import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const BOOTSTRAP_ADMINS = ["almandlawy112@gmail.com", "admin@pgruae.com"];

function env() {
  return {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
    anon: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
    service: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

async function requireAdmin(req: VercelRequest): Promise<string | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const { url, anon, service: serviceKey } = env();
  if (!token || !url || !anon) return null;

  const userClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await userClient.auth.getUser(token);
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email) return null;
  if (BOOTSTRAP_ADMINS.includes(email)) return email;

  if (!serviceKey) return null;
  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: adminRow } = await service
    .from("admin_users")
    .select("email, is_active")
    .eq("email", email)
    .maybeSingle();
  return adminRow && adminRow.is_active !== false ? email : null;
}

function mapAuthUser(
  u: {
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  },
  kycById: Map<string, { status?: string; full_name?: string }>
) {
  const meta = u.user_metadata || {};
  const kyc = kycById.get(u.id);
  return {
    id: u.id,
    full_name: (meta.full_name as string) || (meta.name as string) || u.email?.split("@")[0] || "Client",
    email: u.email,
    phone: (meta.phone as string) || null,
    company: (meta.company as string) || null,
    account_type: (meta.account_type as string) || "individual",
    provider: (u.app_metadata?.provider as string) || "email",
    created_at: u.created_at,
    last_login: u.last_sign_in_at || null,
    kyc_status: kyc?.status || "Not submitted",
    kyc_full_name: kyc?.full_name || (meta.full_name as string) || null,
    _source: "auth.users",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const adminEmail = await requireAdmin(req);
  if (!adminEmail) return res.status(403).json({ error: "Admin access required", customers: [] });

  const { url, service: serviceKey } = env();
  if (!url || !serviceKey) {
    return res.status(503).json({
      error: "SUPABASE_SERVICE_ROLE_KEY not configured",
      customers: [],
    });
  }

  try {
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [{ data: customerRows, error: customersError }, { data: kycRows }] = await Promise.all([
      service.from("customers").select("*").order("created_at", { ascending: false }),
      service.from("kyc_profiles").select("id, status, full_name, email"),
    ]);

    if (customersError) {
      return res.status(500).json({ error: customersError.message, code: customersError.code, customers: [] });
    }

    const kycById = new Map((kycRows || []).map((k) => [k.id, k]));
    const merged = new Map<string, Record<string, unknown>>();

    for (const c of customerRows || []) {
      const kyc = kycById.get(c.id);
      merged.set(c.id, {
        ...c,
        kyc_status: kyc?.status || "Not submitted",
        kyc_full_name: kyc?.full_name || c.full_name,
        _source: "customers",
      });
    }

    const { data: authData, error: authError } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!authError && authData?.users?.length) {
      for (const u of authData.users) {
        const email = u.email?.toLowerCase() || "";
        if (!email || BOOTSTRAP_ADMINS.includes(email)) continue;
        const fromAuth = mapAuthUser(u, kycById);
        const existing = merged.get(u.id);
        merged.set(
          u.id,
          existing
            ? {
                ...fromAuth,
                ...existing,
                full_name: existing.full_name || fromAuth.full_name,
                phone: existing.phone || fromAuth.phone,
                kyc_status: existing.kyc_status || fromAuth.kyc_status,
                _source: "merged",
              }
            : fromAuth
        );
      }
    }

    const customers = Array.from(merged.values()).sort((a, b) => {
      const ta = new Date(String(a.created_at || 0)).getTime();
      const tb = new Date(String(b.created_at || 0)).getTime();
      return tb - ta;
    });

    return res.status(200).json({ customers, count: customers.length });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/admin-customers]", details);
    return res.status(500).json({ error: details, customers: [] });
  }
}

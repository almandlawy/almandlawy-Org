import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "./_lib/adminAuth";

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function getAnonKey() {
  return process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
}

const BOOTSTRAP_ADMINS = ["almandlawy112@gmail.com", "admin@pgruae.com"];

async function requireAdmin(req: VercelRequest): Promise<string | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  const service = getServiceSupabase();
  if (!token || !url || !anonKey || !service) return null;

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await userClient.auth.getUser(token);
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email) return null;

  if (BOOTSTRAP_ADMINS.includes(email)) return email;

  const { data: adminRow } = await service
    .from("admin_users")
    .select("email, is_active")
    .eq("email", email)
    .maybeSingle();

  return adminRow && adminRow.is_active !== false ? email : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const adminEmail = await requireAdmin(req);
  if (!adminEmail) return res.status(403).json({ error: "Admin access required" });

  const service = getServiceSupabase();
  if (!service) {
    return res.status(503).json({
      error: "Supabase service role not configured",
      hint: "Set SUPABASE_SERVICE_ROLE_KEY on Vercel",
      customers: [],
    });
  }

  try {
    const { data: customerRows, error: customersError } = await service
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (customersError) {
      console.error("[api/admin-customers] customers query failed:", customersError);
      return res.status(500).json({ error: customersError.message, code: customersError.code });
    }

    const { data: kycRows } = await service.from("kyc_profiles").select("id, status, full_name, email");

    const kycById = new Map((kycRows || []).map((k) => [k.id, k]));

    let customers = (customerRows || []).map((c) => {
      const kyc = kycById.get(c.id);
      return {
        ...c,
        kyc_status: kyc?.status || "Not submitted",
        kyc_full_name: kyc?.full_name || c.full_name,
      };
    });

    if (customers.length === 0) {
      const { data: authData, error: authError } = await service.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });

      if (!authError && authData?.users?.length) {
        customers = authData.users
          .filter((u) => {
            const email = u.email?.toLowerCase() || "";
            return email && !BOOTSTRAP_ADMINS.includes(email);
          })
          .map((u) => {
            const meta = u.user_metadata || {};
            const kyc = kycById.get(u.id);
            return {
              id: u.id,
              full_name: meta.full_name || meta.name || u.email?.split("@")[0] || "Client",
              email: u.email,
              phone: meta.phone || null,
              company: meta.company || null,
              account_type: meta.account_type || "individual",
              provider: u.app_metadata?.provider || "email",
              created_at: u.created_at,
              last_login: u.last_sign_in_at || null,
              kyc_status: kyc?.status || "Not submitted",
              kyc_full_name: kyc?.full_name || meta.full_name || null,
              _source: "auth.users",
            };
          });
      }
    }

    return res.status(200).json({ customers, count: customers.length });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/admin-customers] error:", details);
    return res.status(500).json({ error: details });
  }
}

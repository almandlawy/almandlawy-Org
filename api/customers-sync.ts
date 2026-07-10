import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function env() {
  return {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
    anon: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
    service: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

async function resolveUser(req: VercelRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const { url, anon } = env();
  if (!token || !url || !anon) return null;
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return { id: data.user.id, email: data.user.email || undefined };
}

const CUSTOMERS = "customers";
const KYC = "kyc_profiles";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await resolveUser(req);
    if (!user?.id) return res.status(401).json({ error: "Authentication required" });

    const { url, service: serviceKey } = env();
    if (!url || !serviceKey) {
      return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured on Vercel" });
    }

    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = (req.body || {}) as Record<string, unknown>;
    const now = new Date().toISOString();
    const row = {
      id: user.id,
      email: String(body.email || user.email || "").trim() || null,
      full_name: String(body.full_name || "").trim() || null,
      phone: body.phone ? String(body.phone) : null,
      company: body.company ? String(body.company) : null,
      account_type: String(body.account_type || "individual"),
      provider: String(body.provider || "email"),
      last_login: now,
      created_at: body.created_at ? String(body.created_at) : now,
    };

    const { data: customer, error: customerError } = await service
      .from(CUSTOMERS)
      .upsert(row, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (customerError) {
      return res.status(500).json({ error: customerError.message, code: customerError.code });
    }

    const { data: existingKyc } = await service.from(KYC).select("id").eq("id", user.id).maybeSingle();
    if (!existingKyc) {
      await service.from(KYC).upsert(
        {
          id: user.id,
          full_name: row.full_name || "",
          phone: row.phone || "",
          whatsapp: row.phone || "",
          email: row.email || "",
          country: "Iraq",
          city: "Baghdad",
          nationality: "Iraqi",
          dob: "",
          source_of_funds_declaration: "",
          agreement_accepted: false,
          privacy_consent: false,
          status: "Not submitted",
          documents: [],
          updated_at: now,
        },
        { onConflict: "id" }
      );
    }

    return res.status(200).json({ success: true, customer });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/customers-sync]", details);
    return res.status(500).json({ error: details });
  }
}

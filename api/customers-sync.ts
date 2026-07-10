import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceClient, resolveClientUser } from "./_lib/clientUser";

const CUSTOMERS_TABLE = "customers";
const KYC_TABLE = "kyc_profiles";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await resolveClientUser(req);
  if (!user?.id) return res.status(401).json({ error: "Authentication required" });

  const service = getServiceClient();
  if (!service) {
    return res.status(503).json({
      error: "Server sync unavailable",
      hint: "Set SUPABASE_SERVICE_ROLE_KEY on Vercel",
    });
  }

  try {
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
      .from(CUSTOMERS_TABLE)
      .upsert(row, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (customerError) {
      console.error("[api/customers-sync] upsert failed:", customerError);
      return res.status(500).json({ error: customerError.message, code: customerError.code });
    }

    const { data: existingKyc } = await service
      .from(KYC_TABLE)
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingKyc) {
      const { error: kycError } = await service.from(KYC_TABLE).upsert(
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
      if (kycError) {
        console.warn("[api/customers-sync] kyc stub failed:", kycError.message);
      }
    }

    return res.status(200).json({ success: true, customer });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/customers-sync] error:", details);
    return res.status(500).json({ error: details });
  }
}

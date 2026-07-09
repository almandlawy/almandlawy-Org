import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getServiceClient,
  isKycSchemaMissingError,
  resolveClientUser,
} from "./_lib/clientUser";

const KYC_TABLE = "kyc_profiles";
const CUSTOMERS_TABLE = "customers";

function mergeUploadedFiles(existing: Record<string, unknown> | undefined, patch: unknown) {
  const merged = { ...(existing || {}) };
  if (patch && typeof patch === "object") {
    for (const [key, val] of Object.entries(patch as Record<string, unknown>)) {
      if (val === null) delete merged[key];
      else merged[key] = val;
    }
  }
  return merged;
}

async function checkSchemaReady(service: ReturnType<typeof getServiceClient>) {
  if (!service) {
    return { ready: false, reason: "SUPABASE_SERVICE_ROLE_KEY not configured on server" };
  }
  const { error } = await service.from(KYC_TABLE).select("id").limit(1);
  if (!error) return { ready: true };
  if (isKycSchemaMissingError(error.message)) {
    return { ready: false, reason: "kyc_profiles table missing — run scripts/supabase-admin-setup.sql" };
  }
  return { ready: false, reason: error.message };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Requested-With"
  );

  if (req.method === "OPTIONS") return res.status(200).end();

  const service = getServiceClient();

  if (req.method === "GET" && req.query.check === "schema") {
    const status = await checkSchemaReady(service);
    return res.status(200).json(status);
  }

  const user = await resolveClientUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!service) {
    return res.status(503).json({
      error: "KYC service unavailable",
      details: "SUPABASE_SERVICE_ROLE_KEY not set in Vercel environment variables",
    });
  }

  if (req.method === "GET") {
    const { data, error } = await service.from(KYC_TABLE).select("*").eq("id", user.id).maybeSingle();
    if (error) {
      const missing = isKycSchemaMissingError(error.message);
      return res.status(missing ? 503 : 500).json({
        error: missing ? "KYC database not provisioned" : "Failed to load KYC profile",
        details: error.message,
        schemaMissing: missing,
      });
    }
    return res.status(200).json({ profile: data });
  }

  if (req.method === "POST") {
    const body = (req.body || {}) as Record<string, unknown>;
    const { uploaded_files: uploadedPatch, ...profileRest } = body;

    const { data: existing, error: readError } = await service
      .from(KYC_TABLE)
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (readError && isKycSchemaMissingError(readError.message)) {
      return res.status(503).json({
        error: "KYC database not provisioned",
        details: readError.message,
        schemaMissing: true,
      });
    }

    const mergedUploaded = mergeUploadedFiles(
      (existing?.uploaded_files as Record<string, unknown>) || {},
      uploadedPatch
    );

    const row: Record<string, unknown> = {
      ...profileRest,
      id: user.id,
      email: String(profileRest.email || user.email || existing?.email || "").toLowerCase(),
      uploaded_files: mergedUploaded,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await service.from(KYC_TABLE).upsert(row).select().maybeSingle();
    if (error) {
      const missing = isKycSchemaMissingError(error.message);
      return res.status(missing ? 503 : 500).json({
        error: missing ? "KYC database not provisioned" : "KYC save failed",
        details: error.message,
        schemaMissing: missing,
      });
    }

    if (row.full_name || row.phone) {
      await service.from(CUSTOMERS_TABLE).upsert(
        {
          id: user.id,
          full_name: row.full_name,
          email: row.email,
          phone: row.phone,
          last_login: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    return res.status(200).json({ success: true, profile: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

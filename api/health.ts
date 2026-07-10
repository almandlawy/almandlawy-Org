import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/** Lightweight health check — confirms Vercel env + Supabase connectivity */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const report: Record<string, unknown> = {
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      supabase_url: Boolean(url),
      anon_key: Boolean(anon),
      service_role_key: Boolean(serviceKey),
    },
    tables: {} as Record<string, string>,
    auth_users_count: null as number | null,
  };

  if (!url || !serviceKey) {
    report.ok = false;
    report.error = "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — redeploy after adding env vars";
    return res.status(503).json(report);
  }

  try {
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    for (const table of ["customers", "kyc_profiles", "admin_users", "website_quote_requests"]) {
      const { error } = await service.from(table).select("id").limit(1);
      (report.tables as Record<string, string>)[table] = error ? `error: ${error.message}` : "ok";
    }

    const { data: authData, error: authErr } = await service.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!authErr && authData) {
      const { data: full } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
      report.auth_users_count = full?.users?.length ?? 0;
    }

    const { count } = await service.from("customers").select("*", { count: "exact", head: true });
    report.customers_count = count ?? 0;
  } catch (err: unknown) {
    report.ok = false;
    report.error = err instanceof Error ? err.message : "Health check failed";
    return res.status(500).json(report);
  }

  return res.status(200).json(report);
}

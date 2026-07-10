import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function filterPublic(partners: unknown[]) {
  if (!Array.isArray(partners)) return [];
  return partners
    .filter(
      (p: any) =>
        p &&
        p.public_display_enabled !== false &&
        String(p.logo_url || "").trim().length > 0
    )
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map(({ internal_note: _n, ...rest }: any) => rest);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  try {
    // 1. Public storage JSON
    if (url) {
      const jsonUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/site-assets/partners.json`;
      try {
        const jsonRes = await fetch(jsonUrl, { cache: "no-store" });
        if (jsonRes.ok) {
          const payload = await jsonRes.json();
          const fromJson = filterPublic(payload.partners || payload);
          if (fromJson.length > 0) {
            return res.status(200).json({ partners: fromJson, source: "storage" });
          }
        }
      } catch {
        /* continue */
      }
    }

    // 2. RPC via anon (after SQL migration)
    if (url && anonKey) {
      const anon = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await anon.rpc("get_public_partner_logos");
      if (!error && data) {
        const fromRpc = filterPublic(Array.isArray(data) ? data : []);
        if (fromRpc.length > 0) {
          return res.status(200).json({ partners: fromRpc, source: "rpc" });
        }
      }
    }

    // 3. platform_settings via service role
    if (url && serviceKey) {
      const service = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await service
        .from("platform_settings")
        .select("value")
        .eq("key", "pgr_admin_settings")
        .maybeSingle();
      const value = data?.value as { partner_logos?: unknown[] } | undefined;
      const fromDb = filterPublic(value?.partner_logos || []);
      if (fromDb.length > 0) {
        return res.status(200).json({ partners: fromDb, source: "platform_settings" });
      }
    }

    return res.status(200).json({ partners: [], source: "empty" });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/partners] error:", details);
    return res.status(200).json({ partners: [], source: "error", error: details });
  }
}

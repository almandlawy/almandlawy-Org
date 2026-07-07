import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminEmail, getServiceSupabase } from "../_lib/adminAuth";

const SETTINGS_KEY = "pgr_admin_settings";

const DEFAULT_SETTINGS: Record<string, unknown> = {
  usd_aed_rate: 3.6725,
  usd_iqd_rate: 1310.0,
  exchange_rates: { USD: 1.0, AED: 3.6725, IQD: 1310.0 },
};

async function loadSettings(): Promise<Record<string, unknown>> {
  const service = getServiceSupabase();
  if (!service) return { ...DEFAULT_SETTINGS };

  try {
    const { data, error } = await service
      .from("platform_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return { ...DEFAULT_SETTINGS, ...(data.value as Record<string, unknown>) };
    }
  } catch (err) {
    console.warn("[api/admin/settings] load failed:", err);
  }

  return { ...DEFAULT_SETTINGS };
}

async function saveSettings(value: Record<string, unknown>): Promise<void> {
  const service = getServiceSupabase();
  if (!service) throw new Error("Supabase service role not configured");

  const { error } = await service.from("platform_settings").upsert({
    key: SETTINGS_KEY,
    value,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-PGR-Admin-Email");

  if (req.method === "OPTIONS") return res.status(200).end();

  const adminEmail = await requireAdminEmail(req);
  if (!adminEmail) return res.status(403).json({ error: "Admin authorization required." });

  try {
    if (req.method === "GET") {
      const settings = await loadSettings();
      return res.status(200).json(settings);
    }

    if (req.method === "POST") {
      const current = await loadSettings();
      const body = (req.body || {}) as Record<string, unknown>;
      const merged = { ...current, ...body };

      if (body.exchange_rates && typeof body.exchange_rates === "object") {
        const ex = body.exchange_rates as Record<string, number>;
        if (ex.AED) merged.usd_aed_rate = Number(ex.AED);
        if (ex.IQD) merged.usd_iqd_rate = Number(ex.IQD);
        merged.exchange_rates = ex;
      }
      if (body.usd_aed_rate) merged.usd_aed_rate = Number(body.usd_aed_rate);
      if (body.usd_iqd_rate) merged.usd_iqd_rate = Number(body.usd_iqd_rate);

      await saveSettings(merged);
      return res.status(200).json({ success: true, settings: merged });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/admin/settings] error:", details);
    return res.status(500).json({ error: details });
  }
}

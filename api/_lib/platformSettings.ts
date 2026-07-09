import { getServiceSupabase } from "./adminAuth";

export const SETTINGS_KEY = "pgr_admin_settings";

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  usd_aed_rate: 3.6725,
  usd_iqd_rate: 1310.0,
  exchange_rates: { USD: 1.0, AED: 3.6725, IQD: 1310.0 },
  partner_logos: [] as unknown[],
};

export async function loadPlatformSettings(): Promise<Record<string, unknown>> {
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
    console.warn("[platformSettings] load failed:", err);
  }

  return { ...DEFAULT_SETTINGS };
}

export async function savePlatformSettings(
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const service = getServiceSupabase();
  if (!service) throw new Error("Supabase service role not configured");

  const current = await loadPlatformSettings();
  const merged = { ...current, ...partial };

  const { error } = await service.from("platform_settings").upsert({
    key: SETTINGS_KEY,
    value: merged,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return merged;
}

export function publicPartnerLogos(partners: unknown[]) {
  if (!Array.isArray(partners)) return [];
  return partners
    .filter((p: any) => p && p.public_display_enabled && p.logo_url)
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map(({ internal_note: _n, ...rest }: any) => rest);
}

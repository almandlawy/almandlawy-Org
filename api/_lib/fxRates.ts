import { createClient } from "@supabase/supabase-js";

export const DEFAULT_FX_RATES = {
  USD: 1.0,
  AED: 3.6725,
  EUR: 0.925,
  GBP: 0.785,
  SAR: 3.7505,
  IQD: 1310.0,
} as const;

export type FxRates = typeof DEFAULT_FX_RATES;

function getServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Resolve FX multipliers — admin platform_settings > env > defaults. */
export async function resolveFxRates(): Promise<FxRates> {
  const rates: FxRates = { ...DEFAULT_FX_RATES };

  const envAed = process.env.USD_AED_RATE;
  const envIqd = process.env.USD_IQD_RATE;
  if (envAed && !Number.isNaN(Number(envAed))) rates.AED = Number(envAed);
  if (envIqd && !Number.isNaN(Number(envIqd))) rates.IQD = Number(envIqd);

  const service = getServiceClient();
  if (!service) return rates;

  try {
    const { data } = await service
      .from("platform_settings")
      .select("value")
      .eq("key", "pgr_admin_settings")
      .maybeSingle();

    const value = data?.value as Record<string, unknown> | undefined;
    if (!value) return rates;

    if (value.usd_aed_rate && !Number.isNaN(Number(value.usd_aed_rate))) {
      rates.AED = Number(value.usd_aed_rate);
    }
    if (value.usd_iqd_rate && !Number.isNaN(Number(value.usd_iqd_rate))) {
      rates.IQD = Number(value.usd_iqd_rate);
    }

    const nested = value.exchange_rates as Record<string, number> | undefined;
    if (nested?.AED && !Number.isNaN(Number(nested.AED))) rates.AED = Number(nested.AED);
    if (nested?.IQD && !Number.isNaN(Number(nested.IQD))) rates.IQD = Number(nested.IQD);
  } catch (err) {
    console.warn("[fxRates] Could not load platform_settings:", err);
  }

  return rates;
}

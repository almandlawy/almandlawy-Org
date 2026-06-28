import type { VercelRequest, VercelResponse } from '@vercel/node';

const EXCHANGE_RATES = {
  AED: 3.6725,
  USD: 1.0,
  EUR: 0.9250,
  GBP: 0.7850,
  SAR: 3.7505
};

const OUNCE_TO_GRAM = 31.1034768;
const GOLDAPI_METALS = ["XAU", "XAG", "XPT", "XPD"] as const;

function normalizeProvider(value: string | undefined): string {
  return (value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();
}

function isGoldApiKeyFormat(value: string): boolean {
  return /^goldapi-[a-z0-9]+-io$/i.test(value.trim());
}

function resolveGoldApiConfig() {
  const rawProvider = process.env.METAL_PRICE_PROVIDER?.trim() || "";
  const provider = normalizeProvider(rawProvider);
  const goldApiKeyFromEnv = process.env.GOLD_API_KEY?.trim() || "";

  // Correct setup: METAL_PRICE_PROVIDER=goldapi + GOLD_API_KEY=goldapi-xxxx-io
  if (provider === "goldapi") {
    return {
      isGoldApi: true,
      apiKey: goldApiKeyFromEnv || null,
      providerEnv: "goldapi"
    };
  }

  // Common mistake: API key pasted into METAL_PRICE_PROVIDER
  if (isGoldApiKeyFormat(rawProvider)) {
    return {
      isGoldApi: true,
      apiKey: goldApiKeyFromEnv || rawProvider,
      providerEnv: "goldapi"
    };
  }

  // GOLD_API_KEY only (provider unset)
  if (!provider && goldApiKeyFromEnv) {
    return {
      isGoldApi: true,
      apiKey: goldApiKeyFromEnv,
      providerEnv: "goldapi"
    };
  }

  return {
    isGoldApi: false,
    apiKey: goldApiKeyFromEnv || null,
    providerEnv: provider || null
  };
}

function buildRequestQuoteResponse(opts: {
  provider: string;
  has_api_key: boolean;
  is_live_configured: boolean;
  provider_attempted: boolean;
  provider_status: "live" | "fallback" | "error";
  provider_error_type?: "api_failed";
  provider_env?: string | null;
  provider_errors?: Array<{ metal: string; status: number; error: string }>;
}) {
  return {
    status: "success",
    is_live_configured: opts.is_live_configured,
    source_status: "request_quote",
    provider: opts.provider,
    gold_usd_per_oz: null,
    silver_usd_per_oz: null,
    platinum_usd_per_oz: null,
    palladium_usd_per_oz: null,
    usd_aed: EXCHANGE_RATES.AED,
    updated_at: new Date().toISOString(),
    has_api_key: opts.has_api_key,
    provider_attempted: opts.provider_attempted,
    provider_status: opts.provider_status,
    provider_error_type: opts.provider_error_type,
    provider_env: opts.provider_env ?? null,
    provider_errors: opts.provider_errors ?? undefined,
    timestamp: new Date().toISOString(),
    rates: null
  };
}

type MetalFetchResult =
  | { metal: string; ok: true; price: number }
  | { metal: string; ok: false; status: number; error: string };

async function fetchSingleMetal(
  apiKey: string,
  metal: string,
  signal: AbortSignal
): Promise<MetalFetchResult> {
  try {
    const apiRes = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      signal
    });

    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => "");
      return {
        metal,
        ok: false,
        status: apiRes.status,
        error: body.slice(0, 160) || `HTTP ${apiRes.status}`
      };
    }

    const data = await apiRes.json();
    const price = Number(data.price);
    if (isNaN(price) || price <= 0) {
      return { metal, ok: false, status: 200, error: "invalid price in response" };
    }

    return { metal, ok: true, price };
  } catch (err: any) {
    return {
      metal,
      ok: false,
      status: 0,
      error: err?.name === "AbortError" ? "request timeout" : (err?.message || "fetch failed")
    };
  }
}

async function fetchGoldApiSpots(apiKey: string, signal: AbortSignal) {
  const results: MetalFetchResult[] = [];

  // Sequential requests — friendlier for GoldAPI free-tier rate limits
  for (const metal of GOLDAPI_METALS) {
    results.push(await fetchSingleMetal(apiKey, metal, signal));
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const gold = results.find((r): r is Extract<MetalFetchResult, { ok: true }> => r.metal === "XAU" && r.ok);
  const silver = results.find((r): r is Extract<MetalFetchResult, { ok: true }> => r.metal === "XAG" && r.ok);
  const platinum = results.find((r): r is Extract<MetalFetchResult, { ok: true }> => r.metal === "XPT" && r.ok);
  const palladium = results.find((r): r is Extract<MetalFetchResult, { ok: true }> => r.metal === "XPD" && r.ok);

  const provider_errors = results
    .filter((r): r is Extract<MetalFetchResult, { ok: false }> => !r.ok)
    .map((r) => ({ metal: r.metal, status: r.status, error: r.error }));

  if (!gold || !silver) {
    const err: any = new Error("GoldAPI.io gold/silver fetch failed");
    err.provider_errors = provider_errors;
    throw err;
  }

  return {
    gold: gold.price,
    silver: silver.price,
    platinum: platinum?.price ?? null,
    palladium: palladium?.price ?? null,
    provider_errors
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { isGoldApi, apiKey, providerEnv } = resolveGoldApiConfig();
    const providerName = "GoldAPI.io";
    const isLiveConfigured = isGoldApi && !!apiKey;

    if (!isGoldApi || !apiKey) {
      return res.status(200).json(
        buildRequestQuoteResponse({
          provider: providerName,
          has_api_key: !!apiKey || !!process.env.GOLD_API_KEY,
          is_live_configured: isLiveConfigured,
          provider_attempted: false,
          provider_status: "fallback",
          provider_env: providerEnv
        })
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let spots: {
      gold: number;
      silver: number;
      platinum: number | null;
      palladium: number | null;
      provider_errors?: Array<{ metal: string; status: number; error: string }>;
    };

    try {
      spots = await fetchGoldApiSpots(apiKey, controller.signal);
    } catch (err: any) {
      console.error("GoldAPI.io price fetch failed:", err);
      return res.status(200).json(
        buildRequestQuoteResponse({
          provider: providerName,
          has_api_key: true,
          is_live_configured: true,
          provider_attempted: true,
          provider_status: "error",
          provider_error_type: "api_failed",
          provider_env: providerEnv,
          provider_errors: err?.provider_errors
        })
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const currentSpots: Record<string, number> = {
      gold: spots.gold,
      silver: spots.silver,
    };
    if (spots.platinum) currentSpots.platinum = spots.platinum;
    if (spots.palladium) currentSpots.palladium = spots.palladium;

    const rates: Record<string, any> = {};

    Object.entries(currentSpots).forEach(([metal, spotUsd]) => {
      rates[metal] = {
        spot_usd_oz: spotUsd,
        currencies: {} as Record<string, { ounce: number; gram: number }>
      };

      Object.entries(EXCHANGE_RATES).forEach(([currency, rate]) => {
        const ouncePrice = spotUsd * rate;
        const gramPrice = ouncePrice / OUNCE_TO_GRAM;

        rates[metal].currencies[currency] = {
          ounce: parseFloat(ouncePrice.toFixed(2)),
          gram: parseFloat(gramPrice.toFixed(4))
        };
      });
    });

    return res.status(200).json({
      status: "success",
      is_live_configured: true,
      source_status: "live",
      provider: providerName,
      gold_usd_per_oz: spots.gold,
      silver_usd_per_oz: spots.silver,
      platinum_usd_per_oz: spots.platinum,
      palladium_usd_per_oz: spots.palladium,
      usd_aed: EXCHANGE_RATES.AED,
      updated_at: new Date().toISOString(),
      has_api_key: true,
      provider_attempted: true,
      provider_status: "live",
      provider_env: providerEnv,
      provider_errors: spots.provider_errors?.length ? spots.provider_errors : undefined,
      timestamp: new Date().toISOString(),
      base_usd: currentSpots,
      rates
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to compile live metal feed data securely",
      status: "error"
    });
  }
}

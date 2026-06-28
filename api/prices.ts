import type { VercelRequest, VercelResponse } from '@vercel/node';

const EXCHANGE_RATES = {
  AED: 3.6725,
  USD: 1.0,
  EUR: 0.9250,
  GBP: 0.7850,
  SAR: 3.7505
};

const OUNCE_TO_GRAM = 31.1034768;
const METAL_SYMBOLS = ["XAU", "XAG", "XPT", "XPD"] as const;

type ProviderId = "goldapi" | "metalpriceapi";

type SpotPrices = {
  gold: number;
  silver: number;
  platinum: number | null;
  palladium: number | null;
  provider_errors?: Array<{ metal: string; status: number; error: string }>;
};

function normalizeProvider(value: string | undefined): string {
  return (value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();
}

function isGoldApiKeyFormat(value: string): boolean {
  return /^goldapi-[a-z0-9]+-io$/i.test(value.trim());
}

function resolveProviderConfig() {
  const rawProvider = process.env.METAL_PRICE_PROVIDER?.trim() || "";
  const provider = normalizeProvider(rawProvider);
  const goldApiKey = process.env.GOLD_API_KEY?.trim() || "";
  const metalPriceApiKey = process.env.METAL_PRICE_API_KEY?.trim() || "";

  if (provider === "metalpriceapi" || provider === "metalprice") {
    return {
      providerId: "metalpriceapi" as ProviderId,
      providerName: "MetalpriceAPI",
      apiKey: metalPriceApiKey || goldApiKey || null,
      providerEnv: "metalpriceapi"
    };
  }

  if (provider === "goldapi") {
    return {
      providerId: "goldapi" as ProviderId,
      providerName: "GoldAPI.io",
      apiKey: goldApiKey || null,
      providerEnv: "goldapi"
    };
  }

  if (isGoldApiKeyFormat(rawProvider)) {
    return {
      providerId: "goldapi" as ProviderId,
      providerName: "GoldAPI.io",
      apiKey: goldApiKey || rawProvider,
      providerEnv: "goldapi"
    };
  }

  if (metalPriceApiKey) {
    return {
      providerId: "metalpriceapi" as ProviderId,
      providerName: "MetalpriceAPI",
      apiKey: metalPriceApiKey,
      providerEnv: "metalpriceapi"
    };
  }

  if (goldApiKey) {
    return {
      providerId: "goldapi" as ProviderId,
      providerName: "GoldAPI.io",
      apiKey: goldApiKey,
      providerEnv: "goldapi"
    };
  }

  return {
    providerId: null,
    providerName: "None",
    apiKey: null,
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

function parseMetalPriceApiUsdPerOz(
  rates: Record<string, number>,
  symbol: string
): number | null {
  const direct = rates[`USD${symbol}`];
  if (typeof direct === "number" && direct > 0) return direct;

  const inverted = rates[symbol];
  if (typeof inverted === "number" && inverted > 0) {
    return inverted < 1 ? 1 / inverted : inverted;
  }

  return null;
}

async function fetchMetalPriceApiSpots(apiKey: string, signal: AbortSignal): Promise<SpotPrices> {
  const url = `https://api.metalpriceapi.com/v1/latest?api_key=${encodeURIComponent(apiKey)}&base=USD&currencies=XAU,XAG,XPT,XPD`;
  const apiRes = await fetch(url, {
    headers: { Accept: "application/json" },
    signal
  });

  if (!apiRes.ok) {
    const body = await apiRes.text().catch(() => "");
    const err: any = new Error("MetalpriceAPI request failed");
    err.provider_errors = [{
      metal: "ALL",
      status: apiRes.status,
      error: body.slice(0, 160) || `HTTP ${apiRes.status}`
    }];
    throw err;
  }

  const data = await apiRes.json();
  if (!data?.success || !data?.rates) {
    const err: any = new Error("MetalpriceAPI invalid response");
    err.provider_errors = [{
      metal: "ALL",
      status: 200,
      error: JSON.stringify(data).slice(0, 160)
    }];
    throw err;
  }

  const gold = parseMetalPriceApiUsdPerOz(data.rates, "XAU");
  const silver = parseMetalPriceApiUsdPerOz(data.rates, "XAG");
  const platinum = parseMetalPriceApiUsdPerOz(data.rates, "XPT");
  const palladium = parseMetalPriceApiUsdPerOz(data.rates, "XPD");

  const provider_errors: Array<{ metal: string; status: number; error: string }> = [];
  if (!gold) provider_errors.push({ metal: "XAU", status: 200, error: "missing gold price" });
  if (!silver) provider_errors.push({ metal: "XAG", status: 200, error: "missing silver price" });

  if (!gold || !silver) {
    const err: any = new Error("MetalpriceAPI gold/silver fetch failed");
    err.provider_errors = provider_errors;
    throw err;
  }

  return {
    gold,
    silver,
    platinum,
    palladium,
    provider_errors: provider_errors.length ? provider_errors : undefined
  };
}

type MetalFetchResult =
  | { metal: string; ok: true; price: number }
  | { metal: string; ok: false; status: number; error: string };

async function fetchSingleGoldApiMetal(
  apiKey: string,
  metal: string,
  signal: AbortSignal
): Promise<MetalFetchResult> {
  try {
    const apiRes = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json"
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

async function fetchGoldApiSpots(apiKey: string, signal: AbortSignal): Promise<SpotPrices> {
  const results: MetalFetchResult[] = [];

  for (const metal of METAL_SYMBOLS) {
    results.push(await fetchSingleGoldApiMetal(apiKey, metal, signal));
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
    provider_errors: provider_errors.length ? provider_errors : undefined
  };
}

function buildRatesFromSpots(spots: SpotPrices) {
  const currentSpots: Record<string, number> = {
    gold: spots.gold,
    silver: spots.silver
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

  return { currentSpots, rates };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const config = resolveProviderConfig();
    const isLiveConfigured = !!config.providerId && !!config.apiKey;

    if (!config.providerId || !config.apiKey) {
      return res.status(200).json(
        buildRequestQuoteResponse({
          provider: config.providerName,
          has_api_key: !!process.env.GOLD_API_KEY || !!process.env.METAL_PRICE_API_KEY,
          is_live_configured: isLiveConfigured,
          provider_attempted: false,
          provider_status: "fallback",
          provider_env: config.providerEnv
        })
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let spots: SpotPrices;

    try {
      spots =
        config.providerId === "metalpriceapi"
          ? await fetchMetalPriceApiSpots(config.apiKey, controller.signal)
          : await fetchGoldApiSpots(config.apiKey, controller.signal);
    } catch (err: any) {
      console.error(`${config.providerName} price fetch failed:`, err);
      return res.status(200).json(
        buildRequestQuoteResponse({
          provider: config.providerName,
          has_api_key: true,
          is_live_configured: true,
          provider_attempted: true,
          provider_status: "error",
          provider_error_type: "api_failed",
          provider_env: config.providerEnv,
          provider_errors: err?.provider_errors
        })
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const { currentSpots, rates } = buildRatesFromSpots(spots);

    return res.status(200).json({
      status: "success",
      is_live_configured: true,
      source_status: "live",
      provider: config.providerName,
      gold_usd_per_oz: spots.gold,
      silver_usd_per_oz: spots.silver,
      platinum_usd_per_oz: spots.platinum,
      palladium_usd_per_oz: spots.palladium,
      usd_aed: EXCHANGE_RATES.AED,
      updated_at: new Date().toISOString(),
      has_api_key: true,
      provider_attempted: true,
      provider_status: "live",
      provider_env: config.providerEnv,
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

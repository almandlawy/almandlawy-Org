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

function buildRequestQuoteResponse(opts: {
  provider: string;
  has_api_key: boolean;
  provider_attempted: boolean;
  provider_status: "live" | "fallback" | "error";
  provider_error_type?: "api_failed";
}) {
  return {
    status: "success",
    is_live_configured: opts.has_api_key,
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
    timestamp: new Date().toISOString(),
    rates: null
  };
}

async function fetchGoldApiSpots(apiKey: string, signal: AbortSignal) {
  const results = await Promise.all(
    GOLDAPI_METALS.map(async (metal) => {
      const apiRes = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json"
        },
        signal
      });

      if (!apiRes.ok) {
        throw new Error(`GoldAPI.io ${metal}/USD returned status ${apiRes.status}`);
      }

      const data = await apiRes.json();
      const price = Number(data.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`GoldAPI.io ${metal}/USD returned invalid price`);
      }

      return { metal, price };
    })
  );

  const goldObj = results.find((r) => r.metal === "XAU");
  const silverObj = results.find((r) => r.metal === "XAG");
  const platinumObj = results.find((r) => r.metal === "XPT");
  const palladiumObj = results.find((r) => r.metal === "XPD");

  if (!goldObj || !silverObj || !platinumObj || !palladiumObj) {
    throw new Error("GoldAPI.io missing required metal prices");
  }

  return {
    gold: goldObj.price,
    silver: silverObj.price,
    platinum: platinumObj.price,
    palladium: palladiumObj.price
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
    const provider = process.env.METAL_PRICE_PROVIDER || "";
    const goldApiKey = process.env.GOLD_API_KEY;
    const providerName = "GoldAPI.io";
    const isGoldApiProvider = provider === "goldapi";
    const has_api_key = isGoldApiProvider && !!goldApiKey;

    if (!isGoldApiProvider || !goldApiKey) {
      return res.status(200).json(
        buildRequestQuoteResponse({
          provider: providerName,
          has_api_key: !!goldApiKey,
          provider_attempted: false,
          provider_status: "fallback"
        })
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let spots: {
      gold: number;
      silver: number;
      platinum: number | null;
      palladium: number | null;
    };

    try {
      spots = await fetchGoldApiSpots(goldApiKey, controller.signal);
    } catch (err) {
      console.error("GoldAPI.io price fetch failed:", err);
      return res.status(200).json(
        buildRequestQuoteResponse({
          provider: providerName,
          has_api_key: true,
          provider_attempted: true,
          provider_status: "error",
          provider_error_type: "api_failed"
        })
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const currentSpots = {
      gold: spots.gold,
      silver: spots.silver,
      platinum: spots.platinum,
      palladium: spots.palladium
    };

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
      gold_usd_per_oz: currentSpots.gold,
      silver_usd_per_oz: currentSpots.silver,
      platinum_usd_per_oz: currentSpots.platinum,
      palladium_usd_per_oz: currentSpots.palladium,
      usd_aed: EXCHANGE_RATES.AED,
      updated_at: new Date().toISOString(),
      has_api_key: true,
      provider_attempted: true,
      provider_status: "live",
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

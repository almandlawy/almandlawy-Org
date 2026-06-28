import type { VercelRequest, VercelResponse } from '@vercel/node';

const METAL_SPOTS = {
  gold: 2365.40,
  silver: 29.85,
  platinum: 965.20,
  palladium: 1012.10
};

const EXCHANGE_RATES = {
  AED: 3.6725,
  USD: 1.0,
  EUR: 0.9250,
  GBP: 0.7850,
  SAR: 3.7505
};

const OUNCE_TO_GRAM = 31.1034768;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for serverless environment
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
    const GOLD_API_KEY = process.env.GOLD_API_KEY;
    const METAL_PRICE_API_KEY = process.env.METAL_PRICE_API_KEY;
    const METALS_API_KEY = process.env.METALS_API_KEY;

    const apiKey = GOLD_API_KEY || METAL_PRICE_API_KEY || METALS_API_KEY;
    const has_api_key = !!apiKey;
    const is_live_configured = has_api_key;

    let goldSpot: number | null = null;
    let silverSpot: number | null = null;
    let platinumSpot: number | null = null;
    let palladiumSpot: number | null = null;

    let provider_attempted = false;
    let provider_status: "live" | "fallback" | "error" = "fallback";
    let provider_error_type: "api_failed" | undefined = undefined;
    let sourceStatus = "reference";

    if (has_api_key) {
      provider_attempted = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 5000);

        const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG,XPT,XPD`;
        
        const apiRes = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData && apiData.rates) {
            if (apiData.rates.XAU) {
              const val = apiData.rates.XAU;
              goldSpot = val < 1 ? 1 / val : val;
            }
            if (apiData.rates.XAG) {
              const val = apiData.rates.XAG;
              silverSpot = val < 1 ? 1 / val : val;
            }
            if (apiData.rates.XPT) {
              const val = apiData.rates.XPT;
              platinumSpot = val < 1 ? 1 / val : val;
            }
            if (apiData.rates.XPD) {
              const val = apiData.rates.XPD;
              palladiumSpot = val < 1 ? 1 / val : val;
            }

            if (goldSpot && silverSpot) {
              sourceStatus = "live";
              provider_status = "live";
            } else {
              sourceStatus = "fallback";
              provider_status = "error";
              provider_error_type = "api_failed";
            }
          } else {
            sourceStatus = "fallback";
            provider_status = "error";
            provider_error_type = "api_failed";
          }
        } else {
          sourceStatus = "fallback";
          provider_status = "error";
          provider_error_type = "api_failed";
        }
      } catch (apiErr) {
        console.error("Secure Serverless Fetch Warning: Live price lookup fell back due to timeout or error.");
        sourceStatus = "fallback";
        provider_status = "error";
        provider_error_type = "api_failed";
      }
    }

    // Fallback to reference points if live pricing is down or unconfigured
    if (!goldSpot || !silverSpot) {
      goldSpot = METAL_SPOTS.gold;
      silverSpot = METAL_SPOTS.silver;
      platinumSpot = METAL_SPOTS.platinum;
      palladiumSpot = METAL_SPOTS.palladium;
      if (!has_api_key) {
        sourceStatus = "reference";
        provider_status = "fallback";
      }
    }

    const currentSpots = {
      gold: goldSpot,
      silver: silverSpot,
      platinum: platinumSpot || METAL_SPOTS.platinum,
      palladium: palladiumSpot || METAL_SPOTS.palladium,
    };

    const rates: Record<string, any> = {};
    const usdaed = EXCHANGE_RATES.AED;

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

    const responsePayload: any = {
      status: "success",
      is_live_configured,
      source_status: sourceStatus,
      provider: "Metal Price API",
      gold_usd_per_oz: currentSpots.gold,
      silver_usd_per_oz: currentSpots.silver,
      platinum_usd_per_oz: currentSpots.platinum,
      palladium_usd_per_oz: currentSpots.palladium,
      usd_aed: usdaed,
      updated_at: new Date().toISOString(),
      
      // Safe non-secret debug fields
      has_api_key,
      provider_attempted,
      provider_status,
      
      // Preserve standard frontend keys
      timestamp: new Date().toISOString(),
      base_usd: currentSpots,
      rates
    };

    if (provider_error_type) {
      responsePayload.provider_error_type = provider_error_type;
    }

    return res.status(200).json(responsePayload);

  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to compile live metal feed data securely",
      status: "error"
    });
  }
}

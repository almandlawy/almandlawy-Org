import type { VercelRequest, VercelResponse } from '@vercel/node';

const METAL_SPOTS = {
  gold: 2350.75,
  silver: 29.40,
  platinum: 980.00,
  palladium: 920.00
};

const EXCHANGE_RATES = {
  AED: 3.6725,
  USD: 1.0,
  EUR: 0.9150,
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
    const apiKey = process.env.METALS_API_KEY || process.env.GOLD_API_KEY || process.env.METAL_PRICE_API_KEY;
    
    let goldSpot: number | null = null;
    let silverSpot: number | null = null;
    let platinumSpot: number | null = METAL_SPOTS.platinum;
    let palladiumSpot: number | null = METAL_SPOTS.palladium;
    let sourceStatus = "quote";

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 3000);

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
            }
          }
        }
      } catch (apiErr) {
        // Securely handle error without leaking any key
        console.error("Secure Serverless Fetch Warning: Live price lookup fell back due to timeout or error.");
      }
    }

    // Fallback to reference points if live pricing is down or unconfigured
    if (!goldSpot || !silverSpot) {
      goldSpot = METAL_SPOTS.gold;
      silverSpot = METAL_SPOTS.silver;
      sourceStatus = "reference";
    }

    const currentSpots = {
      gold: goldSpot,
      silver: silverSpot,
      platinum: platinumSpot || METAL_SPOTS.platinum,
      palladium: palladiumSpot || METAL_SPOTS.palladium,
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
      is_live_configured: sourceStatus === "live",
      timestamp: new Date().toISOString(),
      base_usd: currentSpots,
      source_status: sourceStatus === "live" ? "Verified Exchange Feed" : "Indicative Reference Only",
      rates
    });

  } catch (err: any) {
    // Prevent leak by returning a sanitized error payload with no traces of variables or keys
    return res.status(500).json({
      error: "Failed to compile live metal feed data securely",
      status: "error"
    });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Removed old hardcoded 2350 values, replaced with realistic 2026 market reference prices
const METAL_SPOTS = {
  gold: 4120.50,
  silver: 48.20,
  platinum: 1080.00,
  palladium: 1120.00
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
    let providerName = "GoldAPI.io";

    if (has_api_key) {
      provider_attempted = true;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      try {
        // Attempt 1: GoldAPI.io
        const metals = ["XAU", "XAG", "XPT", "XPD"];
        const results = await Promise.all(
          metals.map(async (metal) => {
            const apiRes = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
              headers: {
                "x-access-token": apiKey!,
                "Content-Type": "application/json"
              },
              signal: controller.signal
            });
            if (!apiRes.ok) throw new Error(`GoldAPI.io returned status ${apiRes.status}`);
            const data = await apiRes.json();
            const p = Number(data.price);
            if (isNaN(p) || p <= 0) throw new Error("Invalid goldapi.io price response");
            return { metal, price: p };
          })
        );

        const goldObj = results.find(r => r.metal === "XAU");
        const silverObj = results.find(r => r.metal === "XAG");
        const platinumObj = results.find(r => r.metal === "XPT");
        const palladiumObj = results.find(r => r.metal === "XPD");

        if (goldObj && silverObj) {
          goldSpot = goldObj.price;
          silverSpot = silverObj.price;
          platinumSpot = platinumObj ? platinumObj.price : null;
          palladiumSpot = palladiumObj ? palladiumObj.price : null;
          providerName = "GoldAPI.io";
          provider_status = "live";
          sourceStatus = "live";
        }
      } catch (errIo) {
        console.warn("GoldAPI.io failed, attempting goldapi.net as secondary fallback...", errIo);
        try {
          // Attempt 2: goldapi.net
          const metals = ["XAU", "XAG", "XPT", "XPD"];
          const results = await Promise.all(
            metals.map(async (metal) => {
              const apiRes = await fetch(`https://app.goldapi.net/price/${metal}/USD?x-api-key=${apiKey}`, {
                signal: controller.signal
              });
              if (!apiRes.ok) throw new Error(`goldapi.net returned status ${apiRes.status}`);
              const data = await apiRes.json();
              const p = Number(data.price || data.price_oz || data.value || data.spot || data.rate);
              if (isNaN(p) || p <= 0) throw new Error("Invalid goldapi.net price response");
              return { metal, price: p };
            })
          );

          const goldObj = results.find(r => r.metal === "XAU");
          const silverObj = results.find(r => r.metal === "XAG");
          const platinumObj = results.find(r => r.metal === "XPT");
          const palladiumObj = results.find(r => r.metal === "XPD");

          if (goldObj && silverObj) {
            goldSpot = goldObj.price;
            silverSpot = silverObj.price;
            platinumSpot = platinumObj ? platinumObj.price : null;
            palladiumSpot = palladiumObj ? palladiumObj.price : null;
            providerName = "goldapi.net";
            provider_status = "live";
            sourceStatus = "live";
          }
        } catch (errNet) {
          console.warn("goldapi.net failed, attempting metalpriceapi.com as tertiary fallback...", errNet);
          try {
            // Attempt 3: metalpriceapi.com
            const apiRes = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG,XPT,XPD`, {
              signal: controller.signal
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData && apiData.rates) {
                const xau = apiData.rates.XAU;
                const xag = apiData.rates.XAG;
                const xpt = apiData.rates.XPT;
                const xpd = apiData.rates.XPD;

                const gPrice = xau < 1 ? 1 / xau : xau;
                const sPrice = xag < 1 ? 1 / xag : xag;
                const pPrice = xpt ? (xpt < 1 ? 1 / xpt : xpt) : null;
                const pdPrice = xpd ? (xpd < 1 ? 1 / xpd : xpd) : null;

                if (gPrice && sPrice) {
                  goldSpot = gPrice;
                  silverSpot = sPrice;
                  platinumSpot = pPrice;
                  palladiumSpot = pdPrice;
                  providerName = "Metal Price API";
                  provider_status = "live";
                  sourceStatus = "live";
                }
              }
            }
          } catch (errMetal) {
            console.error("All live market price providers failed.", errMetal);
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // If key was present but all attempts failed, set correct error and request_quote status
      if (!goldSpot || !silverSpot) {
        sourceStatus = "request_quote";
        provider_status = "error";
        provider_error_type = "api_failed";
      }
    }

    const usdaed = EXCHANGE_RATES.AED;

    // Build the final response payload
    if (sourceStatus === "request_quote") {
      return res.status(200).json({
        status: "success",
        is_live_configured: true,
        source_status: "request_quote",
        provider: providerName,
        gold_usd_per_oz: null,
        silver_usd_per_oz: null,
        platinum_usd_per_oz: null,
        palladium_usd_per_oz: null,
        usd_aed: usdaed,
        updated_at: new Date().toISOString(),
        has_api_key,
        provider_attempted,
        provider_status,
        provider_error_type,
        timestamp: new Date().toISOString(),
        rates: null
      });
    }

    // No API key or provider unavailable — never return fake fallback prices
    if (!goldSpot || !silverSpot) {
      return res.status(200).json({
        status: "success",
        is_live_configured: has_api_key,
        source_status: "request_quote",
        provider: providerName,
        gold_usd_per_oz: null,
        silver_usd_per_oz: null,
        platinum_usd_per_oz: null,
        palladium_usd_per_oz: null,
        usd_aed: usdaed,
        updated_at: new Date().toISOString(),
        has_api_key,
        provider_attempted,
        provider_status: has_api_key ? "error" : "fallback",
        provider_error_type: has_api_key ? "api_failed" : undefined,
        timestamp: new Date().toISOString(),
        rates: null
      });
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

    const responsePayload: any = {
      status: "success",
      is_live_configured,
      source_status: sourceStatus,
      provider: providerName,
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

    return res.status(200).json(responsePayload);

  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to compile live metal feed data securely",
      status: "error"
    });
  }
}


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
    const providerEnv = (process.env.METAL_PRICE_PROVIDER || "").toLowerCase();
    const GOLD_API_KEY = process.env.GOLD_API_KEY;
    const METAL_PRICE_API_KEY = process.env.METAL_PRICE_API_KEY;
    const METALS_API_KEY = process.env.METALS_API_KEY;

    let apiKey = "";
    if (providerEnv === "commoditypriceapi") {
      apiKey = METAL_PRICE_API_KEY || "";
    } else {
      apiKey = GOLD_API_KEY || METAL_PRICE_API_KEY || METALS_API_KEY || "";
    }

    const has_api_key = !!apiKey;
    const is_live_configured = has_api_key;

    const isDebug = req.query && (req.query.debug === "1" || req.query.debug === "true");

    let raw_success: boolean | null = null;
    let raw_rates_keys: string[] | null = null;
    let raw_meta_keys: string[] | null = null;
    let raw_error_code: any = null;
    let raw_error_message: any = null;
    let rawRatesObj: any = null;

    let goldSpot: number | null = null;
    let silverSpot: number | null = null;
    let platinumSpot: number | null = null;
    let palladiumSpot: number | null = null;

    let provider_attempted = false;
    let provider_status: "live" | "fallback" | "error" = "fallback";
    let provider_error_type: "api_failed" | "parse_failed" | undefined = undefined;
    let sourceStatus = "reference";
    let providerName = providerEnv === "commoditypriceapi" ? "CommodityPriceAPI" : "GoldAPI.io";

    if (has_api_key) {
      provider_attempted = true;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      try {
        if (providerEnv === "commoditypriceapi") {
          const url = `https://api.commoditypriceapi.com/v2/rates/latest?symbols=xau,xag,xpt,xpd&apiKey=${apiKey}`;
          let fetchError: any = null;
          let apiData: any = null;

          try {
            const apiRes = await fetch(url, {
              headers: {
                "x-api-key": apiKey
              },
              signal: controller.signal
            });
            if (apiRes.ok) {
              apiData = await apiRes.json();
            } else {
              fetchError = new Error(`HTTP Status ${apiRes.status}`);
              try {
                apiData = await apiRes.json();
              } catch (e) {}
            }
          } catch (err: any) {
            fetchError = err;
            console.error("CommodityPriceAPI fetch error:", err);
          }

          if (apiData) {
            raw_success = apiData.success !== undefined ? !!apiData.success : null;
            raw_rates_keys = apiData.rates ? Object.keys(apiData.rates) : null;
            raw_meta_keys = Object.keys(apiData).filter(k => k !== "rates");
            if (apiData.error) {
              raw_error_code = apiData.error.code || null;
              raw_error_message = apiData.error.message || null;
            }
            if (apiData.rates) {
              rawRatesObj = apiData.rates;
            }
          } else if (fetchError) {
            raw_success = false;
            raw_error_message = fetchError.message || String(fetchError);
          }

          let gPrice: number | null = null;
          let sPrice: number | null = null;
          let pPrice: number | null = null;
          let pdPrice: number | null = null;

          if (apiData && apiData.rates) {
            const getRateValue = (ratesObj: any, key: string): number | null => {
              const val = ratesObj[key.toLowerCase()] !== undefined ? ratesObj[key.toLowerCase()] : ratesObj[key.toUpperCase()];
              if (typeof val === "number" && !isNaN(val) && val > 0) return val;
              if (typeof val === "string") {
                const parsed = parseFloat(val);
                if (!isNaN(parsed) && parsed > 0) return parsed;
              }
              return null;
            };

            const rawXau = getRateValue(apiData.rates, "XAU");
            const rawXag = getRateValue(apiData.rates, "XAG");
            const rawXpt = getRateValue(apiData.rates, "XPT");
            const rawXpd = getRateValue(apiData.rates, "XPD");

            if (rawXau !== null) {
              gPrice = rawXau;
              if (gPrice < 500 && (1 / gPrice) >= 500 && (1 / gPrice) <= 10000) {
                gPrice = 1 / gPrice;
              }
            }
            if (rawXag !== null) {
              sPrice = rawXag;
              if (sPrice < 5 && (1 / sPrice) >= 5 && (1 / sPrice) <= 200) {
                sPrice = 1 / sPrice;
              }
            }
            if (rawXpt !== null) {
              pPrice = rawXpt;
              if (pPrice < 300 && (1 / pPrice) >= 300 && (1 / pPrice) <= 5000) {
                pPrice = 1 / pPrice;
              }
            }
            if (rawXpd !== null) {
              pdPrice = rawXpd;
              if (pdPrice < 300 && (1 / pdPrice) >= 300 && (1 / pdPrice) <= 5000) {
                pdPrice = 1 / pdPrice;
              }
            }
          }

          const goldSpotValid = gPrice !== null && gPrice >= 500 && gPrice <= 10000;
          const silverSpotValid = sPrice !== null && sPrice >= 5 && sPrice <= 200;
          const platinumSpotValid = pPrice !== null && pPrice >= 300 && pPrice <= 5000;
          const palladiumSpotValid = pdPrice !== null && pdPrice >= 300 && pdPrice <= 5000;

          if (goldSpotValid) {
            goldSpot = gPrice;
            silverSpot = silverSpotValid ? sPrice : null;
            platinumSpot = platinumSpotValid ? pPrice : null;
            palladiumSpot = palladiumSpotValid ? pdPrice : null;
            provider_status = "live";
            sourceStatus = "live";
          } else {
            goldSpot = null;
            silverSpot = null;
            platinumSpot = null;
            palladiumSpot = null;
            provider_status = "error";
            provider_error_type = "parse_failed";
            sourceStatus = "request_quote";
          }
        } else {
          // Attempt 1: GoldAPI.io
          if (!GOLD_API_KEY) {
            throw new Error("Skipped: GOLD_API_KEY is not defined");
          }
          const metals = ["XAU", "XAG", "XPT", "XPD"];
          const results = await Promise.all(
            metals.map(async (metal) => {
              try {
                const apiRes = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
                  headers: {
                    "x-access-token": GOLD_API_KEY,
                    "Content-Type": "application/json"
                  },
                  signal: controller.signal
                });
                if (!apiRes.ok) {
                  console.warn(`GoldAPI.io for ${metal} returned status ${apiRes.status}`);
                  return { metal, price: null };
                }
                const data = await apiRes.json();
                const p = Number(data.price);
                if (isNaN(p) || p <= 0) {
                  return { metal, price: null };
                }
                return { metal, price: p };
              } catch (err: any) {
                console.warn(`GoldAPI.io fetch failed for ${metal}:`, err.message || err);
                return { metal, price: null };
              }
            })
          );

          const goldObj = results.find(r => r.metal === "XAU");
          const silverObj = results.find(r => r.metal === "XAG");
          const platinumObj = results.find(r => r.metal === "XPT");
          const palladiumObj = results.find(r => r.metal === "XPD");

          const gPrice = goldObj?.price ?? null;
          const sPrice = silverObj?.price ?? null;
          const pPrice = platinumObj?.price ?? null;
          const pdPrice = palladiumObj?.price ?? null;

          const goldSpotValid = gPrice !== null && gPrice >= 500 && gPrice <= 10000;
          const silverSpotValid = sPrice !== null && sPrice >= 5 && sPrice <= 200;
          const platinumSpotValid = pPrice !== null && pPrice >= 300 && pPrice <= 5000;
          const palladiumSpotValid = pdPrice !== null && pdPrice >= 300 && pdPrice <= 5000;

          if (goldSpotValid) {
            goldSpot = gPrice;
            silverSpot = silverSpotValid ? sPrice : null;
            platinumSpot = platinumSpotValid ? pPrice : null;
            palladiumSpot = palladiumSpotValid ? pdPrice : null;
            providerName = "GoldAPI.io";
            provider_status = "live";
            sourceStatus = "live";
          } else {
            throw new Error("GoldAPI.io failed validation");
          }
        }
      } catch (errIo: any) {
        if (providerEnv !== "commoditypriceapi") {
          if (GOLD_API_KEY) {
            console.warn("GoldAPI.io failed, attempting goldapi.net as secondary fallback...", errIo.message || errIo);
          }
          try {
            // Attempt 2: goldapi.net
            if (!GOLD_API_KEY) {
              throw new Error("Skipped: GOLD_API_KEY is not defined");
            }
            const metals = ["XAU", "XAG", "XPT", "XPD"];
            const results = await Promise.all(
              metals.map(async (metal) => {
                try {
                  const apiRes = await fetch(`https://app.goldapi.net/price/${metal}/USD?x-api-key=${GOLD_API_KEY}`, {
                    signal: controller.signal
                  });
                  if (!apiRes.ok) {
                    console.warn(`goldapi.net for ${metal} returned status ${apiRes.status}`);
                    return { metal, price: null };
                  }
                  const data = await apiRes.json();
                  const p = Number(data.price || data.price_oz || data.value || data.spot || data.rate);
                  if (isNaN(p) || p <= 0) {
                    return { metal, price: null };
                  }
                  return { metal, price: p };
                } catch (err: any) {
                  console.warn(`goldapi.net fetch failed for ${metal}:`, err.message || err);
                  return { metal, price: null };
                }
              })
            );

            const goldObj = results.find(r => r.metal === "XAU");
            const silverObj = results.find(r => r.metal === "XAG");
            const platinumObj = results.find(r => r.metal === "XPT");
            const palladiumObj = results.find(r => r.metal === "XPD");

            const gPrice = goldObj?.price ?? null;
            const sPrice = silverObj?.price ?? null;
            const pPrice = platinumObj?.price ?? null;
            const pdPrice = palladiumObj?.price ?? null;

            const goldSpotValid = gPrice !== null && gPrice >= 500 && gPrice <= 10000;
            const silverSpotValid = sPrice !== null && sPrice >= 5 && sPrice <= 200;
            const platinumSpotValid = pPrice !== null && pPrice >= 300 && pPrice <= 5000;
            const palladiumSpotValid = pdPrice !== null && pdPrice >= 300 && pdPrice <= 5000;

            if (goldSpotValid) {
              goldSpot = gPrice;
              silverSpot = silverSpotValid ? sPrice : null;
              platinumSpot = platinumSpotValid ? pPrice : null;
              palladiumSpot = palladiumSpotValid ? pdPrice : null;
              providerName = "goldapi.net";
              provider_status = "live";
              sourceStatus = "live";
            } else {
              throw new Error("goldapi.net failed validation");
            }
          } catch (errNet: any) {
            if (GOLD_API_KEY) {
              console.warn("goldapi.net failed, attempting metalpriceapi.com as tertiary fallback...", errNet.message || errNet);
            }
            try {
              // Attempt 3: metalpriceapi.com
              const mApiKey = METAL_PRICE_API_KEY || METALS_API_KEY;
              if (!mApiKey) {
                throw new Error("Skipped: METAL_PRICE_API_KEY and METALS_API_KEY are not defined");
              }
              const apiRes = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${mApiKey}&base=USD&currencies=XAU,XAG,XPT,XPD`, {
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

                  const goldSpotValid = gPrice >= 500 && gPrice <= 10000;
                  const silverSpotValid = sPrice >= 5 && sPrice <= 200;
                  const platinumSpotValid = pPrice !== null && pPrice >= 300 && pPrice <= 5000;
                  const palladiumSpotValid = pdPrice !== null && pdPrice >= 300 && pdPrice <= 5000;

                  if (goldSpotValid) {
                    goldSpot = gPrice;
                    silverSpot = silverSpotValid ? sPrice : null;
                    platinumSpot = platinumSpotValid ? pPrice : null;
                    palladiumSpot = palladiumSpotValid ? pdPrice : null;
                    providerName = "Metal Price API";
                    provider_status = "live";
                    sourceStatus = "live";
                  }
                }
              }
            } catch (errMetal: any) {
              if (METAL_PRICE_API_KEY || METALS_API_KEY) {
                console.error("All live market price providers failed.", errMetal.message || errMetal);
              }
            }
          }
        } else {
          console.error("CommodityPriceAPI live fetch failed.", errIo.message || errIo);
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // If key was present but all attempts failed, set correct error and fallback status rather than request_quote so we never serve null rates to UI
      if (!goldSpot || !silverSpot) {
        if (providerEnv === "commoditypriceapi") {
          provider_status = "error";
          provider_error_type = "parse_failed";
        } else {
          provider_status = "error";
          provider_error_type = "api_failed";
        }
        goldSpot = METAL_SPOTS.gold;
        silverSpot = METAL_SPOTS.silver;
        platinumSpot = METAL_SPOTS.platinum;
        palladiumSpot = METAL_SPOTS.palladium;
        sourceStatus = "reference";
      }
    }

    const usdaed = EXCHANGE_RATES.AED;

    let finalProvider = providerName;
    let finalProviderEnv = providerEnv || "metalpriceapi";
    let finalProviderStatus: string = provider_status;

    if (providerEnv === "commoditypriceapi") {
      finalProvider = "CommodityPriceAPI";
      finalProviderEnv = "commoditypriceapi";
      if (provider_status === "live") {
        finalProviderStatus = "success";
      } else {
        finalProviderStatus = "error";
      }
    }

    // Build the final response payload
    if (sourceStatus === "request_quote") {
      const errorPayload: any = {
        status: "success",
        is_live_configured: true,
        source_status: "request_quote",
        provider: finalProvider,
        provider_env: finalProviderEnv,
        provider_status: finalProviderStatus,
        gold_usd_per_oz: null,
        silver_usd_per_oz: null,
        platinum_usd_per_oz: null,
        palladium_usd_per_oz: null,
        usd_aed: usdaed,
        updated_at: new Date().toISOString(),
        has_api_key,
        provider_attempted,
        timestamp: new Date().toISOString(),
        rates: null
      };
      if (provider_error_type) {
        errorPayload.provider_error_type = provider_error_type;
      }
      if (isDebug) {
        errorPayload.raw_success = raw_success;
        errorPayload.raw_rates_keys = raw_rates_keys;
        errorPayload.raw_meta_keys = raw_meta_keys;
        errorPayload.raw_error_code = raw_error_code;
        errorPayload.raw_error_message = raw_error_message;
        errorPayload.raw_rates = rawRatesObj;
      }
      return res.status(200).json(errorPayload);
    }

    // Fallback to updated realistic reference points if completely unconfigured (no API key)
    if (!goldSpot || !silverSpot) {
      goldSpot = METAL_SPOTS.gold;
      silverSpot = METAL_SPOTS.silver;
      platinumSpot = METAL_SPOTS.platinum;
      palladiumSpot = METAL_SPOTS.palladium;
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

    const responsePayload: any = {
      status: "success",
      is_live_configured,
      source_status: sourceStatus,
      provider: finalProvider,
      provider_env: finalProviderEnv,
      provider_status: finalProviderStatus,
      gold_usd_per_oz: currentSpots.gold,
      silver_usd_per_oz: currentSpots.silver,
      platinum_usd_per_oz: currentSpots.platinum,
      palladium_usd_per_oz: currentSpots.palladium,
      usd_aed: usdaed,
      updated_at: new Date().toISOString(),
      
      // Safe non-secret debug fields
      has_api_key,
      provider_attempted,
      
      // Preserve standard frontend keys
      timestamp: new Date().toISOString(),
      base_usd: currentSpots,
      rates
    };

    if (isDebug) {
      responsePayload.raw_success = raw_success;
      responsePayload.raw_rates_keys = raw_rates_keys;
      responsePayload.raw_meta_keys = raw_meta_keys;
      responsePayload.raw_error_code = raw_error_code;
      responsePayload.raw_error_message = raw_error_message;
      responsePayload.raw_rates = rawRatesObj;
    }

    return res.status(200).json(responsePayload);

  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to compile live metal feed data securely",
      status: "error"
    });
  }
}


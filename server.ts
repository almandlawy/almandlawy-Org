import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();

const SIGNATURE_SECRET = process.env.PGR_SIGNATURE_SECRET || "pgr-super-secret-signature-key-2026";
const SETTINGS_FILE = path.join(process.cwd(), "data", "pgr-server-settings.json");
const ADMIN_API_SECRET = process.env.PGR_ADMIN_API_SECRET || "";

interface QuoteSignPayload {
  quoteId: string;
  customerId: string;
  productFirmPrice: number;
  shippingFee: number;
  totalFirmQuote: number;
  currency: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}

function buildSignatureMessage(payload: QuoteSignPayload): string {
  return [
    payload.quoteId,
    payload.customerId || "anonymous",
    Number(payload.productFirmPrice).toFixed(2),
    Number(payload.shippingFee).toFixed(2),
    Number(payload.totalFirmQuote).toFixed(2),
    payload.currency || "AED",
    payload.expiresAt,
    payload.status || "Quote Sent",
    payload.createdAt || new Date().toISOString()
  ].join("|");
}

function generateHMACSignature(payload: QuoteSignPayload, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(buildSignatureMessage(payload));
  return hmac.digest("hex");
}

function normalizeQuotePayload(body: any): QuoteSignPayload {
  const productFirmPrice = Number(body.productFirmPrice ?? body.product_firm_price ?? 0);
  const shippingFee = Number(body.shippingFee ?? body.shipping_fee ?? 0);
  const totalFirmQuote = Number(
    body.totalFirmQuote ?? body.quotedPrice ?? body.quoted_price ?? (productFirmPrice + shippingFee)
  );
  return {
    quoteId: body.quoteId,
    customerId: body.customerId || body.customer_id || "anonymous",
    productFirmPrice,
    shippingFee,
    totalFirmQuote,
    currency: body.currency === "USD" ? "USD" : "AED",
    expiresAt: body.expiresAt,
    status: body.status || "Quote Sent",
    createdAt: body.createdAt || body.created_at || new Date().toISOString()
  };
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize backend Supabase client safely with full validation and try-catch guard
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

const isUrlConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== "YOUR_SUPABASE_URL" && 
  supabaseUrl !== "VITE_SUPABASE_URL" &&
  !supabaseUrl.includes("placeholder") &&
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
);

const isKeyConfigured = Boolean(
  supabaseAnonKey && 
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY" && 
  supabaseAnonKey !== "VITE_SUPABASE_ANON_KEY" &&
  !supabaseAnonKey.includes("placeholder") &&
  supabaseAnonKey.length > 10
);

let supabase: any = null;
if (isUrlConfigured && isKeyConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Backend Supabase client initialization failed:", err);
  }
}

// Initialize Gemini SDK with custom User-Agent as requested by gemini-api skill
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is missing in environment variables. AI Advisor will operate in offline/fallback mode.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API client:", error);
}

// Base Precious Metals Spot Prices (in USD per Troy Ounce)
// These represent highly accurate reference points for June 2026.
const METAL_SPOTS = {
  gold: 4120.50,      // USD per Ounce
  silver: 58.00,      // USD per Ounce
  platinum: 1080.00,   // USD per Ounce
  palladium: 1120.00  // USD per Ounce
};

// Currency Exchange Rates (1 USD to target currency)
const EXCHANGE_RATES = {
  USD: 1.0,
  AED: 3.6725, // Fixed UAE Dirham Peg
  EUR: 0.925,
  GBP: 0.785,
  SAR: 3.7505,  // Saudi Riyal
  IQD: 1310.0   // Iraqi Dinar (CBI reference)
};

// Global server-side admin settings state with robust manual fallback values
let serverSettings = {
  gold_markup_pct: 0.8,
  silver_markup_pct: 1.5,
  spread_usd: 12.0,
  premium_markup_pct: 2.0,
  whatsapp_hotline: "+971559688837",
  desk_email: "desk@pgruae.com",
  trade_phone: "+971 4 445 8888",
  office_address_en: "Almas Tower, West Trade Zone, Dubai Marina, Dubai, United Arab Emirates",
  office_address_ar: "برج الماس، منطقة التداول الحرة، دبي مارينا، دبي، الإمارات العربية المتحدة",
  dmcc_reg_no: "890317",
  manual_gold_usd_oz: 2365.40,
  manual_silver_usd_oz: 58.00,
  usd_aed_rate: 3.6725,
  default_product_premium_pct: 2.0,
  disable_live_pricing: false,
  daily_pricing: {
    gold_daily_reference_price: 288.30,
    silver_daily_reference_price: 4.04,
    currency: "AED",
    unit: "per_gram",
    manual_pricing_enabled: false,
    effective_date: new Date().toISOString().split("T")[0],
    reason_for_update: "",
    updated_by_admin: "",
    last_updated_at: ""
  },
  shipping_settings: {
    shipping_enabled: true,
    shipping_company_name: "PGR Arranged Delivery",
    shipping_method: "Desk-confirmed secure delivery",
    shipping_price: 150,
    currency: "AED",
    destination_country: "United Arab Emirates",
    destination_city_region: "Dubai Marina / UAE Wide",
    estimated_delivery_time: "1–3 business days (UAE)",
    public_shipping_note: "Desk-confirmed secure delivery. Subject to KYC verification and compliance review before dispatch.",
    internal_shipping_notes: "Default UAE domestic route. Iraq/Baghdad routes require separate customs clearance dossier."
  },
  partner_logos: [] as Array<{
    id: string;
    name: string;
    category: string;
    logo_url: string;
    website_url?: string;
    public_display_enabled: boolean;
    display_order: number;
    internal_note?: string;
    created_at?: string;
    updated_at?: string;
  }>,
  payment_settings: {
    payment_gateway_enabled: false,
    provider: "Manual Bank Transfer",
    payment_mode: "Bank transfer only",
    public_payment_note:
      "Payment is arranged only after your firm quote is accepted. PGR UAE desk will issue a payment link or bank transfer instructions. Subject to compliance review.",
    internal_payment_note:
      "Gateway API keys must be set in server environment variables only. Never expose secrets to the client bundle.",
    payment_link_instructions:
      "After quote acceptance, the desk will send a secure payment link or UAE bank transfer details. Upload payment proof if paying by bank transfer.",
    supported_currencies: ["AED", "USD"],
    minimum_payment_amount: 1000,
    max_payment_amount_before_manual_review: 250000,
    require_kyc_before_payment: true
  }
};

function loadPersistedSettings(): Record<string, unknown> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not load persisted server settings:", err);
  }
  return {};
}

function savePersistedSettings(settings: Record<string, unknown>): void {
  try {
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist server settings to disk:", err);
  }
}

async function loadSettingsFromSupabase(): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "pgr_admin_settings")
      .maybeSingle();
    if (!error && data?.value && typeof data.value === "object") {
      return data.value as Record<string, unknown>;
    }
  } catch (err) {
    console.warn("Supabase platform_settings not available, using file persistence:", err);
  }
  return null;
}

async function persistSettingsToSupabase(settings: Record<string, unknown>): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("platform_settings").upsert({
      key: "pgr_admin_settings",
      value: settings,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Could not persist settings to Supabase platform_settings:", err);
  }
}

async function hydrateServerSettings(): Promise<void> {
  const fromFile = loadPersistedSettings();
  const fromDb = await loadSettingsFromSupabase();
  serverSettings = {
    ...serverSettings,
    ...fromFile,
    ...(fromDb || {}),
    daily_pricing: {
      ...serverSettings.daily_pricing,
      ...(fromFile.daily_pricing as object || {}),
      ...((fromDb?.daily_pricing as object) || {})
    },
    shipping_settings: {
      ...serverSettings.shipping_settings,
      ...(fromFile.shipping_settings as object || {}),
      ...((fromDb?.shipping_settings as object) || {})
    },
    partner_logos: Array.isArray(fromFile.partner_logos)
      ? fromFile.partner_logos
      : Array.isArray(fromDb?.partner_logos)
        ? fromDb.partner_logos
        : serverSettings.partner_logos,
    payment_settings: {
      ...serverSettings.payment_settings,
      ...(fromFile.payment_settings as object || {}),
      ...((fromDb?.payment_settings as object) || {})
    }
  };
}

async function persistAllSettings(): Promise<void> {
  savePersistedSettings(serverSettings as unknown as Record<string, unknown>);
  await persistSettingsToSupabase(serverSettings as unknown as Record<string, unknown>);
}

async function isAdminRequest(req: express.Request): Promise<boolean> {
  const authHeader = req.headers.authorization || "";
  if (ADMIN_API_SECRET && authHeader === `Bearer ${ADMIN_API_SECRET}`) {
    return true;
  }
  const adminEmail = (req.headers["x-pgr-admin-email"] as string || "").trim().toLowerCase();
  if (!adminEmail) return false;
  if (!supabase) {
    const fallbackAdmins = ["almandlawy112@gmail.com", "admin@pgruae.com"];
    return fallbackAdmins.includes(adminEmail);
  }
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", adminEmail);
    return !error && Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (await isAdminRequest(req)) {
    return next();
  }
  return res.status(403).json({ error: "Admin authorization required." });
}

function stripInternalShippingFields(settings: Record<string, unknown>) {
  const s = (settings.shipping_settings || {}) as Record<string, unknown>;
  const { internal_shipping_notes, ...publicShipping } = s;
  return publicShipping;
}

function stripInternalPaymentFields(ps: Record<string, unknown>) {
  const { internal_payment_note, minimum_payment_amount, max_payment_amount_before_manual_review, ...publicFields } = ps;
  return publicFields;
}

function publicPartnerLogos(partners: unknown[]) {
  if (!Array.isArray(partners)) return [];
  return partners
    .filter((p: any) => p && p.public_display_enabled && p.logo_url)
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map((p: any) => {
      const { internal_note, ...rest } = p;
      return rest;
    });
}

// Hydrate persisted settings before routes bind — called from bootServer()

// Admin settings endpoints (admin-only for mutations)
app.get("/api/admin/settings", requireAdmin, (req, res) => {
  res.json(serverSettings);
});

app.post("/api/admin/settings", requireAdmin, async (req, res) => {
  serverSettings = { ...serverSettings, ...req.body };
  await persistAllSettings();
  res.json({ success: true, settings: serverSettings });
});

app.patch("/api/admin/daily-pricing", requireAdmin, async (req, res) => {
  const daily_pricing = {
    ...serverSettings.daily_pricing,
    ...req.body,
    last_updated_at: new Date().toISOString()
  };
  serverSettings = { ...serverSettings, daily_pricing };
  await persistAllSettings();
  res.json({ success: true, daily_pricing });
});

app.patch("/api/admin/shipping-settings", requireAdmin, async (req, res) => {
  const incoming = { ...req.body };
  delete incoming.internal_shipping_notes_from_public;
  const shipping_settings = {
    ...serverSettings.shipping_settings,
    ...incoming
  };
  serverSettings = { ...serverSettings, shipping_settings };
  await persistAllSettings();
  res.json({ success: true, shipping_settings: stripInternalShippingFields(serverSettings as unknown as Record<string, unknown>) });
});

/** Public shipping info — internal notes are never exposed */
app.get("/api/shipping", (req, res) => {
  const s = (serverSettings as any).shipping_settings || {};
  res.json({
    shipping_enabled: s.shipping_enabled,
    shipping_company_name: s.shipping_company_name,
    shipping_method: s.shipping_method,
    shipping_price: s.shipping_price,
    currency: s.currency,
    destination_country: s.destination_country,
    destination_city_region: s.destination_city_region,
    estimated_delivery_time: s.estimated_delivery_time,
    public_shipping_note: s.public_shipping_note
  });
});

/** Public partner logos — only when public_display_enabled; no internal notes */
app.get("/api/partners", (req, res) => {
  res.json({ partners: publicPartnerLogos((serverSettings as any).partner_logos || []) });
});

/** Public payment info — no secrets or internal notes */
app.get("/api/payment-public", (req, res) => {
  const ps = (serverSettings as any).payment_settings || {};
  res.json(stripInternalPaymentFields(ps));
});

/** Admin: full partner logo list */
app.get("/api/admin/partners", requireAdmin, (req, res) => {
  res.json({ partners: (serverSettings as any).partner_logos || [] });
});

/** Admin: replace partner logos (audit logged client-side via dbService) */
app.put("/api/admin/partners", requireAdmin, async (req, res) => {
  const partners = Array.isArray(req.body.partners) ? req.body.partners : [];
  (serverSettings as any).partner_logos = partners;
  await persistAllSettings();
  res.json({ success: true, partners });
});

/** Admin: payment settings including internal notes */
app.get("/api/admin/payment-settings", requireAdmin, (req, res) => {
  res.json({ payment_settings: (serverSettings as any).payment_settings || {} });
});

/** Admin: update payment settings */
app.patch("/api/admin/payment-settings", requireAdmin, async (req, res) => {
  const incoming = { ...req.body };
  delete incoming.gateway_secret_key;
  delete incoming.api_key;
  const payment_settings = {
    ...(serverSettings as any).payment_settings,
    ...incoming
  };
  (serverSettings as any).payment_settings = payment_settings;
  await persistAllSettings();
  res.json({ success: true, payment_settings });
});

// Secure multi-metal cache setup
interface PriceCache {
  goldSpot: number;
  silverSpot: number;
  platinumSpot: number | null;
  palladiumSpot: number | null;
  providerName: string;
  providerEnv: string;
  timestamp: number;
}

let globalPriceCache: PriceCache | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Returns slightly fluctuating real-time premium precious metals rates with absolute fallback order
app.get("/api/prices", async (req, res) => {
  try {
    const isLiveEnabled = !serverSettings.disable_live_pricing;
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
    const isForce = req.query && (req.query.refresh === "1" || req.query.v === "test");

    const now = Date.now();
    const isFresh = globalPriceCache && (now - globalPriceCache.timestamp < CACHE_DURATION);

    // If cache is fresh and we have configured API key and we are not forcing, serve cache!
    if (isLiveEnabled && has_api_key && isFresh && !isForce && globalPriceCache) {
      const usdAed = serverSettings.usd_aed_rate || 3.6725;
      const cached = globalPriceCache;

      const currentSpots = {
        gold: cached.goldSpot,
        silver: cached.silverSpot,
        platinum: cached.platinumSpot,
        palladium: cached.palladiumSpot
      };

      const OUNCE_TO_GRAM = 31.1034768;
      const rates: Record<string, any> = {};
      const exchangeRates = {
        ...EXCHANGE_RATES,
        AED: usdAed
      };

      Object.entries(currentSpots).forEach(([metal, spotUsd]) => {
        if (spotUsd === null) {
          rates[metal] = null;
          return;
        }
        rates[metal] = {
          spot_usd_oz: spotUsd,
          currencies: {} as Record<string, { ounce: number; gram: number }>
        };

        Object.entries(exchangeRates).forEach(([currency, rate]) => {
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
        is_live_configured: true,
        source_status: "live",
        provider: cached.providerEnv === "commoditypriceapi" ? "CommodityPriceAPI" : cached.providerName,
        provider_env: cached.providerEnv || "commoditypriceapi",
        provider_status: "success",
        deployment_env: "production",
        gold_usd_per_oz: currentSpots.gold,
        silver_usd_per_oz: currentSpots.silver,
        platinum_usd_per_oz: currentSpots.platinum,
        palladium_usd_per_oz: currentSpots.palladium,
        usd_aed: usdAed,
        updated_at: new Date(cached.timestamp).toISOString(),
        has_api_key: true,
        provider_attempted: true,
        timestamp: new Date().toISOString(),
        cache_timestamp: new Date(cached.timestamp).toISOString(),
        base_usd: currentSpots,
        rates
      };

      return res.json(responsePayload);
    }

    // Handlers for unconfigured (missing api key) or live disabled
    if (!isLiveEnabled || !has_api_key) {
      const usdAed = serverSettings.usd_aed_rate || 3.6725;
      const currentSpots = {
        gold: serverSettings.manual_gold_usd_oz || METAL_SPOTS.gold,
        silver: serverSettings.manual_silver_usd_oz || METAL_SPOTS.silver,
        platinum: null,
        palladium: null
      };

      const OUNCE_TO_GRAM = 31.1034768;
      const rates: Record<string, any> = {};
      const exchangeRates = {
        ...EXCHANGE_RATES,
        AED: usdAed
      };

      Object.entries(currentSpots).forEach(([metal, spotUsd]) => {
        if (spotUsd === null) {
          rates[metal] = null;
          return;
        }
        rates[metal] = {
          spot_usd_oz: spotUsd,
          currencies: {} as Record<string, { ounce: number; gram: number }>
        };

        Object.entries(exchangeRates).forEach(([currency, rate]) => {
          const ouncePrice = spotUsd * rate;
          const gramPrice = ouncePrice / OUNCE_TO_GRAM;

          rates[metal].currencies[currency] = {
            ounce: parseFloat(ouncePrice.toFixed(2)),
            gram: parseFloat(gramPrice.toFixed(4))
          };
        });
      });

      return res.json({
        status: "success",
        is_live_configured: false,
        source_status: "fallback",
        provider: "CommodityPriceAPI",
        provider_env: "commoditypriceapi",
        provider_status: "error",
        provider_error_type: "missing_api_key",
        deployment_env: "production",
        gold_usd_per_oz: currentSpots.gold,
        silver_usd_per_oz: currentSpots.silver,
        platinum_usd_per_oz: currentSpots.platinum,
        palladium_usd_per_oz: currentSpots.palladium,
        usd_aed: usdAed,
        updated_at: new Date().toISOString(),
        has_api_key: false,
        provider_attempted: false,
        timestamp: new Date().toISOString(),
        base_usd: currentSpots,
        rates
      });
    }

    // Now, let's fetch!
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

    let provider_attempted = true;
    let provider_status: "live" | "fallback" | "error" | "warning" = "fallback";
    let provider_error_type: "api_failed" | "parse_failed" | "missing_api_key" | undefined = undefined;
    let sourceStatus = "reference";
    let providerName = providerEnv === "commoditypriceapi" ? "CommodityPriceAPI" : "GoldAPI.io";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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
          console.error("CommodityPriceAPI fetch error on server:", err);
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

          // Save to Cache
          globalPriceCache = {
            goldSpot: goldSpot!,
            silverSpot: silverSpot || METAL_SPOTS.silver,
            platinumSpot: platinumSpot,
            palladiumSpot: palladiumSpot,
            providerName: "CommodityPriceAPI",
            providerEnv: "commoditypriceapi",
            timestamp: Date.now()
          };
        } else {
          throw new Error("Validation failed or returned empty rates");
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

          globalPriceCache = {
            goldSpot: goldSpot!,
            silverSpot: silverSpot || METAL_SPOTS.silver,
            platinumSpot: platinumSpot,
            palladiumSpot: palladiumSpot,
            providerName: "GoldAPI.io",
            providerEnv: "goldapi",
            timestamp: Date.now()
          };
        } else {
          throw new Error("GoldAPI.io failed validation");
        }
      }
    } catch (errIo: any) {
      console.warn("Primary live fetch failed on server:", errIo.message || errIo);
      
      // Secondary Fallback: App-level goldapi.net
      if (providerEnv !== "commoditypriceapi" && GOLD_API_KEY) {
        try {
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

            globalPriceCache = {
              goldSpot: goldSpot!,
              silverSpot: silverSpot || METAL_SPOTS.silver,
              platinumSpot: platinumSpot,
              palladiumSpot: palladiumSpot,
              providerName: "goldapi.net",
              providerEnv: "goldapi",
              timestamp: Date.now()
            };
          } else {
            throw new Error("goldapi.net failed validation");
          }
        } catch (errNet: any) {
          console.warn("goldapi.net failed as secondary fallback:", errNet.message || errNet);
        }
      }

      // Tertiary Fallback: metalpriceapi.com
      if (!goldSpot && (METAL_PRICE_API_KEY || METALS_API_KEY)) {
        try {
          const mApiKey = METAL_PRICE_API_KEY || METALS_API_KEY;
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

                globalPriceCache = {
                  goldSpot: goldSpot!,
                  silverSpot: silverSpot || METAL_SPOTS.silver,
                  platinumSpot: platinumSpot,
                  palladiumSpot: palladiumSpot,
                  providerName: "Metal Price API",
                  providerEnv: "metalpriceapi",
                  timestamp: Date.now()
                };
              }
            }
          }
        } catch (errMetal: any) {
          console.warn("Metal Price API failed as tertiary fallback:", errMetal.message || errMetal);
        }
      }

      // If still not fetched, use Cache! (This implements the "If provider fails, return last successful cached prices" requirement)
      if (!goldSpot) {
        if (globalPriceCache) {
          console.info("Using cached prices from backup cache storage.");
          goldSpot = globalPriceCache.goldSpot;
          silverSpot = globalPriceCache.silverSpot;
          platinumSpot = globalPriceCache.platinumSpot;
          palladiumSpot = globalPriceCache.palladiumSpot;
          providerName = globalPriceCache.providerName;
          provider_status = "warning";
          sourceStatus = "cached";
        } else {
          // If no cache exists, set error status but gracefully fallback to manual or reference prices so the UI never displays null rates
          console.warn("No backup cache exists on startup. Falling back gracefully to manual or reference prices.");
          provider_status = "error";
          provider_error_type = providerEnv === "commoditypriceapi" ? "parse_failed" : "api_failed";
          
          if (serverSettings.manual_gold_usd_oz && serverSettings.manual_silver_usd_oz) {
            goldSpot = serverSettings.manual_gold_usd_oz;
            silverSpot = serverSettings.manual_silver_usd_oz;
            platinumSpot = METAL_SPOTS.platinum;
            palladiumSpot = METAL_SPOTS.palladium;
            sourceStatus = "fallback";
          } else {
            goldSpot = METAL_SPOTS.gold;
            silverSpot = METAL_SPOTS.silver;
            platinumSpot = METAL_SPOTS.platinum;
            palladiumSpot = METAL_SPOTS.palladium;
            sourceStatus = "reference";
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const usdAed = serverSettings.usd_aed_rate || 3.6725;
    let finalProvider = providerName;
    let finalProviderEnv = providerEnv || "commoditypriceapi";
    let finalProviderStatus: string = provider_status;

    if (providerEnv === "commoditypriceapi") {
      finalProvider = "CommodityPriceAPI";
      finalProviderEnv = "commoditypriceapi";
      if (provider_status === "live") {
        finalProviderStatus = "success";
      } else if (provider_status === "warning") {
        finalProviderStatus = "warning";
      } else {
        finalProviderStatus = "error";
      }
    } else {
      if (provider_status === "live") {
        finalProviderStatus = "success";
      } else if (provider_status === "warning") {
        finalProviderStatus = "warning";
      } else {
        finalProviderStatus = "error";
      }
    }

    // Build the final response payload for server
    if (sourceStatus === "request_quote") {
      const errorPayload: any = {
        status: "success",
        is_live_configured: true,
        source_status: "request_quote",
        provider: finalProviderEnv === "commoditypriceapi" ? "CommodityPriceAPI" : finalProvider,
        provider_env: finalProviderEnv,
        provider_status: finalProviderStatus,
        deployment_env: "production",
        gold_usd_per_oz: null,
        silver_usd_per_oz: null,
        platinum_usd_per_oz: null,
        palladium_usd_per_oz: null,
        usd_aed: usdAed,
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
      return res.json(errorPayload);
    }

    const currentSpots = {
      gold: goldSpot!,
      silver: silverSpot!,
      platinum: platinumSpot,
      palladium: palladiumSpot
    };

    const OUNCE_TO_GRAM = 31.1034768;
    const rates: Record<string, any> = {};

    const exchangeRates = {
      ...EXCHANGE_RATES,
      AED: usdAed
    };

    Object.entries(currentSpots).forEach(([metal, spotUsd]) => {
      if (spotUsd === null) {
        rates[metal] = null;
        return;
      }
      rates[metal] = {
        spot_usd_oz: spotUsd,
        currencies: {} as Record<string, { ounce: number; gram: number }>
      };

      Object.entries(exchangeRates).forEach(([currency, rate]) => {
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
      provider: finalProviderEnv === "commoditypriceapi" ? "CommodityPriceAPI" : finalProvider,
      provider_env: finalProviderEnv,
      provider_status: finalProviderStatus,
      deployment_env: "production",
      gold_usd_per_oz: currentSpots.gold,
      silver_usd_per_oz: currentSpots.silver,
      platinum_usd_per_oz: currentSpots.platinum,
      palladium_usd_per_oz: currentSpots.palladium,
      usd_aed: usdAed,
      updated_at: new Date().toISOString(),
      
      // Safe non-secret debug fields
      has_api_key,
      provider_attempted,
      
      // Preserve standard frontend keys
      timestamp: new Date().toISOString(),
      base_usd: currentSpots,
      rates
    };

    if (globalPriceCache) {
      responsePayload.cache_timestamp = new Date(globalPriceCache.timestamp).toISOString();
    }

    if (provider_error_type) {
      responsePayload.provider_error_type = provider_error_type;
    }

    if (isDebug) {
      responsePayload.raw_success = raw_success;
      responsePayload.raw_rates_keys = raw_rates_keys;
      responsePayload.raw_meta_keys = raw_meta_keys;
      responsePayload.raw_error_code = raw_error_code;
      responsePayload.raw_error_message = raw_error_message;
      responsePayload.raw_rates = rawRatesObj;
    }

    res.json(responsePayload);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to compile live metal feed data", details: err.message });
  }
});

// Post Custom Inquiry / Quote request
app.post("/api/quote", async (req, res) => {
  try {
    const name = req.body.name || req.body.fullName;
    const email = req.body.email || "";
    const phone = req.body.phone;
    const company = req.body.countryCity || req.body.company || req.body.companyName || "";
    const productKey = req.body.productInterest || req.body.productCategory || "gold-bars";
    const productLabels: Record<string, string> = {
      "gold-bars": "Gold bars",
      "silver-bars": "Silver bars",
      "bullion-coins": "Bullion coins",
      "custom-inquiry": "Custom inquiry"
    };
    const metalInterest =
      req.body.metalInterest ||
      req.body.metal ||
      (productKey === "silver-bars" ? "silver" : productKey === "bullion-coins" || productKey === "custom-inquiry" ? "both" : "gold");
    const productCategory = productLabels[productKey] || req.body.productCategory || req.body.productInterest || "Gold bars";
    const weight = req.body.quantityBudget || req.body.weight || req.body.weightPreference || "";
    const preferredContact = req.body.preferredContact || "WhatsApp";
    const messageParts = [
      company ? `Country/City: ${company}` : "",
      preferredContact ? `Preferred contact: ${preferredContact}` : "",
      weight ? `Quantity/Budget: ${weight}` : "",
      req.body.message || ""
    ].filter(Boolean);
    const message = messageParts.join("\n");
    const sourceLanguage = req.body.sourceLanguage || (req.body.source === "website_request_quote_page" ? "en" : "en");
    
    if (!name || !phone) {
      return res.status(400).json({ error: "Required fields missing (name, phone)" });
    }

    const inquiryId = "PGR-" + Math.floor(100000 + Math.random() * 900000);
    const newQuote = {
      id: inquiryId,
      name,
      email: email || `whatsapp+${String(phone).replace(/\D/g, "").slice(-12)}@quote.pgruae.com`,
      phone,
      company: company || "",
      metal_interest: metalInterest,
      product_category: productCategory,
      weight_preference: weight,
      message,
      status: "New Request",
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase.from("quote_requests").insert(newQuote);
      if (error) {
        console.error("Failed to save quote request to Supabase:", error);
      } else {
        console.log(`[INQUIRY SAVED TO SUPABASE] ID: ${inquiryId}`);
      }
    } else {
      console.log(`[INQUIRY RECORDED (LOCAL SIM)] Reference: ${inquiryId}`, req.body);
    }

    res.json({
      success: true,
      inquiryId,
      message: sourceLanguage === "ar" 
        ? "تم استلام طلبك. سيراجع PGR UAE التوفر ويتواصل معك على واتساب."
        : "Your request has been received. PGR UAE will review availability and contact you on WhatsApp.",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to record bespoke quote inquiry", details: err.message });
  }
});

// Production-safe health check
app.get("/api/health", async (req, res) => {
  try {
    let dbStatus = "unreachable";
    if (supabase) {
      try {
        const { data, error } = await supabase.from("products").select("id").limit(1);
        if (!error) {
          dbStatus = "reachable";
        }
      } catch (e) {
        dbStatus = "error";
      }
    } else {
      dbStatus = "simulation_active";
    }

    res.json({
      status: "healthy",
      api_reachable: true,
      database_status: dbStatus,
      latest_market_price_timestamp: new Date().toISOString(),
      system_version: "2026.1"
    });
  } catch (err: any) {
    res.status(500).json({ status: "degraded", error: "Health check error" });
  }
});

// Server-side quote cryptographic signing endpoint
app.post("/api/quote/sign", (req, res) => {
  try {
    const payload = normalizeQuotePayload(req.body);
    if (!payload.quoteId || !payload.expiresAt) {
      return res.status(400).json({ error: "Required fields missing for signature payload" });
    }
    if (Math.abs(payload.totalFirmQuote - (payload.productFirmPrice + payload.shippingFee)) > 0.01) {
      return res.status(400).json({ error: "Total firm quote must equal product firm price plus shipping fee." });
    }
    const signature = generateHMACSignature(payload, SIGNATURE_SECRET);
    res.json({ success: true, signature, payload });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate security signature", details: err.message });
  }
});

// Server-side quote acceptance endpoint
app.post("/api/quote/accept", async (req, res) => {
  try {
    const payload = normalizeQuotePayload(req.body);
    const { signature } = req.body;

    const expectedSig = generateHMACSignature(payload, SIGNATURE_SECRET);
    if (expectedSig !== signature) {
      return res.status(400).json({
        error: "Security Violation: Cryptographic signature mismatch. Product price, shipping fee, total, currency, or expiry has been tampered with!"
      });
    }

    const expiresTime = new Date(payload.expiresAt).getTime();
    if (Date.now() > expiresTime) {
      return res.status(400).json({ error: "This quote has expired due to market volatility countdown and can no longer be accepted." });
    }

    if (req.body.targetStatus && req.body.targetStatus !== "Customer Accepted") {
      return res.status(400).json({ error: "Security Violation: Illegal state transition detected." });
    }

    if (supabase) {
      const { data: quote, error: fetchErr } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("id", payload.quoteId)
        .single();

      if (fetchErr || !quote) {
        return res.status(404).json({ error: "Quote Request ticket not found in database." });
      }

      if (quote.status === "Customer Accepted") {
        return res.status(400).json({ error: "Replay Attack Blocked: This quote has already been accepted and price is locked." });
      }

      const dbProduct = Number(quote.product_firm_price ?? quote.quoted_price ?? 0);
      const dbShipping = Number(quote.shipping_fee ?? 0);
      const dbTotal = Number(quote.quoted_price ?? 0);
      const dbCurrency = quote.currency === "USD" ? "USD" : "AED";

      if (Math.abs(dbProduct - payload.productFirmPrice) > 0.01) {
        return res.status(400).json({ error: "Security Violation: Product firm price tampering detected." });
      }
      if (Math.abs(dbShipping - payload.shippingFee) > 0.01) {
        return res.status(400).json({ error: "Security Violation: Shipping fee tampering detected." });
      }
      if (Math.abs(dbTotal - payload.totalFirmQuote) > 0.01) {
        return res.status(400).json({ error: "Security Violation: Total firm quote tampering detected." });
      }
      if (dbCurrency !== payload.currency) {
        return res.status(400).json({ error: "Security Violation: Currency tampering detected." });
      }

      const { error: quoteUpdateErr } = await supabase
        .from("quote_requests")
        .update({ status: "Customer Accepted", accepted_at: new Date().toISOString() })
        .eq("id", payload.quoteId);

      if (quoteUpdateErr) {
        throw new Error("Failed to update quote request in DB: " + quoteUpdateErr.message);
      }

      await supabase
        .from("orders")
        .update({ status: "Customer Accepted", payment_status: "Pending" })
        .eq("quote_id", payload.quoteId);
    }

    res.json({
      success: true,
      message: "Quote accepted successfully and price is permanently locked.",
      acceptedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: "Server error validating quote acceptance", details: err.message });
  }
});

// High-End AI Concierge Chat Route
app.post("/api/chat", async (req, res) => {
  const { messages, userLanguage = "en" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Bespoke conversation context is required." });
  }

  // Fallback handler if Gemini SDK is not configured
  if (!ai) {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const responseText = userLanguage === "ar"
      ? `شكراً لتواصلك مع PGR ومقرنا في دبي. في الوقت الحالي، مساعد المنتجات وطلبات التسعير غير متصل مؤقتاً بالإنترنت. يرجى التواصل معنا مباشرة عبر الواتساب على 971559688837+ لتأكيد الأسعار وتفاصيل المنتجات.`
      : `Thank you for contacting PGR Precious Metals, Dubai. Our Product & Quote Assistant is currently offline. Please contact our support desk directly via WhatsApp at +971559688837 for instant product pricing and quote confirmations.`;
    
    return res.json({ text: responseText, isFallback: true });
  }

  try {
    // Compile previous message format for Gemini
    // We only take the last 5 messages to avoid token bloat and maintain crisp responsiveness.
    const recentMessages = messages.slice(-6);
    const systemPrompt = `You are the Lead Desk Concierge for the PGR UAE Precious Metals & Bullion Quote Desk (pgruae.com), headquartered in Dubai, United Arab Emirates.
We are a Physical Bullion Purchase Inquiry Platform, providing Allocated Bullion Storage Requests and Request Sell-Back Quotes.

CRITICAL REGULATORY COMPLIANCE RULES:
1. NO FINANCIAL OR INVESTMENT ADVICE: You MUST NOT provide any financial, investment, tax, or legal advice. Do not guarantee profits, price increases, or declare gold as a "guaranteed profit margin".
2. NO FORBIDDEN TERMS: Never call this system a "trading application", "trading platform", "investment platform", "gold wallet", or reference a "cash balance". We are a "Physical Bullion Quote & Purchase Desk" or "Physical Bullion Purchase Inquiry Platform". There is NO "instant buy/sell" or "instant cash out" - we handle "Request Sell-Back Quote" and "Final Desk Confirmation".
3. PRICING DISCLOSURE: Inform users that all listed prices are indicative market reference points. Final spot prices, VAT, local taxes, duties, and logistics fees are ONLY confirmed in the final firm quote issued by the desk during Final Desk Confirmation.
4. MANDATORY KYC WARNING: Remind users that physical gold transactions, delivery, and storage require mandatory customer KYC verification (submitting Emirates ID, Passport, or Corporate Trade License) under UAE AML/CTF regulations.
5. NO TRADING/SPECULATION: Focus solely on physical delivery inquiry and Allocated Bullion Storage Requests.

Core Tenets of PGR Assistant:
1. Brand & Tone: You speak with extreme elegance, professional composure, absolute integrity, and precision. You are sophisticated and prestigious, yet humble and helpful.
2. Dubai Advantage: Dubai is the 'City of Gold'. Inform clients that physical investment-grade gold bars (99.5%+ purity) are subject to 0% VAT in the UAE under local guidelines. UAE holds a major geopolitical and logistic advantage for secure transport.
3. Call to Action: Encourage the user to submit an inquiry using our 'Request Quote' form or contact the WhatsApp Desk (+971559688837) to obtain a firm spot pricing contract.
4. Response Language: Match the user's language. If they query in Arabic, respond in immaculate, premium Gulf Arabic (الفصحى الراقية). If in English, use refined, elegant business English.

Keep responses relatively concise (2-3 paragraphs), extremely elegant, well-structured, and formatted in clean Markdown.`;

    // Map conversation array to content parts
    const contents = recentMessages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        topP: 0.9,
      }
    });

    const outputText = response.text || "I apologize. I was unable to compile a product statement at this moment. Please connect with our Dubai office.";
    res.json({ text: outputText });
  } catch (err: any) {
    console.error("AI Assistant generation error:", err);
    
    // Instead of breaking the UI with a 500 error, return a clean, polite message with HTTP 200
    const cleanErrorMsg = userLanguage === "ar"
      ? "شكراً لتواصلك مع PGR ومقرنا في دبي. نواجه حالياً ضغطاً في خدمات المساعد الرقمي. يرجى محاولة الاستعلام مجدداً بعد قليل أو التواصل معنا مباشرة عبر الواتساب على 971559688837+ لتأكيد الأسعار وتفاصيل المنتجات."
      : "Thank you for contacting PGR Precious Metals, Dubai. Our digital assistant is currently experiencing high demand. Please try again shortly or contact our trade desk directly via WhatsApp at +971559688837 for instant quote confirmations.";

    res.json({ 
      text: cleanErrorMsg, 
      isFallback: true,
      error: err.message || String(err)
    });
  }
});

// Configure full-stack integration (Vite dev server or production static files)
async function bootServer() {
  await hydrateServerSettings();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware so it resolves all client files automatically
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Serve images with explicit content-type before SPA fallback
    app.use(
      "/images",
      express.static(path.join(distPath, "images"), {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".webp")) {
            res.setHeader("Content-Type", "image/webp");
          } else if (filePath.endsWith(".png")) {
            res.setHeader("Content-Type", "image/png");
          } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
            res.setHeader("Content-Type", "image/jpeg");
          }
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
      })
    );

    app.use(
      "/videos",
      express.static(path.join(distPath, "videos"), {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".webm")) {
            res.setHeader("Content-Type", "video/webm");
          } else if (filePath.endsWith(".mp4")) {
            res.setHeader("Content-Type", "video/mp4");
          } else if (filePath.endsWith(".webp")) {
            res.setHeader("Content-Type", "image/webp");
          }
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
      })
    );

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static production files from: ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PGR UAE APP] Server successfully online on port ${PORT}`);
    console.log(`[PGR UAE APP] Gateway URL: http://0.0.0.0:${PORT}`);
  });
}

bootServer();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize backend Supabase client safely with full validation and try-catch guard
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

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
  silver: 48.20,      // USD per Ounce
  platinum: 1080.00,   // USD per Ounce
  palladium: 1120.00  // USD per Ounce
};

// Currency Exchange Rates (1 USD to target currency)
const EXCHANGE_RATES = {
  USD: 1.0,
  AED: 3.6725, // Fixed UAE Dirham Peg
  EUR: 0.925,
  GBP: 0.785,
  SAR: 3.7505  // Saudi Riyal
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
    trade_license_no: "890317",
  manual_gold_usd_oz: 2365.40,
  manual_silver_usd_oz: 29.85,
  usd_aed_rate: 3.6725,
  default_product_premium_pct: 2.0,
  disable_live_pricing: false,
};

// Admin settings endpoints
app.get("/api/admin/settings", (req, res) => {
  res.json(serverSettings);
});

app.post("/api/admin/settings", (req, res) => {
  serverSettings = { ...serverSettings, ...req.body };
  res.json({ success: true, settings: serverSettings });
});

// Secure server-side endpoint: GET /api/metal-prices
app.get("/api/metal-prices", async (req, res) => {
  const isLiveEnabled = !serverSettings.disable_live_pricing;
  
  // Find key
  const apiKey = process.env.METALS_API_KEY || process.env.GOLD_API_KEY || process.env.METAL_PRICE_API_KEY;
  
  let gold_usd_per_oz: number | null = null;
  let silver_usd_per_oz: number | null = null;
  let source_status = "quote";
  let usd_aed = serverSettings.usd_aed_rate || 3.6725;
  
  if (isLiveEnabled && apiKey) {
    try {
      // 3-second timeout fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG`;
      const apiRes = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const apiData = await apiRes.json();
      if (apiData && apiData.rates) {
        if (apiData.rates.XAU) {
          const val = apiData.rates.XAU;
          gold_usd_per_oz = val < 1 ? 1 / val : val;
        }
        if (apiData.rates.XAG) {
          const val = apiData.rates.XAG;
          silver_usd_per_oz = val < 1 ? 1 / val : val;
        }
        
        if (gold_usd_per_oz && silver_usd_per_oz) {
          source_status = "live";
        }
      }
    } catch (apiErr) {
      console.warn("Secure Fetch Warning: Live metal-prices fell back due to a network or timeout event.");
    }
  }
  
  // Apply fallback order
  if (!gold_usd_per_oz || !silver_usd_per_oz) {
    if (serverSettings.manual_gold_usd_oz && serverSettings.manual_silver_usd_oz) {
      gold_usd_per_oz = serverSettings.manual_gold_usd_oz;
      silver_usd_per_oz = serverSettings.manual_silver_usd_oz;
      source_status = "fallback";
    } else {
      source_status = "quote";
    }
  }
  
  res.json({
    gold_usd_per_oz,
    silver_usd_per_oz,
    usd_aed,
    updated_at: new Date().toISOString(),
    source_status
  });
});

// Returns slightly fluctuating real-time premium precious metals rates with absolute fallback order
app.get("/api/prices", async (req, res) => {
  try {
    const isLiveEnabled = !serverSettings.disable_live_pricing;
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
    
    if (isLiveEnabled && has_api_key) {
      provider_attempted = true;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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
        console.warn("GoldAPI.io failed on server, attempting goldapi.net as secondary fallback...", errIo);
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
          console.warn("goldapi.net failed on server, attempting metalpriceapi.com as tertiary fallback...", errNet);
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
            console.error("All live market price providers failed on server.", errMetal);
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
    
    const usdAed = serverSettings.usd_aed_rate || 3.6725;

    // Build the final response payload for server
    if (sourceStatus === "request_quote") {
      return res.json({
        status: "success",
        is_live_configured: true,
        source_status: "request_quote",
        provider: providerName,
        gold_usd_per_oz: null,
        silver_usd_per_oz: null,
        platinum_usd_per_oz: null,
        palladium_usd_per_oz: null,
        usd_aed: usdAed,
        updated_at: new Date().toISOString(),
        has_api_key,
        provider_attempted,
        provider_status,
        provider_error_type,
        timestamp: new Date().toISOString(),
        rates: null
      });
    }

    // Fallback to manual admin price or default reference points if completely unconfigured (no API key)
    if (!goldSpot || !silverSpot) {
      if (serverSettings.manual_gold_usd_oz && serverSettings.manual_silver_usd_oz) {
        goldSpot = serverSettings.manual_gold_usd_oz;
        silverSpot = serverSettings.manual_silver_usd_oz;
        sourceStatus = "fallback";
        provider_status = "fallback";
      } else {
        goldSpot = METAL_SPOTS.gold;
        silverSpot = METAL_SPOTS.silver;
        platinumSpot = METAL_SPOTS.platinum;
        palladiumSpot = METAL_SPOTS.palladium;
        sourceStatus = "reference";
        provider_status = "fallback";
      }
    }
    
    const currentSpots = {
      gold: goldSpot!,
      silver: silverSpot!,
      platinum: platinumSpot || METAL_SPOTS.platinum,
      palladium: palladiumSpot || METAL_SPOTS.palladium,
    };
    
    const OUNCE_TO_GRAM = 31.1034768;
    const rates: Record<string, any> = {};
    
    const exchangeRates = {
      ...EXCHANGE_RATES,
      AED: usdAed
    };
    
    Object.entries(currentSpots).forEach(([metal, spotUsd]) => {
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
      provider: providerName,
      gold_usd_per_oz: currentSpots.gold,
      silver_usd_per_oz: currentSpots.silver,
      platinum_usd_per_oz: currentSpots.platinum,
      palladium_usd_per_oz: currentSpots.palladium,
      usd_aed: usdAed,
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
    
    res.json(responsePayload);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to compile live metal feed data", details: err.message });
  }
});

// Post Custom Inquiry / Quote request
app.post("/api/quote", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      metalInterest,
      productCategory,
      productName,
      productId,
      quantity,
      weightPreference,
      message,
      sourceLanguage,
      customerId,
    } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Required fields missing (name, email, phone)" });
    }

    const inquiryId = "PGR-" + Math.floor(100000 + Math.random() * 900000);
    const newQuote = {
      id: inquiryId,
      customer_id: customerId || null,
      name,
      email,
      phone,
      company: company || "",
      metal_interest: metalInterest || "gold",
      product_id: productId || null,
      product_name: productName || productCategory || "General Bullion Consultation",
      quantity: quantity || 1,
      weight_preference: weightPreference || "",
      message: message || "",
      status: "awaiting_confirmation",
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
        ? "لقد تم تسجيل طلب عرض السعر بنجاح. سيتواصل معك أحد ممثلي مكتب طلبات التسعير لدينا قريباً."
        : "Your quote request has been recorded successfully. A PGR Product & Quote Desk Representative will contact you shortly.",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to record quote inquiry", details: err.message });
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
    const systemPrompt = `You are the Lead Product & Quote Assistant for PGR UAE Precious Metals (pgruae.com), headquartered in Dubai, United Arab Emirates.
PGR UAE is an ultra-premium institution. We deal exclusively in physical Gold Bullion, Silver Bullion, Gold Coins, Silver Coins, and Wholesale Trading. 
Our target market consists of High-Net-Worth Individuals (HNWIs), institutional investors, corporate funds, and international wholesalers.

PGR UAE is a premium global wholesale trading house, partnered with world-famous authorized brands including PAMP Suisse, Valcambi, Metalor, Argor-Heraeus, Perth Mint, Royal Canadian Mint, and the Royal Mint. We are a trusted trading house and delivery partner, not a manufacturer.

CRITICAL COMPLIANCE RULES:
1. You MUST NOT give investment advice, financial advisory statements, guaranteed returns, or financial promises of any kind. 
2. You MUST NOT use terms like "guaranteed profit", "fixed returns", "investment guarantee", "risk-free", "insured investment".
3. You should only help with:
   * product details (purity, weight, brand, specs)
   * request quote (guiding them to the form)
   * WhatsApp contact (+971559688837)
   * delivery options (UAE and Iraq secured delivery)
   * price confirmation before payment (indicative reference pricing, confirmed before order settlement)

Core Tenets of PGR Assistant:
1. Brand & Tone: You speak with extreme elegance, professional composure, absolute integrity, and precision. You are sophisticated and prestigious, yet humble and helpful.
2. Dubai Advantage: Dubai is the 'City of Gold'. Inform clients that physical investment-grade gold bars (99.5%+ purity) are subject to 0% VAT in the UAE under local guidelines. UAE holds a major geopolitical and logistic advantage for secure transport.
3. Capabilities: We handle wholesale requests, secure shipping/courier handling, secure product storage options in Dubai, customs processing, and custom corporate orders.
4. Response Language: Match the user's language. If they query in Arabic, respond in immaculate, premium Gulf Arabic (الفصحى الراقية). If in English, use refined, elegant business English.
5. No fake data: We deal with real bullion transactions. If they ask to make a purchase, guide them to use our 'Request Quote' form or click 'WhatsApp Order' (+971559688837) to chat live with our desk.

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
    res.status(500).json({ error: "Our assistant node is experiencing momentary delay. Please proceed with live support.", details: err.message });
  }
});

// Configure full-stack integration (Vite dev server or production static files)
async function bootServer() {
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

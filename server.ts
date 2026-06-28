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
  gold: 2365.40,      // USD per Ounce
  silver: 29.85,      // USD per Ounce
  platinum: 965.20,   // USD per Ounce
  palladium: 1012.10  // USD per Ounce
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
  office_address_en: "Almas Tower, DMCC Precinct, Dubai Marina, Dubai, United Arab Emirates",
  office_address_ar: "برج الماس، منطقة مركز دبي للسلع المتعددة (DMCC)، دبي مارينا، دبي، الإمارات العربية المتحدة",
  dmcc_reg_no: "890317",
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
    
    if (isLiveEnabled && has_api_key) {
      provider_attempted = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
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
        console.warn("Secure Fetch Warning: Live prices route fell back due to a network or timeout event.");
        sourceStatus = "fallback";
        provider_status = "error";
        provider_error_type = "api_failed";
      }
    }
    
    // Fallback to manual admin price or default reference points
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
        if (!has_api_key) {
          sourceStatus = "reference";
          provider_status = "fallback";
        }
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
    const usdAed = serverSettings.usd_aed_rate || 3.6725;
    
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
      provider: "Metal Price API",
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
    const { name, email, phone, company, metalInterest, productCategory, weight, message, sourceLanguage } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Required fields missing (name, email, phone)" });
    }

    const inquiryId = "PGR-" + Math.floor(100000 + Math.random() * 900000);
    const newQuote = {
      id: inquiryId,
      name,
      email,
      phone,
      company: company || "",
      metal_interest: metalInterest || "both",
      product_category: productCategory || "General Bullion Consultation",
      weight_preference: weight || "",
      message: message || "",
      status: "Pending",
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
        ? "لقد تم تسجيل طلب عرض السعر بنجاح. سيتواصل معك أحد مستشارينا التنفيذيين خلال ٢٤ ساعة."
        : "Your bespoke quote request has been cataloged successfully. A PGR Executive Advisor will initiate contact within 24 hours.",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to record bespoke quote inquiry", details: err.message });
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
      ? `شكراً لتواصلك مع PGR ومقرنا في دبي. في الوقت الحالي، خدمة المساعدة الذكية غير متصلة مؤقتاً بالإنترنت. يرجى التواصل معنا مباشرة عبر الواتساب على 971500000000+ للحصول على استشارتك الفورية لبيع وشراء سبائك الذهب والفضة.`
      : `Thank you for contacting PGR Precious Metals, Dubai. Our AI advisor is currently operating in offline refinement mode. Please contact our trading desk directly via WhatsApp at +971500000000 for instant, high-volume bullion transaction support.`;
    
    return res.json({ text: responseText, isFallback: true });
  }

  try {
    // Compile previous message format for Gemini
    // We only take the last 5 messages to avoid token bloat and maintain crisp responsiveness.
    const recentMessages = messages.slice(-6);
    const systemPrompt = `You are the Lead Investment Advisor & Executive Precious Metals Concierge for PGR UAE Precious Metals (pgruae.com), headquartered in Dubai, United Arab Emirates.
PGR UAE is an ultra-premium institution. We deal exclusively in physical physical Gold Bullion, Silver Bullion, Gold Coins, Silver Coins, and Wholesale Trading. 
Our target market consists of High-Net-Worth Individuals (HNWIs), institutional investors, corporate funds, sovereign wealth portfolios, and international wholesalers.

PGR UAE is a premium global wholesale trading desk, partnered with world-famous authorized brands including PAMP Suisse, Valcambi, Metalor, Argor-Heraeus, Perth Mint, Royal Canadian Mint, and the Royal Mint. We are a trusted trading house and delivery partner, not a manufacturer.

Core Tenets of PGR Advisor:
1. Brand & Tone: You speak with extreme elegance, professional composure, absolute integrity, and precision. You are sophisticated and prestigious, yet humble and helpful, mirroring brands like Rolex, Patek Philippe, and Rolls Royce.
2. Dubai Advantage: Dubai is the 'City of Gold'. Inform clients that physical investment-grade gold bars (99.5%+ purity) are 0% VAT in the UAE. UAE holds a major geopolitical and logistic advantage for secure storage and transport.
3. Capabilities: We handle wholesale contracts, secure shipping worldwide, DMCC-standard compliance, secure vaults in Dubai, customs processing, and custom corporate orders.
4. Response Language: Match the user's language. If they query in Arabic, respond in immaculate, premium Gulf Arabic (الفصحى الراقية). If in English, use refined, elegant business English.
5. No fake data: We deal with real bullion transactions. Always advise them that physical metals represent ultimate asset protection. If they ask to make a purchase, guide them to use our 'Request Bespoke Quote' form or click 'WhatsApp Order' to chat live with our executive desk.

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

    const outputText = response.text || "I apologize. I was unable to compile an advisory statement at this moment. Please connect with our Dubai office.";
    res.json({ text: outputText });
  } catch (err: any) {
    console.error("AI Advisor generation error:", err);
    res.status(500).json({ error: "Our advisory node is experiencing momentary luxury delays. Please proceed with live support.", details: err.message });
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

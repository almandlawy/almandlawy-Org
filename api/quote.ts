import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
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

  if (!isUrlConfigured || !isKeyConfigured) return null;

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("[api/quote] Supabase init failed:", err);
    return null;
  }
}

const PRODUCT_LABELS: Record<string, string> = {
  "gold-bars": "Gold bars",
  "silver-bars": "Silver bars",
  "bullion-coins": "Bullion coins",
  "custom-inquiry": "Custom inquiry"
};

function metalFromProduct(productInterest: string): string {
  if (productInterest === "silver-bars") return "silver";
  if (productInterest === "bullion-coins") return "both";
  if (productInterest === "custom-inquiry") return "both";
  return "gold";
}

function buildMessage(body: Record<string, unknown>): string {
  const parts: string[] = [];
  if (body.countryCity) parts.push(`Country/City: ${body.countryCity}`);
  if (body.preferredContact) parts.push(`Preferred contact: ${body.preferredContact}`);
  if (body.quantityBudget) parts.push(`Quantity/Budget: ${body.quantityBudget}`);
  if (body.source) parts.push(`Source: ${body.source}`);
  const userMessage = String(body.message || "").trim();
  if (userMessage) {
    if (parts.length) parts.push("---");
    parts.push(userMessage);
  }
  return parts.join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const name = String(body.name || body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const productKey = String(body.productInterest || body.productCategory || "gold-bars");
    const productCategory =
      PRODUCT_LABELS[productKey] ||
      String(body.productCategory || body.productInterest || "Gold bars");
    const countryCity = String(body.countryCity || body.company || body.companyName || "").trim();
    const quantityBudget = String(
      body.quantityBudget || body.weight || body.weightPreference || ""
    ).trim();
    const preferredContact = String(body.preferredContact || "WhatsApp").trim();
    const sourceLanguage = String(body.sourceLanguage || "en");
    const source = String(body.source || "website_request_quote_page");

    if (!name || !phone) {
      return res.status(400).json({
        error: "Required fields missing (name, phone)",
        details: "fullName and WhatsApp phone are required."
      });
    }

    const inquiryId = "PGR-" + Math.floor(100000 + Math.random() * 900000);
    const newQuote = {
      id: inquiryId,
      name,
      email: email || `whatsapp+${phone.replace(/\D/g, "").slice(-12)}@quote.pgruae.com`,
      phone,
      company: countryCity,
      metal_interest: metalFromProduct(productKey),
      product_category: productCategory,
      weight_preference: quantityBudget,
      message: buildMessage({
        countryCity,
        preferredContact,
        quantityBudget,
        message: body.message,
        source
      }),
      status: "New Request",
      created_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    let persisted = false;

    if (supabase) {
      const { error } = await supabase.from("quote_requests").insert(newQuote);
      if (error) {
        console.error("[api/quote] Supabase insert failed:", error.message, error);
      } else {
        persisted = true;
        console.log(`[api/quote] Saved inquiry ${inquiryId} to Supabase`);
      }
    } else {
      console.warn("[api/quote] Supabase not configured — recording inquiry in logs only", {
        inquiryId,
        name,
        phone,
        productCategory
      });
    }

    return res.status(200).json({
      success: true,
      inquiryId,
      persisted,
      message:
        sourceLanguage === "ar"
          ? "تم استلام طلبك. سيراجع PGR UAE التوفر ويتواصل معك على واتساب."
          : "Your request has been received. PGR UAE will review availability and contact you on WhatsApp.",
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/quote] Unhandled error:", details, err);
    return res.status(500).json({
      error: "Failed to record quote inquiry",
      details
    });
  }
}

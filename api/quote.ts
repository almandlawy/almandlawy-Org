import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function getServiceClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
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

async function tryInsertQuote(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  payloads: Array<Record<string, unknown>>
): Promise<{ ok: boolean; error?: string; code?: string }> {
  for (const payload of payloads) {
    const { error } = await client.from("quote_requests").insert(payload);
    if (!error) return { ok: true };
    console.error("[api/quote] insert attempt failed:", error.message, payload);
    if (payloads.indexOf(payload) === payloads.length - 1) {
      return { ok: false, error: error.message, code: error.code };
    }
  }
  return { ok: false, error: "All insert attempts failed" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed. Use POST." });

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
    const resolvedEmail = email || `whatsapp+${phone.replace(/\D/g, "").slice(-12)}@quote.pgruae.com`;
    const message = buildMessage({
      countryCity,
      preferredContact,
      quantityBudget,
      message: body.message,
      source
    });

    const baseRow = {
      name,
      email: resolvedEmail,
      phone,
      company: countryCity,
      metal_interest: metalFromProduct(productKey),
      product_category: productCategory,
      weight_preference: quantityBudget,
      message,
      status: "New Request",
      created_at: new Date().toISOString()
    };

    const fullMessage = [
      `Inquiry: ${inquiryId}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${resolvedEmail}`,
      `Location: ${countryCity}`,
      `Product: ${productCategory}`,
      `Quantity/Budget: ${quantityBudget}`,
      `Contact: ${preferredContact}`,
      message ? `Notes: ${message}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    const service = getServiceClient();
    let persisted = false;
    let persistError: string | undefined;
    let persistCode: string | undefined;

    if (service) {
      const result = await tryInsertQuote(service, [
        { id: inquiryId, ...baseRow },
        { id: inquiryId, inquiry_id: inquiryId, ...baseRow },
        {
          id: inquiryId,
          name,
          phone,
          company: countryCity,
          metal_interest: metalFromProduct(productKey),
          product_category: productCategory,
          weight_preference: quantityBudget,
          message: fullMessage,
          status: "New Request",
          created_at: baseRow.created_at
        },
        {
          id: inquiryId,
          name,
          phone,
          message: fullMessage,
          status: "New Request",
          created_at: baseRow.created_at
        },
        {
          inquiry_id: inquiryId,
          name,
          phone,
          message: fullMessage,
          status: "New Request",
          created_at: baseRow.created_at
        }
      ]);
      persisted = result.ok;
      persistError = result.error;
      persistCode = result.code;
      if (persisted) {
        console.log(`[api/quote] Saved inquiry ${inquiryId}`);
      }
    } else {
      persistError = "SUPABASE_SERVICE_ROLE_KEY not set in Vercel";
      console.warn("[api/quote] No service role client — quote logged only", { inquiryId, name, phone });
    }

    return res.status(200).json({
      success: true,
      inquiryId,
      persisted,
      persistError: persisted ? undefined : persistError,
      persistCode: persisted ? undefined : persistCode,
      message:
        sourceLanguage === "ar"
          ? "تم استلام طلبك. سيراجع PGR UAE التوفر ويتواصل معك على واتساب."
          : "Your request has been received. PGR UAE will review availability and contact you on WhatsApp.",
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/quote] Unhandled error:", details, err);
    return res.status(500).json({ error: "Failed to record quote inquiry", details });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const WHATSAPP = "+971559688837";

const SUCCESS_MSG = {
  en: "Your request has been received. PGR UAE will review your inquiry and may contact you for additional KYC/AML information before issuing a firm quote.",
  ar: "تم استلام طلبك. سيقوم فريق PGR UAE بمراجعة الاستفسار وقد يتواصل معك لطلب معلومات KYC/AML إضافية قبل إصدار عرض سعر مؤكد.",
};

const ERROR_MSG = {
  en: `We could not submit your request right now. Please contact PGR UAE on WhatsApp: ${WHATSAPP}`,
  ar: `تعذر إرسال طلبك حالياً. يرجى التواصل مع PGR UAE عبر واتساب: ${WHATSAPP}`,
};

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const key = process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !key || url.includes("placeholder") || key.length < 10) return null;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return null;
  return createClient(url, key);
}

function langOf(sourceLanguage?: string): "en" | "ar" {
  return sourceLanguage === "ar" ? "ar" : "en";
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body: Record<string, unknown>;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const lang = langOf(body.sourceLanguage as string | undefined);

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const clientType = String(body.clientType || "").trim();
  const productInterest = String(body.productInterest || body.productCategory || "").trim();
  const metalInterest = String(body.metalInterest || "").trim();
  const weightPreference = String(body.weightPreference || body.weight || body.quantity || "").trim();
  const preferredCurrency = String(body.preferredCurrency || "").trim();
  const deliveryInterest = String(body.deliveryInterest || "").trim();
  const message = String(body.message || "").trim();
  const company = String(body.company || "").trim();

  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!email) missing.push("email");
  if (!phone) missing.push("phone");
  if (!clientType) missing.push("clientType");
  if (!productInterest) missing.push("productInterest");
  if (!metalInterest) missing.push("metalInterest");
  if (!weightPreference) missing.push("weightPreference");
  if (!preferredCurrency) missing.push("preferredCurrency");
  if (!deliveryInterest) missing.push("deliveryInterest");
  if (!message) missing.push("message");

  if (missing.length > 0) {
    return res.status(400).json({
      error: lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.",
      missing,
    });
  }

  if (clientType === "company" && !company) {
    return res.status(400).json({
      error: lang === "ar" ? "يرجى إدخال اسم الشركة." : "Company name is required for company inquiries.",
    });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({
      error: lang === "ar" ? "يرجى إدخال بريد إلكتروني صالح." : "Please enter a valid email address.",
    });
  }

  const inquiryId = "PGR-" + Math.floor(100000 + Math.random() * 900000);

  const enrichedMessage = [
    message,
    `Client type: ${clientType}`,
    `Preferred currency: ${preferredCurrency}`,
    `Delivery/collection/storage: ${deliveryInterest}`,
  ].join("\n");

  // Insert only columns that exist on quote_requests (snake_case schema)
  const dbRow = {
    id: inquiryId,
    customer_id: body.customerId || null,
    name,
    email,
    phone,
    company: clientType === "company" ? company : "",
    metal_interest: metalInterest,
    product_name: productInterest,
    quantity: 1,
    weight_preference: weightPreference,
    currency: preferredCurrency,
    message: enrichedMessage,
    status: "Pending",
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = getSupabase();

    if (!supabase) {
      console.error("Supabase not configured — cannot persist quote:", inquiryId);
      return res.status(503).json({
        success: false,
        error: ERROR_MSG[lang],
        whatsapp: WHATSAPP,
      });
    }

    const { error } = await supabase.from("quote_requests").insert(dbRow);
    if (error) {
      console.error("Failed to save quote request to Supabase:", error.message);
      return res.status(500).json({
        success: false,
        error: ERROR_MSG[lang],
        whatsapp: WHATSAPP,
      });
    }

    return res.status(200).json({
      success: true,
      inquiryId,
      message: SUCCESS_MSG[lang],
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Quote submission error:", err);
    return res.status(500).json({
      success: false,
      error: ERROR_MSG[lang],
      whatsapp: WHATSAPP,
    });
  }
}

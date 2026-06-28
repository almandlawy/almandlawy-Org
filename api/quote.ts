import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const key = process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !key || url.includes("placeholder") || key.length < 10) return null;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const {
      name,
      email,
      phone,
      company,
      metalInterest,
      productCategory,
      productId,
      productName,
      quantity,
      weightPreference,
      message,
      sourceLanguage,
      customerId,
    } = body || {};

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
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from("quote_requests").insert(newQuote);
      if (error) {
        console.error("Failed to save quote request to Supabase:", error);
      }
    }

    return res.status(200).json({
      success: true,
      inquiryId,
      message:
        sourceLanguage === "ar"
          ? "لقد تم تسجيل طلب عرض السعر بنجاح. سيتواصل معك أحد ممثلي مكتب طلبات التسعير لدينا قريباً."
          : "Your quote request has been recorded successfully. A PGR desk representative will contact you shortly.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to record quote request",
      details: err?.message || "Unknown error",
    });
  }
}

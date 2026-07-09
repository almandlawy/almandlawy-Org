import type { VercelRequest, VercelResponse } from "@vercel/node";
import { notifyDeskNewQuote } from "./_lib/quoteNotify";
import { notifyDeskNewKyc } from "./_lib/kycNotify";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const type = String(body.type || "");

    if (type === "quote") {
      const result = await notifyDeskNewQuote({
        inquiryId: String(body.inquiryId || ""),
        name: String(body.name || body.fullName || ""),
        phone: String(body.phone || ""),
        productCategory: String(body.productCategory || body.productInterest || "Bullion"),
        countryCity: String(body.countryCity || body.company || ""),
        quantityBudget: String(body.quantityBudget || ""),
        source: String(body.source || "website"),
        sourceLanguage: String(body.sourceLanguage || "en"),
        message: String(body.message || ""),
      });
      return res.status(200).json({ success: true, ...result });
    }

    if (type === "kyc") {
      const result = await notifyDeskNewKyc({
        customerId: String(body.customerId || ""),
        fullName: String(body.fullName || ""),
        email: String(body.email || ""),
        phone: String(body.phone || ""),
        country: String(body.country || ""),
        city: String(body.city || ""),
        status: String(body.status || "Pending review"),
      });
      return res.status(200).json({ success: true, ...result });
    }

    return res.status(400).json({ error: "Invalid type. Use quote or kyc." });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/desk-notify] error:", details);
    return res.status(500).json({ error: details });
  }
}

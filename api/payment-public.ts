import type { VercelRequest, VercelResponse } from "@vercel/node";
import { loadPlatformSettings } from "./_lib/platformSettings";
import { paymentSettingsFromPlatform, toPublicPaymentSettings, DEFAULT_PAYMENT_SETTINGS } from "./_lib/paymentSettings";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const settings = await loadPlatformSettings();
    const ps = paymentSettingsFromPlatform(settings);
    return res.status(200).json(toPublicPaymentSettings(ps));
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/payment-public] error:", details);
    return res.status(200).json(toPublicPaymentSettings(DEFAULT_PAYMENT_SETTINGS));
  }
}

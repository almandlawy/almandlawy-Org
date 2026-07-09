import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminEmail } from "./_lib/adminAuth";
import { loadPlatformSettings, savePlatformSettings } from "./_lib/platformSettings";
import { mergePaymentSettings, paymentSettingsFromPlatform } from "./_lib/paymentSettings";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PATCH,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-PGR-Admin-Email"
  );

  if (req.method === "OPTIONS") return res.status(200).end();

  const adminEmail = await requireAdminEmail(req);
  if (!adminEmail) return res.status(403).json({ error: "Admin authorization required." });

  try {
    if (req.method === "GET") {
      const settings = await loadPlatformSettings();
      return res.status(200).json({ payment_settings: paymentSettingsFromPlatform(settings) });
    }

    if (req.method === "PATCH") {
      const incoming = mergePaymentSettings(req.body);
      delete (incoming as Record<string, unknown>).gateway_secret_key;
      delete (incoming as Record<string, unknown>).api_key;

      const merged = await savePlatformSettings({ payment_settings: incoming });
      console.log(`[api/admin/payment-settings] updated by ${adminEmail}`);
      return res.status(200).json({
        success: true,
        payment_settings: paymentSettingsFromPlatform(merged),
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/admin/payment-settings] error:", details);
    return res.status(500).json({ error: details });
  }
}

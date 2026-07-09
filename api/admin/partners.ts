import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminEmail } from "../_lib/adminAuth";
import { loadPlatformSettings, savePlatformSettings } from "../_lib/platformSettings";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
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
      return res.status(200).json({ partners: settings.partner_logos || [] });
    }

    if (req.method === "PUT") {
      const body = (req.body || {}) as { partners?: unknown[] };
      const partners = Array.isArray(body.partners) ? body.partners : [];
      const merged = await savePlatformSettings({ partner_logos: partners });
      console.log(`[api/admin/partners] saved ${partners.length} logos by ${adminEmail}`);
      return res.status(200).json({ success: true, partners: merged.partner_logos || [] });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/admin/partners] error:", details);
    return res.status(500).json({ error: details });
  }
}

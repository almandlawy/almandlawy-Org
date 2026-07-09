import type { VercelRequest, VercelResponse } from "@vercel/node";
import { loadPlatformSettings, publicPartnerLogos } from "./_lib/platformSettings";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const settings = await loadPlatformSettings();
    const partners = publicPartnerLogos((settings.partner_logos as unknown[]) || []);
    return res.status(200).json({ partners });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/partners] error:", details);
    return res.status(500).json({ error: details, partners: [] });
  }
}

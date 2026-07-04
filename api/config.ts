import type { VercelRequest, VercelResponse } from "@vercel/node";

function getSupabasePublicEnv() {
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  const configured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder") &&
      supabaseUrl.startsWith("https://")
  );

  return { supabaseUrl, supabaseAnonKey, configured };
}

/** Public runtime config — anon key is safe to expose to the browser. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { supabaseUrl, supabaseAnonKey, configured } = getSupabasePublicEnv();

    return res.status(200).json({
      configured,
      supabaseUrl: configured ? supabaseUrl : "",
      supabaseAnonKey: configured ? supabaseAnonKey : "",
      siteUrl: "https://www.pgruae.com"
    });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/config] Error:", details);
    return res.status(500).json({ configured: false, error: details });
  }
}

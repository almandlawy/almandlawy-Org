import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Public runtime config — anon key is safe to expose to the browser. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

  const configured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder") &&
      supabaseUrl.startsWith("https://")
  );

  return res.status(200).json({
    configured,
    supabaseUrl: configured ? supabaseUrl : "",
    supabaseAnonKey: configured ? supabaseAnonKey : "",
    siteUrl: "https://www.pgruae.com"
  });
}

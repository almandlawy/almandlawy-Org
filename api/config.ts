import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabasePublicEnv } from "./supabaseEnv";

/** Public runtime config — anon key is safe to expose to the browser. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { supabaseUrl, supabaseAnonKey, configured } = getSupabasePublicEnv();

  return res.status(200).json({
    configured,
    supabaseUrl: configured ? supabaseUrl : "",
    supabaseAnonKey: configured ? supabaseAnonKey : "",
    siteUrl: "https://www.pgruae.com"
  });
}

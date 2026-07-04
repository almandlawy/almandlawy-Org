/** Resolve Supabase public credentials from Vercel env (supports both naming conventions). */
export function getSupabasePublicEnv() {
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

/** Service role key for trusted server-side writes (optional). */
export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

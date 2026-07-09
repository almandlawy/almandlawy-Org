import type { VercelRequest } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const BOOTSTRAP_ADMINS = ["almandlawy112@gmail.com", "admin@pgruae.com"];

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function getServiceClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireAdminEmail(req: VercelRequest): Promise<string | null> {
  const secret = process.env.ADMIN_API_SECRET || process.env.PGR_ADMIN_API_SECRET;
  const authHeader = req.headers.authorization || "";
  if (secret && authHeader === `Bearer ${secret}`) {
    return "api-secret";
  }

  const adminEmail = String(req.headers["x-pgr-admin-email"] || "")
    .trim()
    .toLowerCase();
  if (adminEmail && BOOTSTRAP_ADMINS.includes(adminEmail)) return adminEmail;

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const url = getSupabaseUrl();
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const service = getServiceClient();

  if (token && url && anonKey) {
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await userClient.auth.getUser(token);
    const email = data.user?.email?.trim().toLowerCase();
    if (!error && email) {
      if (BOOTSTRAP_ADMINS.includes(email)) return email;
      if (service) {
        const { data: adminRow } = await service
          .from("admin_users")
          .select("email, is_active")
          .eq("email", email)
          .maybeSingle();
        if (adminRow && adminRow.is_active !== false) return email;
      }
    }
  }

  if (adminEmail && service) {
    const { data: adminRow } = await service
      .from("admin_users")
      .select("email, is_active")
      .eq("email", adminEmail)
      .maybeSingle();
    if (adminRow && adminRow.is_active !== false) return adminEmail;
  }

  return null;
}

export function getServiceSupabase() {
  return getServiceClient();
}

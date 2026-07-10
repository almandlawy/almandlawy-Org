import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "./_lib/adminAuth";

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function getAnonKey() {
  return process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
}

const BOOTSTRAP_ADMINS = ["almandlawy112@gmail.com", "admin@pgruae.com"];

async function requireAdmin(req: VercelRequest): Promise<string | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  const service = getServiceSupabase();
  if (!token || !url || !anonKey || !service) return null;

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await userClient.auth.getUser(token);
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email) return null;

  if (BOOTSTRAP_ADMINS.includes(email)) return email;

  const { data: adminRow } = await service
    .from("admin_users")
    .select("email, is_active")
    .eq("email", email)
    .maybeSingle();

  return adminRow && adminRow.is_active !== false ? email : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const adminEmail = await requireAdmin(req);
  if (!adminEmail) return res.status(403).json({ error: "Admin access required" });

  const service = getServiceSupabase();
  if (!service) return res.status(503).json({ error: "Supabase service role not configured" });

  try {
    if (req.method === "GET") {
      const { data, error } = await service
        .from("kyc_profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("[api/admin-kyc] list failed:", error);
        return res.status(500).json({ error: error.message, code: error.code });
      }

      return res.status(200).json({ profiles: data || [] });
    }

    if (req.method === "PATCH") {
      const body = (req.body || {}) as {
        customerId?: string;
        status?: string;
        notifyClient?: boolean;
      };
      const customerId = String(body.customerId || "").trim();
      const status = String(body.status || "").trim();

      if (!customerId || !status) {
        return res.status(400).json({ error: "customerId and status are required" });
      }

      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === "Verified") {
        updates.verified_at = new Date().toISOString();
      }

      const { data, error } = await service
        .from("kyc_profiles")
        .update(updates)
        .eq("id", customerId)
        .select()
        .maybeSingle();

      if (error) {
        console.error("[api/admin-kyc] update failed:", error);
        return res.status(500).json({ error: error.message, code: error.code });
      }

      console.log(`[api/admin-kyc] ${customerId} → ${status} by ${adminEmail}`);
      return res.status(200).json({ success: true, profile: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/admin-kyc] error:", details);
    return res.status(500).json({ error: details });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function getServiceClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function getAnonKey() {
  return process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
}

const BOOTSTRAP_ADMINS = ["almandlawy112@gmail.com", "admin@pgruae.com"];

function normalizeQuote(row: Record<string, unknown>) {
  return {
    ...row,
    metalInterest: row.metal_interest || row.metalInterest,
    productCategory: row.product_category || row.productCategory,
    weight: row.weight_preference || row.weight,
    company: row.company || row.countryCity
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  const service = getServiceClient();

  if (!url || !anonKey || !service) {
    return res.status(503).json({ error: "Supabase service role not configured" });
  }

  try {
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    const email = userData.user?.email?.trim().toLowerCase();

    if (userError || !email) {
      return res.status(401).json({ error: "Invalid session" });
    }

    let isAdmin = BOOTSTRAP_ADMINS.includes(email);
    if (!isAdmin) {
      const { data: adminRow } = await service
        .from("admin_users")
        .select("email, is_active")
        .eq("email", email)
        .maybeSingle();
      isAdmin = Boolean(adminRow && adminRow.is_active !== false);
    }

    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (req.method === "PATCH") {
      const body = (req.body || {}) as { id?: string; updates?: Record<string, unknown> };
      const quoteId = String(body.id || "").trim();
      const updates = body.updates || {};

      if (!quoteId || !Object.keys(updates).length) {
        return res.status(400).json({ error: "id and updates are required" });
      }

      const { data, error } = await service
        .from("website_quote_requests")
        .update(updates)
        .eq("id", quoteId)
        .select()
        .maybeSingle();

      if (error) {
        console.error("[api/admin-quotes] patch failed:", error);
        return res.status(500).json({ error: error.message, code: error.code });
      }

      console.log(`[api/admin-quotes] updated ${quoteId} by ${email}`);
      return res.status(200).json({
        success: true,
        quote: data ? normalizeQuote(data as Record<string, unknown>) : null,
      });
    }

    const { data, error } = await service
      .from("website_quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/admin-quotes] list failed:", error);
      return res.status(500).json({ error: error.message, code: error.code });
    }

    return res.status(200).json({
      quotes: (data || []).map((row) => normalizeQuote(row as Record<string, unknown>))
    });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/admin-quotes] error:", details);
    return res.status(500).json({ error: details });
  }
}

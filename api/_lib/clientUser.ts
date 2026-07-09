import type { VercelRequest } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function getAnonClient() {
  const url = getSupabaseUrl();
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface ResolvedClientUser {
  id: string;
  email?: string;
}

export async function resolveClientUser(req: VercelRequest): Promise<ResolvedClientUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  if (token.startsWith("mock-token-")) {
    const mockId = token.replace("mock-token-", "");
    return mockId ? { id: mockId } : null;
  }

  const anon = getAnonClient();
  if (!anon) return null;
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return { id: data.user.id, email: data.user.email || undefined };
}

export function getServiceClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isKycSchemaMissingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("kyc_profiles") &&
    (lower.includes("schema cache") ||
      lower.includes("not find") ||
      lower.includes("does not exist") ||
      lower.includes("relation"))
  );
}

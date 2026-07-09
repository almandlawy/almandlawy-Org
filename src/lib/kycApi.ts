/**
 * KYC API client — schema check via browser Supabase (API route unreliable on Vercel).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { ensureSupabaseReady, isLive, supabase } from "./supabase";

export interface KycSchemaStatus {
  ready: boolean;
  reason?: string;
}

/** Verify kyc_profiles is reachable from the logged-in client session. */
export async function checkKycSchemaReady(): Promise<KycSchemaStatus> {
  await ensureSupabaseReady();
  if (!isLive || !supabase) {
    return { ready: true };
  }
  const { error } = await supabase
    .from("kyc_profiles")
    .select("id, status, documents, uploaded_files, updated_at")
    .limit(1);
  if (!error) return { ready: true };

  const msg = error.message || "KYC table unreachable";
  if (msg.toLowerCase().includes("column")) {
    return { ready: false, reason: "kyc_profiles missing columns — run scripts/kyc-repair-columns.sql" };
  }
  return { ready: false, reason: msg };
}

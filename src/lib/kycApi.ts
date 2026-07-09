/**
 * KYC API client — uses server service role (production) for reliable persistence.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { getAccessToken } from "./clientAuth";

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export interface KycSchemaStatus {
  ready: boolean;
  reason?: string;
}

export async function checkKycSchemaReady(): Promise<KycSchemaStatus> {
  try {
    const res = await fetch("/api/kyc?check=schema");
    const data = await res.json().catch(() => ({}));
    return { ready: Boolean(data.ready), reason: data.reason };
  } catch {
    return { ready: false, reason: "Could not reach KYC API" };
  }
}

export async function fetchKycProfileViaApi(customerId: string): Promise<any | null> {
  const headers = await authHeaders();
  const res = await fetch("/api/kyc", { headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) return null;

  if (!res.ok) {
    const details = String(data.details || data.error || res.status);
    const err = new Error(details);
    (err as Error & { schemaMissing?: boolean }).schemaMissing = Boolean(data.schemaMissing);
    throw err;
  }

  if (data.profile) return data.profile;

  return {
    id: customerId,
    full_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    country: "",
    city: "",
    nationality: "",
    dob: "",
    source_of_funds_declaration: "",
    agreement_accepted: false,
    privacy_consent: false,
    status: "Not submitted",
    documents: [],
    uploaded_files: {},
  };
}

export async function saveKycProfileViaApi(profile: Record<string, unknown>): Promise<any> {
  const headers = await authHeaders();
  const res = await fetch("/api/kyc", {
    method: "POST",
    headers,
    body: JSON.stringify(profile),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const details = String(data.details || data.error || res.status);
    throw new Error(details);
  }

  return data.profile;
}

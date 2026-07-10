/**
 * Public partner logos — multi-source fetch (storage CDN first, works on all devices).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { PartnerLogo } from "../types";

export type PartnerPublic = Omit<PartnerLogo, "internal_note">;

const SETTINGS_KEY = "pgr_admin_settings";
const PUBLIC_JSON_PATH = "partners.json";
const STORAGE_BUCKET = "site-assets";

function filterPublic(partners: unknown[]): PartnerPublic[] {
  if (!Array.isArray(partners)) return [];
  return partners
    .filter(
      (p: any) =>
        p &&
        p.public_display_enabled !== false &&
        String(p.logo_url || "").trim().length > 0
    )
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map(({ internal_note: _n, ...rest }: any) => rest as PartnerPublic);
}

/** Supabase public storage URL for partners.json (CDN, no API needed). */
export function getPartnersPublicJsonUrl(supabaseUrl: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${PUBLIC_JSON_PATH}`;
}

export async function fetchPublicPartnerLogos(options: {
  supabaseUrl?: string;
  fetchApi?: () => Promise<PartnerPublic[]>;
  fetchStorage?: (url: string) => Promise<PartnerPublic[]>;
  fetchDb?: () => Promise<PartnerPublic[]>;
  localFallback?: () => PartnerPublic[];
}): Promise<PartnerPublic[]> {
  const {
    supabaseUrl,
    fetchApi,
    fetchStorage,
    fetchDb,
    localFallback,
  } = options;

  // 1. Public JSON on Supabase Storage — best for mobile + ads traffic
  if (supabaseUrl) {
    try {
      const url = getPartnersPublicJsonUrl(supabaseUrl);
      const loader =
        fetchStorage ||
        (async (jsonUrl: string) => {
          const res = await fetch(jsonUrl, { cache: "no-store" });
          if (!res.ok) return [];
          const data = await res.json();
          return filterPublic(data.partners || data);
        });
      const fromStorage = await loader(url);
      if (fromStorage.length > 0) return fromStorage;
    } catch (err) {
      console.warn("[partners] storage JSON fetch failed:", err);
    }
  }

  // 2. Vercel API (when service role + platform_settings exist)
  if (fetchApi) {
    try {
      const fromApi = await fetchApi();
      if (fromApi.length > 0) return fromApi;
    } catch (err) {
      console.warn("[partners] API fetch failed:", err);
    }
  }

  // 3. Direct Supabase platform_settings (anon/service via client)
  if (fetchDb) {
    try {
      const fromDb = await fetchDb();
      if (fromDb.length > 0) return fromDb;
    } catch (err) {
      console.warn("[partners] DB fetch failed:", err);
    }
  }

  // 4. Admin browser localStorage — desktop only, not for production visitors
  if (localFallback) {
    const local = localFallback();
    if (local.length > 0) return local;
  }

  return [];
}

export { filterPublic, SETTINGS_KEY, STORAGE_BUCKET, PUBLIC_JSON_PATH };

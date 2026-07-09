/**
 * Marketing attribution — capture UTM params and gclid for quote funnel tracking.
 */

const STORAGE_KEY = "pgr_marketing_attribution";

export interface MarketingAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  landing_page?: string;
  captured_at?: string;
}

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;

/** Read attribution from URL and persist (first-touch in session). */
export function captureAttributionFromUrl(
  search = typeof window !== "undefined" ? window.location.search : "",
  pathname = typeof window !== "undefined" ? window.location.pathname : ""
): MarketingAttribution | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(search);
  const incoming: MarketingAttribution = {};

  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key)?.trim();
    if (value) incoming[key] = value;
  }

  if (!Object.keys(incoming).length) {
    return getStoredAttribution();
  }

  const stored = getStoredAttribution() || {};
  const merged: MarketingAttribution = {
    ...stored,
    ...incoming,
    landing_page: stored.landing_page || pathname,
    captured_at: stored.captured_at || new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore quota / private mode */
  }

  return merged;
}

export function getStoredAttribution(): MarketingAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MarketingAttribution;
  } catch {
    return null;
  }
}

/** Append stored attribution params to a path (for quote navigation). */
export function appendAttributionToPath(path: string): string {
  const attr = getStoredAttribution();
  if (!attr) return path;

  const [base, existingQuery] = path.split("?");
  const params = new URLSearchParams(existingQuery || "");

  for (const key of ATTRIBUTION_KEYS) {
    const value = attr[key];
    if (value && !params.has(key)) params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Flat attribution object for quote API payloads. */
export function attributionPayload(): Record<string, string> {
  const attr = getStoredAttribution();
  if (!attr) return {};

  const out: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = attr[key];
    if (value) out[key] = value;
  }
  if (attr.landing_page) out.landing_page = attr.landing_page;
  return out;
}

/** Human-readable block for admin quote notes. */
export function formatAttributionForMessage(attr: MarketingAttribution | null): string {
  if (!attr || !Object.keys(attr).length) return "";

  const lines: string[] = ["Attribution:"];
  if (attr.utm_source) lines.push(`utm_source: ${attr.utm_source}`);
  if (attr.utm_medium) lines.push(`utm_medium: ${attr.utm_medium}`);
  if (attr.utm_campaign) lines.push(`utm_campaign: ${attr.utm_campaign}`);
  if (attr.utm_term) lines.push(`utm_term: ${attr.utm_term}`);
  if (attr.utm_content) lines.push(`utm_content: ${attr.utm_content}`);
  if (attr.gclid) lines.push(`gclid: ${attr.gclid}`);
  if (attr.landing_page) lines.push(`landing_page: ${attr.landing_page}`);

  return lines.length > 1 ? lines.join("\n") : "";
}

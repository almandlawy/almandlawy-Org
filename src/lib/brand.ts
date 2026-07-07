/** PGR UAE brand assets — logo, favicon, OG image. */
export const BRAND_ASSET_VERSION = "transparent-v1";

export const BRAND = {
  name: "PGR UAE",
  taglineEn: "Precious Metals Trading",
  taglineAr: "تجارة المعادن الثمينة",
  logoFull: `/brand/pgr-uae-logo.png?v=${BRAND_ASSET_VERSION}`,
  logoEmblem: `/brand/pgr-uae-favicon.png?v=${BRAND_ASSET_VERSION}`,
  favicon: `/brand/pgr-uae-favicon.png?v=${BRAND_ASSET_VERSION}`,
  appleTouchIcon: `/brand/pgr-uae-apple-touch-icon.png?v=${BRAND_ASSET_VERSION}`,
  ogImage: `https://www.pgruae.com/brand/pgr-uae-logo.png?v=${BRAND_ASSET_VERSION}`,
} as const;

export const BRAND_LOGO_ALT = "PGR UAE — Precious Metals Trading";

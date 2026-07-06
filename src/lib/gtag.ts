/** Google Ads / gtag helpers — Contact conversion tracking. */

export const GOOGLE_ADS_ID = "AW-432373961";
export const GOOGLE_ADS_CONTACT_CONVERSION = `${GOOGLE_ADS_ID}/zf2UCL3B6bwcEMmBls4B`;
export const GA4_MEASUREMENT_ID = "G-3C5TXFNJLQ";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire Google Ads "Contact" conversion (quote request completed). */
export function trackGoogleAdsContactConversion(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: GOOGLE_ADS_CONTACT_CONVERSION });
}

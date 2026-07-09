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

/** SPA page view for GA4 + Google Ads. */
export function trackPageView(path: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("config", GA4_MEASUREMENT_ID, { page_path: path });
  window.gtag("config", GOOGLE_ADS_ID, { page_path: path });
}

/** Track WhatsApp CTA clicks (micro-conversion for desk engagement). */
export function trackWhatsAppClick(source: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "whatsapp_click", {
    send_to: GOOGLE_ADS_ID,
    event_category: "engagement",
    event_label: source,
  });
}

/** Track quote form opened (funnel step before conversion). */
export function trackQuoteFormStart(source: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "quote_form_start", {
    send_to: GOOGLE_ADS_ID,
    event_category: "engagement",
    event_label: source,
  });
  window.gtag("event", "begin_checkout", {
    send_to: GA4_MEASUREMENT_ID,
    event_category: "quote_funnel",
    event_label: source,
  });
}

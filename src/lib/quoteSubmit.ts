/**
 * Shared quote request submission for Iraq conversion funnels.
 */

import { attributionPayload } from "./attribution";
import { trackGoogleAdsContactConversion } from "./gtag";

export interface QuoteSubmitInput {
  fullName: string;
  phone: string;
  countryCity: string;
  productInterest: string;
  quantityBudget: string;
  preferredContact?: string;
  message?: string;
  source: string;
  sourceLanguage: "en" | "ar";
}

export interface QuoteSubmitResult {
  success: boolean;
  inquiryId?: string;
  error?: string;
}

export async function submitQuoteRequest(
  input: QuoteSubmitInput
): Promise<QuoteSubmitResult> {
  const payload = {
    ...input,
    ...attributionPayload(),
  };

  const response = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok && data.success) {
    trackGoogleAdsContactConversion();
    return { success: true, inquiryId: data.inquiryId };
  }

  const technical = data.details || data.error || `HTTP ${response.status}`;
  return { success: false, error: String(technical) };
}

export const QUOTE_PRODUCT_OPTIONS = [
  { value: "pgr-silver-500g", en: "SAM Silver 500g (Iraq bestseller)", ar: "فضة SAM 500 جرام (الأكثر طلباً)" },
  { value: "pgr-silver-1kg", en: "PALM Silver 1kg", ar: "فضة PALM 1 كيلو" },
  { value: "pgr-silver-1oz-100g", en: "SAM Silver 100g", ar: "فضة SAM 100 جرام" },
  { value: "gold-bars", en: "Gold bars", ar: "سبائك ذهب" },
  { value: "silver-bars", en: "Silver bars (other)", ar: "سبائك فضة (أخرى)" },
  { value: "bullion-coins", en: "Bullion coins", ar: "عملات سبائك" },
  { value: "custom-inquiry", en: "Custom inquiry", ar: "استفسار مخصص" },
] as const;

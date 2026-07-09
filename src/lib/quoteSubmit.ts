/**
 * Shared quote request submission for Iraq conversion funnels.
 */

import { attributionPayload } from "./attribution";
import { trackGoogleAdsContactConversion } from "./gtag";
import { dbService } from "./supabase";

export interface QuoteSubmitInput {
  fullName: string;
  phone: string;
  email?: string;
  countryCity: string;
  productInterest: string;
  quantityBudget: string;
  preferredContact?: string;
  message?: string;
  source: string;
  sourceLanguage: "en" | "ar";
  customerId?: string;
}

export interface QuoteSubmitResult {
  success: boolean;
  inquiryId?: string;
  error?: string;
}

const PRODUCT_LABELS: Record<string, string> = {
  "pgr-silver-500g": "SAM Silver 500g (Iraq bestseller)",
  "pgr-silver-1kg": "PALM Silver 1kg",
  "pgr-silver-1oz-100g": "SAM Silver 100g",
  "gold-bars": "Gold bars",
  "silver-bars": "Silver bars",
  "bullion-coins": "Bullion coins",
  "custom-inquiry": "Custom inquiry",
};

function metalFromProduct(productInterest: string): string {
  if (productInterest === "silver-bars" || productInterest.startsWith("pgr-silver")) return "silver";
  if (productInterest === "bullion-coins" || productInterest === "custom-inquiry") return "both";
  return "gold";
}

function buildQuoteMessage(input: QuoteSubmitInput, attr: Record<string, unknown>): string {
  const parts: string[] = [];
  if (input.countryCity) parts.push(`Country/City: ${input.countryCity}`);
  if (input.preferredContact) parts.push(`Preferred contact: ${input.preferredContact}`);
  if (input.quantityBudget) parts.push(`Quantity/Budget: ${input.quantityBudget}`);
  if (input.source) parts.push(`Source: ${input.source}`);

  const attrLines: string[] = [];
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "landing_page",
  ] as const) {
    const val = attr[key];
    if (val) attrLines.push(`${key}: ${val}`);
  }
  if (attrLines.length) {
    parts.push("Attribution:");
    parts.push(...attrLines);
  }

  const userMessage = (input.message || "").trim();
  if (userMessage) {
    if (parts.length) parts.push("---");
    parts.push(userMessage);
  }
  return parts.join("\n");
}

export async function submitQuoteRequest(
  input: QuoteSubmitInput
): Promise<QuoteSubmitResult> {
  const attr = attributionPayload();
  const productCategory =
    PRODUCT_LABELS[input.productInterest] || input.productInterest || "Gold bars";
  const resolvedEmail =
    input.email?.trim() ||
    `whatsapp+${input.phone.replace(/\D/g, "").slice(-12)}@quote.pgruae.com`;

  const row = {
    name: input.fullName.trim(),
    email: resolvedEmail,
    phone: input.phone.trim(),
    company: input.countryCity.trim(),
    metal_interest: metalFromProduct(input.productInterest),
    product_category: productCategory,
    weight_preference: input.quantityBudget.trim(),
    message: buildQuoteMessage(input, attr),
    status: input.customerId ? "Desk Review" : "New Request",
    customer_id: input.customerId || undefined,
  };

  try {
    const { inquiryId } = await dbService.quoteRequests.createWebsiteQuote(row);
    trackGoogleAdsContactConversion();
    return { success: true, inquiryId };
  } catch (directErr: unknown) {
    const directMsg = directErr instanceof Error ? directErr.message : String(directErr);
    console.warn("[quoteSubmit] Direct Supabase insert failed, trying API:", directMsg);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, ...attr }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        trackGoogleAdsContactConversion();
        return { success: true, inquiryId: data.inquiryId };
      }
      const apiMsg = data.details || data.error || `HTTP ${response.status}`;
      return { success: false, error: String(apiMsg) };
    } catch (apiErr: unknown) {
      const apiMsg = apiErr instanceof Error ? apiErr.message : "API unreachable";
      return { success: false, error: directMsg || apiMsg };
    }
  }
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

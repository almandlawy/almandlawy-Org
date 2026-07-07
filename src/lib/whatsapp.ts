/** Shared WhatsApp desk link helpers. */

export const WHATSAPP_NUMBER = "971559688837";
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

export function buildWhatsAppLink(message: string): string {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export function defaultDeskMessage(lang: "en" | "ar"): string {
  return lang === "ar"
    ? "مرحباً، أريد طلب عرض سعر من PGR UAE للذهب أو الفضة."
    : "Hello, I would like to request a quote from PGR UAE for gold or silver products.";
}

/** Open WhatsApp chat with a client phone number (admin follow-up). */
export function buildClientWhatsAppLink(phone: string, message: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits) return WHATSAPP_BASE;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildAdminQuoteFollowUpMessage(
  quote: Record<string, unknown>,
  lang: "en" | "ar"
): string {
  const name = String(quote.name || "there");
  const product =
    String(quote.productCategory || quote.product_category || "").trim() ||
    (lang === "ar" ? "السبائك" : "bullion");

  return lang === "ar"
    ? `مرحباً ${name}، نتواصل معك من مكتب PGR UAE في دبي بخصوص طلب عرض السعر لـ ${product}. هل يمكننا مساعدتك الآن؟`
    : `Hello ${name}, PGR UAE Dubai desk following up on your quote request for ${product}. How can we assist you today?`;
}

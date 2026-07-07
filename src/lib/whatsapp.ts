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

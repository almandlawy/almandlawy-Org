/** Pre-filled WhatsApp messages per product category. */

import { buildWhatsAppLink } from "./whatsapp";

export type CategoryKey =
  | "gold_bars"
  | "silver_bars"
  | "bullion_coins"
  | "custom_inquiry"
  | "iraq_desk"
  | "sell_back";

const MESSAGES: Record<CategoryKey, { en: string; ar: string }> = {
  gold_bars: {
    en: "Hello, I would like to request a desk-confirmed quote for physical gold bars from PGR UAE Dubai.",
    ar: "مرحباً، أريد طلب عرض سعر مؤكد لسبائك الذهب المادية من مكتب PGR UAE في دبي.",
  },
  silver_bars: {
    en: "Hello, I would like to request a desk-confirmed quote for physical silver bars from PGR UAE Dubai.",
    ar: "مرحباً، أريد طلب عرض سعر مؤكد لسبائك الفضة المادية من مكتب PGR UAE في دبي.",
  },
  bullion_coins: {
    en: "Hello, I would like to request a desk-confirmed quote for mint bars or bullion coins from PGR UAE.",
    ar: "مرحباً، أريد طلب عرض سعر مؤكد للسبائك المصكوكة أو عملات السبائك من PGR UAE.",
  },
  custom_inquiry: {
    en: "Hello, I have a custom bullion sourcing inquiry for PGR UAE Dubai desk.",
    ar: "مرحباً، لدي استفسار توريد سبائك مخصص مع مكتب PGR UAE في دبي.",
  },
  iraq_desk: {
    en: "Hello, I am an Iraqi customer requesting a Dubai desk-confirmed physical bullion quote from PGR UAE.",
    ar: "مرحباً، أنا عميل عراقي وأطلب عرض سعر مؤكد لسبائك مادية من مكتب PGR UAE في دبي.",
  },
  sell_back: {
    en: "Hello, I would like to inquire about a physical gold or silver sell-back desk quote with PGR UAE.",
    ar: "مرحباً، أريد الاستفسار عن عرض سعر إعادة شراء للذهب أو الفضة المادي مع PGR UAE.",
  },
};

export function categoryWhatsAppLink(key: CategoryKey, lang: "en" | "ar"): string {
  const msg = MESSAGES[key][lang];
  return buildWhatsAppLink(msg);
}

export function categoryWhatsAppMessage(key: CategoryKey, lang: "en" | "ar"): string {
  return MESSAGES[key][lang];
}

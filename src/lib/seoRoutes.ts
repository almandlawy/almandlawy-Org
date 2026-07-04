/**
 * Central SEO metadata for public routes — compliance-safe copy.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const SITE_ORIGIN = "https://www.pgruae.com";
export const OG_IMAGE = `${SITE_ORIGIN}/images/products/01-bullion-collection.webp`;

export interface RouteSeo {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  h1En: string;
  h1Ar: string;
}

export const SEO_LANDING_PATHS = [
  "/buy-gold-bars-dubai",
  "/buy-silver-bars-dubai",
  "/gold-rate-dubai-today",
  "/silver-rate-dubai-today",
  "/sell-gold-dubai",
  "/bullion-desk-dubai",
  "/allocated-storage-dubai",
  "/24k-gold-bars-uae"
] as const;

export const NOINDEX_PATHS = new Set([
  "/admin",
  "/login",
  "/register",
  "/dashboard",
  "/calculator"
]);

export const PUBLIC_ROUTES: Record<string, RouteSeo> = {
  "/": {
    titleEn: "PGR UAE | Firm Quote Bullion Desk Dubai",
    titleAr: "PGR UAE | ديوان عروض أسعار السبائك دبي",
    descEn:
      "PGR UAE is a Dubai firm-quote bullion desk for accredited gold and silver bars. Indicative market reference pricing. Final quote confirmed by PGR UAE desk before settlement.",
    descAr:
      "PGR UAE ديوان تداول سبائك في دبي. مرجع سوقي استرشادي. عرض السعر النهائي يؤكده الديوان قبل التسوية.",
    h1En: "PGR UAE Firm Quote Bullion Desk",
    h1Ar: "ديوان PGR UAE لعروض أسعار السبائك المعتمدة"
  },
  "/request-quote": {
    titleEn: "Request Firm Quote | PGR UAE",
    titleAr: "طلب عرض سعر معتمد | PGR UAE",
    descEn: "Request a firm quote from the PGR UAE desk. Subject to market movement and compliance review.",
    descAr: "اطلب عرض سعر معتمد من ديوان PGR UAE. خاضع لحركة السوق ومراجعة الامتثال.",
    h1En: "Request Firm Quote",
    h1Ar: "طلب عرض سعر معتمد"
  },
  "/gold-bars": {
    titleEn: "Gold Bars Catalog | PGR UAE",
    titleAr: "كتالوج سبائك الذهب | PGR UAE",
    descEn: "Accredited gold bars from 1g to 1kg. Indicative market reference. Firm quote confirmed by PGR UAE desk.",
    descAr: "سبائك ذهب معتمدة من ١ جرام إلى ١ كيلو. مرجع سوقي استرشادي. عرض سعر معتمد من الديوان.",
    h1En: "Gold Bars",
    h1Ar: "سبائك الذهب"
  },
  "/silver-bars": {
    titleEn: "Silver Bars Catalog | PGR UAE",
    titleAr: "كتالوج سبائك الفضة | PGR UAE",
    descEn: "Accredited silver bars from 1oz to 1kg. Indicative market reference. Firm quote confirmed by PGR UAE desk.",
    descAr: "سبائك فضة معتمدة. مرجع سوقي استرشادي. عرض سعر معتمد من الديوان.",
    h1En: "Silver Bars",
    h1Ar: "سبائك الفضة"
  },
  "/bullion-coins": {
    titleEn: "Mint Bars & Bullion Coins | PGR UAE",
    titleAr: "السبائك المصكوكة وعملات السبائك | PGR UAE",
    descEn: "Mint bars and bullion coins via PGR UAE desk. Firm quote after compliance review.",
    descAr: "سبائك مصكوكة وعملات سبائك عبر ديوان PGR UAE. عرض سعر معتمد بعد مراجعة الامتثال.",
    h1En: "Mint Bars & Bullion Coins",
    h1Ar: "السبائك المصكوكة وعملات السبائك"
  },
  "/custom-inquiry": {
    titleEn: "Custom Bullion Inquiry | PGR UAE",
    titleAr: "طلب سبائك مخصص | PGR UAE",
    descEn: "Custom bullion sizing and bulk sourcing. Firm quote confirmed by PGR UAE desk.",
    descAr: "طلبات سبائك مخصصة وتوريد بالجملة. عرض سعر معتمد من الديوان.",
    h1En: "Custom Bullion Inquiry",
    h1Ar: "طلب سبائك مخصص"
  },
  "/buy-gold-bars-dubai": {
    titleEn: "Buy Gold Bars in Dubai | PGR UAE Bullion Desk",
    titleAr: "شراء سبائك الذهب في دبي | PGR UAE",
    descEn: "Request accredited gold bars in Dubai from PGR UAE. Indicative market reference. Firm quote confirmed by desk.",
    descAr: "اطلب سبائك ذهب معتمدة في دبي من PGR UAE. مرجع سوقي استرشادي. عرض سعر معتمد من الديوان.",
    h1En: "Buy Gold Bars in Dubai",
    h1Ar: "شراء سبائك الذهب في دبي"
  },
  "/buy-silver-bars-dubai": {
    titleEn: "Buy Silver Bars in Dubai | PGR UAE",
    titleAr: "شراء سبائك الفضة في دبي | PGR UAE",
    descEn: "Request accredited silver bars in Dubai. Indicative pricing. Firm quote confirmed by PGR UAE desk.",
    descAr: "اطلب سبائك فضة معتمدة في دبي. تسعير استرشادي. عرض سعر معتمد من الديوان.",
    h1En: "Buy Silver Bars in Dubai",
    h1Ar: "شراء سبائك الفضة في دبي"
  },
  "/gold-rate-dubai-today": {
    titleEn: "Gold Rate Dubai Today | Indicative Reference | PGR UAE",
    titleAr: "سعر الذهب في دبي اليوم | مرجع استرشادي | PGR UAE",
    descEn: "Indicative gold market reference for Dubai. Subject to market movement. Request a firm quote from PGR UAE.",
    descAr: "مرجع سوقي استرشادي للذهب في دبي. خاضع لحركة السوق. اطلب عرض سعر معتمد من PGR UAE.",
    h1En: "Gold Rate Dubai Today",
    h1Ar: "سعر الذهب في دبي اليوم"
  },
  "/silver-rate-dubai-today": {
    titleEn: "Silver Rate Dubai Today | Indicative Reference | PGR UAE",
    titleAr: "سعر الفضة في دبي اليوم | مرجع استرشادي | PGR UAE",
    descEn: "Indicative silver market reference for Dubai. Subject to market movement. Request a firm quote from PGR UAE.",
    descAr: "مرجع سوقي استرشادي للفضة في دبي. خاضع لحركة السوق. اطلب عرض سعر معتمد من PGR UAE.",
    h1En: "Silver Rate Dubai Today",
    h1Ar: "سعر الفضة في دبي اليوم"
  },
  "/sell-gold-dubai": {
    titleEn: "Sell Gold in Dubai | PGR UAE Desk",
    titleAr: "بيع الذهب في دبي | ديوان PGR UAE",
    descEn: "Sell-back and desk inquiry for physical gold in Dubai. Subject to compliance review and firm quote.",
    descAr: "استفسار إعادة شراء وبيع الذهب المادي في دبي. خاضع لمراجعة الامتثال وعرض سعر معتمد.",
    h1En: "Sell Gold in Dubai",
    h1Ar: "بيع الذهب في دبي"
  },
  "/bullion-desk-dubai": {
    titleEn: "Bullion Desk Dubai | PGR UAE",
    titleAr: "ديوان السبائك دبي | PGR UAE",
    descEn: "Dubai firm-quote bullion desk for physical gold and silver. Indicative market reference only.",
    descAr: "ديوان سبائك في دبي لعروض الأسعار المعتمدة للذهب والفضة. مرجع سوقي استرشادي فقط.",
    h1En: "Bullion Desk Dubai",
    h1Ar: "ديوان السبائك دبي"
  },
  "/allocated-storage-dubai": {
    titleEn: "Allocated Storage Dubai | PGR UAE",
    titleAr: "التخزين المخصص دبي | PGR UAE",
    descEn: "Allocated bullion storage inquiry in Dubai. Subject to compliance review.",
    descAr: "استفسار تخزين سبائك مخصص في دبي. خاضع لمراجعة الامتثال.",
    h1En: "Allocated Storage Dubai",
    h1Ar: "التخزين المخصص دبي"
  },
  "/24k-gold-bars-uae": {
    titleEn: "24K Gold Bars UAE | PGR UAE",
    titleAr: "سبائك ذهب 24 قيراط الإمارات | PGR UAE",
    descEn: "999.9 fine gold bars in the UAE. Indicative market reference. Firm quote confirmed by PGR UAE desk.",
    descAr: "سبائك ذهب 999.9 في الإمارات. مرجع سوقي استرشادي. عرض سعر معتمد من الديوان.",
    h1En: "24K Gold Bars UAE",
    h1Ar: "سبائك ذهب 24 قيراط الإمارات"
  },
  "/compliance": {
    titleEn: "Compliance & KYC | PGR UAE",
    titleAr: "الامتثال واعرف عميلك | PGR UAE",
    descEn: "AML/KYC policies and pricing disclaimer for PGR UAE bullion desk transactions.",
    descAr: "سياسات AML/KYC وإخلاء مسؤولية التسعير لمعاملات ديوان PGR UAE.",
    h1En: "Compliance & KYC",
    h1Ar: "الامتثال واعرف عميلك"
  },
  "/terms": {
    titleEn: "Terms & Conditions | PGR UAE",
    titleAr: "الشروط والأحكام | PGR UAE",
    descEn: "Terms and conditions for PGR UAE precious metals desk services.",
    descAr: "الشروط والأحكام لخدمات ديوان PGR UAE.",
    h1En: "Terms & Conditions",
    h1Ar: "الشروط والأحكام"
  },
  "/privacy-policy": {
    titleEn: "Privacy Policy | PGR UAE",
    titleAr: "سياسة الخصوصية | PGR UAE",
    descEn: "Privacy policy for PGR UAE client data and KYC documentation.",
    descAr: "سياسة الخصوصية لبيانات عملاء PGR UAE.",
    h1En: "Privacy Policy",
    h1Ar: "سياسة الخصوصية"
  },
  "/kyc-aml-policy": {
    titleEn: "KYC & AML Policy | PGR UAE",
    titleAr: "سياسة اعرف عميلك | PGR UAE",
    descEn: "Know Your Customer and anti-money laundering policy for PGR UAE.",
    descAr: "سياسة اعرف عميلك ومكافحة غسيل الأموال لـ PGR UAE.",
    h1En: "KYC & AML Policy",
    h1Ar: "سياسة اعرف عميلك"
  },
  "/pricing-disclaimer": {
    titleEn: "Pricing Disclaimer | PGR UAE",
    titleAr: "إخلاء مسؤولية التسعير | PGR UAE",
    descEn: "Indicative market reference only. Subject to market movement. Firm quote confirmed by PGR UAE desk.",
    descAr: "مرجع سوقي استرشادي فقط. خاضع لحركة السوق. عرض سعر معتمد من الديوان.",
    h1En: "Pricing Disclaimer",
    h1Ar: "إخلاء مسؤولية التسعير"
  }
};

/** Paths included in sitemap.xml — keep in sync with scripts/seo-data.mjs */
export const SITEMAP_PATHS = Object.keys(PUBLIC_ROUTES);

export function canonicalUrl(path: string): string {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path}`;
}

export function getRouteSeo(path: string): RouteSeo {
  const normalized = path.replace(/\/$/, "") || "/";
  if (PUBLIC_ROUTES[normalized]) return PUBLIC_ROUTES[normalized];
  if (normalized.startsWith("/admin")) return PUBLIC_ROUTES["/"];
  return PUBLIC_ROUTES["/"];
}

export function shouldNoindex(path: string): boolean {
  const normalized = path.replace(/\/$/, "") || "/";
  if (NOINDEX_PATHS.has(normalized)) return true;
  return normalized.startsWith("/admin");
}

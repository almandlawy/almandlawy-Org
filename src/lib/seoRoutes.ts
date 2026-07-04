/**
 * Central SEO metadata for public routes — compliance-safe copy.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const SITE_ORIGIN = "https://www.pgruae.com";

export interface RouteSeo {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  h1En: string;
  h1Ar: string;
}

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

/** Paths included in sitemap.xml */
export const SITEMAP_PATHS = [
  "/",
  "/request-quote",
  "/gold-bars",
  "/silver-bars",
  "/bullion-coins",
  "/custom-inquiry",
  "/compliance",
  "/terms",
  "/privacy-policy",
  "/kyc-aml-policy",
  "/pricing-disclaimer"
];

export function canonicalUrl(path: string): string {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path}`;
}

export function getRouteSeo(path: string): RouteSeo {
  return PUBLIC_ROUTES[path] || PUBLIC_ROUTES["/"];
}

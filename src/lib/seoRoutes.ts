/**
 * Central SEO metadata for public routes — compliance-safe copy.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const SITE_ORIGIN = "https://www.pgruae.com";
export const OG_IMAGE = "https://www.pgruae.com/brand/pgr-uae-logo.png?v=transparent-v1";

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
  "/24k-gold-bars-uae",
  "/silver-bars-iraq",
  "/sam-palm-silver-iraq",
  "/gold-bars-baghdad",
  "/silver-bars-erbil",
  "/bullion-desk-iraq",
] as const;

export const NOINDEX_PATHS = new Set([
  "/admin",
  "/login",
  "/register",
  "/dashboard",
  "/my-documents",
  "/kyc",
  "/calculator",
  "/quote-received"
]);

export const PUBLIC_ROUTES: Record<string, RouteSeo> = {
  "/": {
    titleEn: "PGR UAE | Gold & Silver Bullion Quote Desk Dubai to Iraq",
    titleAr: "PGR UAE | سبائك الذهب والفضة من دبي إلى العراق",
    descEn:
      "Request desk-confirmed quotes for physical gold bars, silver bars and bullion coins from Dubai to Iraq. Indicative market reference only. Final quote after compliance review.",
    descAr:
      "اطلب عروض أسعار مؤكدة لسبائك الذهب والفضة من دبي إلى العراق. مرجع سوقي إرشادي فقط. عرض السعر النهائي بعد مراجعة الامتثال.",
    h1En: "Gold & Silver Bullion Quote Desk from Dubai to Iraq",
    h1Ar: "عروض أسعار سبائك الذهب والفضة من دبي إلى العراق"
  },
  "/request-quote": {
    titleEn: "Request Firm Quote | PGR UAE",
    titleAr: "طلب عرض سعر معتمد | PGR UAE",
    descEn: "Request a desk-confirmed bullion quote from PGR UAE. Indicative market reference only. Final quote after compliance review.",
    descAr: "اطلب عرض سعر مؤكد من مكتب PGR UAE. مرجع سوقي إرشادي فقط. عرض السعر النهائي بعد مراجعة الامتثال.",
    h1En: "Request Firm Quote",
    h1Ar: "طلب عرض سعر معتمد"
  },
  "/facebook": {
    titleEn: "PGR UAE from Facebook | Bullion Quote Desk",
    titleAr: "PGR UAE من فيسبوك | مكتب عروض السبائك",
    descEn: "Request a firm desk-confirmed quote for physical gold and silver. WhatsApp quote desk Dubai. Indicative reference only.",
    descAr: "اطلب عرض سعر معتمد للذهب والفضة المادي. واتساب مكتب دبي. مرجع استرشادي فقط.",
    h1En: "PGR UAE Bullion Quote Desk",
    h1Ar: "مكتب عروض سبائك PGR UAE"
  },
  "/quote-received": {
    titleEn: "Quote Request Received | PGR UAE",
    titleAr: "تم استلام طلب عرض السعر | PGR UAE",
    descEn: "Your bullion quote request was received. PGR UAE will contact you on WhatsApp with a desk-confirmed quote.",
    descAr: "تم استلام طلب عرض السعر. سيتواصل PGR UAE معك على واتساب بعرض سعر مؤكد من المكتب.",
    h1En: "Quote Request Received",
    h1Ar: "تم استلام طلب عرض السعر"
  },
  "/iraq-bullion-quote": {
    titleEn: "Gold & Silver Bullion Quotes for Iraq | PGR UAE Dubai",
    titleAr: "عروض أسعار سبائك الذهب والفضة للعراق | PGR UAE دبي",
    descEn:
      "Request desk-confirmed quotes for physical gold bars, silver bars and bullion coins from Dubai to Iraq. Indicative market reference only, final quote after compliance review.",
    descAr:
      "اطلب عروض أسعار مؤكدة لسبائك الذهب والفضة من دبي إلى العراق. مرجع سوقي إرشادي فقط، عرض السعر النهائي بعد مراجعة الامتثال.",
    h1En: "Gold & Silver Bullion Quotes for Iraqi Customers",
    h1Ar: "عروض أسعار سبائك الذهب والفضة للعملاء العراقيين"
  },
  "/gold-bars": {
    titleEn: "Gold Bars Catalog | PGR UAE",
    titleAr: "كتالوج سبائك الذهب | PGR UAE",
    descEn: "Physical gold bars from 1g to 1kg. Indicative market reference. Desk-confirmed quote from PGR UAE.",
    descAr: "سبائك ذهب مادية من ١ جرام إلى ١ كيلو. مرجع سوقي إرشادي. عرض سعر مؤكد من المكتب.",
    h1En: "Gold Bars",
    h1Ar: "سبائك الذهب"
  },
  "/silver-bars": {
    titleEn: "Silver Bars Catalog | PGR UAE",
    titleAr: "كتالوج سبائك الفضة | PGR UAE",
    descEn: "Physical silver bars from 1oz to 1kg. Indicative market reference. Desk-confirmed quote from PGR UAE.",
    descAr: "سبائك فضة مادية. مرجع سوقي إرشادي. عرض سعر مؤكد من المكتب.",
    h1En: "Silver Bars",
    h1Ar: "سبائك الفضة"
  },
  "/bullion-coins": {
    titleEn: "Mint Bars & Bullion Coins | PGR UAE",
    titleAr: "السبائك المصكوكة وعملات السبائك | PGR UAE",
    descEn: "Mint bars and bullion coins via PGR UAE desk. Desk-confirmed quote after compliance review.",
    descAr: "سبائك مصكوكة وعملات سبائك عبر مكتب PGR UAE. عرض سعر مؤكد بعد مراجعة الامتثال.",
    h1En: "Mint Bars & Bullion Coins",
    h1Ar: "السبائك المصكوكة وعملات السبائك"
  },
  "/custom-inquiry": {
    titleEn: "Custom Bullion Inquiry | PGR UAE",
    titleAr: "طلب سبائك مخصص | PGR UAE",
    descEn: "Custom bullion sizing and bulk sourcing. Desk-confirmed quote from PGR UAE desk.",
    descAr: "طلبات سبائك مخصصة وتوريد بالجملة. عرض سعر مؤكد من المكتب.",
    h1En: "Custom Bullion Inquiry",
    h1Ar: "طلب سبائك مخصص"
  },
  "/allocated-storage": {
    titleEn: "Allocated Bullion Storage | PGR UAE",
    titleAr: "تخزين سبائك مخصص | PGR UAE",
    descEn: "Allocated physical bullion storage inquiry. Subject to compliance review. Not a financial wallet.",
    descAr: "استفسار تخزين سبائك مادية مخصصة. خاضع لمراجعة الامتثال. ليس محفظة مالية.",
    h1En: "Allocated Bullion Storage",
    h1Ar: "تخزين سبائك مخصص"
  },
  "/sell-back": {
    titleEn: "Sell-Back Desk Inquiry | PGR UAE",
    titleAr: "استفسار إعادة البيع | PGR UAE",
    descEn: "Desk inquiry for physical gold and silver sell-back. Subject to compliance review and desk-confirmed quote.",
    descAr: "استفسار إعادة بيع الذهب والفضة المادي. خاضع لمراجعة الامتثال وعرض سعر مؤكد من المكتب.",
    h1En: "Sell-Back Desk Inquiry",
    h1Ar: "استفسار إعادة البيع"
  },
  "/faq": {
    titleEn: "FAQ | PGR UAE Bullion Desk",
    titleAr: "الأسئلة الشائعة | مكتب PGR UAE",
    descEn: "Frequently asked questions about physical gold and silver bullion quotes, desk-confirmed pricing, and compliance.",
    descAr: "أسئلة شائعة حول عروض أسعار السبائك المادية والتسعير المؤكد من المكتب والامتثال.",
    h1En: "Frequently Asked Questions",
    h1Ar: "الأسئلة الشائعة"
  },
  "/contact": {
    titleEn: "Contact PGR UAE | Bullion Quote Desk",
    titleAr: "اتصل بـ PGR UAE | مكتب عروض السبائك",
    descEn: "Contact the PGR UAE bullion quote desk in Dubai. WhatsApp, phone, and email for firm quote requests.",
    descAr: "تواصل مع مكتب عروض أسعار السبائك PGR UAE في دبي. واتساب وهاتف وبريد إلكتروني لطلبات عروض الأسعار.",
    h1En: "Contact PGR UAE",
    h1Ar: "اتصل بـ PGR UAE"
  },
  "/compliance": {
    titleEn: "Compliance & KYC | PGR UAE",
    titleAr: "الامتثال واعرف عميلك | PGR UAE",
    descEn: "AML/KYC policies and pricing disclaimer for PGR UAE bullion desk transactions.",
    descAr: "سياسات AML/KYC وإخلاء مسؤولية التسعير لمعاملات مكتب PGR UAE.",
    h1En: "Compliance & KYC",
    h1Ar: "الامتثال واعرف عميلك"
  },
  "/terms": {
    titleEn: "Terms & Conditions | PGR UAE",
    titleAr: "الشروط والأحكام | PGR UAE",
    descEn: "Terms and conditions for PGR UAE precious metals desk services.",
    descAr: "الشروط والأحكام لخدمات مكتب PGR UAE.",
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
    descEn: "Indicative market reference only. Desk-confirmed quote from PGR UAE before settlement.",
    descAr: "مرجع سوقي إرشادي فقط. عرض سعر مؤكد من المكتب قبل التسوية.",
    h1En: "Pricing Disclaimer",
    h1Ar: "إخلاء مسؤولية التسعير"
  },
  "/refund-cancellation-policy": {
    titleEn: "Refund & Cancellation Policy | PGR UAE",
    titleAr: "سياسة الاسترداد والإلغاء | PGR UAE",
    descEn: "Refund and cancellation policy for PGR UAE bullion desk orders.",
    descAr: "سياسة الاسترداد والإلغاء لطلبات مكتب PGR UAE.",
    h1En: "Refund & Cancellation Policy",
    h1Ar: "سياسة الاسترداد والإلغاء"
  },
  "/delivery-collection-policy": {
    titleEn: "Delivery & Collection Policy | PGR UAE",
    titleAr: "سياسة التوصيل والاستلام | PGR UAE",
    descEn: "Delivery and collection arrangements for physical bullion. Subject to desk confirmation and compliance.",
    descAr: "ترتيبات التوصيل والاستلام للسبائك المادية. خاضعة لتأكيد المكتب والامتثال.",
    h1En: "Delivery & Collection Policy",
    h1Ar: "سياسة التوصيل والاستلام"
  },
  "/risk-disclosure": {
    titleEn: "Risk Disclosure | PGR UAE",
    titleAr: "الإفصاح عن المخاطر | PGR UAE",
    descEn: "Risk disclosure for physical precious metals. PGR UAE does not provide financial or investment advice.",
    descAr: "إفصاح مخاطر المعادن الثمينة المادية. لا تقدم PGR UAE نصائح مالية أو استثمارية.",
    h1En: "Risk Disclosure",
    h1Ar: "الإفصاح عن المخاطر"
  },
  "/cookie-policy": {
    titleEn: "Cookie Policy | PGR UAE",
    titleAr: "سياسة ملفات الارتباط | PGR UAE",
    descEn: "Cookie and tracking policy for the PGR UAE bullion quote desk website.",
    descAr: "سياسة ملفات الارتباط والتتبع لموقع مكتب عروض أسعار السبائك PGR UAE.",
    h1En: "Cookie Policy",
    h1Ar: "سياسة ملفات الارتباط"
  },
  "/allocated-storage-terms": {
    titleEn: "Allocated Storage Terms | PGR UAE",
    titleAr: "شروط التخزين المخصص | PGR UAE",
    descEn: "Terms for allocated physical bullion storage with PGR UAE. Subject to compliance review.",
    descAr: "شروط التخزين المخصص للسبائك المادية مع PGR UAE. خاضعة لمراجعة الامتثال.",
    h1En: "Allocated Storage Terms",
    h1Ar: "شروط التخزين المخصص"
  },
  "/sell-back-policy": {
    titleEn: "Sell-Back Policy | PGR UAE",
    titleAr: "سياسة إعادة الشراء | PGR UAE",
    descEn: "Sell-back policy for physical gold and silver desk inquiries. Subject to compliance review.",
    descAr: "سياسة إعادة الشراء لاستفسارات الذهب والفضة المادي. خاضعة لمراجعة الامتثال.",
    h1En: "Sell-Back Policy",
    h1Ar: "سياسة إعادة الشراء"
  },
  "/buy-gold-bars-dubai": {
    titleEn: "Buy Gold Bars in Dubai | PGR UAE Bullion Desk",
    titleAr: "شراء سبائك الذهب في دبي | PGR UAE",
    descEn: "Request physical gold bars in Dubai from PGR UAE. Indicative market reference. Desk-confirmed quote.",
    descAr: "اطلب سبائك ذهب مادية في دبي من PGR UAE. مرجع سوقي إرشادي. عرض سعر مؤكد من المكتب.",
    h1En: "Buy Gold Bars in Dubai",
    h1Ar: "شراء سبائك الذهب في دبي"
  },
  "/buy-silver-bars-dubai": {
    titleEn: "Buy Silver Bars in Dubai | PGR UAE",
    titleAr: "شراء سبائك الفضة في دبي | PGR UAE",
    descEn: "Request physical silver bars in Dubai. Indicative market reference. Desk-confirmed quote from PGR UAE.",
    descAr: "اطلب سبائك فضة مادية في دبي. مرجع سوقي إرشادي. عرض سعر مؤكد من المكتب.",
    h1En: "Buy Silver Bars in Dubai",
    h1Ar: "شراء سبائك الفضة في دبي"
  },
  "/gold-rate-dubai-today": {
    titleEn: "Gold Rate Dubai Today | Indicative Reference | PGR UAE",
    titleAr: "سعر الذهب في دبي اليوم | مرجع استرشادي | PGR UAE",
    descEn: "Indicative gold market reference for Dubai. Subject to market movement. Request a desk-confirmed quote from PGR UAE.",
    descAr: "مرجع سوقي استرشادي للذهب في دبي. خاضع لحركة السوق. اطلب عرض سعر مؤكد من PGR UAE.",
    h1En: "Gold Rate Dubai Today",
    h1Ar: "سعر الذهب في دبي اليوم"
  },
  "/silver-rate-dubai-today": {
    titleEn: "Silver Rate Dubai Today | Indicative Reference | PGR UAE",
    titleAr: "سعر الفضة في دبي اليوم | مرجع استرشادي | PGR UAE",
    descEn: "Indicative silver market reference for Dubai. Subject to market movement. Request a desk-confirmed quote from PGR UAE.",
    descAr: "مرجع سوقي استرشادي للفضة في دبي. خاضع لحركة السوق. اطلب عرض سعر مؤكد من PGR UAE.",
    h1En: "Silver Rate Dubai Today",
    h1Ar: "سعر الفضة في دبي اليوم"
  },
  "/sell-gold-dubai": {
    titleEn: "Sell Gold in Dubai | PGR UAE Desk",
    titleAr: "بيع الذهب في دبي | مكتب PGR UAE",
    descEn: "Sell-back desk inquiry for physical gold in Dubai. Subject to compliance review and desk-confirmed quote.",
    descAr: "استفسار إعادة بيع الذهب المادي في دبي. خاضع لمراجعة الامتثال وعرض سعر مؤكد.",
    h1En: "Sell Gold in Dubai",
    h1Ar: "بيع الذهب في دبي"
  },
  "/bullion-desk-dubai": {
    titleEn: "Bullion Desk Dubai | PGR UAE",
    titleAr: "مكتب السبائك دبي | PGR UAE",
    descEn: "Dubai bullion quote desk for physical gold and silver. Indicative market reference only.",
    descAr: "مكتب عروض أسعار السبائك في دبي للذهب والفضة المادي. مرجع سوقي إرشادي فقط.",
    h1En: "Bullion Desk Dubai",
    h1Ar: "مكتب السبائك دبي"
  },
  "/allocated-storage-dubai": {
    titleEn: "Allocated Storage Dubai | PGR UAE",
    titleAr: "التخزين المخصص دبي | PGR UAE",
    descEn: "Allocated physical bullion storage inquiry in Dubai. Subject to compliance review.",
    descAr: "استفسار تخزين سبائك مادية مخصصة في دبي. خاضع لمراجعة الامتثال.",
    h1En: "Allocated Storage Dubai",
    h1Ar: "التخزين المخصص دبي"
  },
  "/24k-gold-bars-uae": {
    titleEn: "24K Gold Bars UAE | PGR UAE",
    titleAr: "سبائك ذهب 24 قيراط الإمارات | PGR UAE",
    descEn: "999.9 fine physical gold bars in the UAE. Indicative market reference. Desk-confirmed quote from PGR UAE.",
    descAr: "سبائك ذهب مادية 999.9 في الإمارات. مرجع سوقي إرشادي. عرض سعر مؤكد من المكتب.",
    h1En: "24K Gold Bars UAE",
    h1Ar: "سبائك ذهب 24 قيراط الإمارات"
  },
  "/silver-bars-iraq": {
    titleEn: "Silver Bars for Iraq | SAM & PALM from Dubai | PGR UAE",
    titleAr: "سبائك الفضة للعراق | SAM وPALM من دبي | PGR UAE",
    descEn: "Request desk-confirmed silver bar quotes for Iraq — SAM and PALM 500g and 1kg from PGR UAE Dubai. Indicative reference only.",
    descAr: "اطلب عروض أسعار سبائك الفضة للعراق — SAM وPALM 500 جرام و1 كيلو من PGR UAE دبي. مرجع استرشادي فقط.",
    h1En: "Silver Bars for Iraq",
    h1Ar: "سبائك الفضة للعراق"
  },
  "/sam-palm-silver-iraq": {
    titleEn: "SAM & PALM Silver Iraq | PGR UAE Dubai Desk",
    titleAr: "فضة SAM وPALM للعراق | مكتب PGR UAE دبي",
    descEn: "SAM and PALM 999.9 silver bars for Iraqi customers. Desk-confirmed quote from Dubai. Indicative market reference only.",
    descAr: "سبائك فضة SAM وPALM 999.9 للعملاء العراقيين. عرض سعر مؤكد من دبي. مرجع سوقي إرشادي فقط.",
    h1En: "SAM & PALM Silver for Iraq",
    h1Ar: "فضة SAM وPALM للعراق"
  },
  "/gold-bars-baghdad": {
    titleEn: "Gold Bars Baghdad | Dubai to Iraq Quote Desk | PGR UAE",
    titleAr: "سبائك الذهب بغداد | مكتب عروض دبي إلى العراق | PGR UAE",
    descEn: "Physical gold bar quotes for Baghdad and Iraq from PGR UAE Dubai desk. Indicative reference. Final quote after compliance review.",
    descAr: "عروض أسعار سبائك الذهب لبغداد والعراق من مكتب PGR UAE دبي. مرجع استرشادي. عرض نهائي بعد مراجعة الامتثال.",
    h1En: "Gold Bars for Baghdad",
    h1Ar: "سبائك الذهب لبغداد"
  },
  "/silver-bars-erbil": {
    titleEn: "Silver Bars Erbil | SAM & PALM from Dubai | PGR UAE",
    titleAr: "سبائك الفضة أربيل | SAM وPALM من دبي | PGR UAE",
    descEn: "Silver bar quotes for Erbil and Kurdistan from PGR UAE Dubai. SAM and PALM 500g and 1kg. Desk-confirmed quote.",
    descAr: "عروض أسعار سبائك الفضة لأربيل وكردستان من PGR UAE دبي. SAM وPALM 500 جرام و1 كيلو. عرض سعر مؤكد.",
    h1En: "Silver Bars for Erbil",
    h1Ar: "سبائك الفضة لأربيل"
  },
  "/bullion-desk-iraq": {
    titleEn: "Bullion Desk Iraq | Dubai to Iraq Corridor | PGR UAE",
    titleAr: "مكتب السبائك للعراق | ممر دبي إلى العراق | PGR UAE",
    descEn: "PGR UAE bullion quote desk for Iraqi customers. Physical gold and silver from Dubai. Indicative market reference only.",
    descAr: "مكتب عروض أسعار السبائك PGR UAE للعملاء العراقيين. ذهب وفضة مادي من دبي. مرجع سوقي إرشادي فقط.",
    h1En: "Bullion Desk for Iraq",
    h1Ar: "مكتب السبائك للعراق"
  }
};

/** Paths included in sitemap.xml — keep in sync with scripts/seo-data.mjs */
export const SITEMAP_PATHS = [
  "/",
  "/request-quote",
  "/iraq-bullion-quote",
  "/gold-bars",
  "/silver-bars",
  "/bullion-coins",
  "/custom-inquiry",
  "/allocated-storage",
  "/sell-back",
  "/faq",
  "/contact",
  "/compliance",
  "/terms",
  "/privacy-policy",
  "/kyc-aml-policy",
  "/pricing-disclaimer",
  "/refund-cancellation-policy",
  "/delivery-collection-policy",
  "/risk-disclosure",
  "/cookie-policy",
  "/allocated-storage-terms",
  "/sell-back-policy",
  "/buy-gold-bars-dubai",
  "/buy-silver-bars-dubai",
  "/gold-rate-dubai-today",
  "/silver-rate-dubai-today",
  "/sell-gold-dubai",
  "/bullion-desk-dubai",
  "/allocated-storage-dubai",
  "/24k-gold-bars-uae",
  "/silver-bars-iraq",
  "/sam-palm-silver-iraq",
  "/gold-bars-baghdad",
  "/silver-bars-erbil",
  "/bullion-desk-iraq",
];

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

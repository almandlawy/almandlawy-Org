/** Footer & compliance policy links — single source for crawlable hrefs. */

export interface LegalLink {
  href: string;
  labelEn: string;
  labelAr: string;
  group: "core" | "policies" | "disclosures";
}

export const LEGAL_POLICY_LINKS: LegalLink[] = [
  { href: "/terms", labelEn: "Terms & Conditions", labelAr: "الشروط والأحكام", group: "core" },
  { href: "/privacy-policy", labelEn: "Privacy Policy", labelAr: "سياسة الخصوصية", group: "core" },
  { href: "/compliance", labelEn: "Compliance & Trust", labelAr: "الامتثال والشفافية", group: "core" },
  { href: "/kyc-aml-policy", labelEn: "KYC & AML Policy", labelAr: "سياسة اعرف عميلك", group: "policies" },
  { href: "/pricing-disclaimer", labelEn: "Pricing Disclaimer", labelAr: "إخلاء مسؤولية التسعير", group: "policies" },
  { href: "/refund-cancellation-policy", labelEn: "Refund & Cancellation", labelAr: "الاسترداد والإلغاء", group: "policies" },
  { href: "/delivery-collection-policy", labelEn: "Delivery & Collection", labelAr: "التوصيل والاستلام", group: "policies" },
  { href: "/allocated-storage-terms", labelEn: "Allocated Storage Terms", labelAr: "شروط التخزين المخصص", group: "policies" },
  { href: "/sell-back-policy", labelEn: "Sell-Back Policy", labelAr: "سياسة إعادة الشراء", group: "policies" },
  { href: "/risk-disclosure", labelEn: "Risk Disclosure", labelAr: "الإفصاح عن المخاطر", group: "disclosures" },
  { href: "/cookie-policy", labelEn: "Cookie Policy", labelAr: "سياسة ملفات الارتباط", group: "disclosures" },
];

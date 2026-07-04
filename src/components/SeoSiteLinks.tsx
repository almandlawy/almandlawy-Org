/**
 * Crawlable internal links for Google — visually hidden, real href anchors.
 * @license SPDX-License-Identifier: Apache-2.0
 */

const SITE_LINKS: { href: string; labelEn: string; labelAr: string }[] = [
  { href: "/", labelEn: "Home", labelAr: "الرئيسية" },
  { href: "/request-quote", labelEn: "Request Firm Quote", labelAr: "طلب عرض سعر معتمد" },
  { href: "/gold-bars", labelEn: "Gold Bars", labelAr: "سبائك الذهب" },
  { href: "/silver-bars", labelEn: "Silver Bars", labelAr: "سبائك الفضة" },
  { href: "/bullion-coins", labelEn: "Mint Bars & Coins", labelAr: "المسكوكات والعملات" },
  { href: "/custom-inquiry", labelEn: "Custom Inquiry", labelAr: "طلب مخصص" },
  { href: "/buy-gold-bars-dubai", labelEn: "Buy Gold Bars Dubai", labelAr: "شراء ذهب دبي" },
  { href: "/buy-silver-bars-dubai", labelEn: "Buy Silver Bars Dubai", labelAr: "شراء فضة دبي" },
  { href: "/gold-rate-dubai-today", labelEn: "Gold Rate Dubai", labelAr: "سعر الذهب دبي" },
  { href: "/silver-rate-dubai-today", labelEn: "Silver Rate Dubai", labelAr: "سعر الفضة دبي" },
  { href: "/bullion-desk-dubai", labelEn: "Bullion Desk Dubai", labelAr: "ديوان السبائك دبي" },
  { href: "/24k-gold-bars-uae", labelEn: "24K Gold Bars UAE", labelAr: "سبائك 24 قيراط" },
  { href: "/compliance", labelEn: "Compliance", labelAr: "الامتثال" },
  { href: "/kyc-aml-policy", labelEn: "KYC & AML", labelAr: "اعرف عميلك" },
  { href: "/pricing-disclaimer", labelEn: "Pricing Disclaimer", labelAr: "إخلاء التسعير" },
  { href: "/terms", labelEn: "Terms", labelAr: "الشروط" },
  { href: "/privacy-policy", labelEn: "Privacy", labelAr: "الخصوصية" }
];

interface SeoSiteLinksProps {
  currentLang: "en" | "ar";
}

export default function SeoSiteLinks({ currentLang }: SeoSiteLinksProps) {
  const isAr = currentLang === "ar";
  return (
    <nav aria-label={isAr ? "خريطة الموقع" : "Site map"} className="sr-only">
      <ul>
        {SITE_LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{isAr ? link.labelAr : link.labelEn}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

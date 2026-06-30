import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Logo from "./Logo";

export default function PremiumFooter() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  const quickLinks = [
    { to: "/", en: "Home", ar: "الرئيسية" },
    { to: "/#market", en: "Markets", ar: "الأسواق" },
    { to: "/faq", en: "FAQ", ar: "الأسئلة" },
    { to: "/compliance", en: "Compliance", ar: "الامتثال" },
  ];

  const products = [
    { to: "/gold-bars", en: "Gold Bars", ar: "سبائك الذهب" },
    { to: "/silver-bars", en: "Silver Bars", ar: "سبائك الفضة" },
    { to: "/bullion-coins", en: "Bullion Coins", ar: "مسكوكات" },
    { to: "/custom-inquiry", en: "Custom Inquiry", ar: "استفسار مخصص" },
  ];

  const services = [
    { to: "/allocated-storage", en: "Allocated Storage", ar: "التخزين المخصص" },
    { to: "/sell-back", en: "Sell-Back Quote", ar: "إعادة البيع" },
    { to: "/request-quote", en: "Request Quote", ar: "طلب عرض سعر" },
  ];

  const legal = [
    { to: "/privacy-policy", en: "Privacy Policy", ar: "سياسة الخصوصية" },
    { to: "/terms", en: "Terms", ar: "الشروط" },
    { to: "/risk-disclosure", en: "Risk Disclosure", ar: "إفصاح المخاطر" },
    { to: "/kyc-aml-policy", en: "KYC & AML Policy", ar: "سياسة KYC و AML" },
    { to: "/pricing-disclaimer", en: "Pricing Disclaimer", ar: "إخلاء مسؤولية الأسعار" },
  ];

  return (
    <footer className="bg-black border-t border-gold-base/10 pt-14 pb-8" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              {isAr
                ? "مكتب PGR UAE لعروض أسعار المعادن الثمينة والسبائك في دبي. أسعار إرشادية، عروض مؤكدة، ومراجعة KYC/AML."
                : "PGR UAE Precious Metals & Bullion Quote Desk in Dubai. Indicative prices, firm quotes, and KYC/AML review."}
            </p>
            <a
              href="https://wa.me/971559688837"
              className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300"
            >
              <MessageCircle size={14} />
              WhatsApp Desk
            </a>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-gold-base font-semibold mb-4">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-[#F5F0E8] transition-colors">{isAr ? l.ar : l.en}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-gold-base font-semibold mb-4">
              {isAr ? "المنتجات" : "Products"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {products.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="hover:text-[#F5F0E8] transition-colors">{isAr ? p.ar : p.en}</Link>
                </li>
              ))}
            </ul>
            <h4 className="text-[10px] uppercase tracking-widest text-gold-base font-semibold mb-3 mt-6">
              {isAr ? "الخدمات" : "Services"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {services.map((s) => (
                <li key={s.to}>
                  <Link to={s.to} className="hover:text-[#F5F0E8] transition-colors">{isAr ? s.ar : s.en}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-xs text-gray-400">
            <h4 className="text-[10px] uppercase tracking-widest text-gold-base font-semibold mb-4">
              {isAr ? "تواصل" : "Contact"}
            </h4>
            <p className="flex items-center gap-2"><Phone size={13} className="text-gold-base shrink-0" /> +971 55 968 8837</p>
            <p className="flex items-center gap-2"><Mail size={13} className="text-gold-base shrink-0" /> desk@pgruae.com</p>
            <p className="flex items-start gap-2"><MapPin size={13} className="text-gold-base shrink-0 mt-0.5" /> Almas Tower, Dubai Marina, UAE</p>
            <ul className="space-y-2 pt-3">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-[#F5F0E8] transition-colors">{isAr ? l.ar : l.en}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gold-base/10 pt-6 space-y-4">
          <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
            {isAr
              ? "الأسعار المعروضة مراجع سوقية إرشادية فقط. يتم تأكيد التوفر النهائي، الهوامش، معاملة ضريبة القيمة المضافة/الضرائب، الدفع، التسليم، التخزين، وشروط التسوية من قبل PGR UAE قبل أي معاملة. لا تقدم PGR UAE مشورة مالية أو استثمارية أو ضريبية أو قانونية."
              : "Prices shown are indicative market references only. Final availability, premiums, VAT/tax treatment, payment, delivery, storage, and settlement terms are confirmed by PGR UAE before any transaction. PGR UAE does not provide financial, investment, tax, or legal advice."}
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-[10px] text-gray-600 font-mono">
            <p>© {new Date().getFullYear()} PGR UAE. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
            <p>{isAr ? "مرخص ويعمل في دبي، الإمارات" : "Licensed and operating in Dubai, UAE"}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

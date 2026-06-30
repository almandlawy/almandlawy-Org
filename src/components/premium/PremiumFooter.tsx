import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Logo from "./Logo";

export default function PremiumFooter() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  const legal = [
    { to: "/terms", en: "Terms", ar: "الشروط" },
    { to: "/privacy-policy", en: "Privacy", ar: "الخصوصية" },
    { to: "/kyc-aml-policy", en: "KYC / AML", ar: "KYC / AML" },
    { to: "/pricing-disclaimer", en: "Pricing", ar: "الأسعار" },
    { to: "/risk-disclosure", en: "Risk", ar: "المخاطر" },
    { to: "/compliance", en: "Compliance", ar: "الامتثال" },
  ];

  const products = [
    { to: "/gold-bars", en: "Gold Bars", ar: "سبائك الذهب" },
    { to: "/silver-bars", en: "Silver Bars", ar: "سبائك الفضة" },
    { to: "/bullion-coins", en: "Bullion Coins", ar: "مسكوكات" },
    { to: "/custom-inquiry", en: "Custom Inquiry", ar: "استفسار مخصص" },
    { to: "/allocated-storage", en: "Allocated Storage", ar: "التخزين المخصص" },
    { to: "/sell-back", en: "Sell-Back Quote", ar: "إعادة البيع" },
  ];

  return (
    <footer className="bg-[#050505] border-t border-white/[0.05] pt-16 pb-8" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <Logo />
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              {isAr
                ? "مكتب عروض السبائك والمعادن الثمينة في دبي. أسعار إرشادية، عروض مؤكدة، ومراجعة KYC/AML."
                : "Dubai Precious Metals & Bullion Quote Desk. Indicative prices, firm quotes, and KYC/AML review."}
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-gold-base font-semibold mb-4">
              {isAr ? "المنتجات" : "Products"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {products.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="hover:text-white transition-colors">{isAr ? p.ar : p.en}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-gold-base font-semibold mb-4">
              {isAr ? "اللوائح" : "Legal"}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">{isAr ? l.ar : l.en}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-xs text-gray-400">
            <h4 className="text-[10px] uppercase tracking-widest text-gold-base font-semibold mb-4">
              {isAr ? "تواصل" : "Contact"}
            </h4>
            <p className="flex items-center gap-2"><Phone size={13} className="text-gold-base" /> +971 55 968 8837</p>
            <p className="flex items-center gap-2"><Mail size={13} className="text-gold-base" /> desk@pgruae.com</p>
            <p className="flex items-start gap-2"><MapPin size={13} className="text-gold-base shrink-0 mt-0.5" /> Dubai Marina, UAE</p>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 text-[10px] text-gray-600 font-mono leading-relaxed">
          <p>
            {isAr
              ? "PGR UAE يقدم أسعاراً إرشادية وخدمات طلب عروض أسعار للسبائك الفعلية. الأسعار المعروضة مراجع سوقية فقط. يتم تأكيد التوفر، الضرائب، التسليم، والتسوية قبل أي معاملة."
              : "PGR UAE provides indicative pricing and quote request services for physical bullion. Prices shown are market references only. Final availability, taxes, delivery, and settlement are confirmed before any transaction."}
          </p>
          <p className="mt-3">© {new Date().getFullYear()} PGR UAE. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
}

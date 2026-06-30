import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, MessageCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Logo from "./Logo";
import PremiumButton from "./PremiumButton";

const WHATSAPP = "https://wa.me/971559688837";

export default function PremiumHeader() {
  const { currentLang, toggleLanguage, user } = useApp();
  const isAr = currentLang === "ar";
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const nav = [
    { to: "/gold-bars", en: "Gold Bars", ar: "سبائك الذهب" },
    { to: "/silver-bars", en: "Silver Bars", ar: "سبائك الفضة" },
    { to: "/bullion-coins", en: "Bullion Coins", ar: "مسكوكات" },
    { to: "/allocated-storage", en: "Storage", ar: "التخزين" },
    { to: "/faq", en: "FAQ", ar: "الأسئلة" },
    { to: "/contact", en: "Contact", ar: "تواصل" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-[4.5rem] flex items-center justify-between gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-6 text-[11px] uppercase tracking-widest text-gray-400 font-medium">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`hover:text-gold-base transition-colors ${location.pathname === item.to ? "text-gold-base" : ""}`}
              >
                {isAr ? item.ar : item.en}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-400 hover:text-white border border-white/10 rounded-sm cursor-pointer"
              aria-label="Toggle language"
            >
              <Globe size={15} />
            </button>
            <PremiumButton to="/request-quote" variant="ghost" className="!py-2 !px-4 !text-[10px]">
              {isAr ? "طلب عرض سعر" : "Request Quote"}
            </PremiumButton>
            <PremiumButton href={WHATSAPP} variant="whatsapp" className="!py-2 !px-3 !text-[10px]">
              <MessageCircle size={14} />
              WhatsApp
            </PremiumButton>
            <PremiumButton to={user ? "/dashboard" : "/login"} variant="outline" className="!py-2 !px-4 !text-[10px]">
              {user ? (isAr ? "لوحتي" : "Dashboard") : (isAr ? "دخول" : "Login")}
            </PremiumButton>
          </div>

          <button className="lg:hidden p-2 text-gray-400 cursor-pointer" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-[#0a0a0a] border-b border-white/10 px-4 py-4 space-y-3">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="block text-sm text-gray-300 py-2">
              {isAr ? item.ar : item.en}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <PremiumButton to="/request-quote" fullWidth>{isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}</PremiumButton>
            <PremiumButton href={WHATSAPP} variant="whatsapp" fullWidth>WhatsApp Desk</PremiumButton>
            <PremiumButton to={user ? "/dashboard" : "/login"} variant="outline" fullWidth>
              {user ? (isAr ? "لوحة العميل" : "Client Dashboard") : (isAr ? "تسجيل الدخول" : "Sign In")}
            </PremiumButton>
          </div>
        </div>
      )}
    </header>
  );
}

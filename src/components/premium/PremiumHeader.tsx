import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Logo from "./Logo";
import PremiumButton from "./PremiumButton";

const WHATSAPP = "https://wa.me/971559688837";

export default function PremiumHeader() {
  const { currentLang, toggleLanguage, user } = useApp();
  const isAr = currentLang === "ar";
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: "/", en: "Home", ar: "الرئيسية", hash: "" },
    { to: "/#market", en: "Markets", ar: "الأسواق", hash: "market" },
    { to: "/gold-bars", en: "Products", ar: "المنتجات", match: ["/gold-bars", "/silver-bars", "/bullion-coins", "/custom-inquiry"] },
    { to: "/allocated-storage", en: "Services", ar: "الخدمات", match: ["/allocated-storage", "/sell-back"] },
    { to: "/compliance", en: "About Us", ar: "من نحن", match: ["/compliance"] },
    { to: "/faq", en: "Resources", ar: "الموارد", match: ["/faq"] },
    { to: "/contact", en: "Contact", ar: "تواصل" },
  ];

  const isActive = (item: (typeof nav)[0]) => {
    if (item.to === "/" && location.pathname === "/") return true;
    if (item.match) return item.match.includes(location.pathname);
    if (item.hash && location.pathname === "/" && location.hash === `#${item.hash}`) return true;
    return location.pathname === item.to;
  };

  const handleNav = (item: (typeof nav)[0]) => {
    setOpen(false);
    if (item.hash) {
      if (location.pathname !== "/") navigate("/");
      setTimeout(() => document.getElementById(item.hash!)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="bg-[#000000]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-[4.25rem] flex items-center justify-between gap-3">
          <Logo compact className="md:hidden" />
          <Logo className="hidden md:flex" />

          <nav className="hidden xl:flex items-center gap-1">
            {nav.map((item) => {
              const active = isActive(item);
              return item.hash ? (
                <button
                  key={item.en}
                  onClick={() => handleNav(item)}
                  className={`relative px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer ${
                    active ? "text-gold-base" : "text-gray-400 hover:text-[#F5F0E8]"
                  }`}
                >
                  {isAr ? item.ar : item.en}
                  {active && <span className="absolute bottom-0 left-3 right-3 h-px bg-gold-base" />}
                </button>
              ) : (
                <Link
                  key={item.en}
                  to={item.to}
                  className={`relative px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${
                    active ? "text-gold-base" : "text-gray-400 hover:text-[#F5F0E8]"
                  }`}
                >
                  {isAr ? item.ar : item.en}
                  {active && <span className="absolute bottom-0 left-3 right-3 h-px bg-gold-base" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] text-gray-400 hover:text-gold-base border border-white/10 rounded-lg cursor-pointer transition-colors"
              aria-label="Toggle language"
            >
              <Globe size={13} />
              {isAr ? "EN" : "العربية"}
            </button>
            <PremiumButton
              to={user ? "/dashboard" : "/login"}
              variant="outline"
              className="hidden md:inline-flex !py-2 !px-4 !text-[10px] !rounded-lg"
            >
              {user ? (isAr ? "لوحتي" : "Dashboard") : isAr ? "دخول" : "Login"}
            </PremiumButton>
            <PremiumButton to="/request-quote" className="hidden lg:inline-flex !py-2 !px-4 !text-[10px] !rounded-lg">
              {isAr ? "طلب عرض سعر" : "Request Quote"}
            </PremiumButton>
            <button
              className="xl:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="xl:hidden bg-[#0a0a0a]/98 border-b border-white/10 px-4 py-5 space-y-1 backdrop-blur-xl">
          {nav.map((item) =>
            item.hash ? (
              <button
                key={item.en}
                onClick={() => handleNav(item)}
                className="block w-full text-left text-sm text-gray-300 py-2.5 border-b border-white/[0.04] cursor-pointer"
              >
                {isAr ? item.ar : item.en}
              </button>
            ) : (
              <Link
                key={item.en}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block text-sm text-gray-300 py-2.5 border-b border-white/[0.04]"
              >
                {isAr ? item.ar : item.en}
              </Link>
            )
          )}
          <div className="flex flex-col gap-2 pt-4">
            <button
              onClick={toggleLanguage}
              className="text-xs text-gray-400 py-2 cursor-pointer"
            >
              {isAr ? "English" : "العربية"}
            </button>
            <PremiumButton to="/request-quote" fullWidth className="!rounded-lg">
              {isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}
            </PremiumButton>
            <PremiumButton href={WHATSAPP} variant="whatsapp" fullWidth className="!rounded-lg">
              WhatsApp Desk
            </PremiumButton>
            <PremiumButton to={user ? "/dashboard" : "/login"} variant="outline" fullWidth className="!rounded-lg">
              {user ? (isAr ? "لوحة العميل" : "Client Dashboard") : isAr ? "تسجيل الدخول" : "Sign In"}
            </PremiumButton>
          </div>
        </div>
      )}
    </header>
  );
}

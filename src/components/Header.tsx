/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Globe, MessageSquare, Coins, ArrowRight, Menu, X, ShieldCheck, Terminal } from "lucide-react";
import { LiveMarketRates } from "../types";
import { dbService, mockDb } from "../lib/supabase";

interface HeaderProps {
  currentLang: "en" | "ar";
  toggleLanguage: () => void;
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onNavigate: (section: string) => void;
  onOpenAIChat: () => void;
  onOpenQuote: () => void;
  onOpenClientDashboard: () => void;
  onOpenAdminPortal: () => void;
}

export default function Header({
  currentLang,
  toggleLanguage,
  rates,
  selectedCurrency,
  onNavigate,
  onOpenAIChat,
  onOpenQuote,
  onOpenClientDashboard,
  onOpenAdminPortal
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = mockDb.auth.getUser();
        if (user && user.email) {
          const authorized = await dbService.adminUsers.checkEmail(user.email);
          setIsAdmin(authorized);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin in header:", err);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const sObj = await dbService.settings.get();
        if (sObj) setSettings(sObj);
      } catch (err) {
        console.error("Failed to load settings in Header:", err);
      }
    };
    fetchSettings();
  }, []);

  // Get current Gold spot price for the top miniature marquee
  const getGoldMiniPrice = () => {
    if (!rates) return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    const cur = selectedCurrency as any;
    const goldRate = rates.gold.currencies[cur];
    if (!goldRate) return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    return `${goldRate.ounce.toLocaleString()} ${selectedCurrency}`;
  };

  const getMiniSilverPrice = () => {
    if (!rates) return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    const cur = selectedCurrency as any;
    const silverRate = rates.silver.currencies[cur];
    if (!silverRate) return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    return `${silverRate.ounce.toLocaleString()} ${selectedCurrency}`;
  };

  const dirClass = currentLang === "ar" ? "rtl" : "ltr";

  const navLinks = [
    { id: "market", label_en: "Live Rates", label_ar: "الأسعار المباشرة" },
    { id: "catalog", label_en: "Bullion Catalog", label_ar: "كتالوج السبائك" },
    { id: "dashboard", label_en: "Customer Dashboard", label_ar: "لوحة العميل" },
    { id: "why-us", label_en: "Institutional Edge", label_ar: "المعايير المؤسسية" },
    { id: "office", label_en: "Dubai Office", label_ar: "مكتب دبي" },
    { id: "blog", label_en: "Intelligence", label_ar: "تقارير الأبحاث" }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300" id="pgr-global-header" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      {/* Top Live Ticker Marquee Bar */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/[0.03] text-[11px] font-mono py-1.5 px-4 flex justify-between items-center text-gray-400">
        <div className="flex items-center gap-4 overflow-hidden">
          <span className="flex items-center gap-1.5 text-gold-base text-[10px] uppercase tracking-widest font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-base animate-pulse"></span>
            {currentLang === "ar" ? "مباشر دبي" : "Dubai Spot"}
          </span>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-white transition-colors cursor-pointer">
              {currentLang === "ar" ? "الذهب:" : "GOLD:"}{" "}
              <span className="text-white font-medium">{getGoldMiniPrice()}</span>/oz
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {currentLang === "ar" ? "الفضة:" : "SILVER:"}{" "}
              <span className="text-white font-medium">{getMiniSilverPrice()}</span>/oz
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-gray-500 text-[10px]">
            {currentLang === "ar" ? "خدمات المعادن الثمينة الاحترافية" : "Professional Precious Metals Services"}
          </span>
          <span className="text-gold-base hover:underline cursor-pointer flex items-center gap-1" onClick={onOpenQuote}>
            {currentLang === "ar" ? "طلب تسعير" : "Request Quote"} <ArrowRight size={10} />
          </span>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <div className="w-full bg-[#070707]/60 backdrop-blur-md border-b border-white/[0.03] py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Brand Title */}
          <div className="flex flex-col cursor-pointer" onClick={() => onNavigate("hero")}>
            <span className="text-xl md:text-2xl font-serif font-semibold tracking-[0.25em] text-white leading-none">
              PGR <span className="text-gold-base">UAE</span>
            </span>
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.45em] text-gray-400 mt-1 leading-none">
              Precious Metals Services
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-widest text-gray-300 font-medium">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === "dashboard") {
                    onOpenClientDashboard();
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`hover:text-gold-base transition-all duration-300 cursor-pointer ${
                  currentLang === "ar" ? "font-arabic text-sm" : ""
                }`}
              >
                {currentLang === "ar" ? link.label_ar : link.label_en}
              </button>
            ))}
          </nav>

          {/* Action Center (Bespoke Advisor, Lang, Inquiry) */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Customer Dashboard (Tracker) */}
            <button
              onClick={onOpenClientDashboard}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/[0.02] border border-white/[0.05] hover:border-[#c5a85c]/30 text-[11px] text-gray-300 transition-colors cursor-pointer uppercase font-mono"
              title={currentLang === "ar" ? "ديوان العملاء" : "Customer Dashboard"}
            >
              <ShieldCheck size={13} className="text-[#c5a85c]" />
              <span>{currentLang === "ar" ? "ديوان العملاء" : "Customer Dashboard"}</span>
            </button>

            {/* Admin Command Desk */}
            {isAdmin && (
              <button
                onClick={onOpenAdminPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-950/25 border border-[#c5a85c]/40 hover:border-[#c5a85c] text-[11px] text-[#c5a85c] font-semibold transition-colors cursor-pointer uppercase font-mono"
                title={currentLang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                id="header-admin-portal-btn"
              >
                <Terminal size={12} className="text-[#c5a85c]" />
                <span>{currentLang === "ar" ? "لوحة الإدارة" : "Admin Panel"}</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/[0.02] border border-white/[0.05] hover:border-gold-base/30 text-[12px] text-gray-300 transition-colors uppercase cursor-pointer"
              title={currentLang === "ar" ? "Switch to English" : "العربية"}
            >
              <Globe size={13} className="text-gold-base" />
              <span className={currentLang === "ar" ? "font-sans" : "font-arabic text-xs font-semibold"}>
                {currentLang === "ar" ? "English" : "العربية"}
              </span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIChat}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded bg-gradient-to-r from-gold-dark/20 to-gold-base/10 border border-gold-base/30 hover:border-gold-base text-[12px] tracking-wider uppercase text-gold-light font-medium transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.1)]"
            >
              <MessageSquare size={13} className="animate-pulse text-gold-base" />
              <span>{currentLang === "ar" ? "مساعد المنتجات وطلبات التسعير" : "Product & Quote Assistant"}</span>
            </button>

            {/* Custom Quote Request */}
            <button
              onClick={onOpenQuote}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-[12px] tracking-widest uppercase font-semibold text-black bg-gold-base hover:bg-gold-light rounded transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] animate-pulse"
            >
              <Coins size={13} />
              <span>{currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-gray-300 hover:text-white hover:bg-white/[0.04]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-[#070707] border-b border-white/[0.05] py-6 px-4 animate-fadeIn transition-all duration-300">
          <div className="flex flex-col gap-4 text-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === "dashboard") {
                    onOpenClientDashboard();
                  } else {
                    onNavigate(link.id);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-[14px] uppercase tracking-widest text-gray-300 hover:text-gold-base border-b border-white/[0.02] text-center w-full ${
                  currentLang === "ar" ? "font-arabic text-base" : ""
                }`}
              >
                {currentLang === "ar" ? link.label_ar : link.label_en}
              </button>
            ))}

            <div className="grid grid-cols-2 gap-2 text-xs font-mono py-2">
              <button
                onClick={() => {
                  onOpenClientDashboard();
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 bg-white/[0.02] border border-white/[0.05] text-gray-300 rounded flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={13} className="text-[#c5a85c]" />
                <span>{currentLang === "ar" ? "ديوان العملاء" : "Customer Dashboard"}</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenAdminPortal();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 bg-amber-950/20 border border-[#c5a85c]/30 text-[#c5a85c] font-semibold rounded flex items-center justify-center gap-1.5"
                >
                  <Terminal size={12} className="text-[#c5a85c]" />
                  <span>{currentLang === "ar" ? "لوحة الإدارة" : "Admin Panel"}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {/* Mobile AI Assistant Button */}
              <button
                onClick={() => {
                  onOpenAIChat();
                  setMobileMenuOpen(false);
                }}
                className="flex justify-center items-center gap-2 px-4 py-3 rounded bg-gold-dark/10 border border-gold-base/30 text-[13px] tracking-wider uppercase text-gold-light font-medium"
              >
                <MessageSquare size={14} className="text-gold-base" />
                <span>{currentLang === "ar" ? "مساعد المنتجات وطلبات التسعير" : "Product & Quote Assistant"}</span>
              </button>

              {/* Mobile Quote Button */}
              <button
                onClick={() => {
                  onOpenQuote();
                  setMobileMenuOpen(false);
                }}
                className="flex justify-center items-center gap-2 px-4 py-3 text-[13px] tracking-widest uppercase font-semibold text-black bg-gold-base rounded"
              >
                <Coins size={14} />
                <span>{currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

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
    if (rates.source_status !== "live" && rates.source_status !== "cached") {
      return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    }
    const cur = selectedCurrency as any;
    const goldRate = rates.gold.currencies[cur];
    if (!goldRate) return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    return `${goldRate.ounce.toLocaleString()} ${selectedCurrency}`;
  };

  const getMiniSilverPrice = () => {
    if (!rates) return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    if (rates.source_status !== "live" && rates.source_status !== "cached") {
      return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    }
    const cur = selectedCurrency as any;
    const silverRate = rates.silver.currencies[cur];
    if (!silverRate) return currentLang === "ar" ? "طلب عرض سعر" : "Request Quote";
    return `${silverRate.ounce.toLocaleString()} ${selectedCurrency}`;
  };

  const dirClass = currentLang === "ar" ? "rtl" : "ltr";

  const navLinks = [
    { id: "market", label_en: "Live Rates", label_ar: "الأسعار المباشرة" },
    { id: "calculator", label_en: "Calculator", label_ar: "حاسبة الأسعار" },
    { id: "catalog", label_en: "Bullion Catalog", label_ar: "كتالوج السبائك" },
    { id: "investment", label_en: "Buy & Track", label_ar: "شراء وتتبع" },
    { id: "why-us", label_en: "Institutional Edge", label_ar: "المعايير المؤسسية" },
    { id: "office", label_en: "Dubai Office", label_ar: "مكتب دبي" },
    { id: "blog", label_en: "Intelligence", label_ar: "تقارير الأبحاث" }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300" id="pgr-global-header" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      {/* Top Live Ticker Marquee Bar */}
      <div className="w-full bg-brand-bg border-b border-soft-border text-[11px] font-mono py-1.5 px-4 flex justify-between items-center text-text-secondary">
        <div className="flex items-center gap-4 overflow-hidden">
          <span className="flex items-center gap-1.5 text-gold-base text-[10px] uppercase tracking-widest font-semibold">
            <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
              (rates && (rates.source_status === "live" || rates.source_status === "cached")) ? "bg-emerald-600" : "bg-amber-500"
            }`}></span>
            {(rates && (rates.source_status === "live" || rates.source_status === "cached")) ? (
              currentLang === "ar" ? "مباشر دبي" : "Dubai Spot Live"
            ) : (
              currentLang === "ar" ? "أسعار إرشادية دبي" : "Dubai Indicative"
            )}
          </span>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-gold-dark transition-colors cursor-pointer text-text-charcoal">
              {currentLang === "ar" ? "الذهب:" : "GOLD:"}{" "}
              <span className="text-text-charcoal font-semibold">{getGoldMiniPrice()}</span>/oz
            </span>
            <span className="hover:text-gold-dark transition-colors cursor-pointer text-text-charcoal">
              {currentLang === "ar" ? "الفضة:" : "SILVER:"}{" "}
              <span className="text-text-charcoal font-semibold">{getMiniSilverPrice()}</span>/oz
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-text-secondary text-[10px]">
            {currentLang === "ar" ? "خدمات المعادن الثمينة الاحترافية" : "Professional Precious Metals Services"}
          </span>
          <span className="text-gold-base hover:text-gold-dark font-semibold hover:underline cursor-pointer flex items-center gap-1" onClick={onOpenQuote}>
            {currentLang === "ar" ? "طلب تسعير" : "Request Quote"} <ArrowRight size={10} />
          </span>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <div className="w-full bg-brand-card/90 backdrop-blur-md border-b border-soft-border py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Brand Title */}
          <div className="flex flex-col cursor-pointer" onClick={() => onNavigate("hero")}>
            <span className="text-xl md:text-2xl font-serif font-semibold tracking-[0.25em] text-text-charcoal leading-none">
              PGR <span className="text-gold-base">UAE</span>
            </span>
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.45em] text-text-secondary mt-1 leading-none font-mono">
              Precious Metals Services
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[12px] uppercase tracking-widest text-text-secondary font-semibold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === "investment") {
                    onOpenClientDashboard();
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`hover:text-gold-base text-text-charcoal transition-all duration-300 cursor-pointer ${
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
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-bg border border-soft-border hover:border-gold-base text-[11px] text-text-charcoal hover:text-gold-dark transition-colors cursor-pointer uppercase font-mono"
              title={currentLang === "ar" ? "ديوان العملاء" : "Customer Dashboard"}
            >
              <ShieldCheck size={13} className="text-gold-base" />
              <span>{currentLang === "ar" ? "ديوان العملاء" : "Customer Dashboard"}</span>
            </button>

            {/* Admin Command Desk */}
            {isAdmin && (
              <button
                onClick={onOpenAdminPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-soft-success border border-gold-base/50 hover:border-gold-base text-[11px] text-text-charcoal font-semibold transition-colors cursor-pointer uppercase font-mono"
                title={currentLang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                id="header-admin-portal-btn"
              >
                <Terminal size={12} className="text-gold-base" />
                <span>{currentLang === "ar" ? "لوحة الإدارة" : "Admin Panel"}</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-bg border border-soft-border hover:border-gold-base text-[12px] text-text-charcoal transition-colors uppercase cursor-pointer font-sans"
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
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded bg-brand-bg border border-gold-base/40 hover:border-gold-base text-[12px] tracking-wider uppercase text-text-charcoal hover:bg-gold-base/5 font-semibold transition-all duration-300 cursor-pointer shadow-sm"
            >
              <MessageSquare size={13} className="text-gold-base" />
              <span>{currentLang === "ar" ? "مساعد المنتجات وطلبات التسعير" : "Product & Quote Assistant"}</span>
            </button>

            {/* Custom Quote Request */}
            <button
              onClick={onOpenQuote}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-[12px] tracking-widest uppercase font-semibold text-text-charcoal bg-gold-base hover:bg-gold-dark rounded transition-all duration-300 cursor-pointer shadow-md"
            >
              <Coins size={13} />
              <span>{currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-text-charcoal hover:bg-brand-bg"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-brand-card border-b border-soft-border py-6 px-4 animate-fadeIn transition-all duration-300">
          <div className="flex flex-col gap-4 text-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === "investment") {
                    onOpenClientDashboard();
                  } else {
                    onNavigate(link.id);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-[14px] uppercase tracking-widest text-text-charcoal hover:text-gold-base border-b border-brand-bg text-center w-full ${
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
                className="py-2.5 bg-brand-bg border border-soft-border text-text-charcoal rounded flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={13} className="text-gold-base" />
                <span>{currentLang === "ar" ? "ديوان العملاء" : "Customer Dashboard"}</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenAdminPortal();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 bg-soft-success border border-gold-base/50 text-text-charcoal font-semibold rounded flex items-center justify-center gap-1.5"
                >
                  <Terminal size={12} className="text-gold-base" />
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
                className="flex justify-center items-center gap-2 px-4 py-3 rounded bg-brand-bg border border-gold-base/40 text-[13px] tracking-wider uppercase text-text-charcoal font-medium"
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
                className="flex justify-center items-center gap-2 px-4 py-3 text-[13px] tracking-widest uppercase font-semibold text-text-charcoal bg-gold-base rounded"
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

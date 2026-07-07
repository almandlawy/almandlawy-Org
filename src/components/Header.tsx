/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Luxury desk header — mockup navigation & CTAs.
 */

import React, { useState, useEffect } from "react";
import { Globe, Phone, FileText, Menu, X, ShieldCheck, Terminal } from "lucide-react";
import { LiveMarketRates } from "../types";
import { dbService, mockDb } from "../lib/supabase";
import BrandLogo from "./BrandLogo";

const WHATSAPP_BASE = "https://wa.me/971559688837";

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

const NAV_LINKS = [
  { id: "hero", label_en: "Home", label_ar: "الرئيسية" },
  { id: "catalog", label_en: "Catalog", label_ar: "الكتالوج" },
  { id: "iraq-silver-offers", label_en: "Iraq Silver", label_ar: "فضة العراق" },
  { id: "market", label_en: "Market Watch", label_ar: "مراقبة السوق" },
  { id: "how-quotes-work", label_en: "How It Works", label_ar: "كيف يعمل" },
  { id: "about", label_en: "About Us", label_ar: "من نحن" },
  { id: "contact", label_en: "Contact", label_ar: "اتصل بنا" }
];

export default function Header({
  currentLang,
  toggleLanguage,
  onNavigate,
  onOpenQuote,
  onOpenClientDashboard,
  onOpenAdminPortal
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = mockDb.auth.getUser();
        if (user?.email) {
          setIsAdmin(await dbService.adminUsers.checkEmail(user.email));
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const isAr = currentLang === "ar";
  const waMsg = isAr
    ? "مرحباً، أريد التواصل مع PGR UAE."
    : "Hello, I would like to contact the PGR UAE desk.";
  const waLink = `${WHATSAPP_BASE}?text=${encodeURIComponent(waMsg)}`;

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-brand-bg/95 backdrop-blur-md border-b border-champagne shadow-sm"
      id="pgr-global-header"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center gap-4">
        <BrandLogo variant="header" currentLang={currentLang} onClick={() => handleNav("hero")} />

        <nav className="hidden xl:flex items-center gap-6 text-[11px] uppercase tracking-widest text-text-secondary font-semibold">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNav(link.id)}
              className={`hover:text-gold-dark text-text-charcoal transition-colors cursor-pointer ${
                isAr ? "font-arabic text-sm normal-case tracking-normal" : ""
              }`}
            >
              {isAr ? link.label_ar : link.label_en}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAdminPortal}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gold-base/40 text-[10px] text-text-charcoal font-mono uppercase"
              id="header-admin-portal-btn"
            >
              <Terminal size={12} className="text-gold-base" />
              <span>{isAr ? "الإدارة" : "Admin"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded border border-soft-border text-[11px] text-text-charcoal"
            title={isAr ? "English" : "العربية"}
          >
            <Globe size={12} className="text-gold-base" />
            <span className={isAr ? "font-sans" : "font-arabic text-xs"}>
              {isAr ? "EN" : "ع"}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenClientDashboard}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded border border-soft-border text-[10px] font-mono text-text-charcoal"
          >
            <ShieldCheck size={12} className="text-gold-base" />
            <span>{isAr ? "العملاء" : "Clients"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuote}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-[10px] tracking-widest uppercase font-bold text-text-charcoal bg-gold-base hover:bg-gold-dark rounded transition-colors"
          >
            <FileText size={12} />
            <span>{isAr ? "طلب عرض سعر" : "Request Firm Quote"}</span>
          </button>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-widest uppercase font-bold text-brand-bg bg-panel-dark hover:bg-panel-charcoal rounded border border-champagne/20 transition-colors"
          >
            <Phone size={12} />
            <span>{isAr ? "واتساب" : "WhatsApp Desk"}</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded text-text-charcoal hover:bg-brand-section"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-champagne bg-brand-bg px-4 py-5 space-y-3">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNav(link.id)}
              className={`block w-full py-2.5 text-sm uppercase tracking-widest text-text-charcoal hover:text-gold-dark border-b border-soft-border/60 text-left ${
                isAr ? "font-arabic normal-case tracking-normal" : ""
              }`}
            >
              {isAr ? link.label_ar : link.label_en}
            </button>
          ))}
          <div className="grid grid-cols-1 gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                onOpenQuote();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-gold-base text-text-charcoal font-mono text-xs font-bold uppercase rounded"
            >
              {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-panel-dark text-brand-bg font-mono text-xs font-bold uppercase rounded text-center"
            >
              {isAr ? "واتساب" : "WhatsApp"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

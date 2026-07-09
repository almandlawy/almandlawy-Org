/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Luxury desk header — responsive navigation & CTAs.
 */

import React, { useState, useEffect } from "react";
import {
  Globe,
  Phone,
  FileText,
  Menu,
  X,
  User,
  LogIn,
  Terminal,
  Home,
  LayoutGrid,
  Star,
  TrendingUp,
  CircleHelp,
  Building2,
  Briefcase,
  Mail,
  FolderOpen,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { dbService, mockDb } from "../lib/supabase";
import BrandLogo from "./BrandLogo";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";
import type { AppUser } from "../lib/clientAuth";

interface HeaderProps {
  currentLang: "en" | "ar";
  toggleLanguage: () => void;
  onNavigate: (section: string) => void;
  onOpenQuote: () => void;
  onOpenClientDashboard: () => void;
  onOpenAdminPortal: () => void;
  authUser?: AppUser | null;
}

type NavGroup = "main" | "more";

const NAV_LINKS: {
  id: string;
  label_en: string;
  label_ar: string;
  icon: React.ElementType;
  group: NavGroup;
}[] = [
  { id: "hero", label_en: "Home", label_ar: "الرئيسية", icon: Home, group: "main" },
  { id: "catalog", label_en: "Catalog", label_ar: "الكتالوج", icon: LayoutGrid, group: "main" },
  { id: "iraq-silver-offers", label_en: "Iraq Silver", label_ar: "فضة العراق", icon: Star, group: "main" },
  { id: "market", label_en: "Market Watch", label_ar: "مراقبة السوق", icon: TrendingUp, group: "more" },
  { id: "how-quotes-work", label_en: "How It Works", label_ar: "كيف يعمل", icon: CircleHelp, group: "more" },
  { id: "about", label_en: "About Us", label_ar: "من نحن", icon: Building2, group: "more" },
  { id: "desk-services", label_en: "Services", label_ar: "الخدمات", icon: Briefcase, group: "more" },
  { id: "contact", label_en: "Contact", label_ar: "اتصل بنا", icon: Mail, group: "more" },
];

export default function Header({
  currentLang,
  toggleLanguage,
  onNavigate,
  onOpenQuote,
  onOpenClientDashboard,
  onOpenAdminPortal,
  authUser,
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

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const isAr = currentLang === "ar";
  const waMsg = isAr
    ? "مرحباً، أريد التواصل مع PGR UAE."
    : "Hello, I would like to contact the PGR UAE desk.";
  const waLink = buildWhatsAppLink(waMsg);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    closeMenu();
  };

  const handleRoute = (path: string) => {
    onNavigate(path);
    closeMenu();
  };

  const accountLabel = authUser
    ? isAr
      ? "حسابي"
      : "My account"
    : isAr
      ? "دخول"
      : "Sign in";

  const mainLinks = NAV_LINKS.filter((l) => l.group === "main");
  const moreLinks = NAV_LINKS.filter((l) => l.group === "more");

  const AccountIcon = authUser ? User : LogIn;

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-brand-bg/95 backdrop-blur-md border-b border-champagne shadow-sm"
      id="pgr-global-header"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-2 sm:py-3 flex justify-between items-center gap-2 sm:gap-4 min-h-[52px] sm:min-h-[56px]">
        <BrandLogo variant="header" currentLang={currentLang} onClick={() => handleNav("hero")} className="min-w-0" />

        <nav className="hidden xl:flex items-center gap-5 text-[11px] uppercase tracking-widest text-text-secondary font-semibold">
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

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAdminPortal}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gold-base/40 text-[10px] text-text-charcoal font-mono uppercase"
              id="header-admin-portal-btn"
            >
              <Terminal size={12} className="text-gold-base" />
              <span>{isAr ? "الإدارة" : "Admin"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-soft-border text-[11px] text-text-charcoal hover:bg-brand-section transition-colors"
            title={isAr ? "English" : "العربية"}
          >
            <Globe size={12} className="text-gold-base" />
            <span className={isAr ? "font-sans" : "font-arabic text-xs"}>
              {isAr ? "EN" : "ع"}
            </span>
          </button>

          {/* Desktop account */}
          <button
            type="button"
            onClick={onOpenClientDashboard}
            className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
              authUser
                ? "bg-gold-base/15 border border-gold-base/50 text-text-charcoal hover:bg-gold-base/25"
                : "border border-soft-border text-text-charcoal hover:bg-brand-section"
            }`}
          >
            <AccountIcon size={14} className="text-gold-dark shrink-0" />
            <span>{accountLabel}</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuote}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-[10px] tracking-widest uppercase font-bold text-text-charcoal bg-gold-base hover:bg-gold-dark rounded-lg transition-colors"
          >
            <FileText size={12} />
            <span>{isAr ? "طلب عرض سعر" : "Request Firm Quote"}</span>
          </button>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("header_whatsapp")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-widest uppercase font-bold text-brand-bg bg-panel-dark hover:bg-panel-charcoal rounded-lg border border-champagne/20 transition-colors"
          >
            <Phone size={12} />
            <span>{isAr ? "واتساب" : "WhatsApp Desk"}</span>
          </a>

          {/* Mobile quick actions — compact icon row */}
          <div className="flex xl:hidden items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onOpenClientDashboard}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                authUser ? "bg-gold-base/20 text-gold-dark" : "text-text-charcoal hover:bg-brand-section"
              }`}
              aria-label={accountLabel}
              title={accountLabel}
            >
              <AccountIcon size={18} strokeWidth={authUser ? 2.25 : 2} />
            </button>

            <button
              type="button"
              onClick={onOpenQuote}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gold-dark hover:bg-gold-base/15 transition-colors"
              aria-label={isAr ? "طلب عرض سعر" : "Request quote"}
              title={isAr ? "طلب عرض" : "Quote"}
            >
              <FileText size={18} />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-text-charcoal hover:bg-brand-section transition-colors"
              aria-label={isAr ? "القائمة" : "Menu"}
              aria-expanded={mobileMenuOpen}
              title={isAr ? "قائمة" : "Menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-champagne bg-brand-bg max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain">
          <div className="px-4 py-4 space-y-4">
            {/* Account card */}
            <div className="rounded-xl border border-soft-border bg-brand-card p-4 shadow-sm">
              {authUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gold-base/20 flex items-center justify-center shrink-0">
                      <User size={20} className="text-gold-dark" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-serif font-bold text-text-charcoal truncate">
                        {isAr ? `مرحباً، ${authUser.name}` : `Welcome, ${authUser.name}`}
                      </p>
                      <p className="text-[10px] text-text-secondary font-mono truncate">{authUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenClientDashboard();
                        closeMenu();
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold-base/15 border border-gold-base/40 text-[10px] font-mono font-bold uppercase text-text-charcoal"
                    >
                      <LayoutDashboard size={14} />
                      {isAr ? "لوحة التحكم" : "Dashboard"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoute("/my-documents")}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-soft-border text-[10px] font-mono font-bold uppercase text-text-charcoal hover:bg-brand-section"
                    >
                      <FolderOpen size={14} />
                      {isAr ? "مستنداتي" : "Documents"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    {isAr
                      ? "سجّل دخولك لمتابعة KYC وطلبات عروض الأسعار."
                      : "Sign in to track KYC and your quote requests."}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoute("/login")}
                      className="flex items-center justify-center gap-2 py-3 rounded-lg bg-panel-dark text-brand-bg text-[10px] font-mono font-bold uppercase"
                    >
                      <LogIn size={14} />
                      {isAr ? "تسجيل الدخول" : "Sign in"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoute("/register")}
                      className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gold-base text-text-charcoal text-[10px] font-mono font-bold uppercase"
                    >
                      <UserPlus size={14} />
                      {isAr ? "إنشاء حساب" : "Register"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick CTAs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenQuote();
                  closeMenu();
                }}
                className="flex items-center justify-center gap-2 py-3.5 bg-gold-base text-text-charcoal font-mono text-[10px] font-bold uppercase rounded-xl"
              >
                <FileText size={16} />
                {isAr ? "طلب عرض سعر" : "Request Quote"}
              </button>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppClick("header_mobile_whatsapp");
                  closeMenu();
                }}
                className="flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase rounded-xl"
              >
                <Phone size={16} />
                {isAr ? "واتساب" : "WhatsApp"}
              </a>
            </div>

            {/* Main navigation */}
            <div>
              <p className={`text-[9px] font-bold mb-2 px-1 ${isAr ? "font-arabic text-text-secondary" : "latin-brand-tight font-mono text-text-secondary"}`}>
                {isAr ? "الأقسام الرئيسية" : "Main sections"}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {mainLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleNav(link.id)}
                      className={`flex items-center gap-3 w-full py-3 px-3 rounded-lg text-sm text-text-charcoal hover:bg-brand-section transition-colors text-start ${
                        isAr ? "font-arabic" : ""
                      }`}
                    >
                      <Icon size={18} className="text-gold-dark shrink-0" />
                      {isAr ? link.label_ar : link.label_en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* More navigation */}
            <div>
              <p className={`text-[9px] font-bold mb-2 px-1 ${isAr ? "font-arabic text-text-secondary" : "latin-brand-tight font-mono text-text-secondary"}`}>
                {isAr ? "اكتشف المزيد" : "Discover more"}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {moreLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleNav(link.id)}
                      className={`flex items-center gap-3 w-full py-3 px-3 rounded-lg text-sm text-text-charcoal hover:bg-brand-section transition-colors text-start ${
                        isAr ? "font-arabic" : ""
                      }`}
                    >
                      <Icon size={18} className="text-gold-dark shrink-0" />
                      {isAr ? link.label_ar : link.label_en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings row */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-soft-border/60">
              <button
                type="button"
                onClick={() => {
                  toggleLanguage();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-soft-border text-[10px] font-mono font-bold uppercase text-text-charcoal hover:bg-brand-section"
              >
                <Globe size={14} className="text-gold-base" />
                {isAr ? "English" : "العربية"}
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdminPortal();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold-base/40 text-[10px] font-mono font-bold uppercase text-text-charcoal"
                >
                  <Terminal size={14} className="text-gold-base" />
                  {isAr ? "الإدارة" : "Admin"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChevronDown, ArrowRight, Shield, Award, MapPin } from "lucide-react";

interface HeroProps {
  currentLang: "en" | "ar";
  onScrollToCatalog: (category?: string) => void;
  onScrollToMarket: () => void;
  onOpenQuote: () => void;
}

export default function Hero({ currentLang, onScrollToCatalog, onScrollToMarket, onOpenQuote }: HeroProps) {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center pt-32 pb-20 overflow-hidden bg-brand-bg" id="pgr-hero">
      {/* Background Image with Deep Luxury Shadows */}
      <div className="absolute inset-0 z-0">
        <img
          src="/dubai_skyline_gold_1782445111463.jpg"
          alt="Dubai Skyline Gold"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-[0.05] scale-105 transform transition-transform duration-1000"
        />
        {/* Radical Vignette and Soft Overlays to protect text legibility and contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/85 to-brand-bg/95 z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-brand-bg/15 to-brand-bg z-10" />
      </div>

      {/* Floating Gold Dust Micro-Particles (CSS animations for top performance) */}
      <div className="absolute inset-0 z-15 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-gold-base opacity-30 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute top-1/3 left-2/3 w-1 h-1 rounded-full bg-gold-light opacity-50 animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-gold-dark opacity-20 animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/2 left-3/4 w-1 h-1 rounded-full bg-white opacity-40 animate-ping" style={{ animationDuration: "4s" }} />
      </div>

      {/* Hero Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 text-center z-20 flex flex-col items-center justify-center">
        {/* Dubai Premium Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand-section border border-soft-border shadow-sm mb-8 animate-fadeIn" style={{ animationDelay: "100ms" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-olive-accent"></span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-text-secondary font-mono font-bold">
            {currentLang === "ar" ? "بوابة الذهب والمعادن الثمينة المعتمدة" : "Dubai Certified Precious Metals Desk"}
          </span>
        </div>

        {/* Dynamic Typography Bilingual Headlines */}
        <div className="max-w-4xl space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight text-text-charcoal leading-[1.1] animate-fadeIn">
            {currentLang === "ar" ? (
              <span className="font-arabic leading-snug block font-medium">
                بوابة <span className="text-gold-gradient font-bold">PGR UAE</span> للمعادن الثمينة والذهب الفعلي
              </span>
            ) : (
              <span>
                PGR UAE <span className="text-gold-gradient font-bold">Physical Bullion</span> Private Desk
              </span>
            )}
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-text-secondary font-sans tracking-wide leading-relaxed animate-fadeIn" style={{ animationDelay: "300ms" }}>
            {currentLang === "ar" ? (
              <span className="font-arabic">
                الذهب والفضة للإمارات والعراق — شراء، تخزين آمن، تتبع المحفظة، وتوصيل فعلي تحت إشراف معايير الامتثال دبي.
              </span>
            ) : (
              "Secure allocated physical gold & silver bullion for family offices and institutional desk clients. Full Dubai custody, security vaulting, and accredited UAE-to-Iraq transit logistcs."
            )}
          </p>
        </div>

        {/* Subtitles Highlights Box with Olive Secondary Accents */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-10 text-[11px] md:text-[12px] uppercase tracking-widest text-olive-accent font-mono font-bold">
          <span className="flex items-center gap-1.5 bg-brand-section border border-soft-border/50 px-3 py-1 rounded">
            <Shield size={12} className="text-gold-base" />
            {currentLang === "ar" ? "تأكيد السعر المعتمد" : "Firm Price Locks"}
          </span>
          <span className="flex items-center gap-1.5 bg-brand-section border border-soft-border/50 px-3 py-1 rounded">
            <Award size={12} className="text-gold-base" />
            {currentLang === "ar" ? "امتثال وغرفة مقاصة" : "Compliant Clearing Desk"}
          </span>
          <span className="flex items-center gap-1.5 bg-brand-section border border-soft-border/50 px-3 py-1 rounded">
            <MapPin size={12} className="text-gold-base" />
            {currentLang === "ar" ? "تأمين الشحن والتحصيل" : "Insured Gulf Delivery"}
          </span>
        </div>

        {/* Buttons Section (Bespoke UX styling with custom animations) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full max-w-xl mx-auto animate-fadeIn" style={{ animationDelay: "500ms" }}>
          {/* Buy Gold Link - Primary gold button */}
          <button
            onClick={() => onScrollToCatalog("gold_bars")}
            className="w-full sm:w-auto px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] font-sans font-bold text-text-charcoal bg-[#C6A15B] hover:bg-[#A47C36] hover:text-white rounded transition-all duration-300 cursor-pointer shadow-md"
          >
            {currentLang === "ar" ? "شراء سبائك الذهب" : "Buy Gold Bullion"}
          </button>

          {/* Buy Silver Link - Secondary Button */}
          <button
            onClick={() => onScrollToCatalog("silver_bars")}
            className="w-full sm:w-auto px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] font-sans font-bold text-text-charcoal bg-transparent border border-[#C6A15B] hover:bg-gold-base/5 rounded transition-all duration-300 cursor-pointer"
          >
            {currentLang === "ar" ? "شراء الفضة النقية" : "Buy Silver Bullion"}
          </button>

          {/* Request Bespoke Quote - Primary gold outline style button */}
          <button
            onClick={onOpenQuote}
            className="w-full sm:w-auto px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] font-sans font-bold text-text-charcoal bg-brand-card hover:bg-brand-bg border border-soft-border hover:border-[#C6A15B] rounded transition-all duration-300 cursor-pointer shadow-sm"
          >
            {currentLang === "ar" ? "طلب تسعير معتمد" : "Request Firm Quote"}
          </button>
        </div>

        {/* Scroll Indicator Chevron */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-text-secondary hover:text-text-charcoal transition-colors animate-bounce" onClick={onScrollToMarket}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono">
            {currentLang === "ar" ? "الأسعار المباشرة" : "Explore Rates"}
          </span>
          <ChevronDown size={14} className="text-gold-base" />
        </div>
      </div>
    </section>
  );
}

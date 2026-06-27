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
    <section className="relative min-h-screen w-full flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#070707]" id="pgr-hero">
      {/* Background Image with Deep Luxury Shadows */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/dubai_skyline_gold_1782445111463.jpg"
          alt="Dubai Skyline Gold"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 scale-105 transform transition-transform duration-1000"
        />
        {/* Radical Vignette and Dark Overlays to protect text legibility and contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/70 to-[#070707]/90 z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070707]/30 to-[#070707] z-10" />
      </div>

      {/* Floating Gold Dust Micro-Particles (Pure CSS animations for top performance) */}
      <div className="absolute inset-0 z-15 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-gold-base opacity-40 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute top-1/3 left-2/3 w-1 h-1 rounded-full bg-gold-light opacity-60 animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-gold-dark opacity-30 animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/2 left-3/4 w-1 h-1 rounded-full bg-white opacity-55 animate-ping" style={{ animationDuration: "4s" }} />
        <div className="absolute top-3/4 left-10 w-1.5 h-1.5 rounded-full bg-gold-base opacity-40 animate-pulse" style={{ animationDuration: "6s" }} />
      </div>

      {/* Hero Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 text-center z-20 flex flex-col items-center justify-center">
        {/* Dubai Premium Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] mb-8 animate-fadeIn" style={{ animationDelay: "100ms" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-gold-base"></span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-gray-400 font-mono">
            {currentLang === "ar" ? "دبي، الإمارات العربية المتحدة" : "Dubai, United Arab Emirates"}
          </span>
          <span className="text-[9px] bg-gold-base/10 text-gold-base px-2 py-0.5 rounded font-mono font-semibold">DMCC</span>
        </div>

        {/* Dynamic Typography Bilingual Headlines */}
        <div className="max-w-4xl space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tight text-white leading-[1.1] animate-fadeIn">
            {currentLang === "ar" ? (
              <span className="font-arabic leading-snug tracking-normal block">
                استثمر <span className="text-gold-gradient font-bold">بالذهب والفضة</span> بثقة مطلقة
              </span>
            ) : (
              <span>
                Invest in <span className="text-gold-gradient font-semibold">Gold & Silver</span> <br className="hidden md:block" />
                with Absolute Confidence
              </span>
            )}
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-gray-400 font-sans tracking-wide leading-relaxed animate-fadeIn" style={{ animationDelay: "300ms" }}>
            {currentLang === "ar" ? (
              <span className="font-arabic text-gold-light/90">
                PGR UAE للمعادن الثمينة - منتجات الذهب والفضة للإمارات والعراق - اطلب، تحقق، أكد، واستلم سبائكك بدعم احترافي.
              </span>
            ) : (
              "PGR UAE Precious Metals - Gold & Silver Products for UAE and Iraq - Request, verify, confirm, and receive your bullion with professional support."
            )}
          </p>
        </div>

        {/* Subtitles Highlights Box */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-[11px] md:text-[12px] uppercase tracking-widest text-gold-light/80 font-mono">
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-gold-base" />
            {currentLang === "ar" ? "تسليم آمن ومؤمن" : "Secure Insured Delivery"}
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <Award size={12} className="text-gold-base" />
            {currentLang === "ar" ? "أسعار دولية مباشرة" : "LBMA Good Delivery Rates"}
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-gold-base" />
            {currentLang === "ar" ? "تداول بالجملة والمؤسسات" : "DMCC Sovereign Trading"}
          </span>
        </div>

        {/* Buttons Section (Bespoke UX styling with custom animations) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full max-w-lg mx-auto animate-fadeIn" style={{ animationDelay: "500ms" }}>
          {/* Buy Gold Link */}
          <button
            onClick={() => onScrollToCatalog("gold_bars")}
            className="w-full sm:w-auto px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] font-semibold text-black bg-gold-gradient rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:scale-[1.02] transform transition-all duration-300 cursor-pointer"
          >
            {currentLang === "ar" ? "شراء سبائك الذهب" : "Buy Gold Bullion"}
          </button>

          {/* Buy Silver Link */}
          <button
            onClick={() => onScrollToCatalog("silver_bars")}
            className="w-full sm:w-auto px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] font-semibold text-white bg-transparent border border-white/20 hover:border-white hover:bg-white/[0.04] rounded-sm transition-all duration-300 cursor-pointer"
          >
            {currentLang === "ar" ? "شراء الفضة النقية" : "Buy Silver Bullion"}
          </button>

          {/* Request Bespoke Quote */}
          <button
            onClick={onOpenQuote}
            className="w-full sm:w-auto px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] font-semibold text-gold-light bg-gold-dark/10 border border-gold-base/30 hover:border-gold-base rounded-sm transition-all duration-300 cursor-pointer"
          >
            {currentLang === "ar" ? "طلب استشارة ومقايسة" : "Bespoke Portfolio Quote"}
          </button>
        </div>

        {/* Scroll Indicator Chevron */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-gray-500 hover:text-white transition-colors animate-bounce" onClick={onScrollToMarket}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono">
            {currentLang === "ar" ? "الأسعار المباشرة" : "Explore Rates"}
          </span>
          <ChevronDown size={14} className="text-gold-base" />
        </div>
      </div>
    </section>
  );
}

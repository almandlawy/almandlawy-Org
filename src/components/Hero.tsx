/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChevronDown, Phone, FileText } from "lucide-react";

interface HeroProps {
  currentLang: "en" | "ar";
  onScrollToCatalog: (category?: string) => void;
  onScrollToMarket: () => void;
  onOpenQuote: () => void;
}

const WHATSAPP_BASE = "https://wa.me/971559688837";

export default function Hero({ currentLang, onScrollToCatalog, onScrollToMarket, onOpenQuote }: HeroProps) {
  const isAr = currentLang === "ar";
  const waMsg = isAr
    ? "مرحباً، أريد التواصل مع ديوان تسعير PGR UAE لطلب عرض سعر معتمد."
    : "Hello, I would like to contact the PGR UAE Quote Desk for a firm quote.";
  const waLink = `${WHATSAPP_BASE}?text=${encodeURIComponent(waMsg)}`;

  return (
    <section className="relative min-h-[85vh] w-full flex items-center justify-center pt-28 pb-16 bg-brand-bg" id="pgr-hero">
      <div className="absolute inset-0 z-0 opacity-[0.04]">
        <img
          src="/dubai_skyline_gold_1782445111463.jpg"
          alt=""
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-brand-bg/95 to-brand-bg z-[1]" />

      <div className="relative max-w-4xl mx-auto px-4 text-center z-10 flex flex-col items-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-olive-accent font-bold mb-6">
          {isAr ? "ديوان تداول سبائك معتمد — دبي" : "Dubai Firm-Quote Bullion Desk"}
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-text-charcoal leading-tight font-medium mb-6">
          {isAr ? (
            <span className="font-arabic">
              <span className="text-gold-dark">PGR UAE</span> — عروض أسعار معتمدة للسبائك
            </span>
          ) : (
            <>
              <span className="text-gold-dark">PGR UAE</span> Firm Quote Bullion Desk
            </>
          )}
        </h1>

        <p className="max-w-2xl text-base text-text-secondary font-sans leading-relaxed mb-10">
          {isAr
            ? "ديوان تداول سبائك ذهب وفضة في دبي. اختر منتجك، اطلب عرض سعر معتمد، وأكمل التسوية بعد مراجعة الامتثال — بدون دفع مباشر قبل العرض."
            : "PGR UAE is a firm-quote bullion desk for gold and silver. Select your product, request a firm quote, and complete settlement after compliance review — no direct payment before your quote is confirmed."}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-lg">
          <button
            type="button"
            onClick={onOpenQuote}
            className="w-full sm:flex-1 px-8 py-4 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={14} />
            {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={14} />
            {isAr ? "ديوان واتساب" : "WhatsApp Quote Desk"}
          </a>
        </div>

        <button
          type="button"
          onClick={() => onScrollToCatalog()}
          className="mt-8 text-xs font-mono text-text-secondary hover:text-gold-dark uppercase tracking-widest transition-colors"
        >
          {isAr ? "استعرض الكتالوج" : "Browse catalog"} ↓
        </button>

        <button
          type="button"
          onClick={onScrollToMarket}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-secondary hover:text-text-charcoal transition-colors"
          aria-label="Market reference"
        >
          <span className="text-[9px] font-mono uppercase tracking-widest">
            {isAr ? "مرجع السوق" : "Market reference"}
          </span>
          <ChevronDown size={14} className="text-gold-base" />
        </button>
      </div>
    </section>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Institutional hero — luxury bullion imagery, clear desk positioning, no product clutter.
 */

import React from "react";
import { Phone, FileText, Shield, Package, Building2 } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";

const HERO_IMAGE = "/images/products/01-bullion-collection.webp?v=branded-1122x1402-v2";

interface HeroProps {
  currentLang: "en" | "ar";
  onOpenQuote: () => void;
  onScrollToMarket: () => void;
}

const TRUST = [
  { icon: FileText, en: "Desk-confirmed pricing", ar: "تسعير مؤكد من المكتب" },
  { icon: Package, en: "Physical bullion only", ar: "سبائك مادية فقط" },
  { icon: Building2, en: "Dubai-based quote desk", ar: "مكتب عروض مقره دبي" },
];

export default function Hero({ currentLang, onOpenQuote, onScrollToMarket }: HeroProps) {
  const isAr = currentLang === "ar";

  const waHref = buildWhatsAppLink(
    isAr
      ? "مرحباً، أريد طلب عرض سعر من مكتب PGR UAE في دبي للذهب أو الفضة."
      : "Hello, I would like to request a quote from the PGR UAE Dubai quote desk for gold or silver bullion."
  );

  return (
    <section
      id="hero"
      className="relative bg-brand-bg border-b border-soft-border overflow-hidden"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0 lg:min-h-[min(82vh,780px)]">
        {/* Copy */}
        <div className="relative z-10 flex flex-col justify-center px-5 sm:px-10 lg:px-14 xl:px-16 py-12 lg:py-16 order-2 lg:order-1">
          <BrandLogo variant="header" currentLang={currentLang} className="mb-8" />

          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-gold-dark font-bold mb-3">
            {isAr ? "مكتب عروض أسعار السبائك" : "Bullion Quote Desk"}
          </p>

          <h1 className="text-[1.75rem] sm:text-3xl lg:text-[2.4rem] font-serif text-text-charcoal leading-[1.12] font-medium max-w-xl">
            {isAr ? (
              <>
                سبائك الذهب والفضة
                <br />
                <span className="text-gold-dark">عروض أسعار من دبي</span>
              </>
            ) : (
              <>
                Gold &amp; Silver Bullion
                <br />
                <span className="text-gold-dark">Quote Desk Dubai</span>
              </>
            )}
          </h1>

          <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-lg">
            {isAr
              ? "مكتب مؤسسي فاخر لطلب عروض أسعار مؤكدة — وليس متجراً إلكترونياً. مرجع سوقي استرشادي فقط."
              : "An institutional luxury desk for firm quote requests — not an online shop. Indicative market reference only."}
          </p>

          <ul className="mt-7 space-y-3">
            {TRUST.map(({ icon: Icon, en, ar }) => (
              <li key={en} className="flex items-center gap-3 text-sm text-text-charcoal">
                <span className="h-8 w-8 rounded-full border border-champagne bg-brand-card flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-gold-dark" />
                </span>
                <span className="font-sans font-medium">{isAr ? ar : en}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
            <button
              type="button"
              onClick={onOpenQuote}
              className="flex-1 min-h-[48px] px-6 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[11px] font-bold uppercase tracking-widest rounded-md shadow-premium transition-colors"
            >
              {isAr ? "طلب عرض سعر" : "Request Quote"}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("hero_whatsapp")}
              className="flex-1 min-h-[48px] px-6 py-3.5 border border-emerald-600/30 bg-brand-card hover:bg-emerald-600 hover:text-white text-text-charcoal font-mono text-[11px] font-bold uppercase tracking-widest rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={14} />
              {isAr ? "واتساب المكتب" : "WhatsApp Quote Desk"}
            </a>
          </div>

          <button
            type="button"
            onClick={onScrollToMarket}
            className="mt-6 text-[10px] font-mono uppercase tracking-widest text-text-secondary hover:text-gold-dark transition-colors text-start"
          >
            {isAr ? "مرجع السوق المباشر ↓" : "Live market reference ↓"}
          </button>
        </div>

        {/* Image */}
        <div className="relative order-1 lg:order-2 min-h-[42vh] sm:min-h-[48vh] lg:min-h-full bg-[#141816]">
          <img
            src={HERO_IMAGE}
            alt={isAr ? "سبائك ذهب وفضة مادية" : "Physical gold and silver bullion bars"}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141816]/60 via-transparent to-[#141816]/20" />
          <div
            className={`absolute bottom-6 ${isAr ? "right-6" : "left-6"} max-w-xs`}
          >
            <div className="rounded-lg border border-white/15 bg-black/50 backdrop-blur-md px-4 py-3">
              <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-champagne/90 flex items-center gap-1.5">
                <Shield size={10} />
                {isAr ? "سبائك مادية معتمدة" : "Accredited physical bullion"}
              </p>
              <p className="text-sm font-serif text-white mt-1">
                {isAr ? "دبي · عروض أسعار مؤكدة" : "Dubai · Desk-confirmed quotes"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

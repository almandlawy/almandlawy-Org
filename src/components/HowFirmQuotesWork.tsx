/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Firm quote process + desk trust signals — single consolidated section.
 */

import React from "react";
import {
  Search,
  FileText,
  ClipboardCheck,
  Mail,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";

interface HowFirmQuotesWorkProps {
  currentLang: "en" | "ar";
}

const STEPS = [
  { icon: Search, en: "Select Product", ar: "اختر المنتج" },
  { icon: FileText, en: "Request Firm Quote", ar: "اطلب عرض سعر معتمد" },
  { icon: ClipboardCheck, en: "Office Review", ar: "مراجعة المكتب" },
  { icon: Mail, en: "Receive Firm Quote", ar: "استلم العرض المعتمد" },
  { icon: CreditCard, en: "Payment & Delivery", ar: "الدفع والتسليم" },
];

const PROOF_ITEMS = [
  {
    icon: BadgeCheck,
    titleEn: "Desk-confirmed pricing",
    titleAr: "تسعير مؤكد من المكتب",
    bodyEn: "No auto-checkout — every quote is issued by PGR UAE after review.",
    bodyAr: "لا دفع تلقائي — كل عرض يصدر من مكتب PGR UAE بعد المراجعة.",
  },
  {
    icon: MessageCircle,
    titleEn: "WhatsApp + documented flow",
    titleAr: "واتساب ومسار موثّق",
    bodyEn: "Clear pricing and delivery terms before any payment request.",
    bodyAr: "شروط واضحة للتسعير والتسليم قبل أي طلب دفع.",
  },
];

export default function HowFirmQuotesWork({ currentLang }: HowFirmQuotesWorkProps) {
  const isAr = currentLang === "ar";
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <section
      className="py-12 md:py-16 px-4 md:px-8 bg-brand-section border-b border-soft-border"
      id="how-quotes-work"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p
            className={`text-[10px] text-gold-dark font-bold ${
              isAr ? "font-arabic" : "latin-brand-tight font-mono"
            }`}
          >
            {isAr ? "كيف يعمل المكتب" : "How the Desk Works"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "عرض سعر معتمد — بدون دفع مباشر" : "Firm Quote — No Direct Checkout"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {isAr
              ? "خمس خطوات واضحة. لا تقييمات مزيفة — هذه طريقة عمل المكتب الفعلية."
              : "Five clear steps. No fake reviews — this is how our desk actually works."}
          </p>
        </div>

        {/* Desktop — horizontal steps */}
        <ol className="hidden md:flex items-start justify-center w-full max-w-5xl mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <React.Fragment key={step.en}>
                <li className="flex flex-col items-center text-center gap-3 flex-1 min-w-0 max-w-[150px]">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-full bg-gold-base/15 border-2 border-gold-base flex items-center justify-center text-gold-dark shadow-premium">
                      <Icon size={22} aria-hidden />
                    </div>
                    <span className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-panel-dark text-brand-bg text-[10px] font-mono font-bold flex items-center justify-center border border-champagne">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className={`text-sm font-medium text-text-charcoal leading-snug px-1 ${isAr ? "font-arabic" : "font-serif"}`}>
                    {isAr ? step.ar : step.en}
                  </h3>
                </li>
                {!isLast && (
                  <li aria-hidden className="flex items-center justify-center shrink-0 pt-5 px-1 sm:px-2">
                    <ArrowIcon size={20} className="text-gold-base/55" strokeWidth={2} />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>

        {/* Mobile — compact horizontal steps */}
        <ol className="md:hidden flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory -mx-1 px-1">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li
                key={`mobile-${step.en}`}
                className="snap-start shrink-0 w-[38vw] max-w-[140px] flex flex-col items-center text-center gap-2 p-3 rounded-lg border border-soft-border bg-brand-card"
              >
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-gold-base/15 border border-gold-base flex items-center justify-center text-gold-dark">
                    <Icon size={18} aria-hidden />
                  </div>
                  <span className="absolute -top-1 -end-1 h-4 w-4 rounded-full bg-panel-dark text-brand-bg text-[9px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className={`text-[11px] text-text-charcoal leading-snug ${isAr ? "font-arabic" : "font-serif"}`}>
                  {isAr ? step.ar : step.en}
                </h3>
              </li>
            );
          })}
        </ol>

        {/* Trust proof — compact 2 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {PROOF_ITEMS.map(({ icon: Icon, titleEn, titleAr, bodyEn, bodyAr }) => (
            <article
              key={titleEn}
              className="flex gap-3 p-4 rounded-lg border border-soft-border bg-brand-card"
            >
              <span className="h-9 w-9 rounded-full border border-champagne bg-brand-bg flex items-center justify-center shrink-0">
                <Icon size={16} className="text-gold-dark" />
              </span>
              <div className="space-y-1 min-w-0">
                <h3 className={`text-sm font-medium text-text-charcoal ${isAr ? "font-arabic" : "font-serif"}`}>
                  {isAr ? titleAr : titleEn}
                </h3>
                <p className={`text-xs text-text-secondary leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                  {isAr ? bodyAr : bodyEn}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

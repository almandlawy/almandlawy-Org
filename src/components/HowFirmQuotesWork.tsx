/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Five-step firm quote process — aligned horizontal flow with connectors.
 */

import React from "react";
import { Search, FileText, ClipboardCheck, Mail, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

interface HowFirmQuotesWorkProps {
  currentLang: "en" | "ar";
}

const STEPS = [
  { icon: Search, en: "Select Product", ar: "اختر المنتج" },
  { icon: FileText, en: "Request Firm Quote", ar: "اطلب عرض سعر معتمد" },
  { icon: ClipboardCheck, en: "Desk Review", ar: "مراجعة الديوان" },
  { icon: Mail, en: "Receive Firm Quote", ar: "استلم العرض المعتمد" },
  { icon: CreditCard, en: "Payment & Delivery", ar: "الدفع والتسليم" }
];

export default function HowFirmQuotesWork({ currentLang }: HowFirmQuotesWorkProps) {
  const isAr = currentLang === "ar";
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <section
      className="py-16 md:py-20 px-4 md:px-8 bg-brand-section border-b border-soft-border"
      id="how-quotes-work"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold-dark font-bold">
            {isAr ? "عملية التسعير" : "Firm Quote Process"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "كيف تعمل عملية عرض السعر المعتمد" : "How Our Firm Quote Process Works"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {isAr
              ? "لا يوجد دفع مباشر قبل عرض السعر المعتمد — خاضع لحركة السوق ومراجعة الامتثال."
              : "No direct payment before firm quote — subject to market movement and compliance review."}
          </p>
        </div>

        {/* Desktop / tablet — single horizontal row with connectors */}
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
                  <h3 className="text-sm font-serif font-medium text-text-charcoal leading-snug px-1">
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

        {/* Mobile — vertical stack */}
        <ol className="md:hidden flex flex-col items-center gap-0 max-w-xs mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <React.Fragment key={`mobile-${step.en}`}>
                <li className="flex flex-col items-center text-center gap-2 w-full">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-full bg-gold-base/15 border-2 border-gold-base flex items-center justify-center text-gold-dark shadow-premium">
                      <Icon size={22} aria-hidden />
                    </div>
                    <span className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-panel-dark text-brand-bg text-[10px] font-mono font-bold flex items-center justify-center border border-champagne">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-serif font-medium text-text-charcoal leading-snug">
                    {isAr ? step.ar : step.en}
                  </h3>
                </li>
                {!isLast && (
                  <li aria-hidden className="flex justify-center py-2 text-gold-base/55">
                    <ChevronRight size={18} className={`rotate-90 ${isAr ? "-scale-x-100" : ""}`} />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

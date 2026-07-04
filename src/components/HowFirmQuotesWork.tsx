/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Five-step firm quote process — mockup style with gold icons.
 */

import React from "react";
import { Search, FileText, ClipboardCheck, Mail, CreditCard } from "lucide-react";

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
          <h2 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium uppercase tracking-wide">
            {isAr ? "كيف تعمل عملية عرض السعر المعتمد" : "How Our Firm Quote Process Works"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {isAr
              ? "لا يوجد دفع مباشر قبل عرض السعر المعتمد — خاضع لحركة السوق ومراجعة الامتثال."
              : "No direct payment before firm quote — subject to market movement and compliance review."}
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li key={step.en} className="relative flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-gold-base/15 border-2 border-gold-base flex items-center justify-center text-gold-dark shadow-premium">
                    <Icon size={22} />
                  </div>
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-panel-dark text-brand-bg text-[10px] font-mono font-bold flex items-center justify-center border border-champagne">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-serif font-medium text-text-charcoal max-w-[160px]">
                  {isAr ? step.ar : step.en}
                </h3>
                {idx < STEPS.length - 1 && (
                  <span className="hidden lg:block absolute top-7 -right-4 text-gold-base/50 text-lg font-mono">
                    {isAr ? "←" : "→"}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

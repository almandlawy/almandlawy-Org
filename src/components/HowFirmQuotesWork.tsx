/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText, Search, Clock, CreditCard, Package } from "lucide-react";

interface HowFirmQuotesWorkProps {
  currentLang: "en" | "ar";
}

const STEPS = [
  {
    icon: Search,
    en: "Select product",
    ar: "اختر المنتج",
    descEn: "Browse the PGR UAE bullion showroom and choose your bar, coin, or custom sizing requirement.",
    descAr: "استعرض معرض سبائك PGR UAE واختر السبيكة أو العملة أو الطلب المخصص."
  },
  {
    icon: FileText,
    en: "Request firm quote",
    ar: "اطلب عرض سعر معتمد",
    descEn: "Submit a firm quote request online or via WhatsApp Quote Desk.",
    descAr: "قدّم طلب عرض سعر معتمد عبر الموقع أو ديوان واتساب."
  },
  {
    icon: Clock,
    en: "PGR desk reviews market & availability",
    ar: "مراجعة السوق والتوفر",
    descEn: "Our desk confirms live market reference, stock, and compliance requirements.",
    descAr: "يؤكد الديوان مرجع السوق والتوفر ومتطلبات الامتثال."
  },
  {
    icon: CreditCard,
    en: "Quote valid for limited time",
    ar: "عرض سعر محدود المدة",
    descEn: "Your firm quote is issued with a defined expiry. Subject to market movement.",
    descAr: "يُصدر عرض السعر المعتمد بمدة صلاحية محددة. خاضع لحركة السوق."
  },
  {
    icon: Package,
    en: "Payment & collection after compliance review",
    ar: "الدفع والاستلام بعد الامتثال",
    descEn: "After acceptance and KYC review, payment is arranged and collection or delivery confirmed.",
    descAr: "بعد القبول ومراجعة اعرف عميلك، يُرتب الدفع ويُؤكد الاستلام أو التسليم."
  }
];

export default function HowFirmQuotesWork({ currentLang }: HowFirmQuotesWorkProps) {
  const isAr = currentLang === "ar";

  return (
    <section className="py-20 px-4 md:px-8 bg-brand-bg border-b border-soft-border" id="how-quotes-work">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
            {isAr ? "عملية التسعير" : "Firm Quote Process"}
          </p>
          <h2 className="text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "كيف تعمل عروض الأسعار المعتمدة" : "How Firm Quotes Work"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {isAr
              ? "PGR UAE ديوان تداول سبائك — لا يوجد دفع مباشر قبل عرض السعر المعتمد."
              : "PGR UAE is a firm-quote bullion desk — no direct checkout before your quote is confirmed."}
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li
                key={idx}
                className="relative p-6 rounded border border-soft-border bg-brand-card space-y-4"
              >
                <span className="absolute top-4 right-4 text-[10px] font-mono text-gold-dark font-bold">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="h-10 w-10 rounded bg-brand-bg border border-soft-border flex items-center justify-center text-olive-accent">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-serif font-medium text-text-charcoal pr-8">
                  {isAr ? step.ar : step.en}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  {isAr ? step.descAr : step.descEn}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

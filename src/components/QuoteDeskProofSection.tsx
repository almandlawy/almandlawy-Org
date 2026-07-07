/**
 * Process proof — no fabricated reviews; desk trust signals only.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileCheck, ClipboardList, MessageCircle, BadgeCheck } from "lucide-react";

interface QuoteDeskProofSectionProps {
  currentLang: "en" | "ar";
}

const PROOF_ITEMS = [
  {
    icon: BadgeCheck,
    titleEn: "Verified quote process",
    titleAr: "عملية عرض سعر موثقة",
    bodyEn: "Every firm quote is issued by the PGR UAE desk after product and compliance review — not auto-calculated at checkout.",
    bodyAr: "كل عرض سعر مؤكد يصدر من مكتب PGR UAE بعد مراجعة المنتج والامتثال — وليس حساباً تلقائياً عند الدفع.",
  },
  {
    icon: ClipboardList,
    titleEn: "Documented orders",
    titleAr: "طلبات موثقة",
    bodyEn: "Quote requests, KYC when required, and desk confirmations are recorded through a secure documentation flow.",
    bodyAr: "طلبات العروض والتحقق عند الحاجة وتأكيدات المكتب تُسجّل عبر مسار توثيق آمن.",
  },
  {
    icon: MessageCircle,
    titleEn: "Clear communication",
    titleAr: "تواصل واضح",
    bodyEn: "WhatsApp quote desk and structured forms keep pricing, availability, and delivery terms transparent before payment.",
    bodyAr: "مكتب واتساب ونماذج منظمة توضح التسعير والتوفر وشروط التسليم قبل الدفع.",
  },
  {
    icon: FileCheck,
    titleEn: "Desk confirmation before payment",
    titleAr: "تأكيد المكتب قبل الدفع",
    bodyEn: "No payment is requested until the desk confirms your quote, premium, and settlement terms in writing.",
    bodyAr: "لا يُطلب الدفع حتى يؤكد المكتب عرض السعر والهامش وشروط التسوية كتابياً.",
  },
];

export default function QuoteDeskProofSection({ currentLang }: QuoteDeskProofSectionProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      className="py-16 md:py-20 bg-brand-bg border-b border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
      aria-label={isAr ? "إثبات العملية" : "Quote process proof"}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        <header className="text-center max-w-xl mx-auto space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-gold-dark font-bold">
            {isAr ? "الثقة والشفافية" : "Trust & Transparency"}
          </p>
          <h2 className="text-2xl md:text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "عملية مكتب موثوقة" : "A Documented Desk Process"}
          </h2>
          <p className="text-sm text-text-secondary">
            {isAr
              ? "لا نعرض تقييمات مزيفة. هذه هي طريقة عمل المكتب الفعلية."
              : "We do not display fabricated reviews. This is how our desk actually works."}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROOF_ITEMS.map(({ icon: Icon, titleEn, titleAr, bodyEn, bodyAr }) => (
            <article
              key={titleEn}
              className="p-5 rounded-lg border border-soft-border bg-brand-card space-y-3"
            >
              <span className="h-10 w-10 rounded-full border border-champagne bg-brand-bg flex items-center justify-center">
                <Icon size={18} className="text-gold-dark" />
              </span>
              <h3 className="text-sm font-serif font-medium text-text-charcoal">
                {isAr ? titleAr : titleEn}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isAr ? bodyAr : bodyEn}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

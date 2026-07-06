/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface HomepageFAQProps {
  currentLang: "en" | "ar";
}

export const FAQ_ITEMS = [
  {
    qEn: "Can I pay before receiving a firm quote?",
    qAr: "هل يمكنني الدفع قبل عرض السعر المعتمد؟",
    aEn: "No. Customers cannot pay before a firm quote is accepted. The flow is: select product → request firm quote → desk review → quote acceptance → payment arrangement.",
    aAr: "لا. لا يمكن الدفع قبل قبول عرض السعر المعتمد. المسار: اختيار المنتج → طلب عرض سعر → مراجعة الديوان → قبول العرض → ترتيب الدفع."
  },
  {
    qEn: "Are prices on the website final?",
    qAr: "هل الأسعار على الموقع نهائية؟",
    aEn: "No. Displayed prices are indicative market references only, subject to market movement. Final quote confirmed by PGR UAE desk before settlement.",
    aAr: "لا. الأسعار المعروضة مرجع سوقي استرشادي فقط، خاضع لحركة السوق. عرض السعر النهائي يؤكده ديوان PGR UAE قبل التسوية."
  },
  {
    qEn: "What is required before payment?",
    qAr: "ما المطلوب قبل الدفع؟",
    aEn: "KYC/AML review may be required before payment and dispatch. Subject to compliance review.",
    aAr: "قد تُطلب مراجعة اعرف عميلك/AML قبل الدفع والشحن. خاضع لمراجعة الامتثال."
  },
  {
    qEn: "How do I request a firm quote?",
    qAr: "كيف أطلب عرض سعر معتمد؟",
    aEn: "Use Request Firm Quote on any product card, the request-quote page, or WhatsApp Quote Desk.",
    aAr: "استخدم زر طلب عرض سعر معتمد على أي منتج، أو صفحة الطلب، أو ديوان واتساب."
  },
  {
    qEn: "How many products are in the catalog?",
    qAr: "كم عدد المنتجات في الكتالوج؟",
    aEn: "The public catalog shows exactly 10 approved PGR UAE products across gold, silver, mint, and custom inquiry categories.",
    aAr: "يعرض الكتالوج العام عشرة منتجات معتمدة فقط من PGR UAE عبر فئات الذهب والفضة والمسكوكات والطلبات المخصصة."
  }
];

export default function HomepageFAQ({ currentLang }: HomepageFAQProps) {
  const isAr = currentLang === "ar";
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 md:px-8 bg-brand-bg border-t border-soft-border">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
            FAQ
          </p>
          <h2 className="text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h2>
        </div>

        <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
          {FAQ_ITEMS.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded border border-soft-border bg-brand-card overflow-hidden"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-serif text-text-charcoal font-medium" itemProp="name">
                    {isAr ? item.qAr : item.qEn}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gold-dark transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div
                    className="px-4 pb-4 text-sm text-text-secondary font-sans leading-relaxed border-t border-soft-border pt-3"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p itemProp="text">{isAr ? item.aAr : item.aEn}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

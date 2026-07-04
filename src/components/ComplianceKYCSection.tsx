/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface ComplianceKYCSectionProps {
  currentLang: "en" | "ar";
  onOpenLegal?: (docId: string) => void;
}

export default function ComplianceKYCSection({ currentLang, onOpenLegal }: ComplianceKYCSectionProps) {
  const isAr = currentLang === "ar";

  return (
    <section className="py-16 px-4 md:px-8 bg-brand-section border-b border-soft-border" id="compliance-kyc">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-olive-accent">
            <ShieldCheck size={18} />
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
              {isAr ? "الامتثال واعرف عميلك" : "Compliance & KYC"}
            </p>
          </div>
          <h2 className="text-2xl font-serif text-text-charcoal font-medium">
            {isAr ? "إخلاء مسؤولية التسعير والامتثال" : "Pricing & Compliance Disclaimer"}
          </h2>
        </div>

        <div className="p-6 rounded border border-soft-border bg-brand-card space-y-4 text-sm text-text-secondary font-sans leading-relaxed">
          <p>
            {isAr
              ? "جميع الأسعار المعروضة هي مراجع سوقية استرشادية فقط. العرض السعر المعتمد (Firm Quote) يُصدر من ديوان PGR UAE ويخضع لحركة السوق والتوفر ومراجعة الامتثال."
              : "All displayed prices are indicative market references only. Firm quotes are issued by the PGR UAE desk and are subject to market movement, availability, and compliance review."}
          </p>
          <p>
            {isAr
              ? "تخضع المعاملات لإجراءات مكافحة غسيل الأموال (AML) واعرف عميلك (KYC). لا يُقدّم PGR UAE استشارات استثمارية أو ضريبية أو قانونية."
              : "Transactions are subject to AML/KYC procedures. PGR UAE does not provide investment, tax, or legal advice."}
          </p>
          <div className="flex items-start gap-2 p-3 rounded bg-soft-danger border border-soft-border text-xs">
            <AlertTriangle size={14} className="text-gold-dark shrink-0 mt-0.5" />
            <p>
              {isAr
                ? "الأسعار استرشادية — خاضعة لحركة السوق — خاضعة لمراجعة الامتثال قبل التسوية."
                : "Indicative market reference · Subject to market movement · Subject to compliance review before settlement."}
            </p>
          </div>
        </div>

        {onOpenLegal && (
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { id: "aml", en: "KYC & AML Policy", ar: "سياسة اعرف عميلك" },
              { id: "pricing", en: "Pricing Disclaimer", ar: "إخلاء مسؤولية التسعير" },
              { id: "compliance", en: "Compliance", ar: "الامتثال" }
            ].map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onOpenLegal(doc.id)}
                className="px-4 py-2 text-xs font-mono border border-soft-border rounded bg-brand-card hover:border-gold-base text-text-charcoal transition-colors"
              >
                {isAr ? doc.ar : doc.en}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

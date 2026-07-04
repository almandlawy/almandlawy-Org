/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KYC & compliance dark footer strip — mockup style.
 */

import React from "react";
import { ShieldCheck, Lock, FileWarning, AlertTriangle } from "lucide-react";

interface ComplianceKYCSectionProps {
  currentLang: "en" | "ar";
  onOpenLegal?: (docId: string) => void;
}

const BADGES = [
  { icon: ShieldCheck, en: "KYC Verified Process", ar: "عملية KYC معتمدة" },
  { icon: FileWarning, en: "AML Compliant", ar: "متوافق مع AML" },
  { icon: Lock, en: "Data Protection", ar: "حماية البيانات" },
  { icon: AlertTriangle, en: "Important Notice", ar: "إشعار مهم" }
];

export default function ComplianceKYCSection({ currentLang, onOpenLegal }: ComplianceKYCSectionProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      className="py-12 md:py-14 px-4 md:px-8 bg-panel-dark border-t border-champagne/20"
      id="compliance-kyc"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map(({ icon: Icon, en, ar }) => (
            <div
              key={en}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-lg border border-champagne/15 bg-panel-charcoal/50"
            >
              <Icon size={20} className="text-gold-base" />
              <span className="text-xs font-mono text-brand-bg/90 uppercase tracking-wider">
                {isAr ? ar : en}
              </span>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-sm text-champagne/90 font-sans leading-relaxed">
            {isAr
              ? "جميع الأسعار المعروضة مراجع سوقية استرشادية. العروض المعتمدة تخضع لحركة السوق والتوفر ومراجعة الامتثال قبل التسوية."
              : "All displayed prices are indicative market references. Firm quotes are subject to market movement, availability, and compliance review before settlement."}
          </p>
          <p className="text-xs text-panel-muted font-mono">
            {isAr
              ? "لا يقدم PGR UAE استشارات استثمارية. المعاملات تخضع لإجراءات KYC/AML."
              : "PGR UAE does not provide investment advice. Transactions are subject to KYC/AML procedures."}
          </p>

          {onOpenLegal && (
            <button
              type="button"
              onClick={() => onOpenLegal("pricing")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-gold-base/50 text-gold-base font-mono text-xs uppercase tracking-widest hover:bg-gold-base/10 transition-colors"
            >
              {isAr ? "اقرأ إخلاء المسؤولية الكامل" : "Read Full Disclaimer"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

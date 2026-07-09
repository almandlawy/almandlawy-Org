/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unified KYC & compliance panel — single luxury dark card on ivory.
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
      className="py-16 md:py-20 px-4 md:px-8 bg-brand-bg border-t border-soft-border"
      id="compliance-kyc"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-champagne bg-panel-dark shadow-premium overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-gold-base/50 to-transparent" />

          <div className="px-6 sm:px-10 py-8 md:py-10 space-y-8">
            <header className="text-center space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold-base font-bold">
                {isAr ? "الامتثال واعرف عميلك" : "Compliance & KYC"}
              </p>
              <h2 className="text-xl sm:text-2xl font-serif text-brand-bg font-medium">
                {isAr ? "إخلاء مسؤولية التسعير والامتثال" : "Pricing & Compliance Notice"}
              </h2>
            </header>

            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-champagne/15 bg-champagne/10">
              {BADGES.map(({ icon: Icon, en, ar }) => (
                <li
                  key={en}
                  className="flex flex-col items-center justify-center gap-2.5 px-4 py-5 bg-panel-charcoal/80 text-center"
                >
                  <div className="h-10 w-10 rounded-full border border-gold-base/35 bg-gold-base/10 flex items-center justify-center text-gold-base">
                    <Icon size={18} aria-hidden />
                  </div>
                  <span className="text-[11px] font-mono text-champagne uppercase tracking-wider leading-snug">
                    {isAr ? ar : en}
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-champagne/15 bg-panel-charcoal/50 px-5 py-5 sm:px-6 sm:py-6 space-y-3 text-center">
              <p className="text-sm text-champagne/95 font-sans leading-relaxed">
                {isAr
                  ? "جميع الأسعار المعروضة مراجع سوقية استرشادية. العروض المعتمدة تخضع لحركة السوق والتوفر ومراجعة الامتثال قبل التسوية."
                  : "All displayed prices are indicative market references. Firm quotes are subject to market movement, availability, and compliance review before settlement."}
              </p>
              <p className="text-xs text-panel-muted font-mono leading-relaxed">
                {isAr
                  ? "لا يقدم PGR UAE استشارات استثمارية. المعاملات تخضع لإجراءات KYC/AML."
                  : "PGR UAE does not provide investment advice. Transactions are subject to KYC/AML procedures."}
              </p>
            </div>

            {onOpenLegal && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenLegal("pricing")}
                  className="w-full sm:w-auto px-6 py-3 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors"
                >
                  {isAr ? "اقرأ إخلاء المسؤولية الكامل" : "Read Full Disclaimer"}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegal("aml")}
                  className="w-full sm:w-auto px-6 py-3 border border-champagne/30 text-champagne hover:border-gold-base hover:text-gold-base font-mono text-xs uppercase tracking-widest rounded transition-colors"
                >
                  {isAr ? "سياسة KYC/AML" : "KYC & AML Policy"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

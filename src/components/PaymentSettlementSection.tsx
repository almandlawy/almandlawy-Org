/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Secure payment & settlement — mockup flow.
 */

import React, { useEffect, useState } from "react";
import { FileText, CheckCircle2, Link2, Upload, ShieldCheck } from "lucide-react";
import { PublicPaymentSettings } from "../types";
import { dbService } from "../lib/supabase";

interface PaymentSettlementSectionProps {
  currentLang: "en" | "ar";
  onOpenQuote: () => void;
}

const FLOW_STEPS = [
  { icon: FileText, en: "Firm Quote", ar: "عرض سعر معتمد" },
  { icon: CheckCircle2, en: "Accept Quote", ar: "قبول العرض" },
  { icon: Link2, en: "Payment Link / Bank Transfer", ar: "رابط دفع / تحويل بنكي" },
  { icon: Upload, en: "Upload Proof", ar: "رفع إثبات الدفع" },
  { icon: ShieldCheck, en: "Verification & Confirmation", ar: "التحقق والتأكيد" }
];

export default function PaymentSettlementSection({ currentLang, onOpenQuote }: PaymentSettlementSectionProps) {
  const isAr = currentLang === "ar";
  const [payment, setPayment] = useState<PublicPaymentSettings | null>(null);

  useEffect(() => {
    dbService.paymentSettings.getPublic().then(setPayment).catch(() => setPayment(null));
  }, []);

  return (
    <section
      className="py-16 md:py-20 px-4 md:px-8 bg-brand-section border-b border-soft-border"
      id="payment-settlement"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold-dark font-bold">
            {isAr ? "التسوية الآمنة" : "Secure Settlement"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "الدفع والتسوية الآمنة" : "Secure Payment & Settlement"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {payment?.public_payment_note ||
              (isAr
                ? "تتم معالجة المدفوعات فقط بعد قبول عرض السعر المعتمد."
                : "Payments are processed only after firm quote acceptance.")}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-2 flex-wrap">
          {FLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === FLOW_STEPS.length - 1;
            return (
              <React.Fragment key={step.en}>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-champagne bg-brand-card shadow-premium min-w-[160px] flex-1 md:flex-none md:max-w-[200px]">
                  <div className="h-9 w-9 rounded-full bg-gold-base/15 border border-gold-base/40 flex items-center justify-center text-gold-dark shrink-0">
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-sans text-text-charcoal font-medium">
                    {isAr ? step.ar : step.en}
                  </span>
                </div>
                {!isLast && (
                  <span className="hidden md:block text-gold-base font-mono text-lg px-1">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {payment?.payment_gateway_enabled && (
          <div className="max-w-xl mx-auto p-5 rounded-xl border border-soft-border bg-brand-card text-center space-y-2">
            <p className="text-xs font-mono text-text-secondary uppercase">
              {isAr ? "وضع الدفع" : "Payment mode"}
            </p>
            <p className="text-sm font-serif text-text-charcoal">{payment.payment_mode}</p>
            {payment.require_kyc_before_payment && (
              <p className="text-[10px] font-mono text-olive-accent">
                {isAr ? "يتطلب إكمال KYC قبل الدفع" : "KYC completion required before payment"}
              </p>
            )}
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={onOpenQuote}
            className="px-8 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded shadow-premium transition-colors"
          >
            {isAr ? "ابدأ بطلب عرض سعر معتمد" : "Start with a Firm Quote Request"}
          </button>
        </div>
      </div>
    </section>
  );
}

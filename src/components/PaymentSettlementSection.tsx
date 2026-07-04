/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { ShieldCheck, FileCheck, Upload, CheckCircle2 } from "lucide-react";
import { PublicPaymentSettings } from "../types";
import { dbService } from "../lib/supabase";

interface PaymentSettlementSectionProps {
  currentLang: "en" | "ar";
  onOpenQuote: () => void;
}

const FLOW_STEPS = [
  { icon: FileCheck, en: "Firm quote first", ar: "عرض سعر معتمد أولاً" },
  { icon: ShieldCheck, en: "Payment link or bank transfer after acceptance", ar: "رابط دفع أو تحويل بنكي بعد القبول" },
  { icon: Upload, en: "Payment proof upload (bank transfer)", ar: "رفع إثبات الدفع (تحويل بنكي)" },
  { icon: CheckCircle2, en: "Admin verification", ar: "تحقق إداري" },
  { icon: CheckCircle2, en: "Ready for collection / delivery", ar: "جاهز للاستلام / التسليم" }
];

const STATUS_LABELS = [
  { en: "Payment Pending", ar: "الدفع قيد الانتظار" },
  { en: "Payment Verified", ar: "تم التحقق من الدفع" },
  { en: "Ready for Collection", ar: "جاهز للاستلام" },
  { en: "Completed", ar: "مكتمل" }
];

export default function PaymentSettlementSection({ currentLang, onOpenQuote }: PaymentSettlementSectionProps) {
  const isAr = currentLang === "ar";
  const [payment, setPayment] = useState<PublicPaymentSettings | null>(null);

  useEffect(() => {
    dbService.paymentSettings.getPublic().then(setPayment).catch(() => setPayment(null));
  }, []);

  return (
    <section className="py-20 px-4 md:px-8 bg-brand-bg border-b border-soft-border" id="payment-settlement">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
            {isAr ? "التسوية الآمنة" : "Secure Settlement"}
          </p>
          <h2 className="text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "بوابة الدفع والتسوية" : "Payment Gateway & Secure Settlement"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {payment?.public_payment_note ||
              (isAr
                ? "لا يمكن الدفع قبل عرض السعر المعتمد. يتم تأكيد التسوية بعد مراجعة الامتثال."
                : "Customers cannot pay before a firm quote. Settlement is confirmed after compliance review.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-gold-dark font-bold">
              {isAr ? "مسار العميل" : "Customer Flow"}
            </h3>
            <ul className="space-y-3">
              {FLOW_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded border border-soft-border bg-brand-card"
                  >
                    <Icon size={16} className="text-olive-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-text-charcoal font-sans">
                      {isAr ? step.ar : step.en}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-6">
            {payment?.payment_gateway_enabled && (
              <div className="p-5 rounded border border-soft-border bg-brand-card space-y-2">
                <p className="text-xs font-mono text-text-secondary uppercase">
                  {isAr ? "وضع الدفع" : "Payment mode"}
                </p>
                <p className="text-sm font-serif text-text-charcoal">{payment.payment_mode}</p>
                {payment.payment_link_instructions && (
                  <p className="text-xs text-text-secondary font-sans leading-relaxed pt-2 border-t border-soft-border">
                    {payment.payment_link_instructions}
                  </p>
                )}
                {payment.require_kyc_before_payment && (
                  <p className="text-[10px] font-mono text-olive-accent pt-2">
                    {isAr ? "يتطلب إكمال KYC قبل الدفع" : "KYC completion required before payment"}
                  </p>
                )}
              </div>
            )}

            <div className="p-5 rounded border border-soft-border bg-brand-card">
              <p className="text-xs font-mono text-text-secondary uppercase mb-3">
                {isAr ? "حالات الدفع" : "Payment Statuses"}
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_LABELS.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded text-[10px] font-mono font-bold border border-soft-border bg-brand-bg text-text-charcoal"
                  >
                    {isAr ? s.ar : s.en}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenQuote}
              className="w-full py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors"
            >
              {isAr ? "ابدأ بطلب عرض سعر معتمد" : "Start with a Firm Quote Request"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

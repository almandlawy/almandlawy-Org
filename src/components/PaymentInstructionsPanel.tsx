/**
 * Payment instructions + bank transfer proof upload — post quote acceptance.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Building2, Copy, CheckCircle, Upload, ExternalLink } from "lucide-react";
import type { PublicPaymentSettings } from "../types";

interface PaymentInstructionsPanelProps {
  currentLang: "en" | "ar";
  order: {
    id: string;
    total_amount?: number | null;
    currency?: string;
    payment_link?: string | null;
    payment_proof_name?: string | null;
    payment_proof_uploaded_at?: string | null;
    status?: string;
    payment_status?: string;
  };
  paymentSettings: PublicPaymentSettings | null;
  proofUploading: boolean;
  onUploadProof: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function CopyField({ label, value, isAr }: { label: string; value: string; isAr: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-soft-border/60 last:border-0">
      <div className="min-w-0">
        <p className="text-[9px] text-text-secondary font-mono uppercase">{label}</p>
        <p className="text-sm text-text-charcoal font-mono break-all">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 p-1.5 rounded border border-soft-border hover:border-gold-base text-gold-dark"
        title={isAr ? "نسخ" : "Copy"}
      >
        {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export default function PaymentInstructionsPanel({
  currentLang,
  order,
  paymentSettings,
  proofUploading,
  onUploadProof,
}: PaymentInstructionsPanelProps) {
  const isAr = currentLang === "ar";
  const bank = paymentSettings?.bank_transfer;
  const amount =
    order.total_amount != null
      ? `${order.currency || "AED"} ${Number(order.total_amount).toLocaleString()}`
      : null;

  return (
    <div
      className="rounded-xl border border-gold-base/35 bg-gradient-to-b from-gold-base/8 to-brand-card p-5 space-y-4"
      id="payment-instructions"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gold-base/15 border border-gold-base/30 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-gold-dark" />
        </div>
        <div>
          <h3 className={`text-base font-serif font-bold text-text-charcoal ${isAr ? "font-arabic" : ""}`}>
            {isAr ? "تعليمات الدفع — تحويل بنكي" : "Payment Instructions — Bank Transfer"}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
            {paymentSettings?.payment_link_instructions ||
              (isAr
                ? "حوّل المبلغ ثم ارفع إثبات الدفع."
                : "Transfer the amount, then upload your payment proof.")}
          </p>
        </div>
      </div>

      {amount && (
        <div className="rounded-lg bg-brand-bg border border-soft-border px-4 py-3 flex justify-between items-center">
          <span className={`text-[10px] text-text-secondary ${isAr ? "font-arabic" : "font-mono uppercase"}`}>
            {isAr ? "المبلغ المطلوب" : "Amount due"}
          </span>
          <span className="text-lg font-serif font-bold text-gold-dark">{amount}</span>
        </div>
      )}

      <div className="rounded-lg bg-brand-bg border border-soft-border px-4 py-2">
        <p className="text-[9px] text-text-secondary font-mono mb-1">
          {isAr ? "مرجع التحويل" : "Transfer reference"}
        </p>
        <p className="text-sm font-mono font-bold text-text-charcoal">{order.id}</p>
        {bank?.reference_hint && (
          <p className={`text-[10px] text-text-secondary mt-1 ${isAr ? "font-arabic" : ""}`}>
            {bank.reference_hint}
          </p>
        )}
      </div>

      {bank && (
        <div className="rounded-lg bg-brand-card border border-soft-border px-4 py-2 space-y-0">
          <CopyField label={isAr ? "المستفيد" : "Beneficiary"} value={bank.beneficiary_name} isAr={isAr} />
          <CopyField label={isAr ? "البنك" : "Bank"} value={bank.bank_name} isAr={isAr} />
          <CopyField label="IBAN" value={bank.iban} isAr={isAr} />
          <CopyField label="SWIFT" value={bank.swift_code} isAr={isAr} />
          {bank.additional_notes && (
            <p className={`text-[10px] text-text-secondary pt-2 ${isAr ? "font-arabic" : ""}`}>
              {bank.additional_notes}
            </p>
          )}
        </div>
      )}

      {order.payment_link && (
        <a
          href={order.payment_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-panel-dark text-brand-bg rounded-lg text-[10px] font-mono font-bold uppercase"
        >
          <ExternalLink size={14} />
          {isAr ? "رابط الدفع الآمن" : "Secure payment link"}
        </a>
      )}

      <label className="block w-full py-3 bg-brand-bg border-2 border-dashed border-gold-base/50 rounded-lg text-center cursor-pointer hover:bg-gold-base/5 transition-colors">
        <span className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold text-gold-dark">
          <Upload size={14} />
          {proofUploading
            ? isAr
              ? "جاري الرفع…"
              : "Uploading…"
            : order.payment_proof_name
              ? isAr
                ? `تم الرفع: ${order.payment_proof_name} — إعادة الرفع`
                : `Uploaded: ${order.payment_proof_name} — re-upload`
              : isAr
                ? "رفع إثبات التحويل (PDF أو صورة)"
                : "Upload transfer proof (PDF or image)"}
        </span>
        <input
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={proofUploading}
          onChange={onUploadProof}
        />
      </label>

      {order.payment_proof_uploaded_at && (
        <p className={`text-[10px] text-olive-accent text-center ${isAr ? "font-arabic" : "font-mono"}`}>
          {isAr ? "تم استلام إثبات الدفع — المكتب يراجع خلال ساعات العمل." : "Proof received — desk will verify during business hours."}
        </p>
      )}

      {paymentSettings?.public_payment_note && (
        <p className={`text-[10px] text-text-secondary leading-relaxed ${isAr ? "font-arabic" : ""}`}>
          {paymentSettings.public_payment_note}
        </p>
      )}
    </div>
  );
}

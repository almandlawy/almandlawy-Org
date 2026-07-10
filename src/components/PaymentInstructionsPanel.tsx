/**
 * Payment instructions — bank transfer, Zain Cash, SuperQi, USDT + proof upload.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Building2, Copy, CheckCircle, Upload, ExternalLink, Smartphone, Coins } from "lucide-react";
import type { PublicPaymentSettings } from "../types";
import {
  DEFAULT_DESK_PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethodId,
} from "../lib/deskPaymentMethods";

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
  const desk = paymentSettings?.desk_payment_methods || DEFAULT_DESK_PAYMENT_METHODS;
  const bank = paymentSettings?.bank_transfer;

  const enabledMethods = React.useMemo(() => {
    const list: PaymentMethodId[] = [];
    if (desk.bank_transfer?.enabled !== false) list.push("bank");
    if (desk.zain_cash?.enabled) list.push("zain_cash");
    if (desk.superqi?.enabled) list.push("superqi");
    if (desk.usdt?.enabled) list.push("usdt");
    return list.length ? list : (["bank"] as PaymentMethodId[]);
  }, [desk]);

  const [activeMethod, setActiveMethod] = React.useState<PaymentMethodId>("bank");
  React.useEffect(() => {
    if (!enabledMethods.includes(activeMethod)) {
      setActiveMethod(enabledMethods[0]);
    }
  }, [enabledMethods, activeMethod]);

  const amount =
    order.total_amount != null
      ? `${order.currency || "AED"} ${Number(order.total_amount).toLocaleString()}`
      : null;

  const methodIntro = isAr
    ? "طرق الدفع المتاحة: تحويل بنكي · زين كاش · سوبر كي · USDT"
    : "Available: Bank transfer · Zain Cash · SuperQi · USDT";

  return (
    <div
      className="rounded-xl border border-gold-base/35 bg-gradient-to-b from-gold-base/8 to-brand-card p-5 space-y-4"
      id="payment-instructions"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gold-base/15 border border-gold-base/30 flex items-center justify-center shrink-0">
          <Coins size={18} className="text-gold-dark" />
        </div>
        <div>
          <h3 className={`text-base font-serif font-bold text-text-charcoal ${isAr ? "font-arabic" : ""}`}>
            {isAr ? "تعليمات الدفع" : "Payment instructions"}
          </h3>
          <p className={`text-[11px] text-gold-dark font-bold mt-1 ${isAr ? "font-arabic" : "font-mono"}`}>
            {methodIntro}
          </p>
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
            {paymentSettings?.payment_link_instructions ||
              (isAr
                ? "اختر طريقة الدفع، أرسل المبلغ، ثم ارفع إثبات الدفع."
                : "Choose a method, send the amount, then upload proof.")}
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
          {isAr ? "مرجع الطلب / التحويل" : "Order / transfer reference"}
        </p>
        <p className="text-sm font-mono font-bold text-text-charcoal">{order.id}</p>
        {bank?.reference_hint && activeMethod === "bank" && (
          <p className={`text-[10px] text-text-secondary mt-1 ${isAr ? "font-arabic" : ""}`}>
            {bank.reference_hint}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {enabledMethods.map((id) => {
          const label = PAYMENT_METHOD_LABELS[id];
          const active = activeMethod === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveMethod(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                active
                  ? "bg-gold-base text-text-charcoal border-gold-base"
                  : "bg-brand-bg text-text-secondary border-soft-border hover:border-gold-base/50"
              }`}
            >
              <span>{label.icon}</span>
              <span className={isAr ? "font-arabic" : ""}>{isAr ? label.ar : label.en}</span>
            </button>
          );
        })}
      </div>

      {activeMethod === "bank" && bank && (
        <div className="rounded-lg bg-brand-card border border-soft-border px-4 py-2 space-y-0">
          <div className="flex items-center gap-2 pb-2 mb-1 border-b border-soft-border/60">
            <Building2 size={14} className="text-gold-dark" />
            <span className={`text-[10px] font-mono font-bold text-text-charcoal ${isAr ? "font-arabic" : ""}`}>
              {isAr ? "تحويل بنكي (AED / USD)" : "Bank transfer (AED / USD)"}
            </span>
          </div>
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

      {activeMethod === "zain_cash" && desk.zain_cash && (
        <div className="rounded-lg bg-brand-card border border-soft-border px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-gold-dark" />
            <span className={`text-[10px] font-mono font-bold text-text-charcoal ${isAr ? "font-arabic" : ""}`}>
              {isAr ? desk.zain_cash.wallet_label_ar : desk.zain_cash.wallet_label_en}
            </span>
          </div>
          <CopyField
            label={isAr ? "رقم المحفظة" : "Wallet number"}
            value={desk.zain_cash.wallet_id}
            isAr={isAr}
          />
          <p className={`text-[10px] text-text-secondary leading-relaxed ${isAr ? "font-arabic" : ""}`}>
            {isAr ? desk.zain_cash.instructions_ar : desk.zain_cash.instructions_en}
          </p>
        </div>
      )}

      {activeMethod === "superqi" && desk.superqi && (
        <div className="rounded-lg bg-brand-card border border-soft-border px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-gold-dark" />
            <span className={`text-[10px] font-mono font-bold text-text-charcoal ${isAr ? "font-arabic" : ""}`}>
              {isAr ? desk.superqi.wallet_label_ar : desk.superqi.wallet_label_en}
            </span>
          </div>
          <CopyField
            label={isAr ? "رقم المحفظة / الحساب" : "Wallet / account ID"}
            value={desk.superqi.wallet_id}
            isAr={isAr}
          />
          <p className={`text-[10px] text-text-secondary leading-relaxed ${isAr ? "font-arabic" : ""}`}>
            {isAr ? desk.superqi.instructions_ar : desk.superqi.instructions_en}
          </p>
        </div>
      )}

      {activeMethod === "usdt" && desk.usdt && (
        <div className="rounded-lg bg-brand-card border border-soft-border px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Coins size={14} className="text-gold-dark" />
            <span className={`text-[10px] font-mono font-bold text-text-charcoal ${isAr ? "font-arabic" : ""}`}>
              {isAr ? desk.usdt.wallet_label_ar : desk.usdt.wallet_label_en}
            </span>
            {desk.usdt.network && (
              <span className="text-[9px] font-mono bg-brand-bg border border-soft-border px-2 py-0.5 rounded">
                {desk.usdt.network}
              </span>
            )}
          </div>
          <CopyField
            label={isAr ? "عنوان المحفظة" : "Wallet address"}
            value={desk.usdt.wallet_id}
            isAr={isAr}
          />
          <p className={`text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
            {isAr ? desk.usdt.instructions_ar : desk.usdt.instructions_en}
          </p>
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
        <span className={`flex items-center justify-center gap-2 text-[10px] font-mono font-bold text-gold-dark ${isAr ? "font-arabic" : ""}`}>
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
                ? "رفع إثبات الدفع (PDF أو صورة)"
                : "Upload payment proof (PDF or image)"}
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

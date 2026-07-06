/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Iraq-focused quote request page — Google Ads landing form.
 */

import React, { useState } from "react";
import {
  Phone,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileText,
  MessageCircle
} from "lucide-react";
import PricingDisclaimer from "./PricingDisclaimer";
import { trackGoogleAdsContactConversion } from "../lib/gtag";

const WHATSAPP = "https://wa.me/971559688837";

const PRODUCT_OPTIONS = [
  { value: "gold-bars", en: "Gold bars", ar: "سبائك ذهب" },
  { value: "silver-bars", en: "Silver bars", ar: "سبائك فضة" },
  { value: "bullion-coins", en: "Bullion coins", ar: "عملات سبائك" },
  { value: "custom-inquiry", en: "Custom inquiry", ar: "استفسار مخصص" }
] as const;

const CONTACT_OPTIONS = [
  { value: "whatsapp", en: "WhatsApp", ar: "واتساب" },
  { value: "phone", en: "Phone call", ar: "مكالمة هاتفية" },
  { value: "email", en: "Email", ar: "بريد إلكتروني" }
] as const;

interface RequestQuotePageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

function WhatsAppCta({ isAr, variant = "card" }: { isAr: boolean; variant?: "card" | "inline" }) {
  const waText = isAr
    ? "مرحباً، أريد طلب عرض سعر مؤكد لسبائك الذهب أو الفضة من PGR UAE."
    : "Hello, I would like to request a desk-confirmed bullion quote from PGR UAE.";
  const href = `${WHATSAPP}?text=${encodeURIComponent(waText)}`;

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-champagne/40 bg-panel-dark hover:bg-panel-charcoal text-brand-bg font-mono text-xs font-bold uppercase tracking-widest transition-colors w-full sm:w-auto"
      >
        <Phone size={14} />
        {isAr ? "تفضّل واتساب؟ تواصل مع مكتب PGR UAE" : "Prefer WhatsApp? Contact PGR UAE quote desk"}
      </a>
    );
  }

  return (
    <div className="rounded-lg border border-soft-border bg-brand-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <MessageCircle size={18} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-charcoal">
            {isAr ? "تفضّل واتساب؟ تواصل مع مكتب PGR UAE" : "Prefer WhatsApp? Contact PGR UAE quote desk"}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {isAr ? "رد سريع من مكتب التسعير في دبي" : "Fast response from the Dubai quote desk"}
          </p>
        </div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-panel-dark hover:bg-panel-charcoal text-brand-bg font-mono text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
      >
        <Phone size={14} />
        WhatsApp
      </a>
    </div>
  );
}

export default function RequestQuotePage({ currentLang, onNavigate }: RequestQuotePageProps) {
  const isAr = currentLang === "ar";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCity, setCountryCity] = useState("");
  const [productInterest, setProductInterest] = useState<string>("gold-bars");
  const [quantityBudget, setQuantityBudget] = useState("");
  const [preferredContact, setPreferredContact] = useState("whatsapp");
  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2.5 text-sm text-text-charcoal placeholder:text-text-secondary/60 outline-none transition-colors font-sans";
  const labelClass =
    "text-[10px] font-mono uppercase tracking-wider text-text-secondary font-bold block mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !countryCity.trim() || !quantityBudget.trim()) {
      setError(
        isAr
          ? "يرجى تعبئة الاسم ورقم واتساب والبلد/المدينة والكمية أو الميزانية."
          : "Please fill in name, WhatsApp phone, country/city, and quantity or budget."
      );
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      countryCity: countryCity.trim(),
      productInterest,
      quantityBudget: quantityBudget.trim(),
      preferredContact,
      message: message.trim(),
      source: "website_request_quote_page",
      sourceLanguage: currentLang
    };

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setInquiryId(data.inquiryId || "");
        setSubmitted(true);
        trackGoogleAdsContactConversion();
      } else {
        const technical =
          data.details || data.error || `HTTP ${response.status}`;
        console.error("[RequestQuotePage] Submission failed:", {
          status: response.status,
          technical,
          payload: { ...payload, phone: "[redacted]" }
        });
        throw new Error(technical);
      }
    } catch (err: unknown) {
      const technical = err instanceof Error ? err.message : "Unknown error";
      console.error("[RequestQuotePage] Quote submit error:", technical, err);
      setError(
        isAr
          ? "تعذر إرسال طلبك حالياً. يرجى التواصل مع PGR UAE عبر واتساب: +971559688837"
          : "We could not submit your request right now. Please contact PGR UAE on WhatsApp: +971559688837"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <button
        type="button"
        onClick={() => onNavigate("/")}
        className="flex items-center gap-2 text-text-secondary hover:text-text-charcoal transition-colors text-xs font-mono uppercase tracking-wider"
      >
        {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
        {isAr ? "العودة للرئيسية" : "Back to home"}
      </button>

      <header className="space-y-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
          {isAr ? "العراق · دبي" : "Iraq · Dubai"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-text-charcoal font-medium leading-tight">
          {isAr ? "طلب عرض سعر مؤكد للسبائك" : "Request a Firm Bullion Quote"}
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          {isAr
            ? "أرسل تفاصيل طلبك وسيراجع مكتب PGR UAE التوفر ويتواصل معك على واتساب بعرض سعر مؤكد بعد مراجعة الامتثال."
            : "Send your request details. PGR UAE will review availability and contact you on WhatsApp with a desk-confirmed quote after compliance review."}
        </p>
        <PricingDisclaimer currentLang={currentLang} />
      </header>

      <WhatsAppCta isAr={isAr} />

      {submitted ? (
        <div className="rounded-xl border border-gold-base/30 bg-brand-card p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif text-text-charcoal font-medium">
              {isAr ? "تم استلام طلبك" : "Request received"}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              {isAr
                ? "تم استلام طلبك. سيراجع PGR UAE التوفر ويتواصل معك على واتساب."
                : "Your request has been received. PGR UAE will review availability and contact you on WhatsApp."}
            </p>
            {inquiryId && (
              <p className="text-[10px] font-mono text-gold-dark font-bold">
                REF: {inquiryId}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate("/")}
              className="px-6 py-3 rounded-lg border border-soft-border bg-brand-bg text-text-charcoal text-xs font-mono font-bold uppercase tracking-widest hover:bg-brand-card transition-colors"
            >
              {isAr ? "العودة للرئيسية" : "Back to home"}
            </button>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-panel-dark hover:bg-panel-charcoal text-brand-bg text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <Phone size={14} />
              WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-soft-border bg-brand-card p-5 sm:p-8 space-y-5 shadow-sm"
        >
          {error && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm space-y-3">
              <p>{error}</p>
              <WhatsAppCta isAr={isAr} variant="inline" />
            </div>
          )}

          <div className="space-y-1">
            <label className={labelClass}>{isAr ? "الاسم الكامل *" : "Full name *"}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isAr ? "الاسم كما في الهوية" : "Name as on ID"}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{isAr ? "رقم واتساب *" : "WhatsApp phone *"}</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+964 7xx xxx xxxx"
              className={inputClass}
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{isAr ? "البلد / المدينة *" : "Country / city *"}</label>
            <input
              type="text"
              required
              value={countryCity}
              onChange={(e) => setCountryCity(e.target.value)}
              placeholder={isAr ? "مثال: بغداد، العراق" : "e.g. Baghdad, Iraq"}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{isAr ? "المنتج المطلوب *" : "Product interest *"}</label>
            <select
              value={productInterest}
              onChange={(e) => setProductInterest(e.target.value)}
              className={inputClass}
            >
              {PRODUCT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isAr ? opt.ar : opt.en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              {isAr ? "الكمية أو الميزانية *" : "Quantity or budget *"}
            </label>
            <input
              type="text"
              required
              value={quantityBudget}
              onChange={(e) => setQuantityBudget(e.target.value)}
              placeholder={isAr ? "مثال: 100 غرام، 1 كيلو، 5000 دولار" : "e.g. 100g, 1 kilo, $5,000"}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              {isAr ? "طريقة التواصل المفضلة" : "Preferred contact method"}
            </label>
            <select
              value={preferredContact}
              onChange={(e) => setPreferredContact(e.target.value)}
              className={inputClass}
            >
              {CONTACT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isAr ? opt.ar : opt.en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{isAr ? "رسالة (اختياري)" : "Message (optional)"}</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isAr
                  ? "مثال: سبيكة SAM 500 جرام أو PALM 1 كيلو للعراق"
                  : "e.g. SAM 500g or PALM 1kg silver for Iraq delivery"
              }
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gold-base hover:bg-gold-dark disabled:opacity-60 text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-text-charcoal/30 border-t-text-charcoal rounded-full animate-spin" />
            ) : (
              <>
                <FileText size={14} />
                {isAr ? "إرسال طلب عرض السعر" : "Submit quote request"}
              </>
            )}
          </button>
        </form>
      )}

      {!submitted && <WhatsAppCta isAr={isAr} />}
    </div>
  );
}

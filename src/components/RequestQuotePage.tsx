/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Iraq-focused quote request page — Google Ads landing form.
 */

import React, { useEffect, useState } from "react";
import {
  Phone,
  ArrowLeft,
  ArrowRight,
  FileText,
  MessageCircle
} from "lucide-react";
import PricingDisclaimer from "./PricingDisclaimer";
import ClientAccountStepper from "./ClientAccountStepper";
import { trackWhatsAppClick } from "../lib/gtag";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { QUOTE_PRODUCT_OPTIONS, submitQuoteRequest } from "../lib/quoteSubmit";
import { getCurrentUser, type AppUser } from "../lib/clientAuth";
import { canRequestQuote } from "../lib/kycGate";
import { dbService } from "../lib/supabase";

const PRODUCT_OPTIONS = QUOTE_PRODUCT_OPTIONS;

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
  const href = buildWhatsAppLink(waText);

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick("request_quote_inline")}
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
        onClick={() => trackWhatsAppClick("request_quote_card")}
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
  const [productInterest, setProductInterest] = useState<string>("pgr-silver-500g");
  const [quantityBudget, setQuantityBudget] = useState("");
  const [preferredContact, setPreferredContact] = useState("whatsapp");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [accountUser, setAccountUser] = useState<AppUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getCurrentUser();
      if (cancelled) return;
      if (!user) {
        const next = encodeURIComponent(
          `/request-quote${window.location.search || ""}`
        );
        onNavigate(`/login?next=${next}`);
        return;
      }
      const kyc = await dbService.kyc.get(user.id);
      if (!canRequestQuote(kyc?.status)) {
        onNavigate(`/kyc?next=${encodeURIComponent(`/request-quote${window.location.search || ""}`)}`);
        return;
      }
      setAccountUser(user);
      setFullName((prev) => prev || user.name);
      setPhone((prev) => prev || user.phone || "");
      setAuthChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [onNavigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product");
    const name = params.get("name");

    if (product && PRODUCT_OPTIONS.some((opt) => opt.value === product)) {
      setProductInterest(product);
    }

    if (name) {
      setMessage(
        isAr ? `أريد عرض سعر لـ ${name}` : `I would like a quote for ${name}`
      );
    }
  }, [isAr]);

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

    const result = await submitQuoteRequest({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: accountUser?.email,
      countryCity: countryCity.trim(),
      productInterest,
      quantityBudget: quantityBudget.trim(),
      preferredContact,
      message: message.trim(),
      source: "website_request_quote_page",
      sourceLanguage: currentLang,
      customerId: accountUser?.id,
    });

    if (result.success && accountUser && result.inquiryId) {
      await dbService.quoteRequests.saveWebsiteQuoteLocal({
        id: result.inquiryId,
        customer_id: accountUser.id,
        email: accountUser.email,
        name: fullName.trim(),
        phone: phone.trim(),
        product_category: productInterest,
        weight_preference: quantityBudget.trim(),
        status: "Desk Review",
        created_at: new Date().toISOString(),
      });
    }

    try {
      if (result.success) {
        const ref = result.inquiryId || "";
        onNavigate(`/quote-received${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`);
      } else {
        console.error("[RequestQuotePage] Submission failed:", result.error);
        throw new Error(result.error);
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

  if (authChecking) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-text-secondary text-sm">
        {isAr ? "جاري التحقق من حسابك وملف KYC…" : "Verifying your account and KYC profile…"}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <ClientAccountStepper currentLang={currentLang} activeStep="quote" kycComplete />
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

      <WhatsAppCta isAr={isAr} />
    </div>
  );
}

/**
 * Compact inline quote form for Iraq ads landing page.
 */

import React, { useState } from "react";
import { FileText } from "lucide-react";
import { QUOTE_PRODUCT_OPTIONS, submitQuoteRequest } from "../lib/quoteSubmit";
import { trackQuoteFormStart } from "../lib/gtag";

interface IraqInlineQuoteFormProps {
  currentLang: "en" | "ar";
  onSuccess: (inquiryId?: string) => void;
}

export default function IraqInlineQuoteForm({
  currentLang,
  onSuccess,
}: IraqInlineQuoteFormProps) {
  const isAr = currentLang === "ar";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [productInterest, setProductInterest] = useState("pgr-silver-500g");
  const [quantityBudget, setQuantityBudget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2.5 text-sm text-text-charcoal placeholder:text-text-secondary/60 outline-none transition-colors font-sans";
  const labelClass =
    "text-[10px] font-mono uppercase tracking-wider text-text-secondary font-bold block mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !quantityBudget.trim()) {
      setError(
        isAr
          ? "يرجى تعبئة الاسم ورقم واتساب والكمية أو الميزانية."
          : "Please fill in name, WhatsApp phone, and quantity or budget."
      );
      return;
    }

    setLoading(true);
    setError("");
    trackQuoteFormStart("iraq_bullion_inline_form");

    const result = await submitQuoteRequest({
      fullName: fullName.trim(),
      phone: phone.trim(),
      countryCity: isAr ? "العراق" : "Iraq",
      productInterest,
      quantityBudget: quantityBudget.trim(),
      preferredContact: "whatsapp",
      source: "website_iraq_bullion_landing",
      sourceLanguage: currentLang,
    });

    setLoading(false);

    if (result.success) {
      onSuccess(result.inquiryId);
      return;
    }

    setError(
      isAr
        ? "تعذر إرسال طلبك حالياً. يرجى التواصل مع PGR UAE عبر واتساب: +971559688837"
        : "We could not submit your request right now. Please contact PGR UAE on WhatsApp: +971559688837"
    );
  };

  return (
    <section
      id="iraq-quote-form"
      className="rounded-xl border border-soft-border bg-brand-card p-5 sm:p-8 space-y-5 shadow-sm"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <header className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-olive-accent font-bold">
          {isAr ? "نموذج سريع" : "Quick quote form"}
        </p>
        <h2 className="text-xl font-serif text-text-charcoal font-medium">
          {isAr ? "اطلب عرض سعر الآن" : "Request your quote now"}
        </h2>
        <p className="text-sm text-text-secondary">
          {isAr
            ? "أرسل بياناتك وسيتواصل مكتب PGR UAE معك على واتساب بعرض سعر مؤكد."
            : "Send your details and the PGR UAE desk will contact you on WhatsApp with a confirmed quote."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>{isAr ? "المنتج المطلوب *" : "Product interest *"}</label>
            <select
              value={productInterest}
              onChange={(e) => setProductInterest(e.target.value)}
              className={inputClass}
            >
              {QUOTE_PRODUCT_OPTIONS.map((opt) => (
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
              placeholder={isAr ? "مثال: 500 غرام فضة" : "e.g. 500g silver"}
              className={inputClass}
            />
          </div>
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
    </section>
  );
}

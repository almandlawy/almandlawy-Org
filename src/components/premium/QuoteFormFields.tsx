/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { dbService } from "../../lib/supabase";

const WHATSAPP = "+971559688837";
const WHATSAPP_LINK = "https://wa.me/971559688837";

export interface QuoteFormFieldsProps {
  currentLang: "en" | "ar";
  prefilledProduct?: string;
  embedded?: boolean;
  onSuccess?: () => void;
}

export default function QuoteFormFields({
  currentLang,
  prefilledProduct,
  embedded = false,
  onSuccess,
}: QuoteFormFieldsProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clientType: "" as "" | "individual" | "company",
    company: "",
    productInterest: "",
    metalInterest: "gold" as "gold" | "silver" | "both" | "platinum" | "palladium",
    weightPreference: "",
    preferredCurrency: "" as "" | "USD" | "AED" | "EUR" | "GBP" | "SAR",
    deliveryInterest: "" as "" | "delivery" | "collection" | "storage" | "undecided",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState<{ inquiryId: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const sObj = await dbService.settings.get();
        if (sObj) setSettings(sObj);
      } catch (err) {
        console.error("Failed to load settings in QuoteFormFields:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (prefilledProduct) {
      setFormData((prev) => ({
        ...prev,
        productInterest: prefilledProduct,
        message:
          currentLang === "ar"
            ? `أود طلب عرض سعر مؤكد بخصوص: ${prefilledProduct}`
            : `I would like to request a firm quote regarding: ${prefilledProduct}`,
      }));
    }
  }, [prefilledProduct, currentLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required = [
      formData.name,
      formData.email,
      formData.phone,
      formData.clientType,
      formData.productInterest,
      formData.metalInterest,
      formData.weightPreference,
      formData.preferredCurrency,
      formData.deliveryInterest,
      formData.message,
    ];

    if (required.some((v) => !v)) {
      setErrorMessage(
        currentLang === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields."
      );
      return;
    }

    if (formData.clientType === "company" && !formData.company.trim()) {
      setErrorMessage(
        currentLang === "ar" ? "يرجى إدخال اسم الشركة." : "Please enter your company name."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productCategory: formData.productInterest,
          sourceLanguage: currentLang,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessResponse({
          inquiryId: data.inquiryId,
          message: data.message,
        });
        onSuccess?.();
      } else {
        const fallback =
          currentLang === "ar"
            ? `تعذر إرسال طلبك حالياً. يرجى التواصل مع PGR UAE عبر واتساب: ${WHATSAPP}`
            : `We could not submit your request right now. Please contact PGR UAE on WhatsApp: ${WHATSAPP}`;
        throw new Error(data.error || fallback);
      }
    } catch (err: any) {
      const fallback =
        currentLang === "ar"
          ? `تعذر إرسال طلبك حالياً. يرجى التواصل مع PGR UAE عبر واتساب: ${WHATSAPP}`
          : `We could not submit your request right now. Please contact PGR UAE on WhatsApp: ${WHATSAPP}`;
      setErrorMessage(err.message || fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none transition-colors";

  const labelClass = "text-gray-400 font-mono uppercase tracking-wider block";

  const content = successResponse ? (
    <div className="text-center py-8 space-y-6">
      <div className="h-16 w-16 bg-gold-dark/15 border border-gold-base/30 rounded-full flex items-center justify-center mx-auto text-gold-base animate-bounce">
        <CheckCircle size={32} />
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-serif text-white tracking-wide">
          {currentLang === "ar" ? "تم استلام طلبك" : "Request Received"}
        </h3>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#070707] text-xs font-mono text-gold-base border border-gold-base/20">
          <span>REF ID:</span>
          <strong className="font-bold">{successResponse.inquiryId}</strong>
        </div>
        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">{successResponse.message}</p>
      </div>

      <div className="p-4 rounded bg-[#070707] border border-white/[0.02] text-[11px] font-mono text-gray-500 max-w-sm mx-auto space-y-1">
        <div>PGR UAE Bullion Quote Desk</div>
        <div>Dubai Marina, UAE</div>
        <div>{settings?.desk_email || "desk@pgruae.com"}</div>
      </div>

      {onSuccess ? (
        <button
          type="button"
          onClick={onSuccess}
          className="px-6 py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm cursor-pointer"
        >
          {currentLang === "ar" ? "إغلاق" : "Close"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setSuccessResponse(null)}
          className="px-6 py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm cursor-pointer"
        >
          {currentLang === "ar" ? "إرسال طلب آخر" : "Submit Another Request"}
        </button>
      )}
    </div>
  ) : (
    <div className="space-y-6">
      {!embedded && (
        <div className="space-y-2">
          <span className="text-xs font-mono text-gold-base uppercase tracking-widest block">
            {currentLang === "ar" ? "مكتب عروض السبائك والمعادن الثمينة" : "Physical Bullion Quote & Purchase Desk"}
          </span>
          <h2 className="text-2xl font-serif text-white tracking-tight font-medium">
            {currentLang === "ar" ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}
          </h2>
          <p className="text-xs text-gray-400">
            {currentLang === "ar"
              ? "يرجى إدخال تفاصيل استفسارك لمراجعة مكتب PGR UAE وإصدار عرض سعر مؤكد بعد التحقق من الامتثال."
              : "Submit your physical bullion inquiry. PGR UAE will review your request and may contact you for KYC/AML before issuing a firm quote."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>{currentLang === "ar" ? "الاسم الكامل *" : "Full Name *"}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{currentLang === "ar" ? "البريد الإلكتروني *" : "Email Address *"}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>
              {currentLang === "ar" ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
            </label>
            <input
              type="tel"
              required
              placeholder="+971 50 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`${inputClass} text-left`}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              {currentLang === "ar" ? "فرد / شركة *" : "Individual / Company *"}
            </label>
            <select
              required
              value={formData.clientType}
              onChange={(e) => setFormData({ ...formData, clientType: e.target.value as "" | "individual" | "company" })}
              className={inputClass}
            >
              <option value="">{currentLang === "ar" ? "اختر..." : "Select..."}</option>
              <option value="individual">{currentLang === "ar" ? "فرد" : "Individual"}</option>
              <option value="company">{currentLang === "ar" ? "شركة" : "Company"}</option>
            </select>
          </div>
        </div>

        {formData.clientType === "company" && (
          <div className="space-y-1">
            <label className={labelClass}>{currentLang === "ar" ? "اسم الشركة *" : "Company Name *"}</label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={inputClass}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>
              {currentLang === "ar" ? "المنتج المطلوب *" : "Product Interest *"}
            </label>
            <input
              type="text"
              required
              placeholder={
                currentLang === "ar" ? "مثال: سبيكة ذهب 100 غرام PAMP" : "e.g., 100g PAMP Gold Bar"
              }
              value={formData.productInterest}
              onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{currentLang === "ar" ? "المعدن *" : "Metal *"}</label>
            <select
              required
              value={formData.metalInterest}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metalInterest: e.target.value as "gold" | "silver" | "both" | "platinum" | "palladium",
                })
              }
              className={inputClass}
            >
              <option value="gold">{currentLang === "ar" ? "ذهب" : "Gold"}</option>
              <option value="silver">{currentLang === "ar" ? "فضة" : "Silver"}</option>
              <option value="both">{currentLang === "ar" ? "ذهب وفضة" : "Gold & Silver"}</option>
              <option value="platinum">{currentLang === "ar" ? "بلاتين" : "Platinum"}</option>
              <option value="palladium">{currentLang === "ar" ? "بلاديوم" : "Palladium"}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>
              {currentLang === "ar" ? "الوزن / الكمية *" : "Weight / Quantity *"}
            </label>
            <input
              type="text"
              required
              placeholder={currentLang === "ar" ? "مثال: 5 × 100 غرام" : "e.g., 5 x 100g, 10kg"}
              value={formData.weightPreference}
              onChange={(e) => setFormData({ ...formData, weightPreference: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              {currentLang === "ar" ? "العملة المفضلة *" : "Preferred Currency *"}
            </label>
            <select
              required
              value={formData.preferredCurrency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferredCurrency: e.target.value as "" | "USD" | "AED" | "EUR" | "GBP" | "SAR",
                })
              }
              className={inputClass}
            >
              <option value="">{currentLang === "ar" ? "اختر..." : "Select..."}</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SAR">SAR</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>
            {currentLang === "ar"
              ? "التسليم / الاستلام / التخزين *"
              : "Delivery / Collection / Storage Interest *"}
          </label>
          <select
            required
            value={formData.deliveryInterest}
            onChange={(e) =>
              setFormData({
                ...formData,
                deliveryInterest: e.target.value as "" | "delivery" | "collection" | "storage" | "undecided",
              })
            }
            className={inputClass}
          >
            <option value="">{currentLang === "ar" ? "اختر..." : "Select..."}</option>
            <option value="delivery">{currentLang === "ar" ? "توصيل" : "Delivery"}</option>
            <option value="collection">{currentLang === "ar" ? "استلام من المكتب" : "Office Collection"}</option>
            <option value="storage">
              {currentLang === "ar" ? "طلب تخزين مخصص" : "Allocated Storage Request"}
            </option>
            <option value="undecided">{currentLang === "ar" ? "غير محدد بعد" : "Undecided"}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>{currentLang === "ar" ? "الرسالة *" : "Message *"}</label>
          <textarea
            rows={3}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="space-y-2.5 p-3.5 bg-black/40 border border-white/[0.03] rounded-sm font-sans text-[10.5px] leading-tight text-gray-400">
          <span className="text-[10px] font-mono uppercase text-[#c5a85c] tracking-wider block mb-1">
            {currentLang === "ar" ? "موافقة وإقرار الامتثال واللوائح" : "Mandatory Compliance Declarations"}
          </span>

          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              required
              className="mt-0.5 accent-[#c5a85c] h-3.5 w-3.5 rounded-sm bg-black border-white/20 shrink-0"
            />
            <span>
              {currentLang === "ar" ? "أقبل بشروط وأحكام الخدمة لـ PGR UAE." : "I accept the Terms of Service."}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              required
              className="mt-0.5 accent-[#c5a85c] h-3.5 w-3.5 rounded-sm bg-black border-white/20 shrink-0"
            />
            <span>
              {currentLang === "ar" ? "أقبل بسياسة الخصوصية لـ PGR UAE." : "I accept the Privacy Policy."}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              required
              className="mt-0.5 accent-[#c5a85c] h-3.5 w-3.5 rounded-sm bg-black border-white/20 shrink-0"
            />
            <span>
              {currentLang === "ar"
                ? "أوافق على معالجة البيانات وإجراءات التحقق والامتثال (KYC/AML)."
                : "I consent to KYC/AML processing."}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              required
              className="mt-0.5 accent-[#c5a85c] h-3.5 w-3.5 rounded-sm bg-black border-white/20 shrink-0"
            />
            <span>
              {currentLang === "ar"
                ? "أفهم أن الأسعار المعروضة إرشادية وتأشيرية فقط حتى تصدر PGR UAE عرض سعر مؤكد نهائي."
                : "I understand prices are indicative until PGR UAE issues a firm quote."}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              required
              className="mt-0.5 accent-[#c5a85c] h-3.5 w-3.5 rounded-sm bg-black border-white/20 shrink-0"
            />
            <span>
              {currentLang === "ar"
                ? "أفهم أن PGR UAE لا تقدم أي استشارات مالية أو ضريبية أو قانونية."
                : "I understand PGR UAE does not provide financial, investment, tax, or legal advice."}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              required
              className="mt-0.5 accent-[#c5a85c] h-3.5 w-3.5 rounded-sm bg-black border-white/20 shrink-0"
            />
            <span>
              {currentLang === "ar"
                ? "أفهم أن PGR UAE قد ترفض أو تلغي أو تعلّق أي طلب، أو تطلب مستندات إضافية لأسباب تتعلق بالامتثال والقوانين المرعية."
                : "I understand PGR UAE may reject, cancel, hold, or request more information for compliance reasons."}
            </span>
          </label>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded space-y-2">
            <p>{errorMessage}</p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono uppercase tracking-wider text-[10px] transition-colors"
            >
              {currentLang === "ar" ? "تواصل عبر واتساب" : "Contact via WhatsApp"} · {WHATSAPP}
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gold-gradient hover:bg-gold-light text-black uppercase tracking-[0.2em] font-bold rounded-sm text-center transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 cursor-pointer"
        >
          {isLoading
            ? currentLang === "ar"
              ? "جاري الإرسال..."
              : "Submitting..."
            : currentLang === "ar"
              ? "إرسال طلب عرض السعر"
              : "Submit Quote Request"}
        </button>
      </form>
    </div>
  );

  return (
    <div style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      {content}
    </div>
  );
}

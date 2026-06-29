/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Mail, Phone, Users, Landmark, FileText } from "lucide-react";
import { dbService } from "../lib/supabase";

interface QuoteFormProps {
  currentLang: "en" | "ar";
  prefilledProduct?: string;
  onClose: () => void;
}

export default function QuoteForm({ currentLang, prefilledProduct, onClose }: QuoteFormProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    metalInterest: "gold" as "gold" | "silver" | "both",
    weightPreference: "",
    message: ""
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [successResponse, setSuccessResponse] = React.useState<{ inquiryId: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<any>(null);

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const sObj = await dbService.settings.get();
        if (sObj) setSettings(sObj);
      } catch (err) {
        console.error("Failed to load settings in QuoteForm:", err);
      }
    };
    fetchSettings();
  }, []);

  // Initialize pre-filled product if passed
  React.useEffect(() => {
    if (prefilledProduct) {
      setFormData((prev) => ({
        ...prev,
        message: currentLang === "ar"
          ? `أود الحصول على تسعير مباشر وجمركي بخصوص: ${prefilledProduct}`
          : `I would like to request an institutional quote regarding: ${prefilledProduct}`
      }));
    }
  }, [prefilledProduct, currentLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMessage(currentLang === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
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
          productCategory: prefilledProduct || "General Bullion Consultation",
          sourceLanguage: currentLang
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessResponse({
          inquiryId: data.inquiryId,
          message: data.message
        });
      } else {
        throw new Error(data.error || "Failed to process bespoke quotation.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again or contact PGR UAE.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="quote-form-portal" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      {/* Dimmer backdrop */}
      <div className="fixed inset-0 bg-[#070707]/90 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4 relative">
        <div className="relative w-full max-w-xl bg-[#111111] border border-white/[0.05] rounded-sm p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 animate-scaleUp">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* SUCCESS SCREEN */}
          {successResponse ? (
            <div className="text-center py-8 space-y-6">
              <div className="h-16 w-16 bg-gold-dark/15 border border-gold-base/30 rounded-full flex items-center justify-center mx-auto text-gold-base animate-bounce">
                <CheckCircle size={32} />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-serif text-white tracking-wide">
                  {currentLang === "ar" ? "تم تسجيل طلبك بنجاح" : "Inquiry Cataloged Successfully"}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#070707] text-xs font-mono text-gold-base border border-gold-base/20">
                  <span>REF ID:</span>
                  <strong className="font-bold">{successResponse.inquiryId}</strong>
                </div>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  {successResponse.message}
                </p>
              </div>

              <div className="p-4 rounded bg-[#070707] border border-white/[0.02] text-[11px] font-mono text-gray-500 max-w-sm mx-auto space-y-1">
                <div>PGR UAE Bullion Division</div>
                <div>Dubai Marina Trade Zone Precinct, UAE</div>
                <div>{settings?.desk_email || "desk@pgruae.com"}</div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm cursor-pointer"
              >
                {currentLang === "ar" ? "إغلاق النافذة" : "Close Console"}
              </button>
            </div>
          ) : (
            /* ACTIVE FORM STATE */
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-gold-base uppercase tracking-widest block">
                  {currentLang === "ar" ? "استفسار الصفقات الكبرى والمحافظ" : "Institutional Portfolio Consultation"}
                </span>
                <h2 className="text-2xl font-serif text-white tracking-tight font-medium">
                  {currentLang === "ar" ? "طلب عرض سعر مخصص" : "Request Bespoke Quote"}
                </h2>
                <p className="text-xs text-gray-400">
                  {currentLang === "ar"
                    ? "يرجى إدخال معلوماتك لتخصيص محفظتك وحجز سبائك الذهب المعفاة من القيمة المضافة من مكاتبنا بالمنطقة الحرة بدبي."
                    : "Fill in your specifications below to initialize custom allocations and tax-exempt physical gold lots in Dubai Marina Free Zone."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono uppercase tracking-wider block">
                      {currentLang === "ar" ? "الاسم الكامل *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono uppercase tracking-wider block">
                      {currentLang === "ar" ? "البريد الإلكتروني *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono uppercase tracking-wider block">
                      {currentLang === "ar" ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none text-left"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono uppercase tracking-wider block">
                      {currentLang === "ar" ? "اسم الشركة (إن وجد)" : "Company Name (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Metal Interest */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono uppercase tracking-wider block">
                      {currentLang === "ar" ? "المعدن المطلوب" : "Metal Interest"}
                    </label>
                    <select
                      value={formData.metalInterest}
                      onChange={(e) => setFormData({ ...formData, metalInterest: e.target.value as any })}
                      className="w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none"
                    >
                      <option value="gold">{currentLang === "ar" ? "ذهب خالص" : "Pure Gold Only"}</option>
                      <option value="silver">{currentLang === "ar" ? "فضة خالصة" : "Pure Silver Only"}</option>
                      <option value="both">{currentLang === "ar" ? "الاثنين معاً" : "Both Precious Metals"}</option>
                    </select>
                  </div>

                  {/* Weight Preference */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono uppercase tracking-wider block">
                      {currentLang === "ar" ? "حجم الشراء المتوقع" : "Expected Volume (e.g., 1kg, 50oz)"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 5 x 100g, 10kg, etc."
                      value={formData.weightPreference}
                      onChange={(e) => setFormData({ ...formData, weightPreference: e.target.value })}
                      className="w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none"
                    />
                  </div>
                </div>

                {/* Message Box */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono uppercase tracking-wider block">
                    {currentLang === "ar" ? "تفاصيل الطلب الإضافية" : "Additional Specifications"}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#161616] border border-white/[0.04] focus:border-gold-base rounded-sm py-2 px-3 text-white outline-none resize-none"
                  />
                </div>

                {/* Mandated Compliance & Legal Checkboxes */}
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
                      {currentLang === "ar" 
                        ? "أقبل بشروط وأحكام الخدمة لـ PGR UAE." 
                        : "I accept the Terms of Service."}
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
                        ? "أقبل بسياسة الخصوصية وسرية البيانات لـ PGR UAE." 
                        : "I accept the Privacy Policy."}
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
                        ? "أفهم أن PGR UAE لا تقدم أي استشارات مالية أو استثمارية أو ضريبية أو قانونية." 
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

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded">
                    {errorMessage}
                  </div>
                )}

                {/* Action Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gold-gradient hover:bg-gold-light text-black uppercase tracking-[0.2em] font-bold rounded-sm text-center transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading
                    ? (currentLang === "ar" ? "جاري الإرسال للتسجيل..." : "Cataloging Bespoke Request...")
                    : (currentLang === "ar" ? "إرسال طلب المقايسة للرئيس التنفيذي" : "Submit Bespoke Request to Trader")}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

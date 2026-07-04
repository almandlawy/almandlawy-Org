/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Mail, Phone, Users, Landmark, FileText } from "lucide-react";
import { dbService } from "../lib/supabase";
import { PRODUCTS } from "../data";
import { resolvePublicCatalog } from "../lib/productCatalog";

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

  const [selectedProductId, setSelectedProductId] = React.useState(PRODUCTS[0]?.id || "pgr-bullion-collection");
  const catalogProducts = React.useMemo(() => resolvePublicCatalog(PRODUCTS), []);
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

  React.useEffect(() => {
    if (prefilledProduct) {
      const match = catalogProducts.find(
        (product) =>
          product.name_en === prefilledProduct ||
          product.name_ar === prefilledProduct ||
          product.id === prefilledProduct
      );
      if (match) {
        setSelectedProductId(match.id);
      }
      setFormData((prev) => ({
        ...prev,
        message: currentLang === "ar"
          ? `أود الحصول على تسعير مباشر وجمركي بخصوص: ${prefilledProduct}`
          : `I would like to request an institutional quote regarding: ${prefilledProduct}`
      }));
    }
  }, [prefilledProduct, currentLang, catalogProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMessage(currentLang === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const selectedProduct =
      catalogProducts.find((product) => product.id === selectedProductId) || catalogProducts[0];
    const productLabel = currentLang === "ar" ? selectedProduct.name_ar : selectedProduct.name_en;

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productId: selectedProduct.id,
          productCategory: productLabel,
          sourceLanguage: currentLang
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Also save to local storage/database service so it is visible in client/admin panel instantly
        await dbService.quoteRequests.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          metalInterest: formData.metalInterest,
          metal_interest: formData.metalInterest,
          productCategory: productLabel,
          product_category: productLabel,
          productId: selectedProduct.id,
          weight: formData.weightPreference,
          weight_preference: formData.weightPreference,
          message: formData.message,
          status: "New Request"
        });
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
      <div className="fixed inset-0 bg-[#1F1A17]/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4 relative">
        <div className="relative w-full max-w-xl bg-brand-card border border-soft-border rounded p-6 md:p-8 shadow-2xl z-10 animate-scaleUp">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-text-charcoal hover:bg-brand-section transition-colors cursor-pointer border border-soft-border bg-brand-bg shadow-sm"
          >
            <X size={18} />
          </button>

          {/* SUCCESS SCREEN */}
          {successResponse ? (
            <div className="text-center py-8 space-y-6">
              <div className="h-16 w-16 bg-[#C6A15B]/10 border border-[#E8DEC9] rounded-full flex items-center justify-center mx-auto text-[#A47C36]">
                <CheckCircle size={32} />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-serif text-text-charcoal tracking-wide">
                  {currentLang === "ar" ? "تم تسجيل طلبك بنجاح" : "Inquiry Cataloged Successfully"}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-bg text-xs font-mono text-[#A47C36] border border-soft-border font-bold">
                  <span>REF ID:</span>
                  <strong className="font-bold">{successResponse.inquiryId}</strong>
                </div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed font-sans">
                  {successResponse.message}
                </p>
              </div>

              <div className="p-4 rounded bg-brand-bg border border-soft-border text-[11px] font-mono text-text-secondary max-w-sm mx-auto space-y-1 font-bold shadow-sm">
                <div>PGR UAE Bullion Division</div>
                <div>Dubai Marina Trade Zone Precinct, UAE</div>
                <div>{settings?.desk_email || "desk@pgruae.com"}</div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded cursor-pointer shadow-sm"
              >
                {currentLang === "ar" ? "إغلاق النافذة" : "Close Console"}
              </button>
            </div>
          ) : (
            /* ACTIVE FORM STATE */
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#A47C36] uppercase tracking-widest block font-bold">
                  {currentLang === "ar" ? "استفسار الصفقات الكبرى والمحافظ" : "Institutional Portfolio Consultation"}
                </span>
                <h2 className="text-2xl font-serif text-text-charcoal tracking-tight font-medium">
                  {currentLang === "ar" ? "طلب عرض سعر مخصص" : "Request Bespoke Quote"}
                </h2>
                <p className="text-xs text-text-secondary font-sans">
                  {currentLang === "ar"
                    ? "يرجى إدخال معلوماتك لتخصيص محفظتك وحجز سبائك الذهب المعفاة من القيمة المضافة من مكاتبنا بالمنطقة الحرة بدبي."
                    : "Fill in your specifications below to initialize custom allocations and tax-exempt physical gold lots in Dubai Marina Free Zone."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                      {currentLang === "ar" ? "الاسم الكامل *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none placeholder-text-secondary font-sans"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                      {currentLang === "ar" ? "البريد الإلكتروني *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none placeholder-text-secondary font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                      {currentLang === "ar" ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none text-left placeholder-text-secondary font-sans"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1">
                    <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                      {currentLang === "ar" ? "اسم الشركة (إن وجد)" : "Company Name (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none placeholder-text-secondary font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                    {currentLang === "ar" ? "المنتج المطلوب *" : "Product *"}
                  </label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none cursor-pointer font-sans"
                  >
                    {catalogProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {currentLang === "ar" ? product.name_ar : product.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                      {currentLang === "ar" ? "المعدن المطلوب" : "Metal Interest"}
                    </label>
                    <select
                      value={formData.metalInterest}
                      onChange={(e) => setFormData({ ...formData, metalInterest: e.target.value as any })}
                      className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none cursor-pointer font-sans"
                    >
                      <option value="gold">{currentLang === "ar" ? "ذهب خالص" : "Pure Gold Only"}</option>
                      <option value="silver">{currentLang === "ar" ? "فضة خالصة" : "Pure Silver Only"}</option>
                      <option value="both">{currentLang === "ar" ? "الاثنين معاً" : "Both Precious Metals"}</option>
                    </select>
                  </div>

                  {/* Weight Preference */}
                  <div className="space-y-1">
                    <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                      {currentLang === "ar" ? "حجم الشراء المتوقع" : "Expected Volume (e.g., 1kg, 50oz)"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 5 x 100g, 10kg, etc."
                      value={formData.weightPreference}
                      onChange={(e) => setFormData({ ...formData, weightPreference: e.target.value })}
                      className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none placeholder-text-secondary font-sans"
                    />
                  </div>
                </div>

                {/* Message Box */}
                <div className="space-y-1">
                  <label className="text-text-secondary font-mono uppercase tracking-wider block font-bold text-[10px]">
                    {currentLang === "ar" ? "تفاصيل الطلب الإضافية" : "Additional Specifications"}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded py-2 px-3 text-text-charcoal outline-none resize-none placeholder-text-secondary font-sans"
                  />
                </div>

                {/* Mandated Compliance & Legal Checkboxes */}
                <div className="space-y-2.5 p-4 bg-brand-bg border border-soft-border rounded font-sans text-[10.5px] leading-tight text-text-secondary shadow-sm">
                  <span className="text-[10px] font-mono uppercase text-[#A47C36] tracking-wider block mb-1 font-bold">
                    {currentLang === "ar" ? "موافقة وإقرار الامتثال واللوائح" : "Mandatory Compliance Declarations"}
                  </span>
                  
                  <label className="flex items-start gap-2.5 cursor-pointer hover:text-text-charcoal transition-colors">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 accent-[#C6A15B] h-3.5 w-3.5 rounded bg-brand-card border-soft-border shrink-0"
                    />
                    <span>
                      {currentLang === "ar" 
                        ? "أقبل بشروط وأحكام الخدمة لـ PGR UAE." 
                        : "I accept the Terms of Service."}
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer hover:text-text-charcoal transition-colors">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 accent-[#C6A15B] h-3.5 w-3.5 rounded bg-brand-card border-soft-border shrink-0"
                    />
                    <span>
                      {currentLang === "ar" 
                        ? "أقبل بسياسة الخصوصية وسرية البيانات لـ PGR UAE." 
                        : "I accept the Privacy Policy."}
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer hover:text-text-charcoal transition-colors">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 accent-[#C6A15B] h-3.5 w-3.5 rounded bg-brand-card border-soft-border shrink-0"
                    />
                    <span>
                      {currentLang === "ar" 
                        ? "أوافق على معالجة البيانات وإجراءات التحقق والامتثال (KYC/AML)." 
                        : "I consent to KYC/AML processing."}
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer hover:text-text-charcoal transition-colors">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 accent-[#C6A15B] h-3.5 w-3.5 rounded bg-brand-card border-soft-border shrink-0"
                    />
                    <span>
                      {currentLang === "ar" 
                        ? "أشعر أن الأسعار المعروضة إرشادية وتأشيرية فقط حتى تصدر PGR UAE عرض سعر مؤكد نهائي." 
                        : "I understand prices are indicative until PGR UAE issues a firm quote."}
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer hover:text-text-charcoal transition-colors">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 accent-[#C6A15B] h-3.5 w-3.5 rounded bg-brand-card border-soft-border shrink-0"
                    />
                    <span>
                      {currentLang === "ar" 
                        ? "أفهم أن PGR UAE لا تقدم أي استشارات مالية أو استثمارية أو ضريبية أو قانونية." 
                        : "I understand PGR UAE does not provide financial, investment, tax, or legal advice."}
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer hover:text-text-charcoal transition-colors">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 accent-[#C6A15B] h-3.5 w-3.5 rounded bg-brand-card border-soft-border shrink-0"
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
                  <div className="p-3 bg-soft-danger border border-[#E8DEC9] text-text-charcoal text-[11px] rounded font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Action Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white uppercase tracking-[0.2em] font-bold rounded text-center transition-all duration-300 shadow-sm disabled:opacity-50 cursor-pointer"
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

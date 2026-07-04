import React, { useState } from "react";
import Logo from "./Logo";
import { Coins, Phone, Mail, CheckCircle, ShieldAlert, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { dbService } from "../lib/supabase";
import { PRODUCTS } from "../data";
import { resolvePublicCatalog } from "../lib/productCatalog";
import PricingDisclaimer from "./PricingDisclaimer";
import { trackGoogleAdsContactConversion } from "../lib/gtag";

interface RequestQuotePageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

export default function RequestQuotePage({ currentLang, onNavigate }: RequestQuotePageProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [clientType, setClientType] = useState<"individual" | "corporate">("individual");
  const [companyName, setCompanyName] = useState("");
  const [metal, setMetal] = useState("Gold");
  const [productInterest, setProductInterest] = useState(PRODUCTS[0]?.id || "pgr-bullion-collection");
  const catalogProducts = React.useMemo(() => resolvePublicCatalog(PRODUCTS), []);
  const [weight, setWeight] = useState("");
  const [currency, setCurrency] = useState("AED");
  const [interestType, setInterestType] = useState("Collection");
  const [message, setMessage] = useState("");

  // Consent states
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [consentKyc, setConsentKyc] = useState(false);
  const [acceptIndicative, setAcceptIndicative] = useState(false);
  const [acceptNoAdvice, setAcceptNoAdvice] = useState(false);
  const [acceptComplianceHold, setAcceptComplianceHold] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !weight) {
      setError(currentLang === "ar" ? "يرجى تعبئة الحقول الأساسية: الاسم، الهاتف، البريد، والوزن." : "Please fill in all essential fields: Name, Phone, Email, and Weight.");
      return;
    }
    if (!acceptTerms || !acceptPrivacy || !consentKyc || !acceptIndicative || !acceptNoAdvice || !acceptComplianceHold) {
      setError(currentLang === "ar" ? "يجب الموافقة على جميع إقرارات الامتثال وشروط المنصة للمتابعة." : "You must accept all compliance declarations to submit this request.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selectedProduct =
        catalogProducts.find((product) => product.id === productInterest) || catalogProducts[0];
      const productLabel = currentLang === "ar" ? selectedProduct.name_ar : selectedProduct.name_en;

      const payload = {
        fullName,
        phone,
        email,
        clientType,
        companyName,
        metal,
        productInterest: productLabel,
        productId: selectedProduct.id,
        weight,
        currency,
        interestType,
        message,
        source: "website_request_quote_page"
      };

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Also save to local storage/database service so it is visible in client/admin panel instantly
        await dbService.quoteRequests.create({
          name: fullName,
          email,
          phone,
          company: companyName,
          metalInterest: metal.toLowerCase(),
          metal_interest: metal.toLowerCase(),
          productCategory: productLabel,
          product_category: productLabel,
          productId: selectedProduct.id,
          weight,
          weight_preference: weight,
          message,
          currency,
          interest_type: interestType,
          status: "New Request"
        });
        setSubmitted(true);
        trackGoogleAdsContactConversion();
      } else {
        throw new Error("API Submission failed");
      }
    } catch (err) {
      setError(
        currentLang === "ar"
          ? "تعذر إرسال طلبك حالياً. يرجى التواصل مع PGR UAE عبر واتساب: +971559688837"
          : "We could not submit your request right now. Please contact PGR UAE on WhatsApp: +971559688837"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-300 font-mono text-xs py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-dark/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation and Language bar */}
      <div className="max-w-4xl mx-auto mb-10 flex justify-between items-center relative z-10">
        <button
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
        >
          {currentLang === "ar" ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{currentLang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
        </button>
        <Logo className="w-9 h-9" showText={false} />
      </div>

      <div className="max-w-4xl mx-auto bg-[#0d0d0e] border border-white/[0.03] rounded-lg p-6 md:p-10 shadow-2xl relative z-10 space-y-8">
        
        {/* Page Hero Header */}
        <div className="text-center space-y-4 border-b border-white/[0.03] pb-6">
          <h1 className="text-white font-serif text-2xl md:text-3xl font-bold uppercase tracking-wider">
            {currentLang === "ar" ? "اطلب عرض سعر مؤكد للسبائك" : "Request a Firm Bullion Quote"}
          </h1>
          <p className="text-gold-gradient uppercase tracking-widest text-[10px] font-semibold">
            {currentLang === "ar" ? "طلب تسعير المعادن الثمينة والذهب في دبي" : "Dubai Precious Metals & Bullion Desk"}
          </p>
          <p className="text-gray-400 text-[11px] leading-relaxed max-w-2xl mx-auto font-sans">
            {currentLang === "ar"
              ? "قم بتقديم استفسارك. سيقوم مكتب PGR UAE بمراجعة التوفر والأسعار المرجعية وعلاوات المصفاة وضريبة القيمة المضافة ومتطلبات التحقق KYC لإصدار عرض سعر نهائي مؤكد."
              : "Submit your inquiry. PGR UAE will review availability, market reference, premiums, VAT/tax treatment, delivery/collection, KYC/AML requirements, and confirm a firm quote."}
          </p>
        </div>

        {submitted ? (
          <div className="p-8 bg-black/40 border border-[#c5a85c]/30 rounded text-center space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white text-base font-serif font-bold uppercase">
                {currentLang === "ar" ? "تم استلام طلبك بنجاح" : "Quote Request Received"}
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-400">
                {currentLang === "ar"
                  ? "تم استلام طلبك. سيقوم فريق PGR UAE بمراجعة الاستفسار وقد يتواصل معك لطلب معلومات KYC/AML إضافية قبل إصدار عرض سعر مؤكد."
                  : "Your request has been received. PGR UAE will review your inquiry and may contact you for additional KYC/AML information before issuing a firm quote."}
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate("/")}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded transition-colors uppercase tracking-wider text-[10px] font-bold cursor-pointer"
              >
                {currentLang === "ar" ? "العودة للرئيسية" : "Back to Home"}
              </button>
              <a
                href="https://wa.me/971559688837"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded font-sans font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5"
              >
                <Phone size={13} />
                <span>{currentLang === "ar" ? "مكتب الواتساب الفوري" : "WhatsApp Desk"}</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded flex gap-2 text-[11px] leading-relaxed">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Profile Info Section */}
            <div className="space-y-4">
              <h3 className="text-[#c5a85c] font-serif uppercase tracking-widest text-[10px] font-bold border-b border-white/[0.02] pb-1">
                01. {currentLang === "ar" ? "معلومات طالب عينات الأسعار" : "Applicant Client Details"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#070707] p-1.5 rounded border border-white/5">
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Client Classification</span>
                  <div className="flex gap-2 text-[10px]">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={clientType === "individual"}
                        onChange={() => setClientType("individual")}
                        className="accent-[#c5a85c]"
                      />
                      <span>Individual</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={clientType === "corporate"}
                        onChange={() => setClientType("corporate")}
                        className="accent-[#c5a85c]"
                      />
                      <span>Corporate</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Full Legal Name *</span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full legal name corresponding with ID"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">WhatsApp / Phone *</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Email Address *</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Company Entity (If corporate)</span>
                  <input
                    type="text"
                    disabled={clientType === "individual"}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Licensed trade name"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-colors disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Bullion Requirements Section */}
            <div className="space-y-4">
              <h3 className="text-[#c5a85c] font-serif uppercase tracking-widest text-[10px] font-bold border-b border-white/[0.02] pb-1">
                02. {currentLang === "ar" ? "متطلبات مواصفات السبائك" : "Bullion Specifications & Interest"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Precious Metal</span>
                  <select
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none transition-colors"
                  >
                    <option value="Gold">Gold (XAU)</option>
                    <option value="Silver">Silver (XAG)</option>
                    <option value="Platinum">Platinum (XPT)</option>
                    <option value="Palladium">Palladium (XPD)</option>
                  </select>
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">PGR Product</span>
                  <select
                    value={productInterest}
                    onChange={(e) => setProductInterest(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none transition-colors"
                  >
                    {catalogProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {currentLang === "ar" ? product.name_ar : product.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Weight / Quantity *</span>
                  <input
                    type="text"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 1 KILO, 10 oz, 500 grams"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Settlement Currency</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none transition-colors"
                  >
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Handling Preference</span>
                  <select
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none transition-colors"
                  >
                    <option value="Collection">Secure Counter Collection (Dubai)</option>
                    <option value="UAE Delivery">Insured UAE Delivery</option>
                    <option value="Allocated Storage">Allocated Storage Request</option>
                    <option value="International Shipping">Custom Shipping (e.g. Iraq, Global)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Instructions / Specific Refining Brands</span>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Prefer PAMP Suisse bars, or SAM mintings"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Strict Compliance declarations Checklist */}
            <div className="space-y-4 bg-black/40 p-5 border border-white/[0.03] rounded">
              <h4 className="text-[#c5a85c] font-serif uppercase tracking-widest text-[9px] font-bold border-b border-white/[0.04] pb-1 flex items-center gap-1.5">
                <FileText size={12} />
                {currentLang === "ar" ? "قائمة إقرارات الامتثال والموافقات التنظيمية" : "Compliance Checklist & Required Consents"}
              </h4>

              <div className="space-y-3 text-[10px] leading-relaxed">
                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar" 
                      ? "أوافق على شروط وأحكام منصة PGR UAE لتسعير السلع المادية." 
                      : "I accept the Terms of Service governing the physical bullion procurement flow."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptPrivacy}
                    onChange={(e) => setAcceptPrivacy(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar" 
                      ? "أوافق على سياسة الخصوصية واستلام اتصالات مخصصة ومحمية." 
                      : "I accept the Privacy Policy regarding the storage of compliance files and correspondence."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentKyc}
                    onChange={(e) => setConsentKyc(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar" 
                      ? "أوافق على تقديم وثائق إثبات الهوية KYC ومستندات مصدر الأموال والتعاون الكامل مع مسؤولي الامتثال لمكافحة غسيل الأموال." 
                      : "I consent to complete the mandatory KYC/AML screening (including submitting Emirates ID or passport) in accordance with UAE Central Bank and AML policies."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptIndicative}
                    onChange={(e) => setAcceptIndicative(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar" 
                      ? "أدرك تماماً أن الأسعار الموضحة على هذا الموقع إرشادية فقط ومتقلبة، وتخضع للتعديل والتأكيد النهائي من قبل مكتب PGR UAE قبل إبرام العقد." 
                      : "I understand that all displayed pricing is indicative only. Final firm spot rates, VAT, custom charges, and logistical spreads are only confirmed upon Final Desk Confirmation."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptNoAdvice}
                    onChange={(e) => setAcceptNoAdvice(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar" 
                      ? "أقر بأن PGR UAE لا توفر أي استشارات مالية أو نصائح استثمارية أو وعود بالأرباح أو ضمانات بخصوص عوائد الذهب." 
                      : "I understand that PGR UAE operates strictly as a physical bullion desk. The desk does not provide investment, financial, portfolio, tax, or legal advice."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptComplianceHold}
                    onChange={(e) => setAcceptComplianceHold(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar" 
                      ? "أوافق على إمكانية تأجيل أو إلغاء أو تعليق أي طلب لأسباب تتعلق بالامتثال أو التحقق من الهوية." 
                      : "I understand that PGR UAE reserves the right to hold, cancel, reject, or suspend any quote or delivery request pending satisfactory regulatory reviews."}
                  </span>
                </label>
              </div>
            </div>

            <PricingDisclaimer currentLang={currentLang} className="bg-[#0a0a0a] border-white/10 text-gray-400" />

            {/* Submission triggers */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-gold-gradient hover:opacity-95 text-black uppercase tracking-widest font-sans font-bold rounded shadow-lg transition-all duration-300 cursor-pointer text-[11px] flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{currentLang === "ar" ? "إرسال طلب عينة السعر للمراجعة" : "Submit Quote Request"}</span>
                )}
              </button>

              <a
                href={`https://wa.me/971559688837?text=${encodeURIComponent(
                  `Inquiry from Quote Page: ${fullName} wishes to request a quote for ${weight} of ${metal}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#111] hover:bg-white/[0.04] text-white border border-white/10 hover:border-white/20 rounded uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Phone size={13} className="text-emerald-400" />
                <span>{currentLang === "ar" ? "مكتب الواتساب المباشر" : "WhatsApp Desk"}</span>
              </a>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

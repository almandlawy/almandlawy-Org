import React, { useState } from "react";
import Logo from "./Logo";
import { Coins, ShieldAlert, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface SellBackPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

export default function SellBackPage({ currentLang, onNavigate }: SellBackPageProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [metalType, setMetalType] = useState("Gold");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState("999.9 Fine");
  const [holdingLocation, setHoldingLocation] = useState("PGR UAE Storage");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [acceptNoGuarantee, setAcceptNoGuarantee] = useState(false);
  const [acceptPhysicalAssay, setAcceptPhysicalAssay] = useState(false);
  const [acceptKycCheck, setAcceptKycCheck] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !weight) {
      setError(currentLang === "ar" ? "يرجى تعبئة الحقول المطلوبة للمتابعة." : "Please fill in all required fields.");
      return;
    }
    if (!acceptNoGuarantee || !acceptPhysicalAssay || !acceptKycCheck) {
      setError(currentLang === "ar" ? "يجب الموافقة على شروط سياسة تصفية وإعادة بيع السبائك للمتابعة." : "You must accept all sell-back policies to submit this request.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-300 font-mono text-xs py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Visual glowing effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gold-dark/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation and logo bar */}
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
        
        {/* Page Header */}
        <div className="text-center space-y-4 border-b border-white/[0.03] pb-6">
          <div className="w-12 h-12 bg-gold-dark/10 border border-[#c5a85c]/30 rounded-full flex items-center justify-center text-[#c5a85c] mx-auto">
            <Coins size={22} />
          </div>
          
          <h1 className="text-white font-serif text-2xl md:text-3xl font-bold uppercase tracking-wider">
            {currentLang === "ar" ? "طلب تسعير إعادة الشراء للسبائك" : "Request Sell-Back Quote"}
          </h1>
          <p className="text-gold-gradient uppercase tracking-widest text-[10px] font-semibold">
            {currentLang === "ar" ? "تسعير وتسييل مادي للسبائك المعتمدة دولياً" : "Liquidation & Procurement of LBMA Standard Bullion"}
          </p>
          <p className="text-gray-400 text-[11px] leading-relaxed max-w-2xl mx-auto font-sans">
            {currentLang === "ar"
              ? "يتيح مكتبنا لعملائه تقديم طلبات لتسعير بيع سبائكهم التي تم شراؤها مسبقاً أو السبائك المعتمدة من LBMA. تخضع جميع الطلبات للفحص المخبري المادي الدقيق للتأكد من الأصالة قبل إصدار تأكيد نهائي."
              : "Our desk allows clients to request sell-back quotes for physical gold and silver previously sourced through us or standard LBMA accredited refiners. All requests are subject to rigorous physical assaying."}
          </p>
        </div>

        {submitted ? (
          <div className="p-8 bg-black/40 border border-[#c5a85c]/30 rounded text-center space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white text-base font-serif font-bold uppercase">
                {currentLang === "ar" ? "تم استلام طلب إعادة الشراء" : "Sell-Back Request Submitted"}
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-400">
                {currentLang === "ar"
                  ? "تم تسجيل طلبك بنجاح. سيقوم مسؤول التقييم والامتثال بمراجعة مواصفات السبيكة والتواصل معك للتنسيق وحجز موعد الفحص المخبري الفني."
                  : "Your physical sell-back inquiry has been registered. An assay officer will contact you to coordinate shipping, physical inspection, and final desk confirmation."}
              </p>
            </div>
            <button
              onClick={() => onNavigate("/")}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded transition-colors uppercase tracking-wider text-[10px] font-bold cursor-pointer mx-auto"
            >
              {currentLang === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded flex gap-2 text-[11px] leading-relaxed animate-fadeIn">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-[#c5a85c] font-serif uppercase tracking-widest text-[10px] font-bold border-b border-white/[0.02] pb-1">
                01. {currentLang === "ar" ? "بيانات المالك الأصلي" : "Beneficial Owner Identity"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Full Legal Name *</span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-colors"
                  />
                </div>
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
              </div>
            </div>

            {/* Bullion specs */}
            <div className="space-y-4">
              <h3 className="text-[#c5a85c] font-serif uppercase tracking-widest text-[10px] font-bold border-b border-white/[0.02] pb-1">
                02. {currentLang === "ar" ? "تفاصيل السبائك ومستندات المصدر" : "Physical Asset Specifications"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Precious Metal</span>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Gold">Gold Bars / Coins</option>
                    <option value="Silver">Silver Bars / Coins</option>
                  </select>
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Purity Grade</span>
                  <input
                    type="text"
                    required
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    placeholder="999.9 Fine"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Total Net Weight *</span>
                  <input
                    type="text"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 1 KILO, 100 grams"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Original Invoice / Invoice No</span>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="Optional reference"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Current Physical Location of Assets</span>
                <select
                  value={holdingLocation}
                  onChange={(e) => setHoldingLocation(e.target.value)}
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none"
                >
                  <option value="PGR UAE Storage">Under PGR UAE Allocated Storage (Instant Verification)</option>
                  <option value="Client Hand">In Client Possession / Personal Safe (Requires Assay)</option>
                  <option value="Third Party Vault">Stored in external Dubai vault / DMCC (Requires Transfer)</option>
                </select>
              </div>
            </div>

            {/* Regulatory declarations */}
            <div className="space-y-3 bg-black/40 p-4 border border-white/[0.03] rounded">
              <h4 className="text-[#c5a85c] text-[9px] uppercase tracking-widest font-bold border-b border-white/[0.04] pb-1">
                ⚖️ {currentLang === "ar" ? "قائمة إقرارات الامتثال لإعادة الشراء والتصفية" : "Physical Liquidation & Procurement Compliance"}
              </h4>

              <div className="space-y-2 text-[10px] leading-relaxed">
                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptNoGuarantee}
                    onChange={(e) => setAcceptNoGuarantee(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar"
                      ? "أدرك تماماً أن PGR UAE لا تضمن شراء المعادن وليست ملزمة قانونياً بإعادة شراء السبائك مطلقاً."
                      : "I understand that PGR UAE operates strictly on current spot liquidity and market availability. There are no legal guarantees of buyback, nor is the desk contractually obligated to purchase physical metals."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptPhysicalAssay}
                    onChange={(e) => setAcceptPhysicalAssay(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar"
                      ? "أوافق على خضوع المعادن للفحص المادي والتحليل الكيميائي لنسب النقاء قبل تثبيت السعر."
                      : "I agree that all sell-back pricing is strictly subject to chemical assaying, optical testing, weight verification, and final desk confirmation."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptKycCheck}
                    onChange={(e) => setAcceptKycCheck(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar"
                      ? "أوافق على الخضوع لمراجعة الامتثال وإثبات مصدر الأموال الأصلي وهوية المالك المستفيد KYC."
                      : "I agree to undergo mandatory KYC checks and provide detailed, verifiable proof of original physical acquisition and beneficial ownership."}
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gold-gradient hover:opacity-95 text-black uppercase tracking-widest font-sans font-bold rounded shadow-lg transition-all duration-300 cursor-pointer text-[11px] flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{currentLang === "ar" ? "تقديم طلب تسعير إعادة الشراء" : "Submit Sell-Back Quote Request"}</span>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

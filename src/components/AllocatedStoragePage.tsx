import React, { useState } from "react";
import Logo from "./Logo";
import { Shield, Lock, Landmark, CheckCircle, ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";

interface AllocatedStoragePageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

export default function AllocatedStoragePage({ currentLang, onNavigate }: AllocatedStoragePageProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [metalType, setMetalType] = useState("Gold");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [duration, setDuration] = useState("12 Months");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [acceptCustodyOnly, setAcceptCustodyOnly] = useState(false);
  const [acceptNoInterest, setAcceptNoInterest] = useState(false);
  const [acceptAuditFee, setAcceptAuditFee] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !estimatedValue) {
      setError(currentLang === "ar" ? "يرجى تعبئة الحقول الأساسية لطلب التخزين." : "Please fill in all core fields for storage requests.");
      return;
    }
    if (!acceptCustodyOnly || !acceptNoInterest || !acceptAuditFee) {
      setError(currentLang === "ar" ? "يجب الموافقة على شروط الحفظ والامتثال التنظيمي للمتابعة." : "You must accept all custody terms to proceed.");
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
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-dark/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation bar */}
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
        
        {/* Header Hero Section */}
        <div className="text-center space-y-4 border-b border-white/[0.03] pb-6">
          <div className="w-12 h-12 bg-gold-dark/10 border border-[#c5a85c]/30 rounded-full flex items-center justify-center text-[#c5a85c] mx-auto">
            <Lock size={22} />
          </div>
          
          <h1 className="text-white font-serif text-2xl md:text-3xl font-bold uppercase tracking-wider">
            {currentLang === "ar" ? "طلب تخزين مخصص للسبائك" : "Request Allocated Bullion Storage"}
          </h1>
          <p className="text-gold-gradient uppercase tracking-widest text-[10px] font-semibold">
            {currentLang === "ar" ? "خدمات الحفظ العيني المؤمن والمعزول كلياً" : "Fully Insured Segregated Custody Services"}
          </p>
          <p className="text-gray-400 text-[11px] leading-relaxed max-w-2xl mx-auto font-sans">
            {currentLang === "ar"
              ? "يقدم ديوان PGR UAE خدمة حفظ عيني في خزائن مؤمنة ومصنفة ومستقلة كلياً بالتعاون مع كبار مزودي الخزن الدوليين. لا يمثل التخزين حساباً استثمارياً أو مصرفياً يدر عائداً."
              : "PGR UAE facilitates segregated, fully insured physical bullion custody in partnership with top-tier international vault operators. Storage represents pure custody and does not bear interest or yield."}
          </p>
        </div>

        {/* Benefits Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#070707] border border-white/5 p-4 rounded text-center space-y-2">
            <Shield className="text-[#c5a85c] mx-auto" size={18} />
            <h4 className="text-white font-serif font-bold text-[11px] uppercase">
              {currentLang === "ar" ? "تخزين معزول ومخصص" : "Fully Segregated"}
            </h4>
            <p className="text-gray-500 text-[10px] leading-relaxed font-sans">
              {currentLang === "ar" ? "سبائكك محفوظة بأرقامها التسلسلية الخاصة بمعزل عن أي أصول أخرى." : "Your metals remain physically separated, logged under your precise serial numbers."}
            </p>
          </div>

          <div className="bg-[#070707] border border-white/5 p-4 rounded text-center space-y-2">
            <Lock className="text-[#c5a85c] mx-auto" size={18} />
            <h4 className="text-white font-serif font-bold text-[11px] uppercase">
              {currentLang === "ar" ? "تأمين شامل ١٠٠٪" : "100% Insured"}
            </h4>
            <p className="text-gray-500 text-[10px] leading-relaxed font-sans">
              {currentLang === "ar" ? "تأمين شامل ضد جميع المخاطر العينية من كبار بيوت التأمين العالمية." : "All stored allocations are fully covered against physical loss with premier global underwriters."}
            </p>
          </div>

          <div className="bg-[#070707] border border-white/5 p-4 rounded text-center space-y-2">
            <Landmark className="text-[#c5a85c] mx-auto" size={18} />
            <h4 className="text-white font-serif font-bold text-[11px] uppercase">
              {currentLang === "ar" ? "تدقيق سنوي مستقل" : "Independent Audits"}
            </h4>
            <p className="text-gray-500 text-[10px] leading-relaxed font-sans">
              {currentLang === "ar" ? "مراجعات وتدقيق مادي دوري لضمان الالتزام بمواصفات LBMA الموثقة." : "Regular physical auditing by certified third parties ensures complete inventory reconciliation."}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 bg-black/40 border border-[#c5a85c]/30 rounded text-center space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white text-base font-serif font-bold uppercase">
                {currentLang === "ar" ? "تم استلام طلب التخزين" : "Custody Request Submitted"}
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-400">
                {currentLang === "ar"
                  ? "تم تسجيل طلبك بنجاح. سيقوم مسؤول التخزين والامتثال بمراجعة التفاصيل وإرسال وثائق عرض الحفظ واتفاقية التخزين المخصص."
                  : "We have received your physical storage request. A desk storage specialist will review the estimated volumes and issue our custom storage fee proposal."}
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
              <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded flex gap-2 text-[11px] leading-relaxed">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-[#c5a85c] font-serif uppercase tracking-widest text-[10px] font-bold border-b border-white/[0.02] pb-1">
                01. {currentLang === "ar" ? "بيانات مقدم الطلب والمستفيد" : "Client & Depositor Identity"}
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

            {/* Custody Specs */}
            <div className="space-y-4">
              <h3 className="text-[#c5a85c] font-serif uppercase tracking-widest text-[10px] font-bold border-b border-white/[0.02] pb-1">
                02. {currentLang === "ar" ? "تفاصيل السبائك المطلوب حفظها" : "Physical Custody Inventory Details"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Metal Format</span>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Gold">Gold Bars (999.9 Fine)</option>
                    <option value="Silver">Silver Bars (999.0 Fine)</option>
                    <option value="Mixed Bullion Coins">Mixed Bullion Coins</option>
                  </select>
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Estimated Value (AED) *</span>
                  <input
                    type="text"
                    required
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    placeholder="e.g. AED 500,000"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-700 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mb-1">Intended Custody Duration</span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="12 Months">12 Months (Renewable)</option>
                    <option value="24 Months">24 Months</option>
                    <option value="Indefinite">Indefinite (Open-ended)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Strict Regulatory Storage checks */}
            <div className="space-y-3 bg-black/40 p-4 border border-white/[0.03] rounded">
              <h4 className="text-[#c5a85c] text-[9px] uppercase tracking-widest font-bold border-b border-white/[0.04] pb-1">
                ⚖️ {currentLang === "ar" ? "الشروط القانونية والتنظيمية للحفظ العيني" : "Legal Custody & Storage Compliance Declarations"}
              </h4>

              <div className="space-y-2 text-[10px] leading-relaxed">
                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptCustodyOnly}
                    onChange={(e) => setAcceptCustodyOnly(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar"
                      ? "أقر بأن التخزين هو خدمة حفظ عيني (Segregated Custody) بحتة، ولا تمثل وديعة مصرفية أو استثماراً."
                      : "I agree that storage is strictly a physical, allocated, and segregated custody service. Title of ownership remains 100% with the client."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptNoInterest}
                    onChange={(e) => setAcceptNoInterest(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar"
                      ? "أفهم وأقر بأن هذا التخزين العيني لا يمنح أي فوائد أو عوائد مالية أو أرباح استثمارية."
                      : "I understand and confirm that physical allocated custody does not bear any form of interest, yield, financial gains, or investment dividend representations."}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-gray-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptAuditFee}
                    onChange={(e) => setAcceptAuditFee(e.target.checked)}
                    className="mt-0.5 accent-[#c5a85c] shrink-0"
                  />
                  <span>
                    {currentLang === "ar"
                      ? "أوافق على دفع رسوم الخزن والتأمين والتدقيق السنوي بموجب الشروط المقررة من ديوان PGR UAE."
                      : "I agree to satisfy the allocated storage fees, vault handling premiums, and insurance costs as scheduled in our final bilateral custody agreement."}
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
                <span>{currentLang === "ar" ? "تقديم طلب الحفظ الآمن" : "Submit Custody Storage Request"}</span>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

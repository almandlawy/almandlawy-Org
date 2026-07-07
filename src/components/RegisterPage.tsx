import React, { useState } from "react";
import Logo from "./Logo";
import { User, Mail, Lock, Phone, Building, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

interface RegisterPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
  onRegisterSuccess: (user: any) => void;
}

export default function RegisterPage({ currentLang, onNavigate, onRegisterSuccess }: RegisterPageProps) {
  const [accountType, setAccountType] = useState<"individual" | "corporate">("individual");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  
  // Consent checkboxes
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentKyc, setConsentKyc] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || (accountType === "corporate" && !companyName)) {
      setError(currentLang === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }
    if (!consentTerms || !consentPrivacy || !consentKyc) {
      setError(
        currentLang === "ar" 
          ? "يجب الموافقة على الشروط، سياسة الخصوصية، وبدء إجراءات التحقق KYC للمتابعة." 
          : "You must accept the Terms, Privacy Policy, and KYC/AML Consent to proceed."
      );
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      const mockUser = {
        id: "usr-" + Math.floor(Math.random() * 100000),
        email: email,
        name: fullName,
        role: "customer",
        company: accountType === "corporate" ? companyName : undefined,
        token: "session-token-jwt-secure"
      };
      onRegisterSuccess(mockUser);
      setLoading(false);
      onNavigate("/dashboard");
    }, 1200);
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        id: "usr-google-112358",
        email: "john.doe@gmail.com",
        name: "John Doe",
        role: "customer",
        token: "session-token-google-jwt"
      };
      onRegisterSuccess(mockUser);
      setLoading(false);
      onNavigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070707] relative overflow-hidden font-mono text-xs">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-gold-dark/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-white/[0.01] blur-[140px] rounded-full pointer-events-none" />

      {/* Action Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button
          onClick={() => onNavigate("/login")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
        >
          {currentLang === "ar" ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{currentLang === "ar" ? "العودة لتسجيل الدخول" : "Back to Sign In"}</span>
        </button>
      </div>

      <div className="w-full max-w-xl bg-[#0d0d0e] border border-white/[0.04] rounded p-8 shadow-2xl space-y-6 relative z-10 my-10">
        
        {/* Onboarding Header */}
        <div className="text-center space-y-3">
          <Logo className="w-12 h-12 mx-auto" showText={false} currentLang={currentLang} />
          <h1 className="text-white font-serif text-lg tracking-wider font-bold uppercase">
            {currentLang === "ar" ? "طلب فتح حساب ديوان عملاء" : "PGR PRIVATE CLIENT ONBOARDING"}
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-[9px]">
            {currentLang === "ar" ? "سجل طلبك للوصول لعروض أسعار المعادن الثمينة المخصصة" : "Register to access firm precious metals pricing & quotes"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded text-[10px] leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Account Type Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-[#070707] p-1 rounded border border-white/5">
          <button
            type="button"
            onClick={() => setAccountType("individual")}
            className={`py-2 rounded text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
              accountType === "individual"
                ? "bg-gold-gradient text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            👤 {currentLang === "ar" ? "حساب فردي" : "Individual Client"}
          </button>
          <button
            type="button"
            onClick={() => setAccountType("corporate")}
            className={`py-2 rounded text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
              accountType === "corporate"
                ? "bg-gold-gradient text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏢 {currentLang === "ar" ? "حساب شركات / مؤسسات" : "Corporate / Institutional"}
          </button>
        </div>

        {/* Form Registration Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "الاسم القانوني الكامل" : "Full Legal Name"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
                />
                <User size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@gmail.com"
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
                />
                <Mail size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "رقم الهاتف / واتساب" : "WhatsApp / Phone"}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
                />
                <Phone size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "كلمة المرور المشفرة" : "Secure Password"}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
                />
                <Lock size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Company Name if Corporate */}
          {accountType === "corporate" && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "اسم الشركة / المؤسسة القانوني" : "Corporate Legal Entity Name"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Precious Metals Trading DMCC"
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
                />
                <Building size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
              </div>
            </div>
          )}

          {/* Compliance & Consent agreements */}
          <div className="space-y-3 p-4 bg-[#070707] border border-white/5 rounded">
            <h5 className="text-[9px] uppercase tracking-wider text-[#c5a85c] font-bold border-b border-white/5 pb-1">
              ✍️ {currentLang === "ar" ? "إقرارات الامتثال والتحقق التنظيمية" : "Regulatory Compliance Declarations"}
            </h5>
            
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 text-gray-400 leading-normal hover:text-white transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 accent-[#c5a85c]"
                />
                <span>
                  {currentLang === "ar" 
                    ? "أقر وأوافق على شروط الخدمة لـ PGR UAE وسياسات بيع السبائك." 
                    : "I understand and accept the terms of service of PGR UAE & bullion procurement guidelines."}
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-gray-400 leading-normal hover:text-white transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-0.5 accent-[#c5a85c]"
                />
                <span>
                  {currentLang === "ar" 
                    ? "أوافق على سياسة الخصوصية وسرية بيانات الاتصال والاتصالات الخاصة." 
                    : "I accept the Privacy Policy regarding my secure personal communication logs."}
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-gray-400 leading-normal hover:text-white transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentKyc}
                  onChange={(e) => setConsentKyc(e.target.checked)}
                  className="mt-0.5 accent-[#c5a85c]"
                />
                <span>
                  {currentLang === "ar" 
                    ? "أوافق على الخضوع لإجراءات التحقق من الهوية KYC/AML ومكافحة غسيل الأموال بموجب قوانين دولة الإمارات العربية المتحدة." 
                    : "I consent to KYC/AML screening requirements (submitting Passport/ID) under UAE AML/CTF regulations before desk quotes can be contracted."}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold-gradient hover:opacity-90 text-black uppercase tracking-widest font-sans font-bold rounded shadow-lg transition-all duration-300 cursor-pointer text-[11px] flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{currentLang === "ar" ? "تقديم طلب التسجيل" : "Submit Registration Request"}</span>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/[0.04]"></div>
          <span className="flex-shrink mx-4 text-gray-600 uppercase tracking-widest text-[8px]">OR</span>
          <div className="flex-grow border-t border-white/[0.04]"></div>
        </div>

        {/* Continue with Google */}
        <button
          onClick={handleGoogleSignup}
          type="button"
          className="w-full py-3 bg-white text-gray-800 hover:bg-gray-100 font-sans font-bold rounded shadow-md transition-all duration-300 cursor-pointer text-[11px] flex items-center justify-center gap-2.5 border border-gray-200"
        >
          {/* Official Google G Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-.1.95-1.12 1.83v2.52h6.5c3.8-3.5 6-8.6 6-13.83z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-6.5-2.52c-1.8.1.18-.36-3.13-1.04-2.65-2.65-6.56-2.65-9.21 0L1.76 21.36C3.76 23.36 6.48 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M4.34 14.53c-.22-.66-.34-1.36-.34-2.07s.12-1.41.34-2.07L1.76 7.87C.63 10.13 0 12.53 0 15s.63 4.87 1.76 7.13l2.58-2.6z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 6.48 0 3.76.64 1.76 2.64l2.58 2.58c1.35-1.2 3.12-1.97 7.66-2.07z"
            />
          </svg>
          <span className="text-gray-800">{currentLang === "ar" ? "التسجيل السريع باستخدام Google" : "Continue with Google"}</span>
        </button>

        <div className="text-center pt-2">
          <p className="text-gray-500 text-[10px]">
            {currentLang === "ar" ? "لديك حساب بالفعل؟" : "Already registered?"}{" "}
            <button
              onClick={() => onNavigate("/login")}
              className="text-[#c5a85c] font-bold hover:underline cursor-pointer uppercase tracking-wider text-[9px] ml-1"
            >
              {currentLang === "ar" ? "تسجيل الدخول" : "Sign In"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

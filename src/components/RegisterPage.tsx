import React, { useState } from "react";
import Logo from "./Logo";
import { User, Mail, Lock, Phone, Building, ArrowLeft, ArrowRight, Chrome } from "lucide-react";
import ClientAccountStepper from "./ClientAccountStepper";
import {
  getLoginRedirectPath,
  signInWithGoogle,
  signUpWithEmail,
  type AppUser,
} from "../lib/clientAuth";

interface RegisterPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
  onRegisterSuccess: (user: AppUser) => void;
}

export default function RegisterPage({ currentLang, onNavigate, onRegisterSuccess }: RegisterPageProps) {
  const [accountType, setAccountType] = useState<"individual" | "corporate">("individual");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentKyc, setConsentKyc] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = getLoginRedirectPath();
  const kycNext = `/kyc?next=${encodeURIComponent(nextPath)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || (accountType === "corporate" && !companyName)) {
      setError(currentLang === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError(
        currentLang === "ar" ? "كلمة المرور 8 أحرف على الأقل." : "Password must be at least 8 characters."
      );
      return;
    }
    if (!consentTerms || !consentPrivacy || !consentKyc) {
      setError(
        currentLang === "ar"
          ? "يجب الموافقة على الشروط والخصوصية وKYC للمتابعة."
          : "You must accept Terms, Privacy, and KYC consent to proceed."
      );
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const { user, needsEmailConfirm } = await signUpWithEmail({
        email,
        password,
        fullName,
        phone,
        accountType,
        company: accountType === "corporate" ? companyName : undefined,
      });
      onRegisterSuccess(user);
      if (needsEmailConfirm) {
        setInfo(
          currentLang === "ar"
            ? "تم إنشاء الحساب. راجع بريدك لتأكيد البريد ثم سجّل الدخول."
            : "Account created. Check your email to confirm, then sign in."
        );
        onNavigate(`/login?next=${encodeURIComponent(kycNext)}`);
        return;
      }
      onNavigate(kycNext);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!consentTerms || !consentPrivacy || !consentKyc) {
      setError(
        currentLang === "ar"
          ? "يرجى الموافقة على الإقرارات قبل التسجيل بـ Google."
          : "Please accept the declarations before Google sign-up."
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signInWithGoogle(kycNext);
      if (result) {
        onRegisterSuccess(result);
        onNavigate(kycNext);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070707] relative overflow-hidden font-mono text-xs">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-gold-dark/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-white/[0.01] blur-[140px] rounded-full pointer-events-none" />

      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button
          onClick={() => onNavigate("/login")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
        >
          {currentLang === "ar" ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{currentLang === "ar" ? "العودة لتسجيل الدخول" : "Back to sign in"}</span>
        </button>
      </div>

      <div className="w-full max-w-xl space-y-4 relative z-10 my-10">
        <div className="bg-[#0d0d0e]/90 border border-white/[0.04] rounded p-4">
          <ClientAccountStepper currentLang={currentLang} activeStep="account" compact />
        </div>

        <div className="bg-[#0d0d0e] border border-white/[0.04] rounded p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <Logo className="w-12 h-12 mx-auto" showText={false} currentLang={currentLang} />
            <h1 className="text-white font-serif text-lg tracking-wider font-bold uppercase">
              {currentLang === "ar" ? "إنشاء حساب عميل" : "Create client account"}
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-[9px]">
              {currentLang === "ar"
                ? "الاسم · البريد · Google — ثم KYC ثم طلب العرض"
                : "Name · email · Google — then KYC, then quote"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded text-[10px]">
              {error}
            </div>
          )}
          {info && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded text-[10px]">
              {info}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 bg-[#070707] p-1 rounded border border-white/5">
            <button
              type="button"
              onClick={() => setAccountType("individual")}
              className={`py-2 rounded text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                accountType === "individual" ? "bg-gold-gradient text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              {currentLang === "ar" ? "فردي" : "Individual"}
            </button>
            <button
              type="button"
              onClick={() => setAccountType("corporate")}
              className={`py-2 rounded text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                accountType === "corporate" ? "bg-gold-gradient text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              {currentLang === "ar" ? "شركة" : "Corporate"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                  {currentLang === "ar" ? "الاسم الكامل" : "Full name"} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white pl-8"
                  />
                  <User size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                  {currentLang === "ar" ? "البريد الإلكتروني" : "Email"} *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white pl-8"
                  />
                  <Mail size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                  {currentLang === "ar" ? "واتساب / هاتف" : "WhatsApp / phone"} *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 55 968 8837"
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white pl-8"
                  />
                  <Phone size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                  {currentLang === "ar" ? "كلمة المرور" : "Password"} *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white pl-8"
                  />
                  <Lock size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {accountType === "corporate" && (
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                  {currentLang === "ar" ? "اسم الشركة" : "Company name"} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2 text-white pl-8"
                  />
                  <Building size={13} className="text-gray-600 absolute left-2.5 top-2.5" />
                </div>
              </div>
            )}

            <div className="space-y-3 p-4 bg-[#070707] border border-white/5 rounded">
              <label className="flex items-start gap-2.5 text-gray-400 cursor-pointer">
                <input type="checkbox" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} className="mt-0.5 accent-[#c5a85c]" />
                <span className="text-[10px]">
                  {currentLang === "ar" ? "أوافق على شروط الخدمة." : "I accept the terms of service."}
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-gray-400 cursor-pointer">
                <input type="checkbox" checked={consentPrivacy} onChange={(e) => setConsentPrivacy(e.target.checked)} className="mt-0.5 accent-[#c5a85c]" />
                <span className="text-[10px]">
                  {currentLang === "ar" ? "أوافق على سياسة الخصوصية." : "I accept the privacy policy."}
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-gray-400 cursor-pointer">
                <input type="checkbox" checked={consentKyc} onChange={(e) => setConsentKyc(e.target.checked)} className="mt-0.5 accent-[#c5a85c]" />
                <span className="text-[10px]">
                  {currentLang === "ar"
                    ? "أوافق على إكمال KYC قبل طلب أي عرض سعر."
                    : "I agree to complete KYC before requesting any quote."}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-gradient hover:opacity-90 text-black uppercase tracking-widest font-bold rounded text-[11px] disabled:opacity-60"
            >
              {loading
                ? currentLang === "ar"
                  ? "جاري الإنشاء…"
                  : "Creating…"
                : currentLang === "ar"
                  ? "إنشاء الحساب"
                  : "Create account"}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/[0.04]" />
            <span className="flex-shrink mx-4 text-gray-600 uppercase text-[8px]">OR</span>
            <div className="flex-grow border-t border-white/[0.04]" />
          </div>

          <button
            onClick={handleGoogleSignup}
            type="button"
            disabled={loading}
            className="w-full py-3 bg-white text-gray-800 hover:bg-gray-100 font-bold rounded text-[11px] flex items-center justify-center gap-2 border border-gray-200 disabled:opacity-60"
          >
            <Chrome size={16} />
            {currentLang === "ar" ? "التسجيل بـ Google" : "Sign up with Google"}
          </button>

          <div className="text-center">
            <p className="text-gray-500 text-[10px]">
              {currentLang === "ar" ? "لديك حساب؟" : "Already registered?"}{" "}
              <button
                onClick={() => onNavigate("/login")}
                className="text-[#c5a85c] font-bold hover:underline text-[9px]"
              >
                {currentLang === "ar" ? "تسجيل الدخول" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

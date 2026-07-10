import React, { useState } from "react";
import Logo from "./Logo";
import { User, Mail, Lock, Phone, Building, ArrowLeft, ArrowRight } from "lucide-react";
import ClientAccountStepper from "./ClientAccountStepper";
import GoogleSignInButton from "./GoogleSignInButton";
import { trackSignUp } from "../lib/gtag";
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
  const [consentAll, setConsentAll] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isAr = currentLang === "ar";
  const nextPath = getLoginRedirectPath();
  const kycNext = `/kyc?next=${encodeURIComponent(nextPath)}`;

  const inputClass =
    "w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2.5 text-sm text-text-charcoal outline-none transition-colors pl-9";
  const labelClass =
    "text-[10px] font-mono uppercase tracking-wider text-text-secondary font-bold block mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || (accountType === "corporate" && !companyName)) {
      setError(isAr ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError(isAr ? "كلمة المرور 8 أحرف على الأقل." : "Password must be at least 8 characters.");
      return;
    }
    if (!consentAll) {
      setError(
        isAr
          ? "يرجى الموافقة على الشروط للمتابعة."
          : "Please accept the terms to continue."
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
      if (needsEmailConfirm) {
        setInfo(
          isAr
            ? "تم إنشاء الحساب. راجع بريدك لتأكيد البريد ثم سجّل الدخول."
            : "Account created. Check your email to confirm, then sign in."
        );
        onNavigate(`/login?next=${encodeURIComponent(kycNext)}`);
        return;
      }
      onRegisterSuccess(user);
      trackSignUp("email");
      onNavigate(kycNext);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!consentAll) {
      setError(
        isAr
          ? "يرجى الموافقة على الشروط قبل التسجيل بـ Google."
          : "Please accept the terms before Google sign-up."
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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-brand-bg relative overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold-base/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button
          onClick={() => onNavigate("/login")}
          className="flex items-center gap-2 text-text-secondary hover:text-text-charcoal transition-colors cursor-pointer uppercase tracking-wider text-[10px] font-mono"
        >
          {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}</span>
        </button>
      </div>

      <div className="w-full max-w-xl space-y-4 relative z-10 my-10">
        <div className="rounded-xl border border-soft-border bg-brand-card p-4 shadow-sm">
          <ClientAccountStepper currentLang={currentLang} activeStep="account" compact />
        </div>

        <div className="rounded-xl border border-soft-border bg-brand-card p-8 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <Logo className="w-12 h-12 mx-auto" showText={false} currentLang={currentLang} />
            <h1 className="text-text-charcoal font-serif text-xl tracking-wide font-bold">
              {isAr ? "إنشاء حساب" : "Create account"}
            </h1>
            <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest">
              {isAr ? "دقيقة واحدة — Google أو بريد إلكتروني" : "One minute — Google or email"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-[11px]">{error}</div>
          )}
          {info && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[11px]">
              {info}
            </div>
          )}

          <label className="flex items-start gap-2.5 p-3 bg-brand-bg border border-soft-border rounded-lg text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={consentAll}
              onChange={(e) => setConsentAll(e.target.checked)}
              className="mt-0.5 accent-gold-base shrink-0"
            />
            <span className="text-[11px] leading-relaxed">
              {isAr
                ? "أوافق على شروط الخدمة والخصوصية وإكمال KYC قبل طلب عرض السعر."
                : "I accept the terms, privacy policy, and agree to complete KYC before requesting a quote."}
            </span>
          </label>

          <GoogleSignInButton
            label={isAr ? "متابعة بـ Google — الأسرع" : "Continue with Google — fastest"}
            disabled={loading}
            onClick={handleGoogleSignup}
          />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-soft-border" />
            <span className="flex-shrink mx-4 text-text-secondary uppercase text-[8px] font-mono">{isAr ? "أو بالبريد" : "Or with email"}</span>
            <div className="flex-grow border-t border-soft-border" />
          </div>

          <div className="grid grid-cols-2 gap-2 bg-brand-bg p-1 rounded-lg border border-soft-border">
            <button
              type="button"
              onClick={() => setAccountType("individual")}
              className={`py-2 rounded-md text-[10px] uppercase tracking-wider font-bold font-mono transition-all cursor-pointer ${
                accountType === "individual" ? "bg-gold-base text-text-charcoal" : "text-text-secondary hover:text-text-charcoal"
              }`}
            >
              {isAr ? "فردي" : "Individual"}
            </button>
            <button
              type="button"
              onClick={() => setAccountType("corporate")}
              className={`py-2 rounded-md text-[10px] uppercase tracking-wider font-bold font-mono transition-all cursor-pointer ${
                accountType === "corporate" ? "bg-gold-base text-text-charcoal" : "text-text-secondary hover:text-text-charcoal"
              }`}
            >
              {isAr ? "شركة" : "Corporate"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>{isAr ? "الاسم الكامل" : "Full name"} *</label>
                <div className="relative">
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                  <User size={13} className="text-text-secondary absolute left-2.5 top-3" />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{isAr ? "البريد الإلكتروني" : "Email"} *</label>
                <div className="relative">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <Mail size={13} className="text-text-secondary absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>{isAr ? "واتساب / هاتف" : "WhatsApp / phone"} *</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 55 968 8837"
                    className={inputClass}
                  />
                  <Phone size={13} className="text-text-secondary absolute left-2.5 top-3" />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{isAr ? "كلمة المرور" : "Password"} *</label>
                <div className="relative">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                  <Lock size={13} className="text-text-secondary absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            {accountType === "corporate" && (
              <div className="space-y-1">
                <label className={labelClass}>{isAr ? "اسم الشركة" : "Company name"} *</label>
                <div className="relative">
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                  <Building size={13} className="text-text-secondary absolute left-2.5 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-base hover:bg-gold-dark text-text-charcoal uppercase tracking-widest font-mono font-bold rounded-lg text-[11px] disabled:opacity-60"
            >
              {loading ? (isAr ? "جاري الإنشاء…" : "Creating…") : isAr ? "إنشاء الحساب" : "Create account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-text-secondary text-[11px]">
              {isAr ? "لديك حساب؟" : "Already registered?"}{" "}
              <button onClick={() => onNavigate("/login")} className="text-gold-dark font-bold hover:underline text-[10px] font-mono">
                {isAr ? "تسجيل الدخول" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

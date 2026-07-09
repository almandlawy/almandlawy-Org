import React, { useState } from "react";
import Logo from "./Logo";
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";
import ClientAccountStepper from "./ClientAccountStepper";
import GoogleSignInButton from "./GoogleSignInButton";
import {
  getLoginRedirectPath,
  resolvePostAuthPath,
  signInWithEmail,
  signInWithGoogle,
  type AppUser,
} from "../lib/clientAuth";

interface LoginPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
  onLoginSuccess: (user: AppUser) => void;
}

export default function LoginPage({ currentLang, onNavigate, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAr = currentLang === "ar";
  const nextPath = getLoginRedirectPath();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isAr ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await signInWithEmail(email, password);
      onLoginSuccess(user);
      if (user.role === "admin" && nextPath.startsWith("/admin")) {
        onNavigate("/admin");
        return;
      }
      const destination = await resolvePostAuthPath(nextPath);
      onNavigate(destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(isAr ? `تعذر تسجيل الدخول: ${msg}` : `Could not sign in: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const mockOrRedirect = await signInWithGoogle(nextPath);
      if (mockOrRedirect) {
        onLoginSuccess(mockOrRedirect);
        const destination = await resolvePostAuthPath(nextPath);
        onNavigate(destination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2.5 text-sm text-text-charcoal placeholder-text-secondary outline-none transition-colors pl-9";
  const labelClass =
    "text-[10px] font-mono uppercase tracking-wider text-text-secondary font-bold block mb-1";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-brand-bg relative overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold-base/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 text-text-secondary hover:text-text-charcoal transition-colors cursor-pointer uppercase tracking-wider text-[10px] font-mono"
        >
          {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{isAr ? "العودة للرئيسية" : "Back to home"}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10 my-12">
        <div className="rounded-xl border border-soft-border bg-brand-card p-4 shadow-sm">
          <ClientAccountStepper currentLang={currentLang} activeStep="account" compact />
        </div>

        <div className="w-full rounded-xl border border-soft-border bg-brand-card p-8 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Logo className="w-14 h-14" showText={false} currentLang={currentLang} />
            <div className="space-y-1">
              <h1 className="text-text-charcoal font-serif text-xl tracking-wide font-bold">
                {isAr ? "تسجيل الدخول" : "Sign in"}
              </h1>
              <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest">
                {isAr
                  ? "الخطوة ١ — حسابك لمتابعة الطلبات وعروض الأسعار"
                  : "Step 1 — your account to track quotes & orders"}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2 text-[11px]">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <p className="leading-normal">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className={labelClass}>{isAr ? "البريد الإلكتروني" : "Email address"}</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className={inputClass}
                />
                <Mail size={13} className="text-text-secondary absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{isAr ? "كلمة المرور" : "Password"}</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={inputClass}
                />
                <Lock size={13} className="text-text-secondary absolute left-2.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-base hover:bg-gold-dark text-text-charcoal uppercase tracking-widest font-mono font-bold rounded-lg transition-colors cursor-pointer text-[11px] flex justify-center items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-text-charcoal border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isAr ? "تسجيل الدخول" : "Sign in"}</span>
              )}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-soft-border" />
            <span className="flex-shrink mx-4 text-text-secondary uppercase tracking-widest text-[8px] font-mono">
              {isAr ? "أو" : "OR"}
            </span>
            <div className="flex-grow border-t border-soft-border" />
          </div>

          <GoogleSignInButton
            label={isAr ? "المتابعة بحساب Google" : "Continue with Google"}
            disabled={loading}
            onClick={handleGoogleLogin}
          />

          <div className="text-center pt-2">
            <p className="text-text-secondary text-[11px]">
              {isAr ? "ليس لديك حساب؟" : "New to PGR UAE?"}{" "}
              <button
                onClick={() =>
                  onNavigate(
                    `/register${nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`
                  )
                }
                className="text-gold-dark font-bold hover:underline cursor-pointer text-[10px] font-mono uppercase tracking-wider"
              >
                {isAr ? "إنشاء حساب" : "Create account"}
              </button>
            </p>
          </div>

          <div className="border-t border-soft-border pt-4 text-center">
            <p className="text-text-secondary leading-normal text-[9px] uppercase tracking-wider font-mono">
              {isAr
                ? "الدخول لتقديم طلبات العروض ومتابعة KYC والطلبات — وليس للتداول الفوري."
                : "Sign in to request quotes and track KYC & orders — not for instant trading."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

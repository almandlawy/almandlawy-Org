import React, { useState } from "react";
import Logo from "./Logo";
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldAlert, Chrome } from "lucide-react";
import ClientAccountStepper from "./ClientAccountStepper";
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

  const nextPath = getLoginRedirectPath();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(currentLang === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill in all fields.");
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
      setError(
        currentLang === "ar"
          ? `تعذر تسجيل الدخول: ${msg}`
          : `Could not sign in: ${msg}`
      );
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070707] relative overflow-hidden font-mono text-xs">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-gold-dark/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-white/[0.01] blur-[140px] rounded-full pointer-events-none" />

      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
        >
          {currentLang === "ar" ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{currentLang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10">
        <div className="bg-[#0d0d0e]/90 border border-white/[0.04] rounded p-4">
          <ClientAccountStepper currentLang={currentLang} activeStep="account" compact />
        </div>

        <div className="w-full bg-[#0d0d0e] border border-white/[0.04] rounded p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Logo className="w-14 h-14" showText={false} currentLang={currentLang} />
            <div className="space-y-1">
              <h1 className="text-white font-serif text-lg tracking-wider font-bold uppercase">
                {currentLang === "ar" ? "تسجيل الدخول" : "Client sign in"}
              </h1>
              <p className="text-gray-500 uppercase tracking-widest text-[9px]">
                {currentLang === "ar"
                  ? "الخطوة ١ — حسابك الخاص لمتابعة الطلبات"
                  : "Step 1 — your private account to track orders"}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded flex items-start gap-2 text-[10px]">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <p className="leading-normal">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "البريد الإلكتروني" : "Email address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
                />
                <Mail size={13} className="text-gray-600 absolute left-2.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
                />
                <Lock size={13} className="text-gray-600 absolute left-2.5 top-3.5" />
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
                <span>{currentLang === "ar" ? "تسجيل الدخول" : "Sign in"}</span>
              )}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/[0.04]" />
            <span className="flex-shrink mx-4 text-gray-600 uppercase tracking-widest text-[8px]">OR</span>
            <div className="flex-grow border-t border-white/[0.04]" />
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="w-full py-3 bg-white text-gray-800 hover:bg-gray-100 font-sans font-bold rounded shadow-md transition-all duration-300 cursor-pointer text-[11px] flex items-center justify-center gap-2.5 border border-gray-200 disabled:opacity-60"
          >
            <Chrome size={16} />
            <span>{currentLang === "ar" ? "المتابعة بحساب Google" : "Continue with Google"}</span>
          </button>

          <div className="text-center pt-2">
            <p className="text-gray-500 text-[10px]">
              {currentLang === "ar" ? "ليس لديك حساب؟" : "New to PGR UAE?"}{" "}
              <button
                onClick={() =>
                  onNavigate(
                    `/register${nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`
                  )
                }
                className="text-[#c5a85c] font-bold hover:underline cursor-pointer uppercase tracking-wider text-[9px] ml-1"
              >
                {currentLang === "ar" ? "إنشاء حساب" : "Create account"}
              </button>
            </p>
          </div>

          <div className="border-t border-white/[0.04] pt-4 text-center">
            <p className="text-gray-600 leading-normal text-[9px] uppercase tracking-wider">
              {currentLang === "ar"
                ? "الدخول لتقديم طلبات العروض ومتابعة حالة KYC والطلبات — وليس للتداول الفوري."
                : "Sign in to request quotes and track KYC & order status — not for instant trading."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import Logo from "./Logo";
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldAlert, Chrome } from "lucide-react";

interface LoginPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ currentLang, onNavigate, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(currentLang === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    setError("");

    // Simulate login for accredited demo investor
    setTimeout(() => {
      const isAlmandlawy = email.toLowerCase() === "almandlawy112@gmail.com";
      const mockUser = {
        id: "usr-" + Math.floor(Math.random() * 100000),
        email: email,
        name: isAlmandlawy ? "Compliance Desk Officer" : email.split("@")[0].toUpperCase(),
        role: isAlmandlawy ? "admin" : "customer",
        token: "session-token-jwt-secure"
      };
      
      onLoginSuccess(mockUser);
      setLoading(false);
      onNavigate(isAlmandlawy ? "/admin" : "/dashboard");
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        id: "usr-google-112358",
        email: "john.doe@gmail.com",
        name: "John Doe",
        role: "customer",
        token: "session-token-google-jwt"
      };
      onLoginSuccess(mockUser);
      setLoading(false);
      onNavigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070707] relative overflow-hidden font-mono text-xs">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-gold-dark/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-white/[0.01] blur-[140px] rounded-full pointer-events-none" />

      {/* Floating Action Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
        >
          {currentLang === "ar" ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{currentLang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-[#0d0d0e] border border-white/[0.04] rounded p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Logo and Greeting Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo className="w-14 h-14" showText={false} />
          <div className="space-y-1">
            <h1 className="text-white font-serif text-lg tracking-wider font-bold uppercase">
              {currentLang === "ar" ? "ديوان تسعير المعادن الثمينة" : "PGR UAE Precious Metals"}
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-[9px]">
              {currentLang === "ar" ? "بوابة الخدمات الخاصة للسبائك" : "Private Clients Bullion Desk Portal"}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded flex items-start gap-2 text-[10px]">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
              {currentLang === "ar" ? "البريد الإلكتروني للعميل" : "Client Email Address"}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@pgruae.com"
                className="w-full bg-[#070707] border border-white/5 focus:border-[#c5a85c]/60 rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-colors pl-8"
              />
              <Mail size={13} className="text-gray-600 absolute left-2.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-gray-400 uppercase tracking-wider block text-[9px]">
                {currentLang === "ar" ? "كلمة المرور المشفرة" : "Encrypted Password"}
              </label>
              <button
                type="button"
                className="text-gold-base/80 hover:text-white text-[9px] uppercase tracking-wider underline cursor-pointer"
              >
                {currentLang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
              </button>
            </div>
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
              <span>{currentLang === "ar" ? "تسجيل الدخول الآمن" : "Secure Sign In"}</span>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/[0.04]"></div>
          <span className="flex-shrink mx-4 text-gray-600 uppercase tracking-widest text-[8px]">OR</span>
          <div className="flex-grow border-t border-white/[0.04]"></div>
        </div>

        {/* Official Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3 bg-white text-gray-800 hover:bg-gray-100 font-sans font-bold rounded shadow-md transition-all duration-300 cursor-pointer text-[11px] flex items-center justify-center gap-2.5 border border-gray-200"
        >
          {/* Official Google G Icon in SVG */}
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
          <span className="text-gray-800">{currentLang === "ar" ? "المتابعة باستخدام Google" : "Continue with Google"}</span>
        </button>

        <div className="text-center pt-2">
          <p className="text-gray-500 text-[10px]">
            {currentLang === "ar" ? "ليس لديك حساب؟" : "New to PGR UAE?"}{" "}
            <button
              onClick={() => onNavigate("/register")}
              className="text-[#c5a85c] font-bold hover:underline cursor-pointer uppercase tracking-wider text-[9px] ml-1"
            >
              {currentLang === "ar" ? "إنشاء حساب عميل جديد" : "Create an account"}
            </button>
          </p>
        </div>

        {/* Core Compliance Disclaimer */}
        <div className="border-t border-white/[0.04] pt-4 text-center">
          <p className="text-gray-600 leading-normal text-[9px] uppercase tracking-wider">
            ⚠️ {currentLang === "ar" 
              ? "تنبيه تنظيمي: تقتصر صلاحية الدخول على تقديم طلبات عروض الأسعار، مراجعة حالة الأوامر، وثائق الامتثال، والدعم الفني للعملاء فقط. لا تمثل هذه المنصة محفظة تداول أو حساب استثماري." 
              : "Access is for quote requests, order status, document status, and client support. This platform is not a financial wallet or instant investment account."}
          </p>
        </div>

      </div>
    </div>
  );
}

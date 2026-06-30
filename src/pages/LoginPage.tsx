import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import PremiumButton from "../components/premium/PremiumButton";
import GoogleSignInButton from "../components/premium/GoogleSignInButton";
import Logo from "../components/premium/Logo";
import { dbService, isLive, isProduction, mockDb, supabase } from "../lib/supabase";

export default function LoginPage() {
  const { currentLang, setUser } = useApp();
  const isAr = currentLang === "ar";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if ((isProduction || isLive) && supabase) {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || email.split("@")[0],
            role: "customer",
          });
          navigate("/dashboard");
          return;
        }
      }
      const dummyUser = {
        id: `cust-${Date.now()}`,
        email: email.trim().toLowerCase(),
        name: email.split("@")[0],
        role: "customer",
        created_at: new Date().toISOString(),
      };
      mockDb.auth.setUser(dummyUser);
      setUser(dummyUser);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || (isAr ? "فشل تسجيل الدخول" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await dbService.auth.signInWithGoogle();
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <PremiumLayout hideFooter>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-black">
        <div className="w-full max-w-md glass-gold p-8 md:p-10 space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div className="flex justify-center">
            <Logo showDescriptor />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif text-[#F5F0E8]">{isAr ? "تسجيل الدخول" : "Sign In"}</h1>
            <p className="text-xs text-gray-500">
              {isAr ? "الوصول لعروض الأسعار وحالة الطلبات والمستندات" : "Access quote requests, order status, documents & support"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-gold-base/15 rounded-lg py-2.5 px-3 text-[#F5F0E8] outline-none focus:border-gold-base"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-gold-base/15 rounded-lg py-2.5 px-3 text-[#F5F0E8] outline-none focus:border-gold-base"
              />
            </div>
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <PremiumButton type="submit" fullWidth disabled={loading} className="!rounded-lg">
              {loading ? "..." : isAr ? "دخول" : "Sign In"}
            </PremiumButton>
          </form>

          <p className="text-center text-[10px]">
            <button type="button" className="text-gray-500 hover:text-gold-base cursor-pointer">
              {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
            </button>
          </p>

          <div className="relative text-center text-[10px] text-gray-600 uppercase tracking-widest">
            <span className="bg-[#141414] px-2 relative z-10">{isAr ? "أو" : "or"}</span>
            <div className="absolute top-1/2 left-0 right-0 border-t border-gold-base/10" />
          </div>

          <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} />

          <p className="text-center text-xs text-gray-500">
            {isAr ? "ليس لديك حساب؟" : "No account?"}{" "}
            <Link to="/register" className="text-gold-base hover:underline">
              {isAr ? "إنشاء حساب" : "Create account"}
            </Link>
          </p>

          <p className="text-[9px] text-gray-600 text-center font-mono leading-relaxed pt-2 border-t border-gold-base/10">
            {isAr
              ? "الوصول مخصص لطلبات عروض الأسعار وحالة الطلبات والدعم — وليس منصة تداول."
              : "Access is for quote requests, order status, and client support — not a trading platform."}
          </p>
        </div>
      </div>
    </PremiumLayout>
  );
}

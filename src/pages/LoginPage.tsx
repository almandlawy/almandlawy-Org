import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import PremiumButton from "../components/premium/PremiumButton";
import GoogleSignInButton from "../components/premium/GoogleSignInButton";
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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md premium-card p-8 space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif text-white">{isAr ? "تسجيل الدخول" : "Sign In"}</h1>
            <p className="text-xs text-gray-500">{isAr ? "متابعة عروض الأسعار والطلبات" : "Track quotes, orders & KYC status"}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-sm py-2.5 px-3 text-white outline-none focus:border-gold-base" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">{isAr ? "كلمة المرور" : "Password"}</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-sm py-2.5 px-3 text-white outline-none focus:border-gold-base" />
            </div>
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <PremiumButton type="submit" fullWidth disabled={loading}>
              {loading ? "..." : isAr ? "دخول" : "Sign In"}
            </PremiumButton>
          </form>

          <div className="relative text-center text-[10px] text-gray-600 uppercase tracking-widest">
            <span className="bg-[#0e0e0e] px-2 relative z-10">{isAr ? "أو" : "or"}</span>
            <div className="absolute top-1/2 left-0 right-0 border-t border-white/10" />
          </div>

          <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} />

          <p className="text-center text-xs text-gray-500">
            {isAr ? "ليس لديك حساب؟" : "No account?"}{" "}
            <Link to="/register" className="text-gold-base hover:underline">{isAr ? "إنشاء حساب" : "Create account"}</Link>
          </p>
        </div>
      </div>
    </PremiumLayout>
  );
}

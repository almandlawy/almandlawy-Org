import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import PremiumButton from "../components/premium/PremiumButton";
import { mockDb } from "../lib/supabase";

export default function RegisterPage() {
  const { currentLang, setUser } = useApp();
  const isAr = currentLang === "ar";
  const navigate = useNavigate();
  const [clientType, setClientType] = useState<"individual" | "company">("individual");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      id: `cust-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name,
      phone,
      company: clientType === "company" ? company : undefined,
      role: "customer",
      created_at: new Date().toISOString(),
    };
    mockDb.auth.setUser(user);
    setUser(user);
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <PremiumLayout hideFooter>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg premium-card p-8 space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif text-white">{isAr ? "إنشاء حساب" : "Create Account"}</h1>
            <p className="text-xs text-gray-500">{isAr ? "تسجيل للوصول إلى لوحة العميل" : "Register for client dashboard access"}</p>
          </div>

          {success ? (
            <p className="text-center text-emerald-400 text-sm">{isAr ? "تم إنشاء الحساب!" : "Account created!"}</p>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded border border-white/10">
                {(["individual", "company"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setClientType(t)}
                    className={`py-2 text-xs uppercase tracking-wider rounded-sm cursor-pointer ${clientType === t ? "bg-gold-base text-black font-semibold" : "text-gray-400"}`}>
                    {t === "individual" ? (isAr ? "فرد" : "Individual") : (isAr ? "شركة" : "Company")}
                  </button>
                ))}
              </div>
              <input required placeholder={isAr ? "الاسم الكامل" : "Full name"} value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-sm py-2.5 px-3 text-white outline-none focus:border-gold-base" />
              <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-sm py-2.5 px-3 text-white outline-none focus:border-gold-base" />
              <input required type="tel" placeholder={isAr ? "الهاتف / واتساب" : "Phone / WhatsApp"} value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-sm py-2.5 px-3 text-white outline-none focus:border-gold-base" />
              {clientType === "company" && (
                <input required placeholder={isAr ? "اسم الشركة" : "Company name"} value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-sm py-2.5 px-3 text-white outline-none focus:border-gold-base" />
              )}
              <PremiumButton type="submit" fullWidth>{isAr ? "إنشاء حساب" : "Create Account"}</PremiumButton>
            </form>
          )}

          <p className="text-center text-xs text-gray-500">
            {isAr ? "لديك حساب؟" : "Have an account?"}{" "}
            <Link to="/login" className="text-gold-base hover:underline">{isAr ? "دخول" : "Sign in"}</Link>
          </p>
        </div>
      </div>
    </PremiumLayout>
  );
}

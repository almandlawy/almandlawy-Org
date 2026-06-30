import { Link } from "react-router-dom";
import { Shield, FileCheck, Truck, Warehouse, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import SectionHeading from "../components/premium/SectionHeading";
import PremiumButton from "../components/premium/PremiumButton";
import PartnerLogos from "../components/premium/PartnerLogos";
import GoogleSignInButton from "../components/premium/GoogleSignInButton";
import LiveMarket from "../components/LiveMarket";
import { dbService } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { currentLang, rates, selectedCurrency, setSelectedCurrency, isRefreshing, fetchRates } = useApp();
  const isAr = currentLang === "ar";
  const navigate = useNavigate();

  const products = [
    { to: "/gold-bars", img: "/gold_bar_luxury_1782445126673.jpg", en: "Gold Bars", ar: "سبائك الذهب", desc_en: "LBMA-accredited cast and minted bars", desc_ar: "سبائك مصبوبة ومصكوكة معتمدة" },
    { to: "/silver-bars", img: "/silver_bar_luxury_1782445139922.jpg", en: "Silver Bars", ar: "سبائك الفضة", desc_en: "High-purity silver bullion bars", desc_ar: "سبائك فضة عالية النقاء" },
    { to: "/bullion-coins", img: "/gold_bar_luxury_1782445126673.jpg", en: "Bullion Coins", ar: "مسكوكات ذهب وفضة", desc_en: "Sovereign mint bullion coins", desc_ar: "مسكوكات من دور السك المعتمدة" },
    { to: "/custom-inquiry", img: "/dubai_skyline_gold_1782445111463.jpg", en: "Custom Inquiry", ar: "استفسار مخصص", desc_en: "Bespoke bullion procurement requests", desc_ar: "طلبات سبائك مخصصة" },
  ];

  const steps = [
    { icon: Shield, en: "KYC / AML Review", ar: "مراجعة KYC / AML" },
    { icon: FileCheck, en: "Firm Quote Confirmation", ar: "تأكيد عرض السعر" },
    { icon: Truck, en: "Delivery / Collection", ar: "التسليم / الاستلام" },
    { icon: Warehouse, en: "Allocated Storage Request", ar: "طلب تخزين مخصص" },
  ];

  const handleGoogle = async () => {
    try {
      await dbService.auth.signInWithGoogle();
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 premium-hero-glow" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/95 to-[#070707]/40 z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 z-0">
          <img src="/gold_bar_luxury_1782445126673.jpg" alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#070707] via-transparent to-transparent" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 py-20 grid md:grid-cols-2 gap-12 items-center w-full" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div className="space-y-6 animate-fadeIn">
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-gold-base">
              {isAr ? "مكتب عروض السبائك — دبي" : "Dubai Bullion Quote Desk"}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-serif text-white leading-[1.12] font-medium">
              {isAr ? (
                <>مكتب <span className="text-gold-gradient">PGR UAE</span> للمعادن الثمينة والسبائك</>
              ) : (
                <>Dubai <span className="text-gold-gradient">Precious Metals</span> & Bullion Quote Desk</>
              )}
            </h1>
            <p className="text-gold-base/90 text-sm font-arabic">
              {isAr ? "أسعار مباشرة. عروض مؤكدة. تنفيذ آمن." : "Live prices. Firm quotes. Secure execution."}
            </p>
            <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
              {isAr
                ? "اطلب عروض أسعار مؤكدة للذهب والفضة والسبائك الفعلية. مراجعة KYC/AML وتأكيد نهائي من المكتب."
                : "Request firm quotes for physical gold, silver, and bullion. KYC/AML review and final desk confirmation."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <PremiumButton to="/request-quote">{isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}</PremiumButton>
              <PremiumButton href="https://wa.me/971559688837" variant="whatsapp">
                {isAr ? "واتساب المكتب" : "WhatsApp Desk"}
              </PremiumButton>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE MARKET */}
      <div id="market">
        <LiveMarket
          currentLang={currentLang}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onChangeCurrency={setSelectedCurrency}
          onRefresh={fetchRates}
          isRefreshing={isRefreshing}
          onOpenQuote={() => navigate("/request-quote")}
        />
        <div className="text-center pb-8 -mt-8">
          <Link to="/#market" className="text-xs text-gold-base font-mono uppercase tracking-widest hover:underline">
            {isAr ? "عرض جميع الأسواق" : "View all markets"} →
          </Link>
        </div>
      </div>

      {/* OUR PRODUCTS */}
      <section className="py-20 px-4 md:px-8 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow={isAr ? "منتجاتنا" : "Our Products"}
            title={isAr ? "سبائك ومسكوكات معتمدة" : "Accredited Bullion Products"}
            subtitle={isAr ? "اختر فئة المنتج واطلب عرض سعر مؤكد من المكتب." : "Select a product category and request a firm quote from our desk."}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <Link key={p.to} to={p.to} className="premium-card overflow-hidden group">
                <div className="h-40 overflow-hidden">
                  <img src={p.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-serif text-white text-lg">{isAr ? p.ar : p.en}</h3>
                  <p className="text-xs text-gray-500">{isAr ? p.desc_ar : p.desc_en}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gold-base uppercase tracking-widest font-mono">
                    {isAr ? "طلب عرض سعر" : "Request Quote"} <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 md:px-8 bg-[#0a0a0a] border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow={isAr ? "كيف يعمل" : "How It Works"} title={isAr ? "من الاستفسار إلى التسليم" : "From Inquiry to Delivery"} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="premium-card p-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-sm bg-gold-dark/15 border border-gold-base/20 flex items-center justify-center text-gold-base">
                  <s.icon size={20} />
                </div>
                <p className="text-sm text-white font-medium">{isAr ? s.ar : s.en}</p>
                <span className="text-[10px] text-gray-600 font-mono">0{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGN IN BLOCK */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-md mx-auto premium-card p-8 space-y-5 text-center">
          <h3 className="text-xl font-serif text-white">{isAr ? "مرحباً بعودتك" : "Welcome Back"}</h3>
          <p className="text-xs text-gray-500">{isAr ? "سجّل الدخول لمتابعة عروض الأسعار والطلبات." : "Sign in to track quotes, orders, and KYC status."}</p>
          <PremiumButton to="/login" fullWidth>{isAr ? "تسجيل الدخول" : "Sign In"}</PremiumButton>
          <GoogleSignInButton onClick={handleGoogle} />
          <p className="text-xs text-gray-500">
            {isAr ? "ليس لديك حساب؟" : "No account?"}{" "}
            <Link to="/register" className="text-gold-base hover:underline">{isAr ? "إنشاء حساب" : "Create account"}</Link>
          </p>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-16 px-4 md:px-8 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow={isAr ? "شركاؤنا" : "Trusted By"} title={isAr ? "علامات ومصافي معتمدة" : "Accredited Global Partners"} />
          <PartnerLogos />
        </div>
      </section>
    </>
  );
}

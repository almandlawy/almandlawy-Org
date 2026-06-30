import { Link } from "react-router-dom";
import { Shield, FileCheck, CreditCard, Truck, Warehouse, BarChart3, Lock, ArrowRight } from "lucide-react";
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
    {
      to: "/gold-bars",
      img: "/gold_bar_luxury_1782445126673.jpg",
      en: "Gold Bars",
      ar: "سبائك الذهب",
      desc_en: "LBMA accredited gold bars from world-renowned refiners.",
      desc_ar: "سبائك ذهب معتمدة من مصافي عالمية مرموقة.",
    },
    {
      to: "/silver-bars",
      img: "/silver_bar_luxury_1782445139922.jpg",
      en: "Silver Bars",
      ar: "سبائك الفضة",
      desc_en: "Investment-grade silver bars in various sizes.",
      desc_ar: "سبائك فضة استثمارية بأحجام متعددة.",
    },
    {
      to: "/bullion-coins",
      img: "/gold_bar_luxury_1782445126673.jpg",
      en: "Bullion Coins",
      ar: "مسكوكات ذهب وفضة",
      desc_en: "Certified gold & silver coins from leading mints.",
      desc_ar: "مسكوكات ذهب وفضة معتمدة من دور السك الرائدة.",
    },
    {
      to: "/custom-inquiry",
      img: "/dubai_skyline_gold_1782445111463.jpg",
      en: "Custom Bullion Inquiry",
      ar: "استفسار سبائك مخصص",
      desc_en: "Can't find what you need? Request a custom quote.",
      desc_ar: "لم تجد ما تبحث عنه؟ اطلب عرض سعر مخصص.",
    },
  ];

  const steps = [
    { icon: Shield, en: "KYC Review", ar: "مراجعة KYC", desc_en: "Quick verification to open your account.", desc_ar: "تحقق سريع لفتح حسابك." },
    { icon: FileCheck, en: "Quote Confirmation", ar: "تأكيد عرض السعر", desc_en: "Receive firm quotes from our desk.", desc_ar: "استلم عروض أسعار مؤكدة من المكتب." },
    { icon: CreditCard, en: "Payment / Settlement", ar: "الدفع / التسوية", desc_en: "Settlement confirmed before execution.", desc_ar: "تأكيد التسوية قبل التنفيذ." },
    { icon: Truck, en: "Delivery / Collection", ar: "التسليم / الاستلام", desc_en: "Secure delivery or collection in Dubai.", desc_ar: "تسليم أو استلام آمن في دبي." },
    { icon: Warehouse, en: "Allocated Storage", ar: "التخزين المخصص", desc_en: "Request allocated storage for your metals.", desc_ar: "اطلب تخزيناً مخصصاً لمعادنك." },
  ];

  const trustBadges = [
    { icon: BarChart3, en: "Live Market Prices", ar: "أسعار السوق المباشرة" },
    { icon: FileCheck, en: "Quote Confirmation", ar: "تأكيد عرض السعر" },
    { icon: Lock, en: "Secure & Compliant", ar: "آمن ومتوافق" },
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
      <section className="relative min-h-[90vh] md:min-h-[92vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 premium-hero-glow" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/30 z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[55%] z-0">
          <img
            src="/gold_bar_luxury_1782445126673.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        <div
          className="relative z-20 max-w-[1400px] mx-auto px-4 md:px-8 py-24 md:py-20 grid md:grid-cols-2 gap-10 items-center w-full"
          style={{ direction: isAr ? "rtl" : "ltr" }}
        >
          <div className="space-y-5 md:space-y-6 animate-fadeIn order-2 md:order-1">
            <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-[3.4rem] font-serif text-[#F5F0E8] leading-[1.1] font-medium">
              {isAr ? (
                <>
                  مكتب أسعار المعادن الثمينة
                  <br />
                  <span className="text-gold-gradient">والسبائك في دبي</span>
                </>
              ) : (
                <>
                  Dubai Precious Metals
                  <br />
                  <span className="text-gold-gradient">& Bullion Quote Desk</span>
                </>
              )}
            </h1>
            <p className="text-gold-base/90 text-sm md:text-base font-arabic">
              {isAr ? "مكتب أسعار المعادن الثمينة والسبائك في دبي" : "مكتب أسعار المعادن الثمينة والسبائك في دبي"}
            </p>
            <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
              {isAr
                ? "أسعار مباشرة. عروض مؤكدة. تنفيذ آمن. مكتبك الموثوق لاستفسارات الذهب والفضة والبلاتين والبلاديوم."
                : "Live prices. Firm quotes. Secure execution. Your trusted desk for Gold, Silver, Platinum & Palladium inquiries."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <PremiumButton to="/request-quote" className="!rounded-lg">
                {isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}
              </PremiumButton>
              <PremiumButton href="https://wa.me/971559688837" variant="whatsapp" className="!rounded-lg">
                {isAr ? "واتساب المكتب" : "WhatsApp Desk"}
              </PremiumButton>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/[0.06]">
              {trustBadges.map((b) => (
                <div key={b.en} className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider">
                  <b.icon size={14} className="text-gold-base" />
                  {isAr ? b.ar : b.en}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block order-1 md:order-2" aria-hidden />
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
      </div>

      {/* OUR PRODUCTS */}
      <section className="py-16 md:py-24 px-4 md:px-8 border-t border-white/[0.04] bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading
            eyebrow={isAr ? "منتجاتنا" : "Our Products"}
            title={isAr ? "منتجات السبائك" : "Our Products"}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((p) => (
              <Link key={p.to} to={p.to} className="glass-gold overflow-hidden group">
                <div className="h-36 md:h-44 overflow-hidden relative">
                  <img
                    src={p.img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="p-5 space-y-2 relative">
                  <h3 className="font-serif text-[#F5F0E8] text-lg">{isAr ? p.ar : p.en}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{isAr ? p.desc_ar : p.desc_en}</p>
                  <span className="absolute bottom-5 right-5 text-gold-base opacity-60 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 px-4 md:px-8 border-y border-white/[0.04] bg-black">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow={isAr ? "كيف يعمل" : "How It Works"} title={isAr ? "من الاستفسار إلى التسليم" : "How It Works"} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="glass-gold p-5 text-center space-y-3 relative">
                <span className="absolute top-3 left-3 h-6 w-6 rounded-full bg-gold-base/15 border border-gold-base/30 text-[10px] font-mono text-gold-base flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="mx-auto h-11 w-11 rounded-lg bg-gold-dark/15 border border-gold-base/20 flex items-center justify-center text-gold-base mt-2">
                  <s.icon size={20} />
                </div>
                <p className="text-sm text-[#F5F0E8] font-medium">{isAr ? s.ar : s.en}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{isAr ? s.desc_ar : s.desc_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGN IN BLOCK */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#0a0a0a]">
        <div className="max-w-md mx-auto glass-gold p-8 md:p-10 space-y-5 text-center">
          <h3 className="text-xl md:text-2xl font-serif text-[#F5F0E8]">
            {isAr ? "مرحباً بعودتك" : "Welcome Back"}
          </h3>
          <p className="text-xs text-gray-500">
            {isAr ? "سجّل الدخول إلى حساب PGR UAE" : "Sign in to your PGR UAE account"}
          </p>
          <PremiumButton to="/login" fullWidth className="!rounded-lg">
            {isAr ? "تسجيل الدخول" : "Sign In"}
          </PremiumButton>
          <GoogleSignInButton onClick={handleGoogle} />
          <p className="text-xs text-gray-500">
            {isAr ? "جديد في PGR UAE؟" : "New to PGR UAE?"}{" "}
            <Link to="/register" className="text-gold-base hover:underline">
              {isAr ? "إنشاء حساب" : "Create an account"}
            </Link>
          </p>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-12 md:py-16 px-4 md:px-8 border-t border-white/[0.04] bg-black">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading
            eyebrow={isAr ? "مراجع المنتجات" : "Product References"}
            title={isAr ? "مصافي معترف بها عالمياً" : "Recognized Global Refiners"}
            subtitle={
              isAr
                ? "مراجع منتجات — وليس إعلان شراكة رسمية."
                : "Product references — not a claim of official partnership."
            }
          />
          <PartnerLogos />
        </div>
      </section>
    </>
  );
}

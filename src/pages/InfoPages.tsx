import { Link } from "react-router-dom";
import { Shield, AlertTriangle, HelpCircle, Mail, Phone, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import PremiumButton from "../components/premium/PremiumButton";
import SectionHeading from "../components/premium/SectionHeading";

const FAQ_ITEMS = [
  {
    q_en: "Is there VAT on gold bullion in Dubai, UAE?",
    q_ar: "هل يوجد ضريبة قيمة مضافة على سبائك الذهب في دبي؟",
    a_en: "VAT/tax treatment may vary depending on product type, customer status, delivery method, and applicable UAE rules. Any VAT, tax, or fee will be confirmed in the final quote before proceeding.",
    a_ar: "قد تختلف المعاملة الضريبية حسب نوع المنتج، حالة العميل، طريقة التسليم، والأنظمة المطبقة. سيتم توضيح أي ضريبة أو رسوم ضمن عرض السعر النهائي.",
  },
  {
    q_en: "Do you guarantee buyback?",
    q_ar: "هل تضمنون إعادة الشراء؟",
    a_en: "PGR UAE does not guarantee buyback. You may request a sell-back quote, subject to product verification, compliance checks, market conditions, fees, and final desk confirmation.",
    a_ar: "لا تقدم PGR UAE ضماناً لإعادة الشراء. يمكنك تقديم طلب عرض سعر لإعادة البيع، وتخضع أي عملية لتحقق المنتج، فحوصات الامتثال، ظروف السوق، وتأكيد المكتب النهائي.",
  },
  {
    q_en: "Are bullion products certified?",
    q_ar: "هل المنتجات معتمدة؟",
    a_en: "Gold and silver bullion is sourced from accredited global refineries with assay certificates and product specifications, subject to availability and desk verification.",
    a_ar: "يتم توفير سبائك الذهب والفضة من مصافي عالمية معتمدة مع شهادات فحص ومواصفات المنتج حسب التوفر والتحقق من المكتب.",
  },
  {
    q_en: "What is allocated storage?",
    q_ar: "ما هو التخزين المخصص؟",
    a_en: "Allocated storage means your physical bullion is held in segregated, identified form — not as a cash balance or digital wallet. Request storage through our desk after KYC/AML review.",
    a_ar: "التخزين المخصص يعني أن سبائكك الفعلية محفوظة بشكل منفصل ومحدد — وليس كرصيد نقدي أو محفظة رقمية. اطلب التخزين عبر المكتب بعد مراجعة KYC/AML.",
  },
];

export function AllocatedStoragePage() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  const points = [
    {
      en: "Physical bullion held in segregated, allocated form — identified to you.",
      ar: "سبائك فعلية محفوظة بشكل منفصل ومخصص — مرتبطة بك.",
    },
    {
      en: "For clients who have completed KYC/AML review and confirmed purchases.",
      ar: "للعملاء الذين أكملوا مراجعة KYC/AML وأكدوا عمليات الشراء.",
    },
    {
      en: "Indicative market value references only — not a cash balance.",
      ar: "مراجع قيمة سوقية إرشادية فقط — وليست رصيداً نقدياً.",
    },
    {
      en: "Sell-back requires a separate quote request and desk confirmation.",
      ar: "إعادة البيع تتطلب طلب عرض سعر منفصل وتأكيداً من المكتب.",
    },
  ];

  return (
    <PremiumLayout>
      <section className="page-hero border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-gold-base">
            {isAr ? "التخزين المخصص" : "Allocated Bullion Storage"}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-white">
            {isAr ? "طلب تخزين سبائك مخصص" : "Allocated Bullion Storage Request"}
          </h1>
          <p className="text-sm text-gray-400">
            {isAr
              ? "تخزين آمن للسبائك الفعلية — ليس محفظة ولا رصيداً نقدياً."
              : "Secure storage for physical bullion — not a wallet or cash balance."}
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto space-y-8" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="premium-card p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-serif text-white">
            {isAr ? "ما هو التخزين المخصص؟" : "What is Allocated Storage?"}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {isAr
              ? "التخزين المخصص يعني أن سبائك الذهب أو الفضة الفعلية محفوظة بشكل منفصل ومحدد لك في مرافق معتمدة. لا يتم تمثيلها كرصيد نقدي أو حساب استثماري."
              : "Allocated storage means your physical gold or silver bullion is held in segregated, identified form at accredited facilities. It is not represented as a cash balance or investment account."}
          </p>
          <ul className="space-y-3">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3 text-xs text-gray-400">
                <Shield size={14} className="text-gold-base shrink-0 mt-0.5" />
                {isAr ? p.ar : p.en}
              </li>
            ))}
          </ul>
        </div>

        <div className="premium-card p-6 border-amber-500/10">
          <p className="text-xs text-gray-500">
            {isAr
              ? "القيمة السوقية المعروضة إرشادية فقط. لطلب إعادة بيع، قدّم طلب عرض سعر إعادة بيع منفصل."
              : "Displayed market value is indicative only. To sell back, submit a separate sell-back quote request."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <PremiumButton to="/request-quote?product=Allocated%20Storage">
            {isAr ? "طلب تخزين مخصص" : "Request Storage"}
          </PremiumButton>
          <PremiumButton to="/sell-back" variant="outline">
            {isAr ? "عرض إعادة بيع" : "Sell-Back Quote"}
          </PremiumButton>
        </div>
      </section>
    </PremiumLayout>
  );
}

export function SellBackPage() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  return (
    <PremiumLayout>
      <section className="page-hero border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-gold-base">
            {isAr ? "إعادة البيع" : "Sell-Back Quote"}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-white">
            {isAr ? "طلب عرض سعر لإعادة البيع" : "Request Sell-Back Quote"}
          </h1>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="premium-card p-6 space-y-4">
          <p className="text-sm text-gray-400">
            {isAr
              ? "يمكن للعملاء تقديم طلب عرض سعر لإعادة بيع السبائك الفعلية التي اشتروها أو خزنوها عبر PGR UAE."
              : "Customers may request a sell-back quote for physical bullion purchased or stored through PGR UAE."}
          </p>
          <ul className="space-y-3 text-xs text-gray-500">
            <li className="flex gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              {isAr ? "لا يوجد ضمان لإعادة الشراء." : "No guaranteed buyback."}
            </li>
            <li className="flex gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              {isAr ? "لا يوجد صرف نقدي فوري." : "No instant cash out."}
            </li>
            <li className="flex gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              {isAr ? "يتطلب تأكيداً نهائياً من المكتب." : "Final desk confirmation required."}
            </li>
          </ul>
        </div>
        <PremiumButton to="/request-quote?product=Sell-Back%20Quote">
          {isAr ? "طلب عرض سعر إعادة بيع" : "Request Sell-Back Quote"}
        </PremiumButton>
      </section>
    </PremiumLayout>
  );
}

export function FaqPage() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  return (
    <PremiumLayout>
      <section className="page-hero border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center px-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <HelpCircle className="mx-auto text-gold-base mb-4" size={32} />
          <h1 className="text-3xl md:text-4xl font-serif text-white">
            {isAr ? "الأسئلة الشائعة" : "Bullion Quote Desk FAQ"}
          </h1>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto space-y-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="premium-card p-5 space-y-2">
            <h2 className="text-sm font-medium text-white">{isAr ? item.q_ar : item.q_en}</h2>
            <p className="text-xs text-gray-400 leading-relaxed">{isAr ? item.a_ar : item.a_en}</p>
          </div>
        ))}
        <div className="text-center pt-6">
          <PremiumButton to="/request-quote">{isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}</PremiumButton>
        </div>
      </section>
    </PremiumLayout>
  );
}

export function ContactPage() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  return (
    <PremiumLayout>
      <section className="page-hero border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <h1 className="text-3xl md:text-4xl font-serif text-white">{isAr ? "تواصل معنا" : "Contact PGR UAE Desk"}</h1>
          <p className="text-sm text-gray-400">
            {isAr ? "مكتب عروض السبائك والمعادن الثمينة — دبي" : "Precious Metals & Bullion Quote Desk — Dubai"}
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-2xl mx-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="premium-card p-8 space-y-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Phone size={18} className="text-gold-base" />
            <a href="tel:+971559688837" className="hover:text-white">+971 55 968 8837</a>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Mail size={18} className="text-gold-base" />
            <a href="mailto:desk@pgruae.com" className="hover:text-white">desk@pgruae.com</a>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-300">
            <MapPin size={18} className="text-gold-base shrink-0 mt-0.5" />
            <span>Almas Tower, Dubai Marina, UAE</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <PremiumButton href="https://wa.me/971559688837" variant="whatsapp" fullWidth>
              WhatsApp Desk
            </PremiumButton>
            <PremiumButton to="/request-quote" fullWidth>
              {isAr ? "طلب عرض سعر" : "Request Quote"}
            </PremiumButton>
          </div>
        </div>
      </section>
    </PremiumLayout>
  );
}

export function CompliancePage() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  const links = [
    { to: "/kyc-aml-policy", en: "KYC / AML Policy", ar: "سياسة KYC / AML" },
    { to: "/pricing-disclaimer", en: "Pricing Disclaimer", ar: "إخلاء مسؤولية الأسعار" },
    { to: "/risk-disclosure", en: "Risk Disclosure", ar: "إفصاح المخاطر" },
    { to: "/allocated-storage-terms", en: "Storage Terms", ar: "شروط التخزين" },
    { to: "/sell-back-policy", en: "Sell-Back Policy", ar: "سياسة إعادة البيع" },
    { to: "/terms", en: "Terms of Service", ar: "شروط الخدمة" },
    { to: "/privacy-policy", en: "Privacy Policy", ar: "سياسة الخصوصية" },
  ];

  return (
    <PremiumLayout>
      <section className="page-hero border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <Shield className="mx-auto text-gold-base mb-2" size={36} />
          <h1 className="text-3xl md:text-4xl font-serif text-white">
            {isAr ? "الامتثال والحوكمة" : "Compliance & Governance"}
          </h1>
          <p className="text-sm text-gray-400">
            {isAr
              ? "PGR UAE مكتب عروض أسعار للسبائك الفعلية — ليس منصة تداول."
              : "PGR UAE is a physical bullion quote desk — not a trading platform."}
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="grid sm:grid-cols-2 gap-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="premium-card p-4 text-sm text-gray-300 hover:text-gold-base transition-colors"
            >
              {isAr ? l.ar : l.en}
            </Link>
          ))}
        </div>
      </section>
    </PremiumLayout>
  );
}

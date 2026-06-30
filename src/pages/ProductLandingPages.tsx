import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import PremiumButton from "../components/premium/PremiumButton";
import SectionHeading from "../components/premium/SectionHeading";

interface ProductLandingConfig {
  slug: string;
  heroImage: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  sizesEn: string[];
  sizesAr: string[];
  prefilledProduct: string;
}

const CONFIGS: Record<string, ProductLandingConfig> = {
  "gold-bars": {
    slug: "gold-bars",
    heroImage: "/gold_bar_luxury_1782445126673.jpg",
    titleEn: "Gold Bars",
    titleAr: "سبائك الذهب",
    subtitleEn: "Request firm quotes for LBMA-accredited gold bars from 1g to 1kg. Indicative market prices — final desk confirmation required.",
    subtitleAr: "اطلب عروض أسعار مؤكدة لسبائك الذهب المعتمدة من ١ غرام إلى ١ كيلو. أسعار إرشادية — تأكيد نهائي من المكتب.",
    sizesEn: ["1g", "2.5g", "5g", "10g", "20g", "50g", "100g", "250g", "500g", "1kg"],
    sizesAr: ["١غ", "٢.٥غ", "٥غ", "١٠غ", "٢٠غ", "٥٠غ", "١٠٠غ", "٢٥٠غ", "٥٠٠غ", "١كغ"],
    prefilledProduct: "Gold Bar",
  },
  "silver-bars": {
    slug: "silver-bars",
    heroImage: "/silver_bar_luxury_1782445139922.jpg",
    titleEn: "Silver Bars",
    titleAr: "سبائك الفضة",
    subtitleEn: "Physical silver bullion bars for collection, storage, and delivery. Request a firm quote for availability and premiums.",
    subtitleAr: "سبائك فضة فعلية للتخزين والتسليم. اطلب عرض سعر مؤكد للتوفر والهامش.",
    sizesEn: ["100g", "250g", "500g", "1kg", "5kg", "15kg", "30kg", "100oz"],
    sizesAr: ["١٠٠غ", "٢٥٠غ", "٥٠٠غ", "١كغ", "٥كغ", "١٥كغ", "٣٠كغ", "١٠٠ أونصة"],
    prefilledProduct: "Silver Bar",
  },
  "bullion-coins": {
    slug: "bullion-coins",
    heroImage: "/gold_bar_luxury_1782445126673.jpg",
    titleEn: "Bullion Coins",
    titleAr: "مسكوكات ذهب وفضة",
    subtitleEn: "Sovereign mint bullion coins including Maple Leaf, Britannia, and Krugerrand. Firm quotes on request.",
    subtitleAr: "مسكوكات ذهب وفضة من دور السك السيادية. عروض أسعار مؤكدة عند الطلب.",
    sizesEn: ["1/10 oz", "1/4 oz", "1/2 oz", "1 oz"],
    sizesAr: ["١/١٠ أونصة", "١/٤ أونصة", "١/٢ أونصة", "١ أونصة"],
    prefilledProduct: "Bullion Coin",
  },
  "custom-inquiry": {
    slug: "custom-inquiry",
    heroImage: "/dubai_skyline_gold_1782445111463.jpg",
    titleEn: "Custom Bullion Inquiry",
    titleAr: "استفسار سبائك مخصص",
    subtitleEn: "Corporate, wholesale, and bespoke bullion inquiries. Our desk will review specifications and issue a firm quote.",
    subtitleAr: "استفسارات الشركات والجملة والسبائك المخصصة. يراجع المكتب المواصفات ويصدر عرض سعر مؤكد.",
    sizesEn: ["Wholesale lots", "Corporate orders", "Custom weights", "Multi-metal"],
    sizesAr: ["كميات جملة", "طلبات شركات", "أوزان مخصصة", "معادن متعددة"],
    prefilledProduct: "Custom Bullion Inquiry",
  },
};

export function ProductLandingPage({ slug }: { slug: keyof typeof CONFIGS }) {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";
  const c = CONFIGS[slug];
  const sizes = isAr ? c.sizesAr : c.sizesEn;

  return (
    <PremiumLayout>
      <section className="relative page-hero overflow-hidden">
        <div className="absolute inset-0">
          <img src={c.heroImage} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/90 to-[#070707]/70" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-5 px-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-gold-base">PGR UAE</span>
          <h1 className="text-3xl md:text-5xl font-serif text-white">{isAr ? c.titleAr : c.titleEn}</h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">{isAr ? c.subtitleAr : c.subtitleEn}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <PremiumButton to={`/request-quote?product=${encodeURIComponent(c.prefilledProduct)}`}>
              {isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}
            </PremiumButton>
            <PremiumButton href="https://wa.me/971559688837" variant="whatsapp">WhatsApp</PremiumButton>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
        <SectionHeading
          align="left"
          eyebrow={isAr ? "الأحجام" : "Sizes & Types"}
          title={isAr ? "خيارات متاحة عند الطلب" : "Available on Request"}
          subtitle={isAr ? "الأسعار إرشادية. يتم تأكيد التوفر والسعر النهائي من المكتب." : "Prices are indicative. Availability and final pricing confirmed by desk."}
        />
        <div className="flex flex-wrap gap-2 mb-10">
          {sizes.map((s) => (
            <span key={s} className="px-3 py-1.5 text-xs font-mono border border-white/10 rounded-sm text-gray-300 bg-white/[0.02]">{s}</span>
          ))}
        </div>

        <div className="premium-card p-6 space-y-3 text-xs text-gray-500">
          <p>
            {isAr
              ? "PGR UAE ليس منصة تداول أو محفظة. نحن مكتب عروض أسعار للسبائك الفعلية مع مراجعة KYC/AML."
              : "PGR UAE is not a trading platform or wallet. We are a physical bullion quote desk with KYC/AML review."}
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <PremiumButton to="/faq" variant="outline">{isAr ? "الأسئلة الشائعة" : "FAQ"}</PremiumButton>
          <PremiumButton to="/compliance" variant="ghost">{isAr ? "الامتثال" : "Compliance"}</PremiumButton>
        </div>
      </section>
    </PremiumLayout>
  );
}

export default function ProductLandingPages({ slug }: { slug: keyof typeof CONFIGS }) {
  return <ProductLandingPage slug={slug} />;
}

export function GoldBarsPage() {
  return <ProductLandingPage slug="gold-bars" />;
}

export function SilverBarsPage() {
  return <ProductLandingPage slug="silver-bars" />;
}

export function BullionCoinsPage() {
  return <ProductLandingPage slug="bullion-coins" />;
}

export function CustomInquiryPage() {
  return <ProductLandingPage slug="custom-inquiry" />;
}

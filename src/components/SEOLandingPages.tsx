/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Shield, Phone, MessageSquare, ArrowRight, ChevronDown, Award, Landmark, CheckCircle, FileText } from "lucide-react";
import { LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import { resolvePublicCatalog } from "../lib/productCatalog";
import MetalCalculator from "./MetalCalculator";
import {
  getSpotUsdOz,
  getFxRate,
  usdOunceToGramLocal,
  usdOunceToLocal,
  OUNCE_TO_GRAM,
  GRAMS_PER_KG,
  getPriceStatusLabel,
} from "../lib/marketReference";

const IRAQ_SEO_PAGES: Record<
  string,
  {
    badgeEn: string;
    badgeAr: string;
    titleEn: string;
    titleAr: string;
    descEn: string;
    descAr: string;
    ctaEn: string;
    ctaAr: string;
    productFilter: "silver" | "gold" | "all";
  }
> = {
  "/silver-bars-iraq": {
    badgeEn: "DUBAI → IRAQ SILVER",
    badgeAr: "فضة دبي → العراق",
    titleEn: "Silver Bars for Iraq | SAM & PALM from Dubai",
    titleAr: "سبائك الفضة للعراق | SAM وPALM من دبي",
    descEn:
      "Request desk-confirmed SAM and PALM silver bar quotes for Iraq. 500g and 1kg weights most requested for Baghdad, Basra, and Erbil delivery corridors.",
    descAr:
      "اطلب عروض أسعار سبائك فضة SAM وPALM للعراق. أوزان 500 جرام و1 كيلو الأكثر طلباً لمسارات بغداد والبصرة وأربيل.",
    ctaEn: "Request Iraq Silver Quote",
    ctaAr: "طلب عرض فضة للعراق",
    productFilter: "silver",
  },
  "/sam-palm-silver-iraq": {
    badgeEn: "SAM & PALM SILVER IRAQ",
    badgeAr: "فضة SAM وPALM للعراق",
    titleEn: "SAM & PALM Silver for Iraqi Customers",
    titleAr: "فضة SAM وPALM للعملاء العراقيين",
    descEn:
      "999.9 fine SAM and PALM cast silver bars sourced in Dubai for Iraqi buyers. Indicative reference only — final quote confirmed by PGR UAE desk.",
    descAr:
      "سبائك فضة SAM وPALM 999.9 من دبي للمشترين العراقيين. مرجع استرشادي فقط — عرض السعر النهائي من مكتب PGR UAE.",
    ctaEn: "Request SAM / PALM Quote",
    ctaAr: "طلب عرض SAM / PALM",
    productFilter: "silver",
  },
  "/gold-bars-baghdad": {
    badgeEn: "GOLD FOR BAGHDAD",
    badgeAr: "ذهب لبغداد",
    titleEn: "Gold Bars for Baghdad | Dubai Desk to Iraq",
    titleAr: "سبائك الذهب لبغداد | مكتب دبي إلى العراق",
    descEn:
      "Physical 24K gold bar quotes for Baghdad and central Iraq. PGR UAE Dubai desk handles compliance review and desk-confirmed pricing before settlement.",
    descAr:
      "عروض أسعار سبائك ذهب 24 قيراط لبغداد ووسط العراق. مكتب PGR UAE دبي يتولى مراجعة الامتثال والتسعير المؤكد قبل التسوية.",
    ctaEn: "Request Baghdad Gold Quote",
    ctaAr: "طلب عرض ذهب لبغداد",
    productFilter: "gold",
  },
  "/silver-bars-erbil": {
    badgeEn: "SILVER FOR ERBIL",
    badgeAr: "فضة لأربيل",
    titleEn: "Silver Bars for Erbil & Kurdistan",
    titleAr: "سبائك الفضة لأربيل وكردستان",
    descEn:
      "SAM and PALM silver bar quotes for Erbil and Kurdistan region. Desk-confirmed quote from PGR UAE Dubai with indicative IQD reference pricing.",
    descAr:
      "عروض أسعار سبائك فضة SAM وPALM لأربيل وإقليم كردستان. عرض مؤكد من مكتب PGR UAE دبي مع مرجع تسعير بالدينار.",
    ctaEn: "Request Erbil Silver Quote",
    ctaAr: "طلب عرض فضة لأربيل",
    productFilter: "silver",
  },
  "/bullion-desk-iraq": {
    badgeEn: "UAE → IRAQ BULLION DESK",
    badgeAr: "مكتب السبائك دبي → العراق",
    titleEn: "Bullion Desk for Iraqi Customers",
    titleAr: "مكتب السبائك للعملاء العراقيين",
    descEn:
      "PGR UAE connects Iraqi investors with accredited Dubai bullion supply. Physical gold and silver only — indicative market reference, desk-confirmed final quote.",
    descAr:
      "يربط PGR UAE المستثمرين العراقيين بتوريد السبائك المعتمد في دبي. ذهب وفضة مادي فقط — مرجع استرشادي وعرض نهائي مؤكد من المكتب.",
    ctaEn: "Contact Iraq Desk",
    ctaAr: "تواصل مع مكتب العراق",
    productFilter: "all",
  },
};

interface SEOLandingPagesProps {
  currentPath: string;
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onNavigate: (path: string) => void;
  onOpenQuote: (productName?: string) => void;
}

export default function SEOLandingPages({
  currentPath,
  currentLang,
  rates,
  selectedCurrency,
  onNavigate,
  onOpenQuote
}: SEOLandingPagesProps) {
  const isAr = currentLang === "ar";
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Set page-specific titles, descriptions, and JSON-LD schemas
  useEffect(() => {
    let title = "PGR UAE Precious Metals & Bullion Quote Desk";
    let desc = "PGR UAE Dubai physical gold and silver bullion purchase inquiry and allocated storage platform.";
    let faqSchema: any = null;

    if (currentPath === "/buy-gold-bars-dubai") {
      title = isAr ? "شراء سبائك الذهب في دبي | أسعار منافسة ومعتمدة PGR UAE" : "Buy Gold Bars in Dubai | LBMA Accredited Bullion PGR UAE";
      desc = isAr 
        ? "احصل على أفضل تسعير لسبائك الذهب النقية عيار ٢٤ قيراط في دبي. نوفر سبائك معتمدة دولياً من كبرى المصافي السويسرية والإماراتية مع تأكيد السعر الفوري."
        : "Secure premium physical gold bars in Dubai at unmatched spot premiums. Inquire today for certified PAMP Suisse, Valcambi, and Emirates Gold bars.";
      
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": isAr ? "هل سبائك الذهب في دبي معفاة من الضرائب؟" : "Are gold bars in Dubai tax-free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": isAr 
                ? "نعم، سبائك الذهب الاستثمارية ذات النقاوة 99.9% فما فوق معفاة تماماً من ضريبة القيمة المضافة (VAT) في دولة الإمارات."
                : "Yes, fine gold bars with a purity of 99% or higher may be exempt from Value Added Tax (VAT) in the UAE. Confirm with the desk."
            }
          },
          {
            "@type": "Question",
            "name": isAr ? "ما هي كبرى مصافي الذهب المعتمدة التي توفرها PGR؟" : "Which accredited refineries does PGR provide?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": isAr 
                ? "نوفر منتجات معتمدة من PAMP Suisse وValcambi وEmirates Gold وSAM Precious Metals وAl Etihad Gold المصنفة كأعضاء معتمدين."
                : "We supply certified bullion from PAMP Suisse, Valcambi, Emirates Gold, SAM, and Al Etihad Gold, which are fully recognized globally."
            }
          }
        ]
      };
    } else if (currentPath === "/buy-silver-bars-dubai") {
      title = isAr ? "شراء سبائك الفضة في دبي | فضة نقية PGR UAE" : "Buy Silver Bars in Dubai | Physical Silver Bullion PGR UAE";
      desc = isAr 
        ? "تصفح واطلب سبائك الفضة الاستثمارية النقية فئة ١٠٠ جرام و٥٠٠ جرام و١ كيلو في دبي بأسعار تداول حقيقية وعلاوات ممتازة."
        : "Secure bulk physical silver bars and coins in Dubai with secure collection. Offering 100g, 500g, and 1kg fine silver bullion from top mints.";
      
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": isAr ? "ما هي الأوزان المتاحة لسبائك الفضة؟" : "What weights are available for silver bars?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": isAr 
                ? "نوفر أوزان تبدأ من أونصة واحدة، ١٠٠ جرام، ٥٠٠ جرام، وسبائك صناعية واستثمارية ثقيلة بوزن ١ كيلوجرام بنقاوة ٩٩.٩٪."
                : "We supply physical silver starting from 1 oz, 100g, 500g, up to 1kg cast bars with 99.9% fine silver certification."
            }
          }
        ]
      };
    } else if (currentPath === "/gold-rate-dubai-today") {
      title = isAr ? "سعر الذهب اليوم في دبي مباشر | أسعار السبائك والعيارات PGR UAE" : "Gold Rate Dubai Today | Live Spot Prices & Custom Calculations";
      desc = isAr 
        ? "تحديث فوري لأسعار الذهب عيار ٢٤ قيراط، ٢٢ قيراط، ٢١ قيراط في دبي. احسب قيمة سبائكك بناءً على أسعار البورصة العالمية والعمولة."
        : "Monitor today's official live gold rates in Dubai. Calculate exact melt value for 24K, 22K, 21K, and 18K gold based on live global spot feeds.";
    } else if (currentPath === "/silver-rate-dubai-today") {
      title = isAr ? "سعر الفضة اليوم في دبي مباشر | سعر مسبوكات الفضة PGR UAE" : "Silver Rate Dubai Today | Live Silver Bullion Prices Dubai";
      desc = isAr 
        ? "تابع أسعار الفضة المباشرة في دبي اليوم لجميع العيارات والنقاوات الفاخرة. استعن بالحاسبة الذكية لتقدير قيم مبيعاتك وشراءك."
        : "Live physical silver rates in Dubai today. Track spot prices per ounce and per gram in AED, USD, SAR, and EUR with direct desk quote access.";
    } else if (currentPath === "/sell-gold-dubai") {
      title = isAr ? "بيع הذهب والسبائك في دبي | برنامج الشراء والاسترداد PGR UAE" : "Sell Gold in Dubai | Bullion Sell-Back & Liquidations Dubai";
      desc = isAr 
        ? "احصل على أفضل عروض أسعار البيع المرتجع لسبائك الذهب والفضة في دبي. سيولة فورية وعلاوات تسييل عادلة ومطابقة للأنظمة والقوانين."
        : "Liquidate your gold bars and silver bullion in Dubai with maximum transparency. Our premier sell-back desk provides immediate, compliant liquidity.";
    } else if (currentPath === "/bullion-desk-dubai") {
      title = isAr ? "مكتب السبائك في دبي | PGR UAE" : "Physical Bullion Desk Dubai | Secure Metal Quote Desk PGR UAE";
      desc = isAr
        ? "تعرف على مكتب PGR UAE في دبي، شريكك الموثوق لتوفير سبائك المعادن الثمينة والشحن المؤمن والتخزين المخصص."
        : "Discover Dubai's physical gold and silver quote desk. Secure allocations, wholesale bullion inquiries, and allocated custody options.";
    } else if (currentPath === "/allocated-storage-dubai") {
      title = isAr ? "تخزين الذهب المخصص دبي | خزائن ومستودعات مؤمنة PGR UAE" : "Allocated Gold Storage Dubai | Vaulting and Segregated Custody";
      desc = isAr 
        ? "خدمات حفظ وتخزين الذهب والفضة المخصصة والمؤمنة بالكامل في خزائن دبي العالمية بالتعاون مع كبرى الشركات الأمنية العالمية."
        : "Protect your physical gold and silver assets with fully allocated, segregated vaulting in Dubai. Audited storage with global security leaders.";
    } else if (currentPath === "/24k-gold-bars-uae") {
      title = isAr ? "سبائك ذهب عيار ٢٤ في الإمارات | أسعار السبائك المعتمدة PGR UAE" : "24K Gold Bars UAE | Accredited Pure Bullion Dubai";
      desc = isAr 
        ? "اطلب سبائك الذهب الخالص عيار ٢٤ قيراط بنقاوة 999.9 في دبي وأبوظبي. نوفر الأوزان من ١ جرام إلى ١ كيلوجرام مع شهادات أصالة دولية."
        : "Order accredited gold bars in the UAE with firm-quote desk transparency. High-liquidity minted gold bars from accredited international refiners.";
    } else if (IRAQ_SEO_PAGES[currentPath]) {
      const iraqMeta = IRAQ_SEO_PAGES[currentPath];
      title = isAr ? iraqMeta.titleAr : iraqMeta.titleEn;
      desc = isAr ? iraqMeta.descAr : iraqMeta.descEn;
    }

    document.title = title;
    
    // Set meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", desc);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = desc;
      document.head.appendChild(meta);
    }

    // Set schema scripts
    const existingScripts = document.querySelectorAll('.seo-injected-schema');
    existingScripts.forEach(el => el.remove());

    if (faqSchema) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.className = "seo-injected-schema";
      script.text = JSON.stringify(faqSchema);
      document.head.appendChild(script);
    }

  }, [currentPath, isAr, currentLang]);

  // Extract relevant products based on path
  const getPageProducts = () => {
    const catalog = resolvePublicCatalog(PRODUCTS);
    if (currentPath === "/buy-gold-bars-dubai" || currentPath === "/24k-gold-bars-uae") {
      return catalog.filter((p) => p.category === "gold_bars");
    }
    if (currentPath === "/buy-silver-bars-dubai") {
      return catalog.filter((p) => p.category === "silver_bars");
    }
    if (IRAQ_SEO_PAGES[currentPath]?.productFilter === "silver") {
      return catalog.filter((p) => p.category === "silver_bars");
    }
    if (IRAQ_SEO_PAGES[currentPath]?.productFilter === "gold") {
      return catalog.filter((p) => p.category === "gold_bars");
    }
    return catalog;
  };

  const spotGoldUsd = getSpotUsdOz("gold", rates);
  const spotSilverUsd = getSpotUsdOz("silver", rates);
  const fxMultiplier = getFxRate(selectedCurrency, rates);

  const spotGoldLocal = spotGoldUsd * fxMultiplier;
  const spotSilverLocal = spotSilverUsd * fxMultiplier;
  const ratesLabel = getPriceStatusLabel(rates?.source_status, currentLang);

  // Render specific SEO Page contents
  const renderSeoContent = () => {
    switch (currentPath) {
      case "/buy-gold-bars-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "دليل تملك الذهب المادي الفاخر" : "PREMIER PHYSICAL GOLD ACQUISITION"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "شراء سبائك الذهب في دبي بالتسعير المباشر" : "Buy Certified Gold Bars in Dubai"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl">
                {isAr 
                  ? "ترحب بكم PGR UAE في قلب سوق الذهب العالمي في دبي. نوفر ممرًا آمنًا وممتثلًا بالكامل للاستعلام وحيازة سبائك الذهب الفاخرة المطابقة لمعايير تسليم دبي الجيد ومعايير الـ LBMA العالمية. جميع طلبات التسعير تخضع لمراجعة فورية وعمولة مكتب تنافسية."
                  : "Welcome to Dubai's premier precious metals desk. PGR UAE provides institutional and private clients with access to physical gold bar allocation from 1g minted bars to 1kg bars, sourced from LBMA-accredited international refineries."}
              </p>
            </div>

            {/* Premium product showcase */}
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-[#1F1A17] tracking-wide font-medium">
                {isAr ? "السبائك الذهبية الأكثر طلباً عيار ٢٤" : "Most Requested Pure 24K Gold Bars"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPageProducts().map((prod) => {
                  const estValue = spotGoldLocal * (prod.technical_specs.weight_grams / OUNCE_TO_GRAM) * (prod.premium_multiplier || 1.02);
                  return (
                    <div key={prod.id} className="bg-white border border-[#E8DEC9] p-5 rounded space-y-4 hover:border-[#C6A15B]/40 transition-all flex flex-col justify-between shadow-sm">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#A47C36] uppercase tracking-widest font-bold">{prod.manufacturer}</span>
                        <h3 className="text-sm font-serif text-[#1F1A17] font-medium leading-snug">{isAr ? prod.name_ar : prod.name_en}</h3>
                        <p className="text-xs text-[#5E564D] line-clamp-2">{isAr ? prod.description_ar : prod.description_en}</p>
                      </div>

                      {/* Pricing and mandatory QA compliance wording */}
                      <div className="space-y-3 pt-3 border-t border-[#E8DEC9]">
                        <div className="flex justify-between items-baseline text-xs font-mono">
                          <span className="text-[#5E564D]">{isAr ? "السعر الاسترشادي:" : "Est. Value:"}</span>
                          <span className="text-[#A47C36] font-bold">{estValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}</span>
                        </div>

                        {/* Desk Confirmation tag */}
                        <div className="bg-[#FAF9F5] border border-[#E8DEC9] px-2 py-1.5 rounded text-[9px] font-mono text-[#556B5D] leading-tight flex items-start gap-1">
                          <CheckCircle size={10} className="shrink-0 mt-0.5 text-[#556B5D]" />
                          <span>
                            {isAr 
                              ? "السعر الاسترشادي خاضع للتأكيد النهائي من مكتب تداول بي جي آر الإمارات."
                              : "Final quote confirmed by PGR UAE desk before order settlement."}
                          </span>
                        </div>

                        <button
                          onClick={() => onOpenQuote(isAr ? prod.name_ar : prod.name_en)}
                          className="w-full py-2.5 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white text-[11px] uppercase tracking-wider font-mono font-bold rounded transition-colors shadow-sm cursor-pointer"
                        >
                          {isAr ? "طلب تسعير معتمد" : "Request Firm Quote"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Structured educational copy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 border border-[#E8DEC9] rounded shadow-sm">
              <div className="space-y-4">
                <h3 className="text-base font-serif text-[#1F1A17] tracking-wide flex items-center gap-2 font-medium">
                  <Shield size={18} className="text-[#A47C36]" />
                  {isAr ? "امتياز دبي والإعفاء الضريبي" : "The Dubai Gold Advantage"}
                </h3>
                <p className="text-xs text-[#5E564D] leading-relaxed">
                  {isAr
                    ? "بصفتها عاصمة الذهب العالمية، تمنح دبي المستثمرين إعفاءً كاملاً من الضرائب على السبائك الذهبية النقية. مع PGR UAE، يمكنك تملك سبائكك وتخزينها في خزائن مؤمنة أو ترتيب تسليم مادي متوافق مع قوانين الجمارك والامتثال الدولية."
                    : "Known globally as the 'City of Gold', Dubai offers unmatched liquidity and strict tax-exempt benefits for physical bullion. All gold transactions are exempt from VAT, making Dubai one of the most cost-effective jurisdictions on earth for secure metal accumulation."}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-serif text-[#1F1A17] tracking-wide flex items-center gap-2 font-medium">
                  <Landmark size={18} className="text-[#A47C36]" />
                  {isAr ? "حماية وامتثال غسيل الأموال (AML)" : "KYC & AML Stringent Protocol"}
                </h3>
                <p className="text-xs text--[#5E564D] leading-relaxed">
                  {isAr
                    ? "يتطلب تداول السبائك الذهبية المادية الالتزام الصارم بقوانين مكافحة غسيل الأموال ومرسوم اعرف عميلك (KYC). نقوم بمراجعة وتأكيد كافة الأوراق الثبوتية والاعتمادات لضمان بيئة آمنة تضمن سلامة جميع الشحنات."
                    : "Physical bullion transactions must strictly comply with regional and international Anti-Money Laundering (AML) standards. PGR UAE enforces rigorous customer due diligence (KYC) for all institutional requests, safeguarding the integrity of your gold assets."}
                </p>
              </div>
            </div>
          </div>
        );

      case "/buy-silver-bars-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[#5E564D] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "تراكم الأصول والتحوط" : "SEGREGATED SILVER ACQUISITION"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "شراء سبائك الفضة المادية في دبي" : "Buy Physical Silver Bars in Dubai"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl">
                {isAr
                  ? "استثمر في الفضة المادية عالية النقاوة عيار ٩٩٩. توفر PGR UAE سبائك SAM وPALM بأوزان ١٠٠ جرام و٥٠٠ جرام و١ كيلو — الأكثر طلباً لتوصيل العراق."
                  : "Diversify with physical silver bullion. PGR UAE supplies SAM and PALM cast bars in 100g, 500g, and 1kg — top-requested weights for Iraq delivery."}
              </p>
            </div>

            {/* Products */}
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-[#1F1A17] tracking-wide font-medium">
                {isAr ? "سبائك الفضة الفاخرة المتوفرة" : "Certified Physical Silver Bullion"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPageProducts().map((prod) => {
                  const estValue = spotSilverLocal * (prod.technical_specs.weight_grams / OUNCE_TO_GRAM) * (prod.premium_multiplier || 1.05);
                  return (
                    <div key={prod.id} className="bg-white border border-[#E8DEC9] p-5 rounded space-y-4 hover:border-[#C6A15B]/40 transition-all flex flex-col justify-between shadow-sm">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-widest font-bold">{prod.manufacturer}</span>
                        <h3 className="text-sm font-serif text-[#1F1A17] font-medium leading-snug">{isAr ? prod.name_ar : prod.name_en}</h3>
                        <p className="text-xs text-[#5E564D] line-clamp-2">{isAr ? prod.description_ar : prod.description_en}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#E8DEC9]">
                        <div className="flex justify-between items-baseline text-xs font-mono">
                          <span className="text-[#5E564D]">{isAr ? "السعر الاسترشادي:" : "Est. Value:"}</span>
                          <span className="text-[#1F1A17] font-bold">{estValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}</span>
                        </div>

                        {/* Desk Confirmation tag */}
                        <div className="bg-[#FAF9F5] border border-[#E8DEC9] px-2 py-1.5 rounded text-[9px] font-mono text-[#556B5D] leading-tight flex items-start gap-1">
                          <CheckCircle size={10} className="shrink-0 mt-0.5 text-[#556B5D]" />
                          <span>
                            {isAr 
                              ? "السعر الاسترشادي خاضع للتأكيد النهائي من مكتب تداول بي جي آر الإمارات."
                              : "Final quote confirmed by PGR UAE desk before order settlement."}
                          </span>
                        </div>

                        <button
                          onClick={() => onOpenQuote(isAr ? prod.name_ar : prod.name_en)}
                          className="w-full py-2.5 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white text-[11px] uppercase tracking-wider font-mono font-bold rounded transition-colors shadow-sm cursor-pointer"
                        >
                          {isAr ? "طلب تسعير معتمد" : "Request Firm Quote"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "/gold-rate-dubai-today":
        return (
          <div className="space-y-12">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "البورصة العالمية والأسعار الفورية" : "DUBAI REAL-TIME SPOT RATES"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "سعر الذهب اليوم في دبي مباشر" : "Gold Rate Dubai Today - Live Spot Feed"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm">
                {isAr
                  ? `${ratesLabel} — أسعار استرشادية لعيارات ٢٤ و٢٢ و٢١ قيراط. عرض السعر النهائي يؤكده PGR UAE.`
                  : `${ratesLabel} — indicative 24K, 22K, and 21K references. Final quote confirmed by PGR UAE.`}
              </p>
            </div>

            {/* Quick Rates Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 text-center shadow-sm">
                <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider font-bold">{isAr ? "أونصة الذهب (USD)" : "Gold Ounce (USD)"}</span>
                <div className="text-xl md:text-2xl font-serif text-[#A47C36] font-bold">${spotGoldUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 text-center shadow-sm">
                <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider font-bold">{isAr ? "جرام عيار ٢٤ (AED)" : "Gram 24K (AED)"}</span>
                <div className="text-xl md:text-2xl font-serif text-[#1F1A17] font-bold">
                  {usdOunceToGramLocal(spotGoldUsd, "AED", rates).toFixed(2)} AED
                </div>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 text-center shadow-sm">
                <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider font-bold">{isAr ? "جرام عيار ٢٢ (AED)" : "Gram 22K (AED)"}</span>
                <div className="text-xl md:text-2xl font-serif text-[#5E564D] font-bold">
                  {usdOunceToGramLocal(spotGoldUsd, "AED", rates, 0.9167).toFixed(2)} AED
                </div>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 text-center shadow-sm">
                <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider font-bold">{isAr ? "جرام عيار ٢١ (AED)" : "Gram 21K (AED)"}</span>
                <div className="text-xl md:text-2xl font-serif text-[#5E564D] font-bold">
                  {usdOunceToGramLocal(spotGoldUsd, "AED", rates, 0.875).toFixed(2)} AED
                </div>
              </div>
            </div>

            <div className="pt-4">
              <MetalCalculator
                currentLang={currentLang}
                rates={rates}
                selectedCurrency={selectedCurrency}
                onOpenQuote={onOpenQuote}
              />
            </div>
          </div>
        );

      case "/silver-rate-dubai-today":
        return (
          <div className="space-y-12">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <span className="text-[#5E564D] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "أسعار الفضة المادية المباشرة" : "DUBAI SILVER SPOT DIRECT"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "سعر الفضة اليوم في دبي" : "Silver Rate Dubai Today - Live Market"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm">
                {isAr
                  ? `${ratesLabel} — مرجع الفضة بالدرهم والدولار. SAM وPALM ١ كيلو متوفرة للعراق.`
                  : `${ratesLabel} — silver reference in AED and USD. SAM & PALM 1kg available for Iraq.`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 text-center shadow-sm">
                <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider font-bold">{isAr ? "أونصة الفضة (USD)" : "Silver Ounce (USD)"}</span>
                <div className="text-xl md:text-2xl font-serif text-[#1F1A17] font-bold">${spotSilverUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 text-center shadow-sm">
                <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider font-bold">{isAr ? "كيلوغرام الفضة (AED)" : "Kilogram Silver (AED)"}</span>
                <div className="text-xl md:text-2xl font-serif text-[#A47C36] font-bold">
                  {(usdOunceToLocal(spotSilverUsd, "AED", rates) * (GRAMS_PER_KG / OUNCE_TO_GRAM)).toFixed(2)} AED
                </div>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 text-center shadow-sm">
                <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider font-bold">{isAr ? "أونصة الفضة (AED)" : "Silver Ounce (AED)"}</span>
                <div className="text-xl md:text-2xl font-serif text-[#5E564D] font-bold">
                  {usdOunceToLocal(spotSilverUsd, "AED", rates).toFixed(2)} AED
                </div>
              </div>
            </div>
          </div>
        );

      case "/sell-gold-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "برنامج الاسترداد الفوري والتسييل" : "INSTANT LIQUIDATION PROGRAM"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "تسييل وبيع الذهب في دبي بأسعار البورصة" : "Sell Gold Bars in Dubai | Instant Liquidity"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl">
                {isAr 
                  ? "نوفر في ديوان PGR UAE أفضل أسعار شراء عكسية لسبائك الذهب الخالص والفضة. يمكنك تسييل أصولك المودعة في خزائننا أو جلب سبائكك المعتمدة إلى ديوان التداول لإجراء الفحص الفوري وتحصيل السعر الفوري العادل المتطابق مع بورصة دبي للذهب والسلع."
                  : "Liquidate your bullion holdings at premium rates. PGR UAE offers a transparent, rapid sell-back desk. We repurchase certified gold bars, silver bars, and coins directly from our clients, utilizing precise spectroscopic assay checks for real-time payout calculations."}
              </p>
            </div>

            <div className="bg-[#FFFDF8] border border-[#E8DEC9] p-6 rounded space-y-4 shadow-sm">
              <h3 className="text-base font-serif text-[#A47C36] font-medium">{isAr ? "كيف تعمل عملية البيع والاسترداد المالي؟" : "The 3-Step Bullion Repurchase Workflow"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm font-sans">
                <div className="space-y-1">
                  <div className="text-[#A47C36] font-mono font-bold">01. {isAr ? "تقديم طلب الاسترداد" : "Submit Liquidation Query"}</div>
                  <p className="text-xs text-[#5E564D]">{isAr ? "أدخل تفاصيل الأوزان والماركة والشهادة عبر البوابة الرقمية أو الواتساب." : "Provide brand, weight, and assay certificate via customer desk or WhatsApp."}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-[#A47C36] font-mono font-bold">02. {isAr ? "فحص واختبار الأصالة" : "Assay & Quality Inspection"}</div>
                  <p className="text-xs text-[#5E564D]">{isAr ? "نقوم بفحص السبيكة بشكل دقيق وبدون إتلاف بمعدات الفحص المعتمدة." : "Physical testing verifies purity and density matches LBMA certification standards."}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-[#A47C36] font-mono font-bold">03. {isAr ? "تحويل فوري للأموال" : "Secure Payout Contract"}</div>
                  <p className="text-xs text-[#5E564D]">{isAr ? "إتمام عقد البيع وصرف القيمة نقداً أو بتحويل بنكي مطابق لتعليمات البنك المركزي." : "Contract locked, immediate payout issued via secure bank wire or authorized desk dispatch."}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onOpenQuote("Liquidation Request")}
                className="px-8 py-4 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white text-xs font-mono font-bold uppercase tracking-widest rounded transition-all shadow cursor-pointer"
              >
                {isAr ? "طلب تسييل فوري" : "Start Liquidation Quote"}
              </button>
              <a
                href={`https://wa.me/971559688837?text=${encodeURIComponent(isAr ? "مرحباً ديوان PGR دبي، أريد تسييل وبيع سبائك ذهب/فضة والحصول على عرض سعر فوري." : "Hello PGR UAE desk, I want to liquidate my gold/silver bullion and request a repurchase quote.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-transparent hover:bg-gold-base/5 border border-[#C6A15B] text-[#1F1A17] text-xs font-mono font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} className="text-[#556B5D]" />
                <span>{isAr ? "تواصل مباشر مع خبير التسييل" : "WhatsApp Liquidation Expert"}</span>
              </a>
            </div>
          </div>
        );

      case "/bullion-desk-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "بوابة الخدمات المعادن الثمينة المؤسسية" : "THE PHYSICAL BULLION STANDARD"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "ديوان تداول السبائك والذهب في دبي" : "Dubai Physical Precious Metals Desk"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl">
                {isAr 
                  ? "يمثل ديوان PGR UAE المركز الأساسي لتداول وتملك سبائك ومعادن الاستثمار المادي الفاخر. نربط كبرى شركات التعدين والمستثمرين من دول الخليج والعراق بأرقى مصافي الذهب المعتمدة في دولة الإمارات العربية المتحدة، مع تقديم أعلى درجات الالتزام والحماية."
                  : "PGR UAE is Dubai's premier dedicated gold and silver physical bullion quotation counter. Centered in Dubai's secure global corridor, we assist retail, high-net-worth, and corporate investors in locking wholesale precious metal spot rates with assured physical fulfillment."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 shadow-sm">
                <div className="text-[#A47C36] text-lg font-serif font-medium">SEGREGATED Custody</div>
                <p className="text-xs text-[#5E564D] font-sans">{isAr ? "حفظ مخصص بالكامل في كبرى خزائن دبي للذهب المؤمنة." : "Fully allocated custody in world-renowned safe-deposit hubs."}</p>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 shadow-sm">
                <div className="text-[#A47C36] text-lg font-serif font-medium">LBMA Certified</div>
                <p className="text-xs text-[#5E564D] font-sans">{isAr ? "جميع المنتجات معتمدة دولياً ومسجلة بالأرقام التسلسلية الرسمية." : "All bullion is sourced directly from certified LBMA refineries."}</p>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded space-y-2 shadow-sm">
                <div className="text-[#A47C36] text-lg font-serif font-medium">UAE - Iraq Corridor</div>
                <p className="text-xs text-[#5E564D] font-sans">{isAr ? "شحن آمن متوافق مع كافة المعايير الجمركية الإقليمية." : "Expert logistic clearance handling across regional borders."}</p>
              </div>
            </div>
          </div>
        );

      case "/allocated-storage-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "التخزين المخصص والحماية الفائقة" : "ALLOCATED BULLION VAULTING"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "تخزين الذهب والفضة المخصص في دبي" : "Allocated & Segregated Bullion Storage Dubai"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl">
                {isAr 
                  ? "توفر PGR UAE خدمات التخزين المخصص (Allocated Storage) لسبائكك الذهبية والفضية في خزائن دبي المتطورة والآمنة. نضمن الحراسة Segregated والأكثر أماناً بالتعاون مع كبرى الشركات الرائدة عالمياً في النقل المؤمن لحفظ ثرواتك بعيداً عن تقلبات الأنظمة المالية."
                  : "Protect physical bullion holdings with allocated, audited, and segregated custody. PGR UAE offers storage in secure Dubai vault facilities with serial number tracking."}
              </p>
            </div>

            <div className="bg-white border border-[#E8DEC9] p-8 rounded space-y-6 shadow-sm">
              <h3 className="text-lg font-serif text-[#1F1A17] tracking-wide font-medium">{isAr ? "ميزات الحفظ المخصص معنا" : "Institutional Storage Highlights"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm font-sans">
                <div className="space-y-1">
                  <h4 className="text-[#A47C36] font-serif font-medium">{isAr ? "حفظ مخصص بالكامل (Allocated & Segregated)" : "Fully Allocated & Segregated"}</h4>
                  <p className="text-xs text-[#5E564D]">{isAr ? "سبائكك تسجل وتخزن بشكل منفصل باسمك ورقمه التسلسلي، وليست مجرد أرقام ورقية." : "Your gold is physically separated, labeled with unique serials, and registered directly in your name."}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[#A47C36] font-serif font-medium">{isAr ? "تغطية تأمينية شاملة" : "Comprehensive Lloyd's Insurance"}</h4>
                  <p className="text-xs text-[#5E564D]">{isAr ? "جميع الودائع مغطاة بالكامل بوثائق تأمين عالمية ضد جميع المخاطر المحتملة." : "All client holdings are insured at full replacement value against physical loss and theft."}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "/24k-gold-bars-uae":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? "الذهب الخالص عيار ٢٤ قيراط" : "PREMIUM PURE GOLD STANDARDS"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? "سبائك ذهب عيار ٢٤ في الإمارات والشرق الأوسط" : "24K Physical Gold Bars in the UAE"}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl">
                {isAr 
                  ? "سبائك الذهب عيار ٢٤ قيراط بنقاوة تامة تبلغ 999.9 هي الأداة المثالية لحفظ الأصول والثروات. نوفر في PGR UAE السبائك المعتمدة من مصافي سويسرية وإماراتية مرموقة مثل PAMP وValcambi وEmirates Gold."
                  : "PGR UAE provides high-volume allocations of 999.9 fine minted and cast gold bars. Sourced from accredited UAE and international refineries. Firm quote confirmed by desk."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <MetalCalculator
                  currentLang={currentLang}
                  rates={rates}
                  selectedCurrency={selectedCurrency}
                  onOpenQuote={onOpenQuote}
                />
              </div>
              <div className="lg:col-span-4 bg-white border border-[#E8DEC9] p-6 rounded flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <h3 className="text-sm font-serif text-[#1F1A17] font-medium">{isAr ? "الأوزان المتوفرة فوراً:" : "Standard Purity Weights:"}</h3>
                  <ul className="space-y-2 text-xs text-[#5E564D] font-mono font-medium">
                    <li>• 1 Gram Minted Bar</li>
                    <li>• 5 Grams Minted Bar</li>
                    <li>• 10 Grams Minted Bar</li>
                    <li>• 20 Grams Minted Bar</li>
                    <li>• 1 Troy Ounce (31.1g) Bar</li>
                    <li>• 50 Grams Cast Bar</li>
                    <li>• 100 Grams Cast Bar</li>
                    <li>• 1 Kilogram Cast Bar</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => onOpenQuote("24K Gold Bars Allocation")}
                    className="w-full py-3 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white text-xs font-mono font-bold uppercase tracking-widest rounded transition-colors cursor-pointer shadow-sm"
                  >
                    {isAr ? "حجز عقد سبائك ٢٤" : "Inquire 24K Allocation"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default: {
        const iraqMeta = IRAQ_SEO_PAGES[currentPath];
        if (!iraqMeta) {
          return (
            <div className="text-center py-12">
              <h1 className="text-xl font-serif text-[#1F1A17]">SEO Page Not Found</h1>
            </div>
          );
        }

        const iqdGramSilver = usdOunceToGramLocal(spotSilverUsd, "IQD", rates);
        const iqdGramGold = usdOunceToGramLocal(spotGoldUsd, "IQD", rates);

        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest block font-bold">
                {isAr ? iraqMeta.badgeAr : iraqMeta.badgeEn}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-[#1F1A17] tracking-tight font-medium">
                {isAr ? iraqMeta.titleAr : iraqMeta.titleEn}
              </h1>
              <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl">
                {isAr ? iraqMeta.descAr : iraqMeta.descEn}
              </p>
              <p className="text-[10px] font-mono text-[#5E564D] uppercase tracking-wider">
                {ratesLabel} — {isAr ? "مرجع الدينار:" : "IQD reference:"}{" "}
                {iqdGramGold.toLocaleString(undefined, { maximumFractionDigits: 0 })} IQD/g gold ·{" "}
                {iqdGramSilver.toLocaleString(undefined, { maximumFractionDigits: 0 })} IQD/g silver
              </p>
            </div>

            {iraqMeta.productFilter !== "all" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPageProducts().map((prod) => {
                  const isGold = prod.category?.includes("gold");
                  const spotLocal = isGold ? spotGoldLocal : spotSilverLocal;
                  const estValue =
                    spotLocal *
                    (prod.technical_specs.weight_grams / OUNCE_TO_GRAM) *
                    (prod.premium_multiplier || (isGold ? 1.02 : 1.05));
                  return (
                    <div
                      key={prod.id}
                      className="bg-white border border-[#E8DEC9] p-5 rounded space-y-4 hover:border-[#C6A15B]/40 transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#5E564D] uppercase tracking-widest font-bold">
                          {prod.manufacturer}
                        </span>
                        <h3 className="text-sm font-serif text-[#1F1A17] font-medium leading-snug">
                          {isAr ? prod.name_ar : prod.name_en}
                        </h3>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-[#E8DEC9]">
                        <div className="flex justify-between items-baseline text-xs font-mono">
                          <span className="text-[#5E564D]">{isAr ? "السعر الاسترشادي:" : "Est. Value:"}</span>
                          <span className="text-[#1F1A17] font-bold">
                            {estValue.toLocaleString(undefined, { maximumFractionDigits: selectedCurrency === "IQD" ? 0 : 2 })}{" "}
                            {selectedCurrency}
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenQuote(isAr ? prod.name_ar : prod.name_en)}
                          className="w-full py-2.5 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white text-[11px] uppercase tracking-wider font-mono font-bold rounded transition-colors shadow-sm cursor-pointer"
                        >
                          {isAr ? "طلب تسعير معتمد" : "Request Firm Quote"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white border border-[#E8DEC9] p-6 rounded shadow-sm">
                <div className="text-[#A47C36] text-lg font-serif font-medium">Dubai Sourcing</div>
                <p className="text-xs text-[#5E564D] font-sans mt-2">
                  {isAr ? "توريد من مصافي معتمدة في دبي." : "Sourced from accredited Dubai refineries."}
                </p>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded shadow-sm">
                <div className="text-[#A47C36] text-lg font-serif font-medium">Iraq Corridor</div>
                <p className="text-xs text-[#5E564D] font-sans mt-2">
                  {isAr ? "ترتيبات توصيل بعد مراجعة الامتثال." : "Delivery arranged after compliance review."}
                </p>
              </div>
              <div className="bg-white border border-[#E8DEC9] p-6 rounded shadow-sm">
                <div className="text-[#A47C36] text-lg font-serif font-medium">Desk-Confirmed</div>
                <p className="text-xs text-[#5E564D] font-sans mt-2">
                  {isAr ? "عرض السعر النهائي من المكتب قبل الدفع." : "Final quote from desk before payment."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onOpenQuote(isAr ? iraqMeta.titleAr : iraqMeta.titleEn)}
                className="px-8 py-4 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white text-xs font-mono font-bold uppercase tracking-widest rounded transition-all shadow cursor-pointer"
              >
                {isAr ? iraqMeta.ctaAr : iraqMeta.ctaEn}
              </button>
              <button
                onClick={() => onNavigate("/request-quote")}
                className="px-8 py-4 bg-transparent hover:bg-gold-base/5 border border-[#C6A15B] text-[#1F1A17] text-xs font-mono font-bold uppercase tracking-widest rounded transition-all"
              >
                {isAr ? "نموذج طلب عرض سعر" : "Quote Request Form"}
              </button>
            </div>
          </div>
        );
      }
    }
  };

  // Shared FAQ Section
  const getPageFaqs = () => {
    const defaultFaqs = [
      {
        q: isAr ? "هل الأسعار المعروضة نهائية؟" : "Are the listed prices final and binding?",
        a: isAr 
          ? "لا، جميع الأسعار والتقديرات استرشادية فقط بناءً على أسعار البورصة العالمية المباشرة. الأسعار النهائية وحجز العقود يتم فقط عبر ديوان PGR UAE بعد مراجعة الأوراق، وعلاوة الصب والتخزين المعتمدة."
          : "No. All pricing estimates shown are indicative based on global spot references. Final desk-confirmed prices are issued on our quote desk subject to KYC, refiner premiums, and availability confirmation."
      },
      {
        q: isAr ? "كيف يمكنني تقديم مستندات KYC؟" : "How do I submit my KYC documents?",
        a: isAr 
          ? "يمكنك رفع وثائق التحقق بأمان من خلال بوابة العميل الرقمية لدينا، أو من خلال إرسالها بشكل مباشر وسري إلى فريق الامتثال ومكافحة غسيل الأموال في مكتبنا."
          : "You can upload government-issued ID or passport and corporate credentials through your PGR Client Dashboard, or coordinate with our compliance officer via WhatsApp."
      },
      {
        q: isAr ? "هل تدعمون الشحن الآمن وال Segregated التخزين؟" : "Do you offer physical delivery and vault storage?",
        a: isAr 
          ? "نعم، PGR UAE توفر الشحن المؤمن بالكامل بالتعاون مع كبرى الشركات الأمنية الإقليمية، بجانب خدمات التخزين SEGREGATED المخصص والمؤمن."
          : "Yes. PGR UAE supports secured, insured logistic transit within authorized free zones and regional corridors, plus segregated, fully-insured vault storage solutions."
      }
    ];
    return defaultFaqs;
  };

  return (
    <div className="space-y-16 py-4" id="seo-landing-pages-container" style={{ direction: isAr ? "rtl" : "ltr" }}>
      {/* Back Button */}
      <button
        onClick={() => onNavigate("/")}
        className="text-xs text-[#A47C36] hover:text-[#C6A15B] font-mono flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
      >
        {isAr ? <ArrowRight size={14} /> : <span>&larr;</span>}
        <span>{isAr ? "الرجوع للرئيسية" : "Back to Homepage"}</span>
      </button>

      {/* Main content render */}
      <div className="min-h-[400px]">
        {renderSeoContent()}
      </div>

      {/* Dynamic Accordion FAQs Section */}
      <div className="space-y-6 pt-12 border-t border-[#E8DEC9]">
        <h2 className="text-xl md:text-2xl font-serif text-[#1F1A17] tracking-wide font-medium">
          {isAr ? "الأسئلة الشائعة ومراجعة الامتثال والقوانين" : "Regulatory & Bullion FAQ Desk"}
        </h2>
        <div className="space-y-3 font-sans">
          {getPageFaqs().map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="border border-[#E8DEC9] rounded bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                  style={{ direction: isAr ? "rtl" : "ltr" }}
                >
                  <span className="text-sm font-serif font-medium text-[#1F1A17]">{faq.q}</span>
                  <ChevronDown size={16} className={`text-[#A47C36] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-5 border-t border-[#E8DEC9] text-xs text-[#5E564D] leading-relaxed bg-[#FFFDF8]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured CTA Section */}
      <div className="bg-white border border-[#E8DEC9] p-8 md:p-12 rounded text-center space-y-6 shadow-sm">
        <span className="text-[#A47C36] font-mono uppercase text-xs tracking-widest font-bold">
          {isAr ? "تواصل ممتثل مع ديوان تداول المعادن" : "LOCK YOUR CONTRACT SPOT RATE"}
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-[#1F1A17] tracking-tight font-medium">
          {isAr ? "هل ترغب في الحصول على تسعير فوري معتمد من الديوان؟" : "Ready to Lock a Firm Bullion Quote?"}
        </h2>
        <p className="text-xs text-[#5E564D] max-w-xl mx-auto leading-relaxed">
          {isAr 
            ? "يرجى العلم أن أسعار السبائك والفضة والذهب تتغير كل ثانية. اتصل بنا فوراً أو اطلب عرض سعر معتمد عبر الواتساب لتأمين صفقتك."
            : "Market spots fluctuate continuously. Protect your transaction window by initiating a secure, accredited desk consultation."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 font-mono">
          <button
            onClick={() => onOpenQuote()}
            className="px-6 py-3 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shadow-sm"
          >
            {isAr ? "طلب عرض سعر رسمي" : "Request Desk Quote"}
          </button>
          <a
            href={`https://wa.me/971559688837?text=${encodeURIComponent(isAr ? "مرحباً، أريد طلب تسعير فوري وحجز سبيكة ذهب/فضة معتمدة من PGR دبي." : "Hello, I am looking to lock in a firm physical gold or silver bullion quote contract with PGR UAE.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-transparent hover:bg-gold-base/5 border border-[#C6A15B] text-[#1F1A17] text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={14} className="text-[#556B5D]" />
            <span>{isAr ? "تواصل عبر الواتساب" : "WhatsApp Bullion Advisor"}</span>
          </a>
        </div>
      </div>

    </div>
  );
}

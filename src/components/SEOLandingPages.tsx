/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Shield, Sparkles, Phone, MessageSquare, ArrowRight, HelpCircle, ChevronDown, Award, TrendingUp, HelpCircle as HelpIcon, Landmark, Star, Coins } from "lucide-react";
import { LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import MetalCalculator from "./MetalCalculator";

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
    let productSchema: any = null;

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
                : "Yes, investment-grade gold bars with a purity of 99% or higher are exempt from Value Added Tax (VAT) in the UAE."
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
      title = isAr ? "شراء سبائك الفضة في دبي | فضة استثمارية نقية PGR UAE" : "Buy Silver Bars in Dubai | Investment Silver Bullion PGR UAE";
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
                : "We supply physical silver starting from 1 oz, 100g, 500g, up to 1kg investment cast bars with 99.9% fine silver certification."
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
      title = isAr ? "بيع الذهب والسبائك في دبي | برنامج الشراء والاسترداد PGR UAE" : "Sell Gold in Dubai | Bullion Sell-Back & Liquidations Dubai";
      desc = isAr 
        ? "احصل على أفضل عروض أسعار البيع المرتجع لسبائك الذهب والفضة في دبي. سيولة فورية وعلاوات تسييل عادلة ومطابقة للأنظمة والقوانين."
        : "Liquidate your gold bars and silver bullion in Dubai with maximum transparency. Our premier sell-back desk provides immediate, compliant liquidity.";
    } else if (currentPath === "/bullion-desk-dubai") {
      title = isAr ? "ديوان تداول السبائك في دبي | مكتب تداول المعادن PGR UAE" : "Physical Bullion Desk Dubai | Secure Metal Quote Desk PGR UAE";
      desc = isAr 
        ? "تعرف على ديوان PGR UAE في دبي، شريكك الموثوق لتوفير كميات سبائك المعادن الثمينة وتوفير الشحن المؤمن والتخزين الآمنSegregated."
        : "Discover Dubai's premier physical gold and silver quote desk. Secure custom allocations, high-volume trading contracts, and institutional gold custody.";
    } else if (currentPath === "/allocated-storage-dubai") {
      title = isAr ? "تخزين الذهب المخصص دبي | خزائن ومستودعات مؤمنة PGR UAE" : "Allocated Gold Storage Dubai | Vaulting and Segregated Custody";
      desc = isAr 
        ? "خدمات حفظ وتخزين الذهب والفضة المخصصة والمؤمنة بالكامل في خزائن دبي العالمية بالتعاون مع كبرى الشركات الأمنية العالمية."
        : "Protect your physical gold and silver assets with fully allocated, segregated vaulting in Dubai. Audited storage with global security leaders.";
    } else if (currentPath === "/24k-gold-bars-uae") {
      title = isAr ? "سبائك ذهب عيار ٢٤ في الإمارات | أسعار السبائك المعتمدة PGR UAE" : "24K Gold Bars UAE | Investment Grade Pure Bullion Dubai";
      desc = isAr 
        ? "اطلب سبائك الذهب الخالص عيار ٢٤ قيراط بنقاوة 999.9 في دبي وأبوظبي. نوفر الأوزان من ١ جرام إلى ١ كيلوجرام مع شهادات أصالة دولية."
        : "Order 24K pure gold bars in the UAE with maximum price transparency. High-liquidity Swiss and Emirati minted gold bars certified for institutional storage.";
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

  }, [currentPath, currentLang]);

  // Extract relevant products based on path
  const getPageProducts = () => {
    if (currentPath === "/buy-gold-bars-dubai" || currentPath === "/24k-gold-bars-uae") {
      return PRODUCTS.filter(p => p.category === "gold_bars").slice(0, 4);
    }
    if (currentPath === "/buy-silver-bars-dubai") {
      return PRODUCTS.filter(p => p.category === "silver_bars").slice(0, 4);
    }
    return PRODUCTS.slice(0, 4);
  };

  const getSpotRateValue = (metal: "gold" | "silver") => {
    const defaultSpots = { gold: 2365.40, silver: 29.85 };
    if (!rates) return defaultSpots[metal];
    const val = rates[metal]?.spot_usd_oz;
    return val && val > 0 ? val : defaultSpots[metal];
  };

  const exchangeRate = () => {
    const ratesMap: Record<string, number> = {
      USD: 1.0,
      AED: 3.6725,
      EUR: 0.925,
      GBP: 0.785,
      SAR: 3.7505
    };
    return ratesMap[selectedCurrency] || 1.0;
  };

  const spotGoldUsd = getSpotRateValue("gold");
  const spotSilverUsd = getSpotRateValue("silver");
  const currentExchangeRate = exchangeRate();

  const spotGoldLocal = spotGoldUsd * currentExchangeRate;
  const spotSilverLocal = spotSilverUsd * currentExchangeRate;

  // Render specific SEO Page contents
  const renderSeoContent = () => {
    switch (currentPath) {
      case "/buy-gold-bars-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-gold-base font-mono uppercase text-xs tracking-widest block">
                {isAr ? "دليل تملك الذهب المادي الفاخر" : "PREMIER PHYSICAL GOLD ACQUISITION"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "شراء سبائك الذهب في دبي بالتسعير المباشر" : "Buy Certified Gold Bars in Dubai"}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
                {isAr 
                  ? "ترحب بكم PGR UAE في قلب سوق الذهب العالمي في دبي. نوفر ممرًا آمنًا وممتثلًا بالكامل للاستعلام وحيازة سبائك الذهب الفاخرة المطابقة لمعايير تسليم دبي الجيد ومعايير الـ LBMA العالمية. جميع طلبات التسعير تخضع لمراجعة فورية وعمولة مكتب تنافسية."
                  : "Welcome to Dubai's premier precious metals conduit. PGR UAE provides institutional and private clients with direct access to physical gold bar allocation. Acquire gold bullion ranging from 1g minted bars to 400 oz Good Delivery bars, directly secured from world-class LBMA accredited Swiss and UAE refineries."}
              </p>
            </div>

            {/* Premium product showcase */}
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-white tracking-wide">
                {isAr ? "السبائك الذهبية الأكثر طلباً عيار ٢٤" : "Most Requested Pure 24K Gold Bars"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPageProducts().map((prod) => {
                  const estValue = spotGoldLocal * (prod.technical_specs.weight_grams / 31.1034768) * (prod.premium_multiplier || 1.02);
                  return (
                    <div key={prod.id} className="bg-[#111112] border border-white/[0.04] p-5 rounded space-y-4 hover:border-gold-base/20 transition-all flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-gold-base uppercase tracking-widest">{prod.manufacturer}</span>
                        <h3 className="text-base font-serif text-white font-medium">{isAr ? prod.name_ar : prod.name_en}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{isAr ? prod.description_ar : prod.description_en}</p>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-white/[0.03]">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-gray-500">{isAr ? "السعر التقريبي:" : "Est. Value:"}</span>
                          <span className="text-gold-light font-mono font-bold">{estValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}</span>
                        </div>
                        <button
                          onClick={() => onOpenQuote(isAr ? prod.name_ar : prod.name_en)}
                          className="w-full py-2 bg-gold-base hover:bg-gold-light text-black text-[11px] uppercase tracking-wider font-bold rounded transition-colors"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0b0b0c] p-8 border border-white/[0.03] rounded">
              <div className="space-y-4">
                <h3 className="text-lg font-serif text-white tracking-wide flex items-center gap-2">
                  <Shield size={18} className="text-gold-base" />
                  {isAr ? "امتياز دبي والإعفاء الضريبي" : "The Dubai Gold Advantage"}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {isAr
                    ? "بصفتها عاصمة الذهب العالمية، تمنح دبي المستثمرين إعفاءً كاملاً من الضرائب على السبائك الذهبية النقية. مع PGR UAE، يمكنك تملك سبائكك وتخزينها في خزائن مؤمنة أو ترتيب تسليم مادي متوافق مع قوانين الجمارك والامتثال الدولية."
                    : "Known globally as the 'City of Gold', Dubai offers unmatched liquidity and strict tax-exempt benefits for physical bullion. All gold transactions are exempt from VAT, making Dubai one of the most cost-effective jurisdictions on earth for secure metal accumulation."}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-serif text-white tracking-wide flex items-center gap-2">
                  <Landmark size={18} className="text-gold-base" />
                  {isAr ? "حماية وامتثال غسيل الأموال (AML)" : "KYC & AML Stringent Protocol"}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
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
              <span className="text-gray-400 font-mono uppercase text-xs tracking-widest block">
                {isAr ? "تراكم الأصول والتحوط" : "SEGREGATED SILVER ACQUISITION"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "شراء سبائك الفضة الاستثمارية في دبي" : "Buy Investment Silver Bars in Dubai"}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
                {isAr 
                  ? "استثمر في الفضة المادية عالية النقاوة من عيار ٩٩٩. توفر PGR UAE لعملائها سبائك فضية استثمارية بأوزان مثالية لحفظ القيمة، مع خيارات تسليم معتمدة في دبي أو تخزين SEGREGATED مؤمن بالكامل."
                  : "Diversify your wealth using physical silver bullion. PGR UAE supplies high-purity (99.9% fine) silver cast bars in premier weights including 100g, 500g, and 1kg sizes, carefully certified by internationally recognized refiners."}
              </p>
            </div>

            {/* Products */}
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-white tracking-wide">
                {isAr ? "سبائك الفضة الفاخرة المتوفرة" : "Certified Physical Silver Bullion"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPageProducts().map((prod) => {
                  const estValue = spotSilverLocal * (prod.technical_specs.weight_grams / 31.1034768) * (prod.premium_multiplier || 1.05);
                  return (
                    <div key={prod.id} className="bg-[#111112] border border-white/[0.04] p-5 rounded space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{prod.manufacturer}</span>
                        <h3 className="text-base font-serif text-white font-medium">{isAr ? prod.name_ar : prod.name_en}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{isAr ? prod.description_ar : prod.description_en}</p>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-white/[0.03]">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-gray-500">{isAr ? "السعر التقريبي:" : "Est. Value:"}</span>
                          <span className="text-white font-mono font-bold">{estValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency}</span>
                        </div>
                        <button
                          onClick={() => onOpenQuote(isAr ? prod.name_ar : prod.name_en)}
                          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[11px] uppercase tracking-wider font-bold rounded transition-colors"
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
              <span className="text-gold-base font-mono uppercase text-xs tracking-widest block">
                {isAr ? "البورصة العالمية والأسعار الفورية" : "DUBAI REAL-TIME SPOT RATES"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "سعر الذهب اليوم في دبي مباشر" : "Gold Rate Dubai Today - Live Spot Feed"}
              </h1>
              <p className="text-gray-400 text-xs md:text-sm">
                {isAr 
                  ? "أسعار تفاعلية محدثة كل دقيقة بناءً على بورصة لندن للمعادن مع حساب عيارات ٢٤ قيراط، ٢٢ قيراط، ٢١ قيراط."
                  : "Track official live market prices per ounce and per gram in Dubai's major currency denominations."}
              </p>
            </div>

            {/* Quick Rates Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{isAr ? "أونصة الذهب (USD)" : "Gold Ounce (USD)"}</span>
                <div className="text-2xl font-serif text-gold-base font-medium">${spotGoldUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{isAr ? "جرام عيار ٢٤ (AED)" : "Gram 24K (AED)"}</span>
                <div className="text-2xl font-serif text-white font-medium">{(spotGoldUsd / 31.1034768 * 3.6725).toFixed(2)} AED</div>
              </div>
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{isAr ? "جرام عيار ٢٢ (AED)" : "Gram 22K (AED)"}</span>
                <div className="text-2xl font-serif text-gray-300 font-medium">{(spotGoldUsd / 31.1034768 * 3.6725 * 0.9167).toFixed(2)} AED</div>
              </div>
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{isAr ? "جرام عيار ٢١ (AED)" : "Gram 21K (AED)"}</span>
                <div className="text-2xl font-serif text-gray-400 font-medium">{(spotGoldUsd / 31.1034768 * 3.6725 * 0.875).toFixed(2)} AED</div>
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
              <span className="text-gray-400 font-mono uppercase text-xs tracking-widest block">
                {isAr ? "أسعار الفضة المادية المباشرة" : "DUBAI SILVER SPOT DIRECT"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "سعر الفضة اليوم في دبي" : "Silver Rate Dubai Today - Live Market"}
              </h1>
              <p className="text-gray-400 text-xs md:text-sm">
                {isAr 
                  ? "تتبع مباشر لأسعار الفضة الفاخرة بالدرهم الإماراتي والدولار الأمريكي لحساب الأصول وحساب الصب والعمولة."
                  : "Track high-purity physical silver spot prices with instant premium calculations for secure delivery contracts."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{isAr ? "أونصة الفضة (USD)" : "Silver Ounce (USD)"}</span>
                <div className="text-2xl font-serif text-white font-medium">${spotSilverUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{isAr ? "كيلوغرام الفضة (AED)" : "Kilogram Silver (AED)"}</span>
                <div className="text-2xl font-serif text-gold-base font-medium">{(spotSilverUsd * 3.6725 * 32.1507).toFixed(2)} AED</div>
              </div>
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{isAr ? "أونصة الفضة (AED)" : "Silver Ounce (AED)"}</span>
                <div className="text-2xl font-serif text-gray-300 font-medium">{(spotSilverUsd * 3.6725).toFixed(2)} AED</div>
              </div>
            </div>
          </div>
        );

      case "/sell-gold-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-gold-base font-mono uppercase text-xs tracking-widest block">
                {isAr ? "برنامج الاسترداد الفوري والتسييل" : "INSTANT LIQUIDATION PROGRAM"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "تسييل وبيع الذهب في دبي بأسعار البورصة" : "Sell Gold Bars in Dubai | Instant Liquidity"}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
                {isAr 
                  ? "نوفر في ديوان PGR UAE أفضل أسعار شراء عكسية لسبائك الذهب الخالص والفضة. يمكنك تسييل أصولك المودعة في خزائننا أو جلب سبائكك المعتمدة إلى ديوان التداول لإجراء الفحص الفوري وتحصيل السعر الفوري العادل المتطابق مع بورصة دبي للذهب والسلع."
                  : "Liquidate your bullion holdings at premium rates. PGR UAE offers a transparent, rapid sell-back desk. We repurchase certified gold bars, silver bars, and coins directly from our clients, utilizing precise spectroscopic assay checks for real-time payout calculations."}
              </p>
            </div>

            <div className="bg-amber-950/10 border border-[#c5a85c]/20 p-6 rounded space-y-4">
              <h3 className="text-lg font-serif text-[#c5a85c] font-medium">{isAr ? "كيف تعمل عملية البيع والاسترداد المالي؟" : "The 3-Step Bullion Repurchase Workflow"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <div className="text-gold-base font-mono font-bold">01. {isAr ? "تقديم طلب الاسترداد" : "Submit Liquidation Query"}</div>
                  <p className="text-xs text-gray-400">{isAr ? "أدخل تفاصيل الأوزان والماركة والشهادة عبر البوابة الرقمية أو الواتساب." : "Provide brand, weight, and assay certificate via customer desk or WhatsApp."}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-gold-base font-mono font-bold">02. {isAr ? "فحص واختبار الأصالة" : "Assay & Quality Inspection"}</div>
                  <p className="text-xs text-gray-400">{isAr ? "نقوم بفحص السبيكة بشكل دقيق وبدون إتلاف بمعدات الفحص المعتمدة." : "Physical testing verifies purity and density matches LBMA certification standards."}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-gold-base font-mono font-bold">03. {isAr ? "تحويل فوري للأموال" : "Secure Payout Contract"}</div>
                  <p className="text-xs text-gray-400">{isAr ? "إتمام عقد البيع وصرف القيمة نقداً أو بتحويل بنكي مطابق لتعليمات البنك المركزي." : "Contract locked, immediate payout issued via secure bank wire or authorized desk dispatch."}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onOpenQuote("Liquidation Request")}
                className="px-8 py-4 bg-gold-base hover:bg-gold-light text-black text-xs font-bold uppercase tracking-widest rounded transition-all"
              >
                {isAr ? "طلب تسييل فوري" : "Start Liquidation Quote"}
              </button>
              <a
                href={`https://wa.me/971559688837?text=${encodeURIComponent(isAr ? "مرحباً ديوان PGR دبي، أريد تسييل وبيع سبائك ذهب/فضة والحصول على عرض سعر فوري." : "Hello PGR UAE desk, I want to liquidate my gold/silver bullion and request a repurchase quote.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} />
                <span>{isAr ? "تواصل مباشر مع خبير التسييل" : "WhatsApp Liquidation Expert"}</span>
              </a>
            </div>
          </div>
        );

      case "/bullion-desk-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-gold-base font-mono uppercase text-xs tracking-widest block">
                {isAr ? "بوابة الخدمات المعادن الثمينة المؤسسية" : "THE PHYSICAL BULLION STANDARD"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "ديوان تداول السبائك والذهب في دبي" : "Dubai Physical Precious Metals Desk"}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
                {isAr 
                  ? "يمثل ديوان PGR UAE المركز الأساسي لتداول وتملك سبائك ومعادن الاستثمار المادي الفاخر. نربط كبرى شركات التعدين والمستثمرين من دول الخليج والعراق بأرقى مصافي الذهب المعتمدة في دولة الإمارات العربية المتحدة، مع تقديم أعلى درجات الالتزام والحماية."
                  : "PGR UAE is Dubai's premier dedicated gold and silver physical bullion quotation counter. Centered in Dubai's secure global corridor, we assist retail, high-net-worth, and corporate investors in locking wholesale precious metal spot rates with guaranteed physical fulfillment."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2">
                <div className="text-gold-base text-xl font-serif">SEGREGATED Custody</div>
                <p className="text-xs text-gray-400">{isAr ? "حفظ مخصص بالكامل في كبرى خزائن دبي للذهب المؤمنة." : "Fully allocated custody in world-renowned safe-deposit hubs."}</p>
              </div>
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2">
                <div className="text-gold-base text-xl font-serif">LBMA Certified</div>
                <p className="text-xs text-gray-400">{isAr ? "جميع المنتجات معتمدة دولياً ومسجلة بالأرقام التسلسلية الرسمية." : "All bullion is sourced directly from certified LBMA refineries."}</p>
              </div>
              <div className="bg-[#111112] border border-white/[0.04] p-6 rounded space-y-2">
                <div className="text-gold-base text-xl font-serif">UAE - Iraq Corridor</div>
                <p className="text-xs text-gray-400">{isAr ? "شحن آمن متوافق مع كافة المعايير الجمركية الإقليمية." : "Expert logistic clearance handling across regional borders."}</p>
              </div>
            </div>
          </div>
        );

      case "/allocated-storage-dubai":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-gold-base font-mono uppercase text-xs tracking-widest block">
                {isAr ? "التخزين المخصص والحماية الفائقة" : "ALLOCATED BULLION VAULTING"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "تخزين الذهب والفضة المخصص في دبي" : "Allocated & Segregated Bullion Storage Dubai"}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
                {isAr 
                  ? "توفر PGR UAE خدمات التخزين المخصص (Allocated Storage) لسبائكك الذهبية والفضية في خزائن دبي المتطورة والآمنة. نضمن الحراسة Segregated والأكثر أماناً بالتعاون مع كبرى الشركات الرائدة عالمياً في النقل المؤمن لحفظ ثرواتك بعيداً عن تقلبات الأنظمة المالية."
                  : "Protect your physical investments under the gold standard of safety. PGR UAE offers fully allocated, audited, and segregated custody. Your gold and silver bars are held individually in highly secure Dubai custom vault facilities, complete with transparent serial number tracking."}
              </p>
            </div>

            <div className="bg-[#111112] border border-white/[0.04] p-8 rounded space-y-6">
              <h3 className="text-xl font-serif text-white tracking-wide">{isAr ? "ميزات الحفظ المخصص معنا" : "Institutional Storage Highlights"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <h4 className="text-gold-base font-serif font-medium">{isAr ? "حفظ مخصص بالكامل (Allocated & Segregated)" : "Fully Allocated & Segregated"}</h4>
                  <p className="text-xs text-gray-400">{isAr ? "سبائكك تسجل وتخزن بشكل منفصل باسمك ورقمه التسلسلي، وليست مجرد أرقام ورقية." : "Your gold is physically separated, labeled with unique serials, and registered directly in your name."}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-gold-base font-serif font-medium">{isAr ? "تغطية تأمينية شاملة" : "Comprehensive Lloyd's Insurance"}</h4>
                  <p className="text-xs text-gray-400">{isAr ? "جميع الودائع مغطاة بالكامل بوثائق تأمين عالمية ضد جميع المخاطر المحتملة." : "All client holdings are insured at full replacement value against physical loss and theft."}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "/24k-gold-bars-uae":
        return (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-gold-base font-mono uppercase text-xs tracking-widest block">
                {isAr ? "الذهب الخالص عيار ٢٤ قيراط" : "PREMIUM PURE GOLD STANDARDS"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {isAr ? "سبائك ذهب عيار ٢٤ في الإمارات والشرق الأوسط" : "24K Investment Gold Bars in the UAE"}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
                {isAr 
                  ? "سبائك الذهب عيار ٢٤ قيراط بنقاوة تامة تبلغ 999.9 هي الأداة المثالية لحفظ الأصول والثروات. نوفر في PGR UAE السبائك المعتمدة من مصافي سويسرية وإماراتية مرموقة مثل PAMP وValcambi وEmirates Gold."
                  : "Invest exclusively in maximum purity. PGR UAE provides high-volume allocations of 24K pure minted and cast gold bars with a guaranteed purity of 999.9. Sourced from the UAE's premier refineries and globally-renowned Swiss mints."}
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
              <div className="lg:col-span-4 bg-[#111112] border border-white/[0.04] p-6 rounded flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-base font-serif text-white font-medium">{isAr ? "الأوزان المتوفرة فوراً:" : "Standard Purity Weights:"}</h3>
                  <ul className="space-y-2 text-xs text-gray-400 font-mono">
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
                    className="w-full py-3 bg-gold-base hover:bg-gold-light text-black text-xs font-bold uppercase tracking-widest rounded transition-colors"
                  >
                    {isAr ? "حجز عقد سبائك ٢٤" : "Inquire 24K Allocation"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-2xl font-serif text-white">SEO Page Not Found</h1>
          </div>
        );
    }
  };

  // Shared FAQ Section
  const getPageFaqs = () => {
    const defaultFaqs = [
      {
        q: isAr ? "هل الأسعار المعروضة نهائية؟" : "Are the listed prices final and binding?",
        a: isAr 
          ? "لا، جميع الأسعار والتقديرات استرشادية فقط بناءً على أسعار البورصة العالمية المباشرة. الأسعار النهائية وحجز العقود يتم فقط عبر ديوان PGR UAE بعد مراجعة الأوراق، وعلاوة الصب والتخزين المعتمدة."
          : "No. All pricing estimates shown are indicative based on direct global spot markets. Final binding prices are locked manually on our trading counter subject to KYC, specific refiner premiums, and instant stock verification."
      },
      {
        q: isAr ? "كيف يمكنني تقديم مستندات KYC؟" : "How do I submit my KYC documents?",
        a: isAr 
          ? "يمكنك رفع وثائق التحقق بأمان من خلال بوابة العميل الرقمية لدينا، أو من خلال إرسالها بشكل مباشر وسري إلى فريق الامتثال ومكافحة غسيل الأموال في مكتبنا."
          : "You can securely upload your government-issued ID/Passport and corporate trading credentials through your secure PGR Client Dashboard, or coordinate with our compliance officer via WhatsApp."
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
    <div className="space-y-20 py-12" id="seo-landing-pages-container">
      {/* Back Button */}
      <button
        onClick={() => onNavigate("/")}
        className="text-xs text-gold-base hover:text-gold-light font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        &larr; {isAr ? "الرجوع للرئيسية" : "Back to Homepage"}
      </button>

      {/* Main content render */}
      <div className="min-h-[400px]">
        {renderSeoContent()}
      </div>

      {/* Dynamic Accordion FAQs Section */}
      <div className="space-y-6 pt-12 border-t border-white/[0.04]">
        <h2 className="text-xl md:text-2xl font-serif text-white tracking-wide">
          {isAr ? "الأسئلة الشائعة ومراجعة الامتثال والقوانين" : "Regulatory & Bullion FAQ Desk"}
        </h2>
        <div className="space-y-3">
          {getPageFaqs().map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="border border-white/[0.03] rounded bg-[#0b0b0c] overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-white/[0.01] transition-colors cursor-pointer"
                  style={{ direction: isAr ? "rtl" : "ltr" }}
                >
                  <span className="text-sm font-serif font-medium text-white">{faq.q}</span>
                  <ChevronDown size={16} className={`text-gold-base transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-5 border-t border-white/[0.03] text-xs text-gray-400 leading-relaxed bg-[#0d0d0e]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured CTA Section */}
      <div className="bg-[#111112] border border-white/[0.04] p-8 md:p-12 rounded text-center space-y-6">
        <span className="text-gold-base font-mono uppercase text-xs tracking-widest font-bold">
          {isAr ? "تواصل ممتثل مع ديوان تداول المعادن" : "LOCK YOUR CONTRACT SPOT SPOT RATE"}
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-white tracking-tight">
          {isAr ? "هل ترغب في الحصول على تسعير فوري معتمد من الديوان؟" : "Ready to Lock a Firm Bullion Quote?"}
        </h2>
        <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
          {isAr 
            ? "يرجى العلم أن أسعار السبائك والفضة والذهب تتغير كل ثانية. اتصل بنا فوراً أو اطلب عرض سعر معتمد عبر الواتساب لتأمين صفقتك."
            : "Market spots fluctuate continuously. Protect your transaction window by initiating a secure, accredited desk consultation."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={() => onOpenQuote()}
            className="px-6 py-3 bg-gold-base hover:bg-gold-light text-black text-xs font-sans font-bold uppercase tracking-widest rounded transition-colors cursor-pointer"
          >
            {isAr ? "طلب عرض سعر رسمي" : "Request Desk Quote"}
          </button>
          <a
            href={`https://wa.me/971559688837?text=${encodeURIComponent(isAr ? "مرحباً، أريد طلب تسعير فوري وحجز سبيكة ذهب/فضة معتمدة من PGR دبي." : "Hello, I am looking to lock in a firm physical gold or silver bullion quote contract with PGR UAE.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={14} />
            <span>{isAr ? "تواصل عبر الواتساب" : "WhatsApp Bullion Advisor"}</span>
          </a>
        </div>
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { PRODUCTS } from "../data";
import { resolvePublicCatalog } from "../lib/productCatalog";
import { Product, LiveMarketRates } from "../types";
import { ArrowLeft, ArrowRight, Shield, Award, HelpCircle, Phone, FileText, CheckCircle } from "lucide-react";
import { getProductImage } from "../lib/productImages";
import DeskRichContent from "./DeskRichContent";
import { GOLD_BARS_CONTENT, SILVER_BARS_CONTENT } from "../lib/deskPageContent";
import { categoryWhatsAppLink } from "../lib/categoryWhatsApp";
import { trackWhatsAppClick } from "../lib/gtag";
import PricingDisclaimer from "./PricingDisclaimer";

interface ProductLandingPageProps {
  currentLang: "en" | "ar";
  categoryPath: "/gold-bars" | "/silver-bars" | "/bullion-coins" | "/custom-inquiry";
  onNavigate: (path: string) => void;
  onOpenProductDetail: (product: Product) => void;
  rates?: LiveMarketRates | null;
  selectedCurrency?: string;
  onOpenQuote?: (productName?: string) => void;
}

export default function ProductLandingPage({
  currentLang,
  categoryPath,
  onNavigate,
  onOpenProductDetail,
  rates,
  selectedCurrency = "AED",
  onOpenQuote
}: ProductLandingPageProps) {
  const isAr = currentLang === "ar";
  
  // Determine metadata based on category
  const getCategoryMeta = () => {
    switch (categoryPath) {
      case "/gold-bars":
        return {
          categoryKey: "gold_bars",
          title_en: "LBMA Accredited Gold Bars",
          title_ar: "سبائك الذهب المعتمدة دولياً LBMA",
          subtitle_en: "999.9 Fine Accredited Gold Bullion",
          subtitle_ar: "سبائك الذهب الخالص بنقاوة ٩٩٩.٩ للتحوط المالي الموثوق",
          description_en: "Direct physical gold bullion ranging from 1 gram up to 1 Kilogram treasury bars. All bars are certified by globally recognized LBMA-accredited refiners and stamped with unique serial numbers.",
          description_ar: "نقدم تشكيلة سبائك الذهب الفاخرة من وزن جرام واحد وحتى سبائك الخزينة فئة كيلو جرام. سبائك سويسرية وإماراتية معتمدة عالمياً ومصحوبة بشهادات الفحص.",
          faqs: [
            {
              q_en: "What refiners do you provide for gold bars?",
              q_ar: "ما هي المصافي التي توفرونها لسبائك الذهب؟",
              a_en: "We offer gold bars primarily from PAMP Suisse, Valcambi, SAM Precious Metals, Emirates Gold, and Al Etihad. All refiners are accredited with London Bullion Market Association (LBMA) good delivery guidelines.",
              a_ar: "نوفر سبائك من مصفاة بامب سويس، فالكامبي، إس إيه إم، إمارات جولد، ومصفاة الاتحاد للذهب. جميع هذه المصافي مدرجة في القائمة المعتمدة لجمعية سوق السبائك في لندن (LBMA)."
            },
            {
              q_en: "Can I receive the physical gold bar in Dubai?",
              q_ar: "هل يمكنني استلام سبيكة الذهب مادية في دبي؟",
              a_en: "Yes. All quote requests can be fulfilled by physical collection at our secure counter in Dubai, or via fully insured armored shipping within the UAE and select regions.",
              a_ar: "نعم. يتم تسليم السبائك فعلياً في مكتبنا الآمن بدبي، أو شحنها عبر ناقلات غارديان المؤمنة والمصفحة داخل دولة الإمارات العربية المتحدة ومناطق محددة."
            }
          ]
        };
      case "/silver-bars":
        return {
          categoryKey: "silver_bars",
          title_en: "Accredited Fine Silver Bars",
          title_ar: "سبائك الفضة النقية لتعزيز الادخار",
          subtitle_en: "999.0+ Purity Physical Silver Bullion",
          subtitle_ar: "سبائك الفضة الصافية بنقاوة لا تقل عن ٩٩٩ للتحوط الصناعي والمالي",
          description_en: "Procure physical silver bars in standard sizes up to 5 Kilograms. Highly liquid bulk assets sourced directly from world-class refiners with competitive price-to-metal premiums.",
          description_ar: "اعثر على سبائك الفضة الكلاسيكية بأحجام وأوزان مختلفة تتراوح بين أونصة واحدة وحتى سبائك ٥ كيلو جرام. نوفر حلول التحوط بكميات ضخمة ومزايا سعرية منافسة.",
          faqs: [
            {
              q_en: "Is VAT applied on silver bars in the UAE?",
              q_ar: "هل تطبق ضريبة القيمة المضافة على سبائك الفضة في الإمارات؟",
              a_en: "Fine silver bars with purity of 99% or higher may be treated under specialized tax rules in the UAE. Our desk will confirm the precise VAT treatment based on your compliance status and delivery format.",
              a_ar: "تخضع سبائك الفضة الاستثمارية ذات النقاوة ٩٩٪ أو أكثر لمعاملات ضريبية خاصة في دولة الإمارات. سيقوم فريقنا بتأكيد المعالجة الضريبية الدقيقة وفقاً لوضعك القانوني."
            },
            {
              q_en: "What is the minimum weight for silver quotes?",
              q_ar: "ما هو الحد الأدنى لطلب عرض أسعار الفضة？",
              a_en: "While we showcase 10g and 1oz items, large bullion inquiries typically involve weights of 1 KILO, 100 oz, or 5 KILOs to maximize cost efficiency on desk premiums.",
              a_ar: "بينما نعرض أوزاناً تبدأ من ١٠ جرام وأونصة، فإن طلبات عروض الأسعار المفضلة تبدأ من ١ كيلو جرام أو ١٠٠ أونصة لضمان فروق أسعار منافسة للغاية."
            }
          ]
        };
      case "/bullion-coins":
        return {
          categoryKey: "mint_bars_coins",
          title_en: "Mint Bars & Bullion Coins",
          title_ar: "عملات السبائك والمسكوكات الرسمية",
          subtitle_en: "Certified Pure Gold & Silver Legal Tender Coins",
          subtitle_ar: "عملات ذهبية رسمية مدعومة قانونياً من الحكومات والسكك الملكية",
          description_en: "Accredited mint bars and sovereign bullion coins from world-renowned national mints. PGR UAE desk sources mint bars and bullion coins with indicative market reference pricing and desk-confirmed quote.",
          description_ar: "سبائك مصكوكة وعملات سيادية من دور سك وطنية عالمية. يوفر ديوان PGR UAE منتجات مصكوكة مع تسعير استرشادي وعرض سعر مؤكد.",
          faqs: [
            {
              q_en: "Do these bullion coins carry legal tender face value?",
              q_ar: "هل تحمل هذه العملات الذهبية قيمة نقدية قانونية؟",
              a_en: "Yes, accredited mint bars and bullion coins from partner sovereign mints carry official legal tender backing in their countries of origin.",
              a_ar: "نعم، السبائك المصكوكة وعملات السبائك المعتمدة من شركائنا تحمل ضماناً قانونياً رسمياً في بلدان المنشأ."
            },
            {
              q_en: "Are the coin capsules sealed?",
              q_ar: "هل كبسولات العملات محكمة الإغلاق؟",
              a_en: "All of our sovereign coins are issued directly in archival-grade airtight optical acrylic capsules to prevent oxygenation, dust, and physical wear.",
              a_ar: "نعم، يتم تسليم جميع العملات الملكية والمسكوكات في كبسولات أكريليك بصرية محكمة ومضادة للخدش والأكسدة لحفظ بريق السبيكة وقيمتها."
            }
          ]
        };
      default:
        return {
          categoryKey: "custom_inquiry",
          title_en: "Bespoke Refining & Bulk Inquiry",
          title_ar: "طلبات الصهر المخصصة والسبائك غير القياسية",
          subtitle_en: "Custom Bullion Sizing & Industrial Grain Desk",
          subtitle_ar: "توفير أوزان خاصة وحبوب الذهب والفضة للأغراض الصناعية",
          description_en: "For institutional clients, industrial users, and family offices requiring custom casting weights, specialized purity assaying, or bulk grain allocations. Our desk works directly with accredited refiners to fulfill complex mandates.",
          description_ar: "للشركات والمصانع والصناديق العائلية التي تتطلب أوزاناً خاصة أو صباً مخصصاً أو حبوب ذهب وفضة نقية عيار ٢٤. نقوم بتلبية الطلبات المعقدة بالتعاون المباشر مع المصافي المعتمدة.",
          faqs: [
            {
              q_en: "How does the custom inquiry process work?",
              q_ar: "كيف تسير إجراءات الطلبات المخصصة؟",
              a_en: "You submit your volume and purity specifications. Our desk coordinates with certified refiners, runs an initial KYC verification, and presents an institutional spread and timeline for final desk confirmation.",
              a_ar: "تقوم بتقديم الحجم والمواصفات المطلوبة، وسينسق ديواننا مع المصافي المعتمدة لإجراء المراجعات وتوفير عرض أسعار مؤسساتي مع جدول زمني للتسليم."
            }
          ]
        };
    }
  };

  const meta = getCategoryMeta();
  const filteredProducts = resolvePublicCatalog(PRODUCTS).filter((p) => p.category === meta.categoryKey);

  // Calculate live indicative prices
  const calculateIndicativePrice = (prod: Product) => {
    if (!rates) return null;
    const cur = selectedCurrency as any;
    const isGoldMetal = prod.technical_specs.metal === "gold";
    const baseSpot = isGoldMetal ? rates.gold.currencies[cur] : rates.silver.currencies[cur];

    if (!baseSpot) return null;

    let totalGrams = 0;
    if (prod.technical_specs.weight_grams) {
      totalGrams = prod.technical_specs.weight_grams;
    } else if (prod.technical_specs.weight_oz) {
      totalGrams = prod.technical_specs.weight_oz * 31.1034768;
    }

    if (totalGrams === 0) return null;

    const baseCost = totalGrams * baseSpot.gram;
    const finalCost = baseCost * prod.premium_multiplier;

    return finalCost.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getWhatsAppLink = (prod: Product) => {
    const pName = isAr ? prod.name_ar : prod.name_en;
    const baseMsg = isAr
      ? `مرحباً، أريد طلب عرض سعر رسمي لمنتج: ${pName}`
      : `Hello, I would like to request a firm quote from the PGR UAE desk for: ${pName}`;
    return `https://wa.me/971559688837?text=${encodeURIComponent(baseMsg)}`;
  };

  const isDeskCategory = categoryPath === "/gold-bars" || categoryPath === "/silver-bars";
  const categoryWa = categoryWhatsAppLink(
    categoryPath === "/gold-bars" ? "gold_bars" : "silver_bars",
    currentLang
  );

  return (
    <div className="py-12" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="space-y-12">
        
        {/* Category Hero Banner */}
        <div className="bg-brand-card border border-soft-border rounded p-8 md:p-12 shadow-sm space-y-4 relative overflow-hidden">
          {/* Subtle gold decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-base/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-bg border border-soft-border">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-base animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-mono">
              {isAr ? "كتالوج السبائك الفاخرة" : "Premium Bullion Catalog"}
            </span>
          </div>
          
          <h1 className="text-text-charcoal font-serif text-3xl md:text-4xl font-medium tracking-wide">
            {isAr ? meta.title_ar : meta.title_en}
          </h1>
          <p className="text-gold-dark text-xs font-mono tracking-widest uppercase font-bold">
            {isAr ? meta.subtitle_ar : meta.subtitle_en}
          </p>
          <p className="text-text-secondary text-xs md:text-sm leading-relaxed max-w-4xl pt-1">
            {isAr ? meta.description_ar : meta.description_en}
          </p>

          {(categoryPath === "/gold-bars" || categoryPath === "/silver-bars") && (
            <div className="pt-6 border-t border-soft-border/60 mt-6">
              <DeskRichContent
                currentLang={currentLang}
                category={categoryPath === "/gold-bars" ? "gold_bars" : "silver_bars"}
                introEn={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.introEn : SILVER_BARS_CONTENT.introEn}
                introAr={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.introAr : SILVER_BARS_CONTENT.introAr}
                weightsEn={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.weightsEn : SILVER_BARS_CONTENT.weightsEn}
                weightsAr={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.weightsAr : SILVER_BARS_CONTENT.weightsAr}
                purityEn={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.purityEn : SILVER_BARS_CONTENT.purityEn}
                purityAr={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.purityAr : SILVER_BARS_CONTENT.purityAr}
                brandsEn={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.brandsEn : undefined}
                brandsAr={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.brandsAr : undefined}
                sections={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.sections : SILVER_BARS_CONTENT.sections}
                faqs={categoryPath === "/gold-bars" ? GOLD_BARS_CONTENT.faqs : SILVER_BARS_CONTENT.faqs}
                onNavigate={onNavigate}
                onOpenQuote={() => (onOpenQuote ? onOpenQuote() : onNavigate("/request-quote"))}
                pagePath={categoryPath}
              />
            </div>
          )}

          <div className="pt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-wider font-mono">
            <span className="flex items-center gap-1.5 text-olive-accent font-bold">
              <Shield size={12} />
              {isAr ? "سبائك معتمدة ١٠٠٪" : "100% Certified Purity"}
            </span>
            <span className="text-champagne hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-gold-dark font-bold">
              <Award size={12} />
              {isAr ? "أسعار مرتبطة بالبورصة المباشرة" : "Rates Linked to Live Spot"}
            </span>
          </div>
        </div>

        {/* Weight formats — compact desk table for gold/silver */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-soft-border pb-3">
              <h2 className="text-text-charcoal uppercase tracking-wider font-serif text-base font-medium">
                {isAr ? "الأوزان — اطلب عرض سعر من المكتب" : "Weights — Request Desk Quote"}
              </h2>
            </div>

            {isDeskCategory ? (
              <div className="overflow-x-auto rounded-lg border border-soft-border bg-brand-card">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-soft-border bg-brand-bg">
                      <th className="px-4 py-3 font-mono uppercase tracking-wider text-text-secondary">{isAr ? "الوزن" : "Weight"}</th>
                      <th className="px-4 py-3 font-mono uppercase tracking-wider text-text-secondary">{isAr ? "النقاوة" : "Purity"}</th>
                      <th className="px-4 py-3 font-mono uppercase tracking-wider text-text-secondary">{isAr ? "الإجراء" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="border-b border-soft-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium text-text-charcoal">{prod.weight_label}</td>
                        <td className="px-4 py-3 text-text-secondary">{prod.purity}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenQuote
                                ? onOpenQuote(isAr ? prod.name_ar : prod.name_en)
                                : onNavigate("/request-quote")
                            }
                            className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold-dark hover:text-gold-base"
                          >
                            {isAr ? "طلب عرض سعر" : "Request Quote"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="px-4 py-3 text-[10px] font-mono text-text-secondary border-t border-soft-border">
                  {isAr
                    ? "الأسعار استرشادية فقط — عرض السعر النهائي من المكتب."
                    : "Indicative market reference only — final quote confirmed by desk."}
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const livePrice = calculateIndicativePrice(prod);
                return (
                  <div 
                    key={prod.id}
                    className="bg-brand-card border border-soft-border hover:border-gold-base rounded p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    <div className="space-y-4">
                      {/* Metal tag, purity and weight */}
                      <div className="flex justify-between items-start">
                        <span className="text-text-secondary text-[10px] uppercase tracking-widest font-mono font-bold bg-brand-bg px-2.5 py-1 rounded border border-soft-border">
                          {prod.weight_label}
                        </span>
                        <span className="text-gold-dark text-[10px] uppercase tracking-wider font-mono font-bold bg-brand-bg px-2 py-0.5 rounded border border-soft-border/50">
                          {prod.purity}
                        </span>
                      </div>

                      {/* Product image (optional, styled beautifully) */}
                      <div 
                        onClick={() => onOpenProductDetail(prod)}
                        className="h-40 w-full rounded bg-brand-bg border border-soft-border/50 overflow-hidden flex items-center justify-center p-4 cursor-pointer relative"
                      >
                        <img
                          src={getProductImage(prod)}
                          alt={prod.name_en}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getProductImage(prod);
                          }}
                          className="h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 pointer-events-none ${prod.technical_specs.metal === 'gold' ? 'shimmer-mask-gold' : 'shimmer-mask'}`} />
                      </div>

                      {/* Title & Metadata */}
                      <div onClick={() => onOpenProductDetail(prod)} className="space-y-1 cursor-pointer">
                        <div className="text-[10px] uppercase font-mono text-gold-dark font-bold tracking-wider">
                          {prod.manufacturer} • <span className="capitalize">{prod.technical_specs.metal === "gold" ? (isAr ? "ذهب" : "Gold") : (isAr ? "فضة" : "Silver")}</span>
                        </div>
                        <h3 className="text-text-charcoal text-sm font-serif font-medium leading-snug group-hover:text-gold-dark transition-colors">
                          {isAr ? prod.name_ar : prod.name_en}
                        </h3>
                        <p className="text-text-secondary text-[11px] leading-relaxed line-clamp-2 font-sans">
                          {isAr ? prod.description_ar : prod.description_en}
                        </p>
                      </div>

                      {/* Pricing section with required compliance wording */}
                      <div className="pt-3 border-t border-soft-border/60 space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-mono text-text-secondary">
                            {isAr ? "السعر الاسترشادي المباشر:" : "Indicative Live Price:"}
                          </span>
                          {livePrice ? (
                            <span className="text-sm font-mono font-bold text-gold-dark">
                              {livePrice} <span className="text-[10px] text-text-secondary">{selectedCurrency}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-gold-dark font-bold">
                              {isAr ? "يتطلب تسعير فوري" : "Quote on Request"}
                            </span>
                          )}
                        </div>
                        
                        {/* Final Quote Confirmed wording mandated by compliance QA */}
                        <div className="bg-brand-bg border border-soft-border px-2 py-1.5 rounded text-[9px] font-mono text-olive-accent leading-tight flex items-start gap-1">
                          <CheckCircle size={10} className="shrink-0 mt-0.5 text-olive-accent" />
                          <span>
                            {isAr 
                              ? "السعر الاسترشادي خاضع للتأكيد النهائي من مكتب تداول بي جي آر الإمارات."
                              : "Final quote confirmed by PGR UAE desk before order settlement."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Request Quote Buttons */}
                    <div className="pt-4 mt-4 border-t border-soft-border/60 flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => {
                          if (onOpenQuote) {
                            onOpenQuote(isAr ? prod.name_ar : prod.name_en);
                          } else {
                            onNavigate("/request-quote");
                          }
                        }}
                        className="flex-1 py-2 px-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-colors text-center cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <FileText size={11} />
                        <span>{isAr ? "طلب تسعير مؤكد" : "Request Firm Quote"}</span>
                      </button>

                      <a 
                        href={getWhatsAppLink(prod)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackWhatsAppClick(`product_landing_${prod.id}`)}
                        className="flex-1 py-2 px-2.5 bg-brand-card hover:bg-brand-bg border border-soft-border text-text-charcoal font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <Phone size={11} className="text-olive-accent" />
                        <span>{isAr ? "طلب واتساب" : "WhatsApp Desk"}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        ) : (
          /* Custom/Bespoke Inquiry View */
          <div className="bg-brand-card border border-soft-border rounded-lg p-8 md:p-12 text-center space-y-6 max-w-xl mx-auto shadow-sm">
            <h3 className="text-text-charcoal text-base font-serif font-medium uppercase tracking-wide">
              {isAr ? "طلب تخصيص سبائك أو صهر مخصص" : "Bespoke Refining Custom Quote"}
            </h3>
            <p className="text-text-secondary text-xs leading-relaxed font-sans">
              {isAr
                ? "هل تحتاج لسبائك بأوزان مخصصة أو طلبيات تجارية كبيرة؟ يتخصص مكتبنا في صياغة المعادن وصهرها بالتعاون مع مصافي LBMA لتأمين أوزان الخزانة وحبوب الذهب والفضة الفاخرة."
                : "Looking for customized weights, large wholesale volumes, or industrial grain format? Submit a custom quote request, and our desk will secure tailored pricing and refiner availability."}
            </p>
            <button
              onClick={() => onNavigate("/request-quote")}
              className="px-8 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal hover:text-white font-mono font-bold uppercase tracking-widest rounded shadow transition-all duration-300 cursor-pointer text-[10px]"
            >
              {isAr ? "تعبئة نموذج الطلبات المخصصة" : "Open Custom Inquiry Form"}
            </button>
          </div>
        )}

        {!isDeskCategory && <PricingDisclaimer currentLang={currentLang} />}

        {/* FAQs — skip for gold/silver (handled in DeskRichContent) */}
        {!isDeskCategory && (
        <div className="space-y-6">
          <div className="border-b border-soft-border pb-3">
            <h3 className="text-text-charcoal uppercase tracking-wider font-serif text-base font-medium flex items-center gap-2">
              <HelpCircle size={16} className="text-gold-dark" />
              {isAr ? "الأسئلة الشائعة حول الكتالوج" : "Category FAQ & Guidelines"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meta.faqs.map((faq, i) => (
              <div key={i} className="bg-brand-card border border-soft-border p-5 rounded space-y-2 shadow-sm">
                <h4 className="text-text-charcoal font-serif font-medium text-xs leading-snug">
                  {isAr ? faq.q_ar : faq.q_en}
                </h4>
                <p className="text-text-secondary font-sans leading-relaxed text-[11px] pt-1">
                  {isAr ? faq.a_ar : faq.a_en}
                </p>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* CTA Banner */}
        <div className="bg-brand-bg border border-soft-border p-8 rounded flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-text-charcoal font-serif text-base font-medium uppercase">
              {isAr ? "هل ترغب في الحصول على تسعير نهائي؟" : "Ready to Request a Firm Quote?"}
            </h4>
            <p className="text-text-secondary text-[11px] max-w-2xl font-sans leading-normal">
              {isAr
                ? "يستغرق تقديم الطلب أقل من دقيقتين. بعد تقديم النموذج، سيتصل بك فريقنا لتوجيهك بخطوات مراجعة الهوية وتلقي السعر المؤكد."
                : "Submit your requirements. PGR UAE will review stock levels, spot values, and direct you with our simple digital KYC workflow to issue a firm desk quote."}
            </p>
          </div>
          
          <button
            onClick={() => {
              if (onOpenQuote) {
                onOpenQuote();
              } else {
                onNavigate("/request-quote");
              }
            }}
            className="w-full md:w-auto px-8 py-3.5 bg-panel-dark hover:bg-gold-dark text-white hover:text-white font-mono font-bold uppercase tracking-widest rounded shadow transition-all duration-300 hover:scale-[1.01] shrink-0 text-[10px] cursor-pointer"
          >
            {isAr ? "طلب تسعير مؤكد الآن" : "Request Firm Quote"}
          </button>
        </div>

      </div>
    </div>
  );
}

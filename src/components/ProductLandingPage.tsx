import React, { useState } from "react";
import { PRODUCTS } from "../data";
import { Product, LiveMarketRates } from "../types";
import { ArrowLeft, ArrowRight, Shield, Award, HelpCircle, Phone, FileText, CheckCircle } from "lucide-react";
import { getProductImage } from "../lib/productImages";

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
          subtitle_en: "999.9 Fine Investment-Grade Gold Bullion",
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
          title_en: "Investment-Grade Fine Silver Bars",
          title_ar: "سبائك الفضة النقية لتعزيز الادخار",
          subtitle_en: "999.0+ Purity Physical Silver Bullion",
          subtitle_ar: "سبائك الفضة الصافية بنقاوة لا تقل عن ٩٩٩ للتحوط الصناعي والمالي",
          description_en: "Procure physical silver bars in standard sizes up to 5 Kilograms. Highly liquid bulk assets sourced directly from world-class refiners with competitive price-to-metal premiums.",
          description_ar: "اعثر على سبائك الفضة الكلاسيكية بأحجام وأوزان مختلفة تتراوح بين أونصة واحدة وحتى سبائك ٥ كيلو جرام. نوفر حلول التحوط بكميات ضخمة ومزايا سعرية منافسة.",
          faqs: [
            {
              q_en: "Is VAT applied on silver bars in the UAE?",
              q_ar: "هل تطبق ضريبة القيمة المضافة على سبائك الفضة في الإمارات؟",
              a_en: "Investment-grade silver bars with purity of 99% or higher are treated under specialized tax treatments in the UAE. Our desk will confirm the precise VAT treatment based on your compliance status and delivery format.",
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
          categoryKey: "gold_coins",
          title_en: "Sovereign Mints Bullion Coins",
          title_ar: "عملات السبائك والمسكوكات الرسمية",
          subtitle_en: "Certified Pure Gold & Silver Legal Tender Coins",
          subtitle_ar: "عملات ذهبية رسمية مدعومة قانونياً من الحكومات والسكك الملكية",
          description_en: "Certified gold and silver coins from prestigious sovereign mints. Includes the British Sovereign & Britannia, Canadian Maple Leaf, American Eagle, and South African Krugerrand. Each coin combines collector value with maximum bullion liquidity.",
          description_ar: "اقتنِ المسكوكات الرسمية والعملات الذهبية التاريخية من مصافي دار السك الرسمية. تشمل عملات السوفرين وبريتانيا الملكية، القيقب الكندي، النسر الأمريكي، والكروغران.",
          faqs: [
            {
              q_en: "Do these bullion coins carry legal tender face value?",
              q_ar: "هل تحمل هذه العملات الذهبية قيمة نقدية قانونية؟",
              a_en: "Yes, coins like the Sovereign, Britannia, and Maple Leaf are official legal tender in their countries of origin, backed fully by their respective central banks and governments.",
              a_ar: "نعم، عملات مثل السوفرين البريطاني وبريتانيا والMaple Leaf الكندي هي عملات قانونية رسمية في بلدان المنشأ، ومدعومة كلياً من الحكومات والخزائن الرسمية."
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
          categoryKey: "custom",
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
  const filteredProducts = PRODUCTS.filter(p => p.category === meta.categoryKey);

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

  return (
    <div className="bg-[#FAF9F5] py-12" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="space-y-12">
        
        {/* Category Hero Banner */}
        <div className="bg-white border border-[#E8DEC9] rounded p-8 md:p-12 shadow-sm space-y-4 relative overflow-hidden">
          {/* Subtle gold decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A15B]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#E8DEC9]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C6A15B] animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#5E564D] font-mono">
              {isAr ? "كتالوج السبائك الفاخرة" : "Premium Bullion Catalog"}
            </span>
          </div>
          
          <h1 className="text-[#1F1A17] font-serif text-3xl md:text-4xl font-medium tracking-wide">
            {isAr ? meta.title_ar : meta.title_en}
          </h1>
          <p className="text-[#A47C36] text-xs font-mono tracking-widest uppercase font-bold">
            {isAr ? meta.subtitle_ar : meta.subtitle_en}
          </p>
          <p className="text-[#5E564D] text-xs md:text-sm leading-relaxed max-w-4xl pt-1">
            {isAr ? meta.description_ar : meta.description_en}
          </p>

          <div className="pt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-wider font-mono">
            <span className="flex items-center gap-1.5 text-[#556B5D] font-bold">
              <Shield size={12} />
              {isAr ? "سبائك معتمدة ١٠٠٪" : "100% Certified Purity"}
            </span>
            <span className="text-[#E8DEC9] hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-[#A47C36] font-bold">
              <Award size={12} />
              {isAr ? "أسعار مرتبطة بالبورصة المباشرة" : "Rates Linked to Live Spot"}
            </span>
          </div>
        </div>

        {/* Catalog Items Display Grid */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E8DEC9] pb-3">
              <h2 className="text-[#1F1A17] uppercase tracking-wider font-serif text-base font-medium">
                {isAr ? "الأوزان والمواصفات المتاحة" : "Available Weight Formats"}
              </h2>
              <span className="text-[#5E564D] uppercase tracking-widest text-[10px] font-mono">
                {filteredProducts.length} {isAr ? "مواصفات مسجلة" : "Specifications Listed"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const livePrice = calculateIndicativePrice(prod);
                return (
                  <div 
                    key={prod.id}
                    className="bg-white border border-[#E8DEC9] hover:border-[#C6A15B] rounded p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    <div className="space-y-4">
                      {/* Metal tag, purity and weight */}
                      <div className="flex justify-between items-start">
                        <span className="text-[#5E564D] text-[10px] uppercase tracking-widest font-mono font-bold bg-[#FAF9F5] px-2.5 py-1 rounded border border-[#E8DEC9]">
                          {prod.weight_label}
                        </span>
                        <span className="text-[#A47C36] text-[10px] uppercase tracking-wider font-mono font-bold bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8DEC9]/50">
                          {prod.purity}
                        </span>
                      </div>

                      {/* Product image (optional, styled beautifully) */}
                      <div 
                        onClick={() => onOpenProductDetail(prod)}
                        className="h-40 w-full rounded bg-[#FAF9F5] border border-[#E8DEC9]/50 overflow-hidden flex items-center justify-center p-4 cursor-pointer relative"
                      >
                        <img
                          src={getProductImage(prod)}
                          alt={prod.name_en}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = prod.technical_specs.metal === "gold"
                              ? "/images/products/02-gold-bars-1g-5g-10g.webp"
                              : "/images/products/06-silver-bars-1oz-100g.webp";
                          }}
                          className="h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 pointer-events-none ${prod.technical_specs.metal === 'gold' ? 'shimmer-mask-gold' : 'shimmer-mask'}`} />
                      </div>

                      {/* Title & Metadata */}
                      <div onClick={() => onOpenProductDetail(prod)} className="space-y-1 cursor-pointer">
                        <div className="text-[10px] uppercase font-mono text-[#A47C36] font-bold tracking-wider">
                          {prod.manufacturer} • <span className="capitalize">{prod.technical_specs.metal === "gold" ? (isAr ? "ذهب" : "Gold") : (isAr ? "فضة" : "Silver")}</span>
                        </div>
                        <h3 className="text-[#1F1A17] text-sm font-serif font-medium leading-snug group-hover:text-[#A47C36] transition-colors">
                          {isAr ? prod.name_ar : prod.name_en}
                        </h3>
                        <p className="text-[#5E564D] text-[11px] leading-relaxed line-clamp-2 font-sans">
                          {isAr ? prod.description_ar : prod.description_en}
                        </p>
                      </div>

                      {/* Pricing section with required compliance wording */}
                      <div className="pt-3 border-t border-[#E8DEC9]/60 space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-mono text-[#5E564D]">
                            {isAr ? "السعر الاسترشادي المباشر:" : "Indicative Live Price:"}
                          </span>
                          {livePrice ? (
                            <span className="text-sm font-mono font-bold text-[#A47C36]">
                              {livePrice} <span className="text-[10px] text-[#5E564D]">{selectedCurrency}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-[#A47C36] font-bold">
                              {isAr ? "يتطلب تسعير فوري" : "Quote on Request"}
                            </span>
                          )}
                        </div>
                        
                        {/* Final Quote Confirmed wording mandated by compliance QA */}
                        <div className="bg-[#FAF9F5] border border-[#E8DEC9] px-2 py-1.5 rounded text-[9px] font-mono text-[#556B5D] leading-tight flex items-start gap-1">
                          <CheckCircle size={10} className="shrink-0 mt-0.5 text-[#556B5D]" />
                          <span>
                            {isAr 
                              ? "السعر الاسترشادي خاضع للتأكيد النهائي من مكتب تداول بي جي آر الإمارات."
                              : "Final quote confirmed by PGR UAE desk before order settlement."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Request Quote Buttons */}
                    <div className="pt-4 mt-4 border-t border-[#E8DEC9]/60 flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => {
                          if (onOpenQuote) {
                            onOpenQuote(isAr ? prod.name_ar : prod.name_en);
                          } else {
                            onNavigate("/request-quote");
                          }
                        }}
                        className="flex-1 py-2 px-2.5 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-colors text-center cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <FileText size={11} />
                        <span>{isAr ? "طلب تسعير مؤكد" : "Request Firm Quote"}</span>
                      </button>

                      <a 
                        href={getWhatsAppLink(prod)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-2.5 bg-white hover:bg-[#FAF9F5] border border-[#E8DEC9] text-[#1F1A17] font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <Phone size={11} className="text-[#556B5D]" />
                        <span>{isAr ? "طلب واتساب" : "WhatsApp Desk"}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Custom/Bespoke Inquiry View */
          <div className="bg-white border border-[#E8DEC9] rounded-lg p-8 md:p-12 text-center space-y-6 max-w-xl mx-auto shadow-sm">
            <h3 className="text-[#1F1A17] text-base font-serif font-medium uppercase tracking-wide">
              {isAr ? "طلب تخصيص سبائك أو صهر مخصص" : "Bespoke Refining Custom Quote"}
            </h3>
            <p className="text-[#5E564D] text-xs leading-relaxed font-sans">
              {isAr
                ? "هل تحتاج لسبائك بأوزان مخصصة أو طلبيات تجارية كبيرة؟ يتخصص مكتبنا في صياغة المعادن وصهرها بالتعاون مع مصافي LBMA لتأمين أوزان الخزانة وحبوب الذهب والفضة الفاخرة."
                : "Looking for customized weights, large wholesale volumes, or industrial grain format? Submit a custom quote request, and our desk will secure tailored pricing and refiner availability."}
            </p>
            <button
              onClick={() => onNavigate("/request-quote")}
              className="px-8 py-3.5 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white font-mono font-bold uppercase tracking-widest rounded shadow transition-all duration-300 cursor-pointer text-[10px]"
            >
              {isAr ? "تعبئة نموذج الطلبات المخصصة" : "Open Custom Inquiry Form"}
            </button>
          </div>
        )}

        {/* Pricing Policy Disclaimer Banner */}
        <div className="bg-[#FFFDF8] border border-[#E8DEC9] rounded p-5 space-y-2 shadow-sm">
          <h4 className="text-[#A47C36] text-[10px] uppercase tracking-widest font-bold font-mono flex items-center gap-2">
            ⚠️ {isAr ? "تنويه تسعير إرشادي مهم" : "IMPORTANT INDICATIVE PRICING NOTICE"}
          </h4>
          <p className="text-[#5E564D] text-[11px] leading-relaxed font-sans">
            {isAr
              ? "الأسعار المعروضة على الموقع هي أسعار مرجعية وإرشادية فقط تعكس تقلبات البورصة الفورية وتخلف علاوات التصنيع وتكاليف الشحن. لا يمكن إبرام تسوية أو تثبيت سعر شراء نهائي إلا بصدور عينات عروض الأسعار النهائية المؤكدة من ديوان PGR UAE. قد تكون مراجعة الامتثال مطلوبة قبل تأكيد أي معاملة."
              : "All values, rates, and catalog prices are indicative only and based on global spot market inputs. Physical metal premiums, logistical handling, and VAT treatments apply. You must contact our desk to lock the spot and receive a Final Desk Confirmation. Regulatory compliance reviews may be required."}
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="border-b border-[#E8DEC9] pb-3">
            <h3 className="text-[#1F1A17] uppercase tracking-wider font-serif text-base font-medium flex items-center gap-2">
              <HelpCircle size={16} className="text-[#A47C36]" />
              {isAr ? "الأسئلة الشائعة حول الكتالوج" : "Category FAQ & Guidelines"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meta.faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-[#E8DEC9] p-5 rounded space-y-2 shadow-sm">
                <h4 className="text-[#1F1A17] font-serif font-medium text-xs leading-snug">
                  {isAr ? faq.q_ar : faq.q_en}
                </h4>
                <p className="text-[#5E564D] font-sans leading-relaxed text-[11px] pt-1">
                  {isAr ? faq.a_ar : faq.a_en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#F7F4ED] border border-[#E8DEC9] p-8 rounded flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-[#1F1A17] font-serif text-base font-medium uppercase">
              {isAr ? "هل ترغب في الحصول على تسعير نهائي؟" : "Ready to Request a Firm Quote?"}
            </h4>
            <p className="text-[#5E564D] text-[11px] max-w-2xl font-sans leading-normal">
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
            className="w-full md:w-auto px-8 py-3.5 bg-[#1F1A17] hover:bg-[#A47C36] text-white hover:text-white font-mono font-bold uppercase tracking-widest rounded shadow transition-all duration-300 hover:scale-[1.01] shrink-0 text-[10px] cursor-pointer"
          >
            {isAr ? "طلب تسعير مؤكد الآن" : "Request Firm Quote"}
          </button>
        </div>

      </div>
    </div>
  );
}

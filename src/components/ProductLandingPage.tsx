import React, { useState } from "react";
import Logo from "./Logo";
import { PRODUCTS } from "../data";
import { Product } from "../types";
import { ArrowLeft, ArrowRight, Shield, Award, HelpCircle, CheckSquare, MessageSquare, ExternalLink } from "lucide-react";

interface ProductLandingPageProps {
  currentLang: "en" | "ar";
  categoryPath: "/gold-bars" | "/silver-bars" | "/bullion-coins" | "/custom-inquiry";
  onNavigate: (path: string) => void;
  onOpenProductDetail: (product: Product) => void;
}

export default function ProductLandingPage({ currentLang, categoryPath, onNavigate, onOpenProductDetail }: ProductLandingPageProps) {
  
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
              q_ar: "ما هو الحد الأدنى لطلب عرض أسعار الفضة؟",
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
  
  // Filter products by category
  const filteredProducts = PRODUCTS.filter(p => p.category === meta.categoryKey);

  return (
    <div className="min-h-screen bg-[#070707] text-gray-300 font-mono text-xs py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gold-dark/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

      {/* Breadcrumb Header */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center relative z-10">
        <button
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
        >
          {currentLang === "ar" ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{currentLang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
        </button>
        <Logo className="w-9 h-9" showText={false} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Category Hero Block */}
        <div className="bg-[#0d0d0e] border border-white/[0.03] rounded-lg p-8 md:p-12 shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.05]">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-base"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
              {currentLang === "ar" ? "كتالوج السبائك الفاخرة" : "Premium Bullion Catalog"}
            </span>
          </div>
          
          <h1 className="text-white font-serif text-3xl md:text-4xl font-extrabold tracking-tight">
            {currentLang === "ar" ? meta.title_ar : meta.title_en}
          </h1>
          <p className="text-[#c5a85c] text-sm tracking-widest uppercase font-semibold">
            {currentLang === "ar" ? meta.subtitle_ar : meta.subtitle_en}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed max-w-4xl font-sans pt-2">
            {currentLang === "ar" ? meta.description_ar : meta.description_en}
          </p>

          <div className="pt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1 text-[#c5a85c] font-bold">
              <Shield size={12} />
              {currentLang === "ar" ? "سبائك معتمدة ١٠٠٪" : "100% Certified Purity"}
            </span>
            <span className="text-white/10 hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Award size={12} />
              {currentLang === "ar" ? "الأسعار مرتبطة بالسعر العالمي المباشر" : "Rates Linked to Live Spot"}
            </span>
          </div>
        </div>

        {/* Dynamic Display of Catalog Items */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
              <h2 className="text-white uppercase tracking-widest font-bold text-sm font-serif">
                {currentLang === "ar" ? "الأوزان والمواصفات المتاحة" : "Available Weight Formats"}
              </h2>
              <span className="text-gray-500 uppercase tracking-widest text-[10px]">
                {filteredProducts.length} {currentLang === "ar" ? "منتج" : "Specifications Listed"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => onOpenProductDetail(prod)}
                  className="bg-[#0d0d0e] border border-white/[0.04] hover:border-[#c5a85c]/40 rounded p-6 shadow-md transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group cursor-pointer relative"
                >
                  {/* Subtle hover glow accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c5a85c]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold bg-[#070707] px-2.5 py-1 rounded border border-white/5">
                        {prod.weight_label}
                      </span>
                      <span className="text-[#c5a85c] text-[10px] uppercase tracking-wider font-bold">
                        {prod.purity}
                      </span>
                    </div>

                    <h3 className="text-white text-sm font-serif group-hover:text-[#c5a85c] transition-colors leading-snug">
                      {currentLang === "ar" ? prod.name_ar : prod.name_en}
                    </h3>
                    
                    <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 font-sans">
                      {currentLang === "ar" ? prod.description_ar : prod.description_en}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/[0.03] mt-6 flex justify-between items-center relative z-10">
                    <span className="text-emerald-500 font-bold uppercase text-[9px] bg-emerald-500/10 px-2.5 py-1 rounded">
                      {currentLang === "ar" ? "متاح للطلب" : prod.availability}
                    </span>
                    <button 
                      className="text-white/60 group-hover:text-white uppercase text-[10px] font-bold tracking-wider flex items-center gap-1"
                    >
                      <span>{currentLang === "ar" ? "التفاصيل والطلب" : "Details"}</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Custom inquiry form or message when no listed standard items */
          <div className="bg-[#0d0d0e] border border-white/[0.04] rounded-lg p-8 md:p-12 text-center space-y-6 max-w-xl mx-auto">
            <h3 className="text-white text-base font-serif font-bold uppercase">
              {currentLang === "ar" ? "طلب تخصيص سبائك أو صهر مخصص" : "Bespoke Refining Custom Quote"}
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              {currentLang === "ar"
                ? "هل تحتاج لسبائك بأوزان مخصصة أو طلبيات تجارية كبيرة؟ يتخصص مكتبنا في صياغة المعادن وصهرها بالتعاون مع مصافي LBMA لتأمين أوزان الخزانة وحبوب الذهب والفضة الفاخرة."
                : "Looking for customized weights, large wholesale volumes, or industrial grain format? Submit a custom quote request, and our desk will secure tailored pricing and refiner availability."}
            </p>
            <button
              onClick={() => onNavigate("/request-quote")}
              className="px-8 py-3 bg-gold-gradient text-black font-sans font-bold uppercase tracking-widest rounded shadow-lg hover:scale-[1.02] transform transition-all duration-300 cursor-pointer text-[10px]"
            >
              {currentLang === "ar" ? "تعبئة نموذج الطلبات المخصصة" : "Open Custom Inquiry Form"}
            </button>
          </div>
        )}

        {/* Indicative Pricing Policy Notice */}
        <div className="bg-amber-950/10 border border-[#c5a85c]/10 rounded p-5 space-y-2">
          <h4 className="text-[#c5a85c] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
            ⚠️ {currentLang === "ar" ? "تنويه تسعير إرشادي مهم" : "IMPORTANT INDICATIVE PRICING NOTICE"}
          </h4>
          <p className="text-gray-400 text-[11px] leading-normal font-sans">
            {currentLang === "ar"
              ? "الأسعار المعروضة على الموقع هي أسعار مرجعية وإرشادية فقط تعكس تقلبات البورصة الفورية وتخلف علاوات التصنيع وتكاليف الشحن. لا يمكن إبرام تسوية أو تثبيت سعر شراء نهائي إلا بصدور عينات عروض الأسعار النهائية المؤكدة من ديوان PGR UAE."
              : "All values, rates, and catalog prices are indicative only and based on global spot market inputs. Physical metal premiums, logistical handling, and VAT treatments apply. You must contact our desk to lock the spot and receive a Final Desk Confirmation."}
          </p>
        </div>

        {/* Category FAQs */}
        <div className="space-y-6">
          <div className="border-b border-white/[0.04] pb-2">
            <h3 className="text-white uppercase tracking-widest font-bold text-sm font-serif flex items-center gap-2">
              <HelpCircle size={15} className="text-[#c5a85c]" />
              {currentLang === "ar" ? "الأسئلة الشائعة حول الكتالوج" : "Category FAQ & Guidelines"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meta.faqs.map((faq, i) => (
              <div key={i} className="bg-[#0d0d0e] border border-white/[0.03] p-5 rounded space-y-2">
                <h4 className="text-white font-serif font-bold text-[11px] leading-snug">
                  {currentLang === "ar" ? faq.q_ar : faq.q_en}
                </h4>
                <p className="text-gray-400 font-sans leading-relaxed text-[11px] pt-1">
                  {currentLang === "ar" ? faq.a_ar : faq.a_en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Process flow summary and CTA */}
        <div className="bg-[#0d0d0e] border border-white/[0.03] p-8 rounded-lg flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-white font-serif text-base font-bold uppercase">
              {currentLang === "ar" ? "هل ترغب في الحصول على تسعير نهائي؟" : "Ready to Request a Firm Quote?"}
            </h4>
            <p className="text-gray-500 text-[11px] max-w-2xl font-sans leading-normal">
              {currentLang === "ar"
                ? "يستغرق تقديم الطلب أقل من دقيقتين. بعد تقديم النموذج، سيتصل بك فريقنا لتوجيهك بخطوات مراجعة الهوية وتلقي السعر المؤكد."
                : "Submit your requirements. PGR UAE will review stock levels, spot values, and direct you with our simple digital KYC workflow to issue a firm desk quote."}
            </p>
          </div>
          
          <button
            onClick={() => onNavigate("/request-quote")}
            className="w-full md:w-auto px-8 py-3.5 bg-gold-gradient text-black font-sans font-bold uppercase tracking-widest rounded shadow-lg transition-all duration-300 hover:scale-[1.02] shrink-0 text-[10px]"
          >
            {currentLang === "ar" ? "طلب تسعير مؤكد الآن" : "Request Firm Quote"}
          </button>
        </div>

      </div>
    </div>
  );
}

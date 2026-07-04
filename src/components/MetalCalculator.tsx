/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, HelpCircle, Shield, RefreshCw, Calculator, MessageSquare, Info } from "lucide-react";
import { LiveMarketRates } from "../types";

interface MetalCalculatorProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onOpenQuote: (prefillDetails?: string) => void;
  onClose?: () => void;
}

export default function MetalCalculator({
  currentLang,
  rates,
  selectedCurrency,
  onOpenQuote,
  onClose
}: MetalCalculatorProps) {
  const isAr = currentLang === "ar";
  
  // State for calculation parameters
  const [metalType, setMetalType] = useState<"gold" | "silver">("gold");
  const [weight, setWeight] = useState<number>(100);
  const [weightUnit, setWeightUnit] = useState<"g" | "kg" | "oz" | "tola">("g");
  const [purity, setPurity] = useState<string>("24K"); // Default 24K
  const [customPremium, setCustomPremium] = useState<number>(2.0); // Default premium 2.0%

  // Reference spots for calculation
  const getMetalSpotUsdOz = () => {
    const defaultSpots = { gold: 2365.40, silver: 29.85 };
    if (!rates) return defaultSpots[metalType];
    const spot = rates[metalType]?.spot_usd_oz;
    return spot && spot > 0 ? spot : defaultSpots[metalType];
  };

  const getExchangeRate = () => {
    const ratesMap: Record<string, number> = {
      USD: 1.0,
      AED: 3.6725,
      EUR: 0.925,
      GBP: 0.785,
      SAR: 3.7505
    };
    return ratesMap[selectedCurrency] || 1.0;
  };

  // Metal purities catalog based on requirements: 24K, 22K, 21K, 18K, 999.9, 999, 925
  const goldPurities = [
    { key: "24K", label_en: "24K (99.99% Fine Gold)", label_ar: "عيار ٢٤ قيراط (٩٩.٩٩٪ ذهب نقي)", multiplier: 1.0 },
    { key: "22K", label_en: "22K (91.67% Standard Gold)", label_ar: "عيار ٢٢ قيراط (٩١.٦٧٪ ذهب قياسي)", multiplier: 0.9167 },
    { key: "21K", label_en: "21K (87.50% Jewelry Gold)", label_ar: "عيار ٢١ قيراط (٨٧.٥٠٪ ذهب مجوهرات)", multiplier: 0.875 },
    { key: "18K", label_en: "18K (75.00% Alloy Gold)", label_ar: "عيار ١٨ قيراط (٧٥.٠٠٪ ذهب عيار ١٨)", multiplier: 0.75 },
    { key: "999.9", label_en: "999.9 Swiss Premium Purity", label_ar: "نقاوة ٩٩٩.٩ (ذهب سويسري فاخر)", multiplier: 1.0 }
  ];

  const silverPurities = [
    { key: "999.9", label_en: "99.99% Pure Silver", label_ar: "فضة نقية ٩٩.٩٩٪", multiplier: 1.0 },
    { key: "999", label_en: "99.9% Standard Silver", label_ar: "فضة قياسية ٩٩.٩٪", multiplier: 0.999 },
    { key: "925", label_en: "92.5% Sterling Silver", label_ar: "فضة إسترلينية ٩٢.٥٪", multiplier: 0.925 }
  ];

  const purities = metalType === "gold" ? goldPurities : silverPurities;

  // Auto reset purity when metalType changes
  useEffect(() => {
    setPurity(metalType === "gold" ? "24K" : "999");
  }, [metalType]);

  // Run the premium-based math
  const calculateEstimate = () => {
    const spotUsdOz = getMetalSpotUsdOz();
    const OUNCE_TO_GRAM = 31.1034768;
    const TOLA_TO_GRAM = 11.6638125;
    const exchangeRate = getExchangeRate();

    // Base spot in local currency per ounce
    const spotLocalOz = spotUsdOz * exchangeRate;
    const spotLocalGram = spotLocalOz / OUNCE_TO_GRAM;

    // Convert input weight to Grams based on unit: g, kg, oz, tola
    let weightInGrams = weight;
    if (weightUnit === "kg") {
      weightInGrams = weight * 1000;
    } else if (weightUnit === "oz") {
      weightInGrams = weight * OUNCE_TO_GRAM;
    } else if (weightUnit === "tola") {
      weightInGrams = weight * TOLA_TO_GRAM;
    }

    // Purity multiplier
    const activePurity = purities.find(p => p.key === purity) || purities[0];
    const purityMultiplier = activePurity.multiplier;

    // Spot value
    const baseSpotValue = spotLocalGram * weightInGrams * purityMultiplier;

    // Add premium
    const premiumAmount = baseSpotValue * (customPremium / 100);
    const finalEstimatedValue = baseSpotValue + premiumAmount;

    return {
      baseSpotValue: parseFloat(baseSpotValue.toFixed(2)),
      premiumAmount: parseFloat(premiumAmount.toFixed(2)),
      finalEstimatedValue: parseFloat(finalEstimatedValue.toFixed(2)),
      metalPricePerGram: parseFloat((spotLocalGram * purityMultiplier).toFixed(4)),
      weightGrams: parseFloat(weightInGrams.toFixed(3)),
      purityLabel: isAr ? activePurity.label_ar : activePurity.label_en
    };
  };

  const calc = calculateEstimate();

  // Create WhatsApp message string
  const getWhatsAppMessage = () => {
    const metalLabel = metalType === "gold" ? (isAr ? "ذهب" : "Gold") : (isAr ? "فضة" : "Silver");
    const unitMap: Record<string, string> = {
      g: isAr ? "جرام" : "Grams",
      kg: isAr ? "كيلوغرام" : "kg",
      oz: isAr ? "أونصة تروي" : "Troy Ounces",
      tola: isAr ? "تولا" : "Tolas"
    };
    const weightLabel = `${weight} ${unitMap[weightUnit]}`;
    const purityLabel = calc.purityLabel;
    
    const text = isAr 
      ? `مرحباً PGR دبي، قمت بحساب السعر الإرشادية للذهب/الفضة عبر الحاسبة الذكية المحدثة:\n` +
        `• المعدن: ${metalLabel}\n` +
        `• الوزن والوحدة: ${weightLabel}\n` +
        `• العيار/النقاوة: ${purityLabel}\n` +
        `• السعر الاسترشادي الإجمالي: ${calc.finalEstimatedValue.toLocaleString()} ${selectedCurrency}\n` +
        `أرغب في طلب تسعير رسمي نهائي وتأكيد حجز العقد عبر مكتب دبي.`
      : `Hello PGR UAE Bullion Desk, I have calculated an indicative bullion quote:\n` +
        `• Metal: ${metalLabel}\n` +
        `• Weight & Unit: ${weightLabel}\n` +
        `• Purity/Karat: ${purityLabel}\n` +
        `• Indicative Total: ${calc.finalEstimatedValue.toLocaleString()} ${selectedCurrency}\n` +
        `I would like to request an official quote contract and proceed with the verification desk.`;
        
    return encodeURIComponent(text);
  };

  const handleInquirySubmit = () => {
    const metalLabel = metalType === "gold" ? "Gold" : "Silver";
    const details = `${weight}${weightUnit} ${metalLabel} (${purity} purity) - Indicative: ${calc.finalEstimatedValue.toLocaleString()} ${selectedCurrency}`;
    onOpenQuote(details);
  };

  return (
    <div className="bg-[#0b0b0c] border border-white/[0.04] rounded-lg p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden" id="metals-calculator-component" style={{ direction: isAr ? "rtl" : "ltr" }}>
      {/* Background glow card */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-10 pointer-events-none transition-opacity ${
        metalType === "gold" ? "bg-gold-base" : "bg-gray-400"
      }`} />
      
      {/* Header section */}
      <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
        <div className="space-y-1">
          <span className="text-gold-base font-mono uppercase text-[10px] tracking-widest font-bold flex items-center gap-1.5">
            <Calculator size={12} />
            {isAr ? "حاسبة تقدير أسعار المعادن الثمينة المباشرة" : "Live Precious Metals Estimator"}
          </span>
          <h3 className="text-xl font-serif text-white tracking-wide font-medium">
            {isAr ? "ديوان الحساب الذكي المباشر" : "Interactive Bullion Quote Calculator"}
          </h3>
          <p className="text-xs text-gray-400 font-sans">
            {isAr 
              ? "احسب التكلفة التقديرية للسبائك والعملات والطلبات بناء على أسعار البورصة الحرة وعلاوات دبي المنافسة." 
              : "Perform real-time indicative valuation for gold and silver based on live spot rates and customizable premium rates."}
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
          >
            &times;
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metal Selector */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-mono font-bold block">
              {isAr ? "١. اختر نوع المعدن الثمين" : "1. Select Precious Metal"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetalType("gold")}
                className={`py-3.5 px-4 rounded border font-serif text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  metalType === "gold"
                    ? "bg-gold-base/10 border-gold-base text-gold-light font-bold shadow-[0_0_15px_rgba(212,175,55,0.08)]"
                    : "bg-[#111112] border-white/[0.03] text-gray-400 hover:text-white hover:border-white/10"
                }`}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${metalType === "gold" ? "bg-gold-base" : "bg-gray-600"}`} />
                <span>{isAr ? "سبائك ومسكوكات الذهب" : "Gold Bars & Coins"}</span>
              </button>
              <button
                type="button"
                onClick={() => setMetalType("silver")}
                className={`py-3.5 px-4 rounded border font-serif text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  metalType === "silver"
                    ? "bg-white/5 border-gray-400 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "bg-[#111112] border-white/[0.03] text-gray-400 hover:text-white hover:border-white/10"
                }`}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${metalType === "silver" ? "bg-silver-base" : "bg-gray-600"}`} />
                <span>{isAr ? "سبائك ومسكوكات الفضة" : "Silver Bars & Coins"}</span>
              </button>
            </div>
          </div>

          {/* Weight Controls */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-mono font-bold block">
                {isAr ? "٢. حدد الوزن والوحدة" : "2. Enter Material Weight & Unit"}
              </label>
              <div className="flex bg-[#111112] rounded border border-white/[0.03] p-0.5">
                {(["g", "kg", "oz", "tola"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setWeightUnit(unit)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-sm cursor-pointer uppercase ${
                      weightUnit === unit ? "bg-white/10 text-white font-bold" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="any"
                value={weight || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setWeight(isNaN(val) ? 0 : val);
                }}
                className="w-full bg-[#111112] border border-white/[0.04] focus:border-gold-base/50 focus:outline-none rounded py-3.5 px-4 text-white text-base font-serif tracking-wide font-medium"
                placeholder={isAr ? "أدخل كمية الوزن" : "Enter weight quantity"}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500 uppercase font-bold">
                {weightUnit === "g" ? (isAr ? "جرام" : "g") : weightUnit === "kg" ? (isAr ? "كيلوغرام" : "kg") : weightUnit === "oz" ? (isAr ? "أونصة تروي" : "oz t") : (isAr ? "تولا" : "tola")}
              </span>
            </div>
          </div>

          {/* Purity & Karat Selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-mono font-bold block">
              {isAr ? "٣. اختر عيار أو نقاوة المعدن" : "3. Choose Purity / Karat"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {purities.map((pur) => (
                <button
                  key={pur.key}
                  type="button"
                  onClick={() => setPurity(pur.key)}
                  className={`py-3 px-3.5 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                    purity === pur.key
                      ? "bg-white/[0.03] border-gold-base/50 text-white font-semibold"
                      : "bg-[#111112] border-white/[0.03] text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs">{isAr ? pur.label_ar : pur.label_en}</span>
                  {purity === pur.key && <span className="h-2 w-2 rounded-full bg-gold-base" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Premium Slider */}
          <div className="space-y-2 bg-white/[0.01] border border-white/[0.02] p-4 rounded">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="uppercase tracking-widest text-gray-500 font-bold">
                {isAr ? "٤. هامش المصنعية والعمولة" : "4. Premium / Desk Commission"}
              </span>
              <span className="text-gold-base font-bold">{customPremium.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15.0"
              step="0.1"
              value={customPremium}
              onChange={(e) => setCustomPremium(parseFloat(e.target.value))}
              className="w-full accent-gold-base bg-white/10 h-1 rounded-sm appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-gray-600">
              <span>{isAr ? "أدنى هامش (٠.٥٪)" : "Min Premium (0.5%)"}</span>
              <span>{isAr ? "هامش عالي (١٥٪)" : "High Premium (15.0%)"}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-sans pt-1 leading-normal">
              {isAr
                ? "* يشمل هذا الهامش رسوم صب المصنع والتحقق والشحن المؤمن والتسليم في دبي."
                : "* This covers refiner minting charges, assay validation, secured vaulting, and physical Dubai desk collection logistics."}
            </p>
          </div>
        </div>

        {/* Right column: Results & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#111112] border border-white/[0.04] rounded p-6 space-y-6 relative">
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block border-b border-white/[0.03] pb-2">
              {isAr ? "النتيجة والتقدير المباشر" : "Indicative Quote Breakdown"}
            </span>

            {/* Price Calculations */}
            <div className="space-y-4 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">{isAr ? "وزن السبيكة الإجمالي:" : "Calculated Weight:"}</span>
                <span className="text-white font-medium">{calc.weightGrams} {isAr ? "جرام" : "grams"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">{isAr ? "العيار المحدد:" : "Selected Purity:"}</span>
                <span className="text-white font-medium">{purity}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">{isAr ? "سعر البورصة الصافي:" : "Base Spot Melt Value:"}</span>
                <span className="text-gray-300 font-medium">
                  {calc.baseSpotValue.toLocaleString()} {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-amber-500">
                <span className="text-gray-500">{isAr ? "قيمة الهامش المضافة:" : "Premium Amount:"}</span>
                <span className="font-medium">
                  +{calc.premiumAmount.toLocaleString()} {selectedCurrency}
                </span>
              </div>

              <div className="border-t border-white/[0.05] pt-4 space-y-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest block">
                  {isAr ? "السعر الإجمالي الاسترشادي" : "Total Indicative Quote"}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-serif text-gold-base font-medium tracking-tight">
                    {calc.finalEstimatedValue.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 font-mono">{selectedCurrency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/[0.04]">
            {/* Compliance warning */}
            <div className="bg-amber-950/10 border border-[#c5a85c]/10 rounded p-4 space-y-1.5 text-[10px] font-sans leading-normal text-gray-400">
              <span className="font-bold text-[#c5a85c] uppercase tracking-wider block">
                ⚠️ {isAr ? "تنبيه هام ومراجعة امتثال" : "MANDATORY REGULATORY DISCLOSURE"}
              </span>
              <span>
                {isAr
                  ? "الأسعار استرشادية لغرض التخطيط فقط. لا يمكن تأكيد السعر النهائي وحجز العقد الفوري إلا عبر إصدار تسعير معتمد من ديوان PGR UAE، مع إتمام مراجعة التحقق من الهوية كواجب أمني وطني."
                  : "Estimations are based on fluctuating market feeds and include estimated refiner margins. Final binding contract pricing must be confirmed on our quote desk, subject to mandatory KYC compliance."}
              </span>
            </div>

            {/* Direct Call To Action buttons */}
            <div className="flex flex-col gap-2.5">
              {/* Request Quote button */}
              <button
                type="button"
                onClick={handleInquirySubmit}
                className="w-full py-3 bg-gold-base hover:bg-gold-light text-black font-sans font-bold uppercase tracking-widest text-[11px] rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_25px_rgba(212,175,55,0.35)]"
              >
                <Calculator size={14} />
                <span>{isAr ? "تثبيت وطلب عرض سعر رسمي" : "Request Official Quote Contract"}</span>
              </button>

              {/* WhatsApp Quote button */}
              <a
                href={`https://wa.me/971559688837?text=${getWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold uppercase tracking-widest text-[11px] rounded transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} />
                <span>{isAr ? "تأكيد فوري عبر الواتساب" : "Confirm Instant Desk Price"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

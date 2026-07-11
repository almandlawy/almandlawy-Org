/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, Sparkles, RefreshCw, Layers, DollarSign } from "lucide-react";
import { LiveMarketRates } from "../types";
import {
  REFERENCE_GOLD_USD_OZ,
  REFERENCE_SILVER_USD_OZ,
} from "../lib/metalReferenceSpots";

interface LiveMarketProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onChangeCurrency: (currency: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenQuote?: () => void;
}

export default function LiveMarket({
  currentLang,
  rates,
  selectedCurrency,
  onChangeCurrency,
  onRefresh,
  isRefreshing,
  onOpenQuote
}: LiveMarketProps) {
  // We keep a history of the last 15 prices for each metal to draw stunning dynamic glowing SVG sparklines!
  const [history, setHistory] = React.useState<Record<string, number[]>>({
    gold: [4040, 4042, 4041, 4044, 4043, 4046, 4045, 4044, 4047, 4045, 4046, 4044, 4045, 4046, REFERENCE_GOLD_USD_OZ],
    silver: [55.7, 55.8, 55.75, 55.82, 55.8, 55.85, 55.83, 55.84, 55.89, 55.86, 55.87, 55.82, 55.85, 55.88, REFERENCE_SILVER_USD_OZ],
    platinum: [960, 962, 961, 963, 962, 965, 964, 963, 966, 964, 965, 963, 964, 966, 965.2],
    palladium: [1005, 1008, 1006, 1010, 1009, 1012, 1011, 1010, 1013, 1011, 1012, 1010, 1011, 1013, 1012.1]
  });

  const [lastPrices, setLastPrices] = React.useState<Record<string, number>>({});
  const [lastUpdatedTime, setLastUpdatedTime] = React.useState<string>("");
  const [flashStates, setFlashStates] = React.useState<Record<string, "up" | "down" | null>>({
    gold: null,
    silver: null,
    platinum: null,
    palladium: null
  });

  const getFormattedCacheTime = () => {
    if (!rates || !rates.cache_timestamp) return lastUpdatedTime;
    try {
      const d = new Date(rates.cache_timestamp);
      return d.toLocaleTimeString(currentLang === "ar" ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch (e) {
      return lastUpdatedTime;
    }
  };

  // Track price history when rates tick up or down from the parent
  React.useEffect(() => {
    if (rates) {
      const updatedHistory = { ...history };
      const updatedFlash = { ...flashStates };
      let changed = false;

      (["gold", "silver", "platinum", "palladium"] as const).forEach((metal) => {
        const metalData = rates[metal];
        const currentPrice = metalData ? metalData.spot_usd_oz : undefined;
        const previousPrice = lastPrices[metal];

        if (currentPrice && currentPrice !== previousPrice) {
          changed = true;
          // Append new price
          const list = [...(updatedHistory[metal] || [])];
          list.push(currentPrice);
          if (list.length > 20) list.shift(); // Keep only last 20 ticks
          updatedHistory[metal] = list;

          // Set Flash State
          if (previousPrice) {
            updatedFlash[metal] = currentPrice > previousPrice ? "up" : "down";
          }
        }
      });

      if (changed || !lastUpdatedTime) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString(currentLang === "ar" ? "ar-EG" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        setLastUpdatedTime(timeStr);
      }

      if (changed) {
        setHistory(updatedHistory);
        setLastPrices({
          gold: rates.gold?.spot_usd_oz || 0,
          silver: rates.silver?.spot_usd_oz || 0,
          platinum: rates.platinum?.spot_usd_oz || 0,
          palladium: rates.palladium?.spot_usd_oz || 0,
        });
        setFlashStates(updatedFlash);

        // Clear flashes after 1.5 seconds
        const timer = setTimeout(() => {
          setFlashStates({ gold: null, silver: null, platinum: null, palladium: null });
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [rates]);

  // Generate beautiful SVG Path points from price history array
  const generateSparklineSvgPath = (prices: number[], width = 280, height = 70) => {
    if (prices.length < 2) return "";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * width;
      // Invert Y because SVG coordinates start from top-left
      const y = height - 5 - ((price - min) / range) * (height - 10);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(" L ")}`;
  };

  const getDayChangePct = (metal: string) => {
    const prices = history[metal] || [];
    if (prices.length < 2) return "+0.12%";
    const first = prices[0];
    const last = prices[prices.length - 1];
    const diff = last - first;
    const pct = (diff / first) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
  };

  const getPriceData = (metal: "gold" | "silver" | "platinum" | "palladium") => {
    if (!rates) return { ounce: 0, gram: 0 };
    const metalData = rates[metal];
    // Fallback pricing can leave platinum/palladium as null; guard before dereferencing.
    if (!metalData || !metalData.currencies) return { ounce: 0, gram: 0 };
    const cur = selectedCurrency as any;
    return metalData.currencies[cur] || { ounce: 0, gram: 0 };
  };

  // Safe number formatter: null/undefined/NaN renders as "Unavailable" instead of a broken value.
  const formatRateValue = (value: number | null | undefined, maximumFractionDigits: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return currentLang === "ar" ? "غير متاح" : "Unavailable";
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits
    });
  };

  const currencies = ["IQD", "AED", "USD", "EUR", "GBP", "SAR"];

  return (
    <section className="py-24 px-4 md:px-8 border-t border-soft-border bg-brand-bg relative" id="market" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Title Container */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-soft-border pb-8">
          <div className="space-y-3">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.25em] font-bold flex items-center gap-2">
              <Sparkles size={12} className="text-olive-accent" />
              {currentLang === "ar" ? "لوحة الأسعار الاسترشادية للمعادن الثمينة" : "Indicative Precious Metals Price Board"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-text-charcoal font-medium">
              {currentLang === "ar" ? "الأسعار الفورية للمعادن الثمينة" : "Precious Metals Spot Pricing"}
            </h2>
            <p className="text-sm text-text-secondary max-w-xl">
              {currentLang === "ar" 
                ? "أسعار استرشادية للذهب والفضة. يتم تأكيد السعر النهائي المعتمد عبر ديوان المبيعات قبل إرسال الحوالة." 
                : "Indicative live spot rates for institutional and private gold and silver desk allocation. Exact price locks are validated directly with our Dubai desk."}
            </p>
          </div>

          {/* Currency Switcher & Refresh buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {rates && (
              <div className="flex bg-brand-card rounded border border-soft-border p-1">
                {currencies.map((cur) => (
                  <button
                    key={cur}
                    onClick={() => onChangeCurrency(cur)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold tracking-wider transition-all cursor-pointer ${
                      selectedCurrency === cur
                        ? "bg-gold-base text-text-charcoal shadow-sm"
                        : "text-text-secondary hover:text-text-charcoal"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            )}

            {rates && (
              <button
                onClick={onRefresh}
                className={`p-2.5 rounded bg-brand-card border border-soft-border hover:border-gold-base text-text-secondary hover:text-text-charcoal transition-all cursor-pointer shadow-sm ${
                  isRefreshing ? "animate-spin text-gold-base" : ""
                }`}
                title="Force market sync"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Warning banner when live API pricing is unavailable/stale */}
        {rates && rates.source_status !== "live" && (
          <div className="bg-soft-danger border border-gold-base/30 text-text-charcoal rounded p-4 font-mono text-xs sm:text-sm flex items-center gap-3 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-base opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-dark"></span>
            </span>
            <span className="font-bold">
              {currentLang === "ar"
                ? "مرجع السوق المباشر غير متوفر مؤقتًا. يرجى طلب عرض سعر معتمد من مكتبنا الإقليمي."
                : "Live market reference temporarily unavailable. Please request a firm quote via our Dubai HQ."}
            </span>
          </div>
        )}

        {/* Live Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(["gold", "silver", "platinum", "palladium"] as const).map((metal) => {
            const metalPrice = getPriceData(metal);
            const isGold = metal === "gold";
            const isSilver = metal === "silver";
            const changePct = getDayChangePct(metal);
            const isPositive = !changePct.startsWith("-");
            const flash = flashStates[metal];

            // A metal only has usable pricing data when its rate object exists with a valid spot price.
            // In fallback mode platinum/palladium are null, so this is false for them.
            const metalData = rates ? rates[metal] : null;
            const isMetalAvailable = !!(
              metalData &&
              typeof metalData.spot_usd_oz === "number" &&
              metalData.spot_usd_oz > 0
            );

            // Verify if this specific metal has a live spot price available
            const isMetalLive = !!(
              isMetalAvailable &&
              rates &&
              rates.source_status === "live"
            );

            // Setup border flash effect
            let flashClass = "border-soft-border bg-brand-card shadow-sm";
            if (rates && isMetalLive && flash === "up") flashClass = "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-brand-card";
            if (rates && isMetalLive && flash === "down") flashClass = "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-brand-card";

            return (
              <div
                key={metal}
                className={`rounded p-6 space-y-6 transition-all duration-500 relative overflow-hidden group border ${flashClass}`}
              >
                {/* Visual Glow Layer for Metals */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-[0.05] pointer-events-none transition-opacity group-hover:opacity-10 ${
                  isGold ? "bg-gold-base" : isSilver ? "bg-[#808080]" : "bg-olive-accent"
                }`} />

                {/* Card Header (Metal Name & Tag) */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif text-text-charcoal tracking-wide capitalize font-semibold">
                      {currentLang === "ar" ? (
                        metal === "gold" ? "الذهب النقي" :
                        metal === "silver" ? "الفضة النقية" :
                        metal === "platinum" ? "البلاتين" : "البلاديوم"
                      ) : metal}
                    </h3>
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest font-bold">
                      {isGold ? "999.9 Purity" : isSilver ? "999.0 Purity" : "999.5 Purity"}
                    </span>
                  </div>
                  {isMetalLive && (
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-sm ${
                      isPositive ? "bg-soft-success text-text-charcoal" : "bg-soft-danger text-text-charcoal"
                    }`}>
                      {changePct}
                    </span>
                  )}
                </div>

                {/* Spot Prices Details */}
                <div className="space-y-2">
                  <div className="text-xs text-text-secondary font-mono uppercase tracking-widest font-bold">
                    {currentLang === "ar" ? "سعر الأونصة الاسترشادي" : "Indicative Price per Ounce"}
                  </div>
                  {isMetalLive ? (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-serif tracking-tight font-bold transition-colors ${
                          isGold ? "text-[#C6A15B]" : "text-text-charcoal"
                        }`}>
                          {formatRateValue(metalPrice.ounce, 2)}
                        </span>
                        <span className="text-xs text-text-secondary font-mono font-bold">{selectedCurrency}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-soft-border text-xs font-mono">
                        <span className="text-text-secondary font-bold">
                          {currentLang === "ar" ? "سعر الجرام" : "Rate per Gram (g)"}
                        </span>
                        <span className="text-text-charcoal font-extrabold">
                          {formatRateValue(metalPrice.gram, 4)} {selectedCurrency}
                        </span>
                      </div>
                    </>
                  ) : isMetalAvailable ? (
                    <div className="space-y-3 pt-1">
                      {(isGold || isSilver) && (
                        <div className="text-xs text-text-charcoal font-mono flex items-center gap-1.5 bg-soft-danger border border-gold-base/20 p-2 rounded">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                          <span>
                            {currentLang === "ar" ? "سعر المباشر غير متوفر مؤقتاً" : "Live price temporarily unavailable"}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-semibold text-text-charcoal font-mono min-h-[36px] flex items-center gap-1.5 bg-brand-bg border border-soft-border p-2 rounded">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold-base"></span>
                        <span>
                          {currentLang === "ar" ? "إرشادي — تأكيد من المكتب" : "Indicative — confirm with desk"}
                        </span>
                      </div>
                      <button
                        onClick={onOpenQuote}
                        className="w-full text-center py-2.5 bg-gold-base text-text-charcoal hover:bg-gold-dark hover:text-white text-xs font-mono font-bold uppercase rounded transition-all cursor-pointer shadow-sm"
                      >
                        {currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {/* Metal has no pricing data (e.g. platinum/palladium in fallback mode) */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-serif tracking-tight font-semibold text-text-secondary">
                          {formatRateValue(null, 2)}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-text-charcoal font-mono min-h-[36px] flex items-center gap-1.5 bg-brand-bg border border-soft-border p-2 rounded">
                        <span className="h-1.5 w-1.5 rounded-full bg-text-secondary"></span>
                        <span>
                          {currentLang === "ar" ? "غير متاح حالياً — تأكيد من المكتب" : "Unavailable — confirm with desk"}
                        </span>
                      </div>
                      <button
                        onClick={onOpenQuote}
                        className="w-full text-center py-2.5 bg-gold-base text-text-charcoal hover:bg-gold-dark hover:text-white text-xs font-mono font-bold uppercase rounded transition-all cursor-pointer shadow-sm"
                      >
                        {currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}
                      </button>
                    </div>
                  )}
                </div>

                {/* High-End Sparkling Vector Graph */}
                {isMetalLive && (
                  <div className="pt-2 h-[75px] w-full flex items-end">
                    <svg className="overflow-visible w-full h-[70px] pointer-events-none">
                      {/* Glowing drop-shadow filters */}
                      <defs>
                        <linearGradient id={`grad-${metal}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isGold ? "#C6A15B" : "#556B5D"} stopOpacity="0.15" />
                          <stop offset="100%" stopColor={isGold ? "#C6A15B" : "#556B5D"} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Glowing sparkline line */}
                      <path
                        d={generateSparklineSvgPath(history[metal] || [], 280, 70)}
                        fill="none"
                        stroke={isGold ? "#C6A15B" : "#556B5D"}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                )}

                {/* Technical Footnote */}
                <div className="flex justify-between text-[10px] font-mono text-text-secondary pt-2 border-t border-soft-border font-bold">
                  <span>{currentLang === "ar" ? "مرجع السوق الاسترشادي" : "Indicative market reference"}</span>
                  <span>{currentLang === "ar" ? "يتم تأكيد السعر قبل الدفع" : "Price confirmed before payment"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Disclaimer Alert */}
        <div className="p-6 rounded border border-soft-border bg-brand-section space-y-3 text-xs text-text-secondary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-soft-border pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-olive-accent animate-pulse"></span>
              <span className="font-mono text-text-charcoal font-bold">
                {currentLang === "ar" 
                  ? "يتم التحقق من تفاصيل المنتج قبل الطلب. يتم التحديث عند توفر مصدر التسعير."
                  : "Accredited pricing registry & clearing system. Verification locks operate during standard UAE trading hours."}
              </span>
            </div>
            <div className="text-text-charcoal font-mono text-xs">
              {rates ? (
                rates.source_status === "cached" ? (
                  <span className="text-text-charcoal flex items-center gap-1.5 bg-brand-bg border border-soft-border px-2.5 py-1 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>
                      {currentLang === "ar" ? `آخر تحديث (مخزن مؤقتاً): ${getFormattedCacheTime()}` : `Last updated (cached): ${getFormattedCacheTime()}`}
                    </span>
                  </span>
                ) : rates.source_status === "live" ? (
                  <span className="text-text-charcoal flex items-center gap-1.5 bg-soft-success border border-gold-base/20 px-2.5 py-1 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>
                      {currentLang === "ar" ? `آخر تحديث مباشر: ${lastUpdatedTime}` : `Last updated (live): ${lastUpdatedTime}`}
                    </span>
                  </span>
                ) : (
                  <span className="text-text-charcoal flex items-center gap-1.5 bg-soft-danger border border-soft-border px-2.5 py-1 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>
                      {currentLang === "ar" ? "الأسعار المباشرة غير متوفرة مؤقتاً" : "Live price temporarily unavailable"}
                    </span>
                  </span>
                )
              ) : (
                <span className="text-text-charcoal flex items-center gap-1.5 bg-soft-danger border border-soft-border px-2.5 py-1 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>
                    {currentLang === "ar" ? "الأسعار المباشرة غير متوفرة مؤقتاً" : "Live price temporarily unavailable"}
                  </span>
                </span>
              )}
            </div>
          </div>
          <p className="leading-relaxed font-sans text-[11px] text-text-secondary">
            {currentLang === "ar"
              ? "الأسعار إرشادية وتتحدث بشكل دوري. يتم تأكيد التوفر، المصنعية أو الهامش، الضرائب، التسليم، وشروط التسوية من قبل PGR UAE قبل أي عملية."
              : "Prices listed above are indicative and subject to final physical gold inventory premium checks. Formal clearance, UAE custom logs, and secure logistics arrangements will be processed by our compliance team prior to client dispatch."}
          </p>
        </div>

      </div>
    </section>
  );
}

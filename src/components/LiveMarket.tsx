/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import { LiveMarketRates } from "../types";

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
    gold: [2360, 2362, 2361, 2364, 2363, 2366, 2365, 2364, 2367, 2365, 2366, 2364, 2365, 2366, 2365.4],
    silver: [29.7, 29.8, 29.75, 29.82, 29.8, 29.85, 29.83, 29.84, 29.89, 29.86, 29.87, 29.82, 29.85, 29.88, 29.85],
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
        const currentPrice = metalData?.spot_usd_oz ?? undefined;
        const previousPrice = lastPrices[metal];

        if (currentPrice != null && currentPrice > 0 && currentPrice !== previousPrice) {
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

  const METAL_SYMBOLS: Record<string, string> = {
    gold: "XAU / USD",
    silver: "XAG / USD",
    platinum: "XPT / USD",
    palladium: "XPD / USD",
  };

  const isMetalLive = (metal: "gold" | "silver" | "platinum" | "palladium") => {
    if (!rates || !rates[metal]) return false;
    const spot = rates[metal].spot_usd_oz;
    if (spot == null || spot <= 0) return false;
    if (metal === "platinum" || metal === "palladium") {
      return rates.source_status === "live" || rates.source_status === "cached";
    }
    return true;
  };

  const getDayChange = (metal: string) => {
    const prices = history[metal] || [];
    if (prices.length < 2) return { pct: "+0.00%", abs: "+0.00", positive: true };
    const first = prices[0];
    const last = prices[prices.length - 1];
    const diff = last - first;
    const pct = (diff / first) * 100;
    const sign = pct >= 0 ? "+" : "";
    return { pct: `${sign}${pct.toFixed(2)}%`, abs: `${sign}${diff.toFixed(2)}`, positive: pct >= 0 };
  };

  const getPriceData = (metal: "gold" | "silver" | "platinum" | "palladium") => {
    if (!rates) return { ounce: 0, gram: 0 };
    const metalData = rates[metal];
    if (
      !metalData ||
      metalData.spot_usd_oz === null ||
      metalData.spot_usd_oz === undefined ||
      !metalData.currencies
    ) {
      return { ounce: 0, gram: 0 };
    }
    const cur = selectedCurrency as any;
    return metalData.currencies[cur] || { ounce: 0, gram: 0 };
  };

  const currencies = ["AED", "USD", "EUR", "GBP", "SAR"];

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 border-t border-white/[0.04] bg-black relative" id="market" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#F5F0E8] font-medium">
              {currentLang === "ar" ? "أسعار السوق المباشرة" : "Live Market Prices"}
            </h2>
            <p className="text-xs text-gray-500 max-w-xl">
              {currentLang === "ar"
                ? "أسعار إرشادية للذهب والفضة. البلاتين والبلاديوم — اطلب عرض سعر من المكتب."
                : "Indicative gold and silver references. Platinum & palladium — request desk quote if not live."}
            </p>
          </div>

          {/* Currency Switcher & Refresh buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {rates && (
              <div className="flex bg-[#111111]/80 rounded border border-white/[0.05] p-1">
                {currencies.map((cur) => (
                  <button
                    key={cur}
                    onClick={() => onChangeCurrency(cur)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                      selectedCurrency === cur
                        ? "bg-gold-base text-black shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                        : "text-gray-400 hover:text-white"
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
                className={`p-2.5 rounded bg-white/[0.02] border border-white/[0.05] hover:border-gold-base/30 text-gray-400 hover:text-white transition-colors cursor-pointer ${
                  isRefreshing ? "animate-spin text-gold-base" : ""
                }`}
                title="Force market sync"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {(["gold", "silver", "platinum", "palladium"] as const).map((metal) => {
            const metalPrice = getPriceData(metal);
            const isGold = metal === "gold";
            const isSilver = metal === "silver";
            const change = getDayChange(metal);
            const flash = flashStates[metal];
            const live = isMetalLive(metal);
            const usdOz = rates?.[metal]?.spot_usd_oz;

            let flashClass = "border-gold-base/10";
            if (live && flash === "up") flashClass = "border-emerald-500/40";
            if (live && flash === "down") flashClass = "border-rose-500/40";

            return (
              <div
                key={metal}
                className={`glass-gold p-5 md:p-6 space-y-4 transition-all duration-500 relative overflow-hidden group border ${flashClass}`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-[50px] opacity-15 pointer-events-none ${
                  isGold ? "bg-gold-base" : isSilver ? "bg-silver-base" : "bg-white"
                }`} />

                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-gold-base/80 uppercase tracking-widest block mb-1">
                      {METAL_SYMBOLS[metal]}
                    </span>
                    <h3 className="text-base font-serif text-[#F5F0E8] capitalize font-medium">
                      {currentLang === "ar" ? (
                        metal === "gold" ? "الذهب" : metal === "silver" ? "الفضة" : metal === "platinum" ? "البلاتين" : "البلاديوم"
                      ) : metal}
                    </h3>
                  </div>
                  {live && (
                    <span className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-md ${
                      change.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {change.abs} {change.pct}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {live && usdOz ? (
                    <>
                      <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">USD / oz</div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl md:text-3xl font-serif font-medium ${isGold ? "text-gold-gradient" : isSilver ? "text-silver-gradient" : "text-[#F5F0E8]"}`}>
                          ${usdOz.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {selectedCurrency !== "USD" && metalPrice.ounce > 0 && (
                        <div className="text-xs text-gray-500 font-mono pt-1">
                          {metalPrice.ounce.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedCurrency} / oz
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="text-sm font-medium text-amber-500/90 font-mono flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {currentLang === "ar" ? "إرشادي" : "Indicative"}
                      </div>
                      <p className="text-xs text-gray-500">
                        {currentLang === "ar" ? "تأكيد من المكتب" : "Confirm with desk"}
                      </p>
                      <button
                        onClick={onOpenQuote}
                        className="w-full text-center py-2.5 bg-gold-base/10 hover:bg-gold-base/20 border border-gold-base/25 text-gold-base text-[10px] font-mono font-semibold uppercase rounded-lg transition-all cursor-pointer"
                      >
                        {currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}
                      </button>
                    </div>
                  )}
                </div>

                {live && (
                  <div className="pt-1 h-[60px] w-full flex items-end">
                    <svg className="overflow-visible w-full h-[55px] pointer-events-none">
                      <path
                        d={generateSparklineSvgPath(history[metal] || [], 260, 55)}
                        fill="none"
                        stroke={isGold ? "#C9A84C" : isSilver ? "#C0C0C0" : "#E2E2E2"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Informative Disclaimer Alert */}
        <div className="p-5 rounded border border-white/[0.03] bg-[#0a0a0a] space-y-3 text-xs text-gray-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.02] pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold-base animate-pulse"></span>
              <span className="font-mono">
                {currentLang === "ar" 
                  ? "يتم التحقق من تفاصيل المنتج قبل الطلب. يتم التحديث عند توفر مصدر التسعير."
                  : "Product details verified before order. Updated when pricing source is available."}
              </span>
            </div>
            <div className="text-gray-400 font-mono text-xs">
              {rates ? (
                rates.source_status === "cached" ? (
                  <span className="text-amber-400 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>
                      {currentLang === "ar" ? `آخر تحديث (مخزن مؤقتاً): ${getFormattedCacheTime()}` : `Last updated (cached): ${getFormattedCacheTime()}`}
                    </span>
                  </span>
                ) : rates.source_status === "live" ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>
                      {currentLang === "ar" ? `آخر تحديث مباشر: ${lastUpdatedTime}` : `Last updated (live): ${lastUpdatedTime}`}
                    </span>
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>
                      {currentLang === "ar" ? "الأسعار المباشرة غير متوفرة مؤقتاً" : "Live price temporarily unavailable"}
                    </span>
                  </span>
                )
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>
                    {currentLang === "ar" ? "الأسعار المباشرة غير متوفرة مؤقتاً" : "Live price temporarily unavailable"}
                  </span>
                </span>
              )}
            </div>
          </div>
          <p className="leading-relaxed font-sans text-[11px] text-gray-500">
            {currentLang === "ar"
              ? "الأسعار إرشادية وتتحدث بشكل دوري. يتم تأكيد التوفر، المصنعية أو الهامش، الضرائب، التسليم، وشروط التسوية من قبل PGR UAE قبل أي عملية."
              : "Prices are indicative and updated periodically. Final availability, premiums, taxes, delivery, and settlement terms are confirmed by PGR UAE before any transaction."}
          </p>
        </div>

      </div>
    </section>
  );
}

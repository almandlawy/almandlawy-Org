/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, Sparkles, RefreshCw, Layers, DollarSign } from "lucide-react";
import { LiveMarketRates } from "../types";

interface LiveMarketProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onChangeCurrency: (currency: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function LiveMarket({
  currentLang,
  rates,
  selectedCurrency,
  onChangeCurrency,
  onRefresh,
  isRefreshing
}: LiveMarketProps) {
  // We keep a history of the last 15 prices for each metal to draw stunning dynamic glowing SVG sparklines!
  const [history, setHistory] = React.useState<Record<string, number[]>>({
    gold: [2360, 2362, 2361, 2364, 2363, 2366, 2365, 2364, 2367, 2365, 2366, 2364, 2365, 2366, 2365.4],
    silver: [29.7, 29.8, 29.75, 29.82, 29.8, 29.85, 29.83, 29.84, 29.89, 29.86, 29.87, 29.82, 29.85, 29.88, 29.85],
    platinum: [960, 962, 961, 963, 962, 965, 964, 963, 966, 964, 965, 963, 964, 966, 965.2],
    palladium: [1005, 1008, 1006, 1010, 1009, 1012, 1011, 1010, 1013, 1011, 1012, 1010, 1011, 1013, 1012.1]
  });

  const [lastPrices, setLastPrices] = React.useState<Record<string, number>>({});
  const [flashStates, setFlashStates] = React.useState<Record<string, "up" | "down" | null>>({
    gold: null,
    silver: null,
    platinum: null,
    palladium: null
  });

  // Track price history when rates tick up or down from the parent
  React.useEffect(() => {
    if (rates) {
      const updatedHistory = { ...history };
      const updatedFlash = { ...flashStates };
      let changed = false;

      ["gold", "silver", "platinum", "palladium"].forEach((metal) => {
        const currentPrice = rates[metal as keyof LiveMarketRates]?.spot_usd_oz;
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

      if (changed) {
        setHistory(updatedHistory);
        setLastPrices({
          gold: rates.gold.spot_usd_oz,
          silver: rates.silver.spot_usd_oz,
          platinum: rates.platinum.spot_usd_oz,
          palladium: rates.palladium.spot_usd_oz,
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
    const cur = selectedCurrency as any;
    return rates[metal].currencies[cur] || { ounce: 0, gram: 0 };
  };

  const currencies = ["AED", "USD", "EUR", "GBP", "SAR"];

  return (
    <section className="py-24 px-4 md:px-8 border-t border-white/[0.03] bg-[#070707] relative" id="market" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Title Container */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/[0.04] pb-8">
          <div className="space-y-3">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.25em] font-semibold flex items-center gap-2">
              <Sparkles size={12} />
              {currentLang === "ar" ? "شاشات أسعار دبي للذهب" : "Dubai Wholesale Spot Index"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-white font-medium">
              {currentLang === "ar" ? "أسعار التداول المباشرة" : "Live Market Metal Feed"}
            </h2>
            <p className="text-sm text-gray-400 max-w-xl">
              {currentLang === "ar" 
                ? "تسعير فوري ومباشر يتبع بورصات السلع المتعددة بدبي. نضمن لك شفافية مطلقة وهوامش مطابقة للأسعار العالمية." 
                : "Dynamic institutional precious metals spot feed. Sourced directly from Dubai commodities exchange tickers with sub-second accuracy."}
            </p>
          </div>

          {/* Currency Switcher & Refresh buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currencies Toggle Menu */}
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

            {/* Refresh Node */}
            <button
              onClick={onRefresh}
              className={`p-2.5 rounded bg-white/[0.02] border border-white/[0.05] hover:border-gold-base/30 text-gray-400 hover:text-white transition-colors cursor-pointer ${
                isRefreshing ? "animate-spin text-gold-base" : ""
              }`}
              title="Force market sync"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Live Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(["gold", "silver", "platinum", "palladium"] as const).map((metal) => {
            const metalPrice = getPriceData(metal);
            const isGold = metal === "gold";
            const isSilver = metal === "silver";
            const changePct = getDayChangePct(metal);
            const isPositive = !changePct.startsWith("-");
            const flash = flashStates[metal];

            // Setup border flash effect
            let flashClass = "border-white/[0.04]";
            if (flash === "up") flashClass = "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]";
            if (flash === "down") flashClass = "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]";

            return (
              <div
                key={metal}
                className={`glass-premium rounded p-6 space-y-6 transition-all duration-500 relative overflow-hidden group border ${flashClass}`}
              >
                {/* Visual Glow Layer for Metals */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 ${
                  isGold ? "bg-gold-base" : isSilver ? "bg-silver-base" : "bg-white"
                }`} />

                {/* Card Header (Metal Name & Tag) */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif text-white tracking-wide capitalize font-medium">
                      {currentLang === "ar" ? (
                        metal === "gold" ? "الذهب النقي" :
                        metal === "silver" ? "الفضة النقية" :
                        metal === "platinum" ? "البلاتين" : "البلاديوم"
                      ) : metal}
                    </h3>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      {isGold ? "999.9 Purity" : isSilver ? "999.0 Purity" : "999.5 Purity"}
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-sm ${
                    isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {changePct}
                  </span>
                </div>

                {/* Spot Prices Details */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                    {currentLang === "ar" ? "سعر الأونصة المباشر" : "Spot Price per Ounce"}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-serif tracking-tight font-medium transition-colors ${
                      isGold ? "text-gold-gradient" : isSilver ? "text-silver-gradient" : "text-white"
                    }`}>
                      {metalPrice.ounce ? metalPrice.ounce.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "..."}
                    </span>
                    <span className="text-xs text-gray-400 font-mono font-medium">{selectedCurrency}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/[0.03] text-xs font-mono">
                    <span className="text-gray-500">
                      {currentLang === "ar" ? "سعر الجرام" : "Rate per Gram (g)"}
                    </span>
                    <span className="text-gray-300 font-medium">
                      {metalPrice.gram ? metalPrice.gram.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "..."} {selectedCurrency}
                    </span>
                  </div>
                </div>

                {/* High-End Sparkling Vector Graph */}
                <div className="pt-2 h-[75px] w-full flex items-end">
                  <svg className="overflow-visible w-full h-[70px] pointer-events-none">
                    {/* Glowing drop-shadow filters */}
                    <defs>
                      <linearGradient id={`grad-${metal}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isGold ? "#D4AF37" : isSilver ? "#C0C0C0" : "#FFFFFF"} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={isGold ? "#D4AF37" : isSilver ? "#C0C0C0" : "#FFFFFF"} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Glowing sparkline line */}
                    <path
                      d={generateSparklineSvgPath(history[metal] || [], 280, 70)}
                      fill="none"
                      stroke={isGold ? "#D4AF37" : isSilver ? "#C0C0C0" : "#E2E2E2"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>

                {/* Technical Footnote */}
                <div className="flex justify-between text-[10px] font-mono text-gray-600">
                  <span>LBMA Standard</span>
                  <span>{currentLang === "ar" ? "مؤمن بالكامل" : "100% Asset-Backed"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Disclaimer Alert */}
        <div className="p-4 rounded border border-white/[0.03] bg-[#0a0a0a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold-base animate-pulse"></span>
            <span>
              {currentLang === "ar" 
                ? "شاشة الذهب PGR مرتبطة مع شبكة DMCC وتخضع لأسعار بورصة دبي للذهب والسلع (DGCX)."
                : "Prices reflect international bullion markets and are synchronized with DMCC & DGCX clearing hubs."}
            </span>
          </div>
          <div className="text-gray-500">
            {currentLang === "ar" ? "آخر تحديث: قبل ثوانٍ قليلة" : "Last synchronized: Seconds ago"}
          </div>
        </div>

      </div>
    </section>
  );
}

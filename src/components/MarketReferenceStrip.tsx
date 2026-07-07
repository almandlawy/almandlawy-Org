/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Dark live market reference strip — mockup style.
 */

import React from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import { LiveMarketRates } from "../types";

interface MarketReferenceStripProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onChangeCurrency: (currency: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenQuote: () => void;
}

export default function MarketReferenceStrip({
  currentLang,
  rates,
  selectedCurrency,
  onChangeCurrency,
  onRefresh,
  isRefreshing,
  onOpenQuote
}: MarketReferenceStripProps) {
  const isAr = currentLang === "ar";
  const isLive = rates?.source_status === "live" || rates?.source_status === "cached";

  const getMetalOz = (metal: "gold" | "silver") => {
    if (!rates?.[metal]?.currencies) return null;
    const cur = selectedCurrency as keyof typeof rates.gold.currencies;
    const data = rates[metal].currencies[cur];
    if (!data?.ounce || data.ounce <= 0) return null;
    return data.ounce;
  };

  const goldOz = getMetalOz("gold");
  const silverOz = getMetalOz("silver");

  const getUsdAed = () => {
    if (!rates?.gold?.currencies?.USD?.ounce || !rates?.gold?.currencies?.AED?.ounce) return null;
    const ratio = rates.gold.currencies.AED.ounce / rates.gold.currencies.USD.ounce;
    return ratio > 0 ? ratio : null;
  };

  const usdAed = getUsdAed();

  const lastUpdated = rates?.updated_at || rates?.cache_timestamp;
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(isAr ? "ar-AE" : "en-AE", {
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  const scrollToMarket = () => {
    document.getElementById("market")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="market"
      className="bg-panel-dark border-y border-champagne/20"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-gold-base" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-champagne font-bold">
                {isAr ? "مرجع السوق المباشر" : "Live Market Reference"}
              </span>
            </div>

            <div className="flex flex-wrap gap-5 sm:gap-8">
              <MarketCell
                label={isAr ? "الذهب / XAUUSD" : "Gold / XAUUSD"}
                value={
                  goldOz != null
                    ? `${goldOz.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedCurrency}`
                    : isAr
                      ? "اطلب عرض سعر"
                      : "Request quote"
                }
                sub={isAr ? "استرشادي" : "Indicative"}
              />
              <MarketCell
                label={isAr ? "الفضة / XAGUSD" : "Silver / XAGUSD"}
                value={
                  silverOz != null
                    ? `${silverOz.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedCurrency}`
                    : isAr
                      ? "اطلب عرض سعر"
                      : "Request quote"
                }
                sub={isAr ? "استرشادي" : "Indicative"}
              />
              <MarketCell
                label="USD / AED"
                value={usdAed != null ? usdAed.toFixed(4) : "—"}
                sub={isAr ? "مرجع صرف" : "FX reference"}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {formattedTime && (
              <span className="text-[10px] font-mono text-panel-muted">
                {isAr ? "آخر تحديث:" : "Last updated:"} {formattedTime}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              {["IQD", "AED", "USD"].map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => onChangeCurrency(cur)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-colors ${
                    selectedCurrency === cur
                      ? "bg-gold-base text-text-charcoal border-gold-base"
                      : "bg-transparent text-champagne border-champagne/30 hover:border-gold-base"
                  }`}
                >
                  {cur}
                </button>
              ))}
              <button
                type="button"
                onClick={onRefresh}
                className={`p-1.5 rounded border border-champagne/30 text-champagne hover:text-gold-base ${
                  isRefreshing ? "animate-spin" : ""
                }`}
                aria-label="Refresh"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            <button
              type="button"
              onClick={scrollToMarket}
              className="px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border border-gold-base/50 text-gold-base hover:bg-gold-base/10 transition-colors"
            >
              {isAr ? "مراقبة السوق" : "View Market Watch"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-[10px] font-mono text-panel-muted leading-relaxed">
          {isAr
            ? "استرشادي فقط — يتم تأكيد عرض السعر النهائي من PGR UAE."
            : "Indicative only — final quote confirmed by PGR UAE desk."}
          {!isLive && (
            <span className="text-champagne/80">
              {" "}
              {isAr ? "· مرجع احتياطي نشط" : "· Reference fallback active"}
            </span>
          )}
        </p>
      </div>
    </section>
  );
}

function MarketCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-[9px] font-mono uppercase tracking-wider text-panel-muted">{label}</p>
      <p className="text-sm sm:text-base font-serif text-brand-bg font-medium mt-0.5">{value}</p>
      <p className="text-[9px] font-mono text-gold-base/80">{sub}</p>
    </div>
  );
}

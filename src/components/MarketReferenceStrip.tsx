/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Compact live market reference — indicative only, AED/USD.
 */

import React from "react";
import { RefreshCw } from "lucide-react";
import { LiveMarketRates } from "../types";

interface MarketReferenceStripProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onChangeCurrency: (currency: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function MarketReferenceStrip({
  currentLang,
  rates,
  selectedCurrency,
  onChangeCurrency,
  onRefresh,
  isRefreshing,
}: MarketReferenceStripProps) {
  const isAr = currentLang === "ar";
  const cur = (selectedCurrency === "USD" ? "USD" : "AED") as "USD" | "AED";

  const goldOz = rates?.gold?.currencies?.[cur]?.ounce;
  const silverOz = rates?.silver?.currencies?.[cur]?.ounce;

  const lastUpdated = rates?.updated_at || rates?.cache_timestamp;
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleString(isAr ? "ar-AE" : "en-AE", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <section
      id="market"
      className="bg-panel-dark border-y border-champagne/20"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-gold-base font-bold mb-4">
              {isAr ? "مرجع السوق المباشر" : "Live Market Reference"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wider text-panel-muted">
                  {isAr ? "مرجع الذهب" : "Gold reference price"}
                </p>
                <p className="text-xl font-serif text-brand-bg font-medium mt-1">
                  {goldOz != null
                    ? `${goldOz.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur}/oz`
                    : isAr
                      ? "اطلب عرض سعر"
                      : "Request quote"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wider text-panel-muted">
                  {isAr ? "مرجع الفضة" : "Silver reference price"}
                </p>
                <p className="text-xl font-serif text-brand-bg font-medium mt-1">
                  {silverOz != null
                    ? `${silverOz.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur}/oz`
                    : isAr
                      ? "اطلب عرض سعر"
                      : "Request quote"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
            {formattedTime && (
              <span className="text-panel-muted">
                {isAr ? "آخر تحديث:" : "Last updated:"} {formattedTime}
              </span>
            )}
            <span className="text-panel-muted hidden sm:inline">·</span>
            <span className="text-panel-muted">{isAr ? "العملة:" : "Currency:"}</span>
            {(["AED", "USD"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChangeCurrency(c)}
                className={`px-2.5 py-1 rounded font-bold border transition-colors ${
                  cur === c
                    ? "bg-gold-base text-text-charcoal border-gold-base"
                    : "text-champagne border-champagne/30 hover:border-gold-base"
                }`}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={onRefresh}
              className={`p-1.5 rounded border border-champagne/30 text-champagne hover:text-gold-base ${isRefreshing ? "animate-spin" : ""}`}
              aria-label="Refresh"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        <p className="mt-4 text-[11px] font-sans text-champagne/85 leading-relaxed max-w-4xl border-t border-champagne/10 pt-4">
          {isAr
            ? "مرجع سوقي استرشادي فقط. السعر النهائي والهامش والتوفر وشروط التسليم يؤكدها مكتب PGR UAE."
            : "Market reference only. Final price, premium, availability and delivery terms are confirmed by the PGR UAE desk."}
        </p>
      </div>
    </section>
  );
}

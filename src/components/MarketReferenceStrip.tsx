/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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

  const getMetalPrice = (metal: "gold" | "silver") => {
    if (!rates?.[metal]?.currencies) return null;
    const cur = selectedCurrency as keyof typeof rates.gold.currencies;
    const data = rates[metal].currencies[cur];
    if (!data?.ounce || data.ounce <= 0) return null;
    return data;
  };

  const goldPrice = getMetalPrice("gold");
  const silverPrice = getMetalPrice("silver");
  const showUnavailable = !isLive || (!goldPrice && !silverPrice);

  const metals: { key: "gold" | "silver"; labelEn: string; labelAr: string; price: typeof goldPrice }[] = [
    { key: "gold", labelEn: "Gold", labelAr: "الذهب", price: goldPrice },
    { key: "silver", labelEn: "Silver", labelAr: "الفضة", price: silverPrice }
  ];

  return (
    <section
      id="market"
      className="py-10 px-4 md:px-8 bg-brand-section border-y border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-olive-accent font-bold">
              {isAr ? "مرجع السوق المباشر" : "Live Market Reference"}
            </p>
            <h2 className="text-xl sm:text-2xl font-serif text-text-charcoal font-medium mt-1">
              {isAr ? "أسعار استرشادية — الذهب والفضة" : "Indicative Reference — Gold & Silver"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {["AED", "USD"].map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => onChangeCurrency(cur)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                  selectedCurrency === cur
                    ? "bg-gold-base text-text-charcoal border-gold-base"
                    : "bg-brand-card text-text-secondary border-soft-border hover:border-gold-base"
                }`}
              >
                {cur}
              </button>
            ))}
            <button
              type="button"
              onClick={onRefresh}
              className={`p-2 rounded border border-soft-border bg-brand-card text-text-secondary hover:text-text-charcoal ${
                isRefreshing ? "animate-spin" : ""
              }`}
              aria-label="Refresh rates"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {showUnavailable ? (
          <div className="p-4 rounded border border-soft-border bg-soft-danger text-sm text-text-charcoal flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="font-sans">
              {isAr
                ? "مرجع السوق المباشر غير متوفر مؤقتاً. يرجى طلب عرض سعر معتمد."
                : "Live market reference temporarily unavailable. Please request a firm quote."}
            </p>
            <button
              type="button"
              onClick={onOpenQuote}
              className="shrink-0 px-4 py-2 bg-gold-base hover:bg-gold-dark text-text-charcoal text-xs font-mono font-bold uppercase rounded"
            >
              {isAr ? "طلب عرض سعر" : "Request Firm Quote"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metals.map(({ key, labelEn, labelAr, price }) => (
              <div
                key={key}
                className="p-5 rounded border border-soft-border bg-brand-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                    {isAr ? labelAr : labelEn} · {isAr ? "مرجع استرشادي" : "Indicative reference"}
                  </p>
                  {price ? (
                    <p className="text-2xl font-serif font-bold text-text-charcoal mt-1">
                      {price.ounce.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                      <span className="text-sm font-mono text-gold-dark">{selectedCurrency}</span>
                      <span className="text-xs font-mono text-text-secondary ml-2">
                        / {isAr ? "أونصة" : "oz"}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-text-secondary mt-1 font-sans">
                      {isAr ? "غير متوفر — اطلب عرض سعر" : "Unavailable — request firm quote"}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-text-secondary font-mono max-w-[200px]">
                  {isAr ? "خاضع لحركة السوق والامتثال" : "Subject to market movement & compliance"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

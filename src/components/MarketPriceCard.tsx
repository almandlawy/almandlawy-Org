/**
 * Indicative metal price card for the market reference strip.
 */

import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { MetalDelta } from "../lib/marketPriceDelta";
import { formatDeltaPct } from "../lib/marketPriceDelta";

interface MarketPriceCardProps {
  label: string;
  ouncePrice: number | null | undefined;
  gramPrice: number | null | undefined;
  currency: string;
  delta: MetalDelta | null;
  isAr: boolean;
  formatPrice: (value: number) => string;
}

export default function MarketPriceCard({
  label,
  ouncePrice,
  gramPrice,
  currency,
  delta,
  isAr,
  formatPrice,
}: MarketPriceCardProps) {
  const hasPrice = ouncePrice != null;

  return (
    <article className="rounded-lg border border-champagne/25 bg-panel-charcoal/40 p-4 space-y-2 min-w-0">
      <p className="text-[9px] font-mono uppercase tracking-wider text-panel-muted">
        {label}
      </p>

      {hasPrice ? (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <p className="text-xl sm:text-2xl font-serif text-brand-bg font-medium leading-none">
              {formatPrice(ouncePrice!)}{" "}
              <span className="text-sm font-mono text-champagne/80">{currency}/oz</span>
            </p>
            {delta && Math.abs(delta.pct) >= 0.01 && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  delta.direction === "up"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : delta.direction === "down"
                      ? "bg-red-500/15 text-red-300"
                      : "bg-champagne/10 text-champagne"
                }`}
              >
                {delta.direction === "up" ? (
                  <TrendingUp size={10} />
                ) : delta.direction === "down" ? (
                  <TrendingDown size={10} />
                ) : null}
                {formatDeltaPct(delta.pct, isAr ? "ar" : "en")}
              </span>
            )}
          </div>
          {gramPrice != null && (
            <p className="text-[11px] font-mono text-panel-muted">
              {formatPrice(gramPrice)} {currency}/g
            </p>
          )}
        </>
      ) : (
        <p className="text-lg font-serif text-brand-bg/80">
          {isAr ? "اطلب عرض سعر" : "Request quote"}
        </p>
      )}
    </article>
  );
}

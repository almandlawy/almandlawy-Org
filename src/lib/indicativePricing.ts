/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LiveMarketRates, Product } from "../types";
import { getIqdPerUsd } from "./fxRatesClient";

export const OUNCE_TO_GRAM = 31.1034768;

/** @deprecated Use getIqdPerUsd(rates) — kept for legacy imports */
export function getIqdPerUsdLegacy(rates?: LiveMarketRates | null): number {
  return getIqdPerUsd(rates);
}

export function canShowIndicativePrice(sourceStatus?: string): boolean {
  return !!sourceStatus && sourceStatus !== "request_quote";
}

export function getPriceStatusLabel(
  sourceStatus: string | undefined,
  lang: "en" | "ar"
): string {
  if (!canShowIndicativePrice(sourceStatus)) {
    return lang === "ar" ? "السعر عند الطلب" : "Price on Request";
  }
  if (sourceStatus === "live" || sourceStatus === "cached") {
    return lang === "ar" ? "السعر الاسترشادي الفوري" : "Live Indicative Price";
  }
  return lang === "ar" ? "السعر الاسترشادي المرجعي" : "Reference Indicative Price";
}

export function calculateIndicativePrice(
  product: Product,
  rates: LiveMarketRates | null,
  currency: string,
  defaultPremiumPct = 2
): number | null {
  try {
    if (!rates || !product) return null;

    const cur = currency as keyof typeof rates.gold.currencies;
    const isGold =
      product.technical_specs?.metal === "gold" || product.category?.includes("gold");
    const metalRates = isGold ? rates.gold : rates.silver;
    const baseSpot = metalRates?.currencies?.[cur];

    if (!baseSpot) return null;

    let totalGrams = 0;
    if (product.technical_specs?.weight_grams) {
      totalGrams = product.technical_specs.weight_grams;
    } else if (product.technical_specs?.weight_oz) {
      totalGrams = product.technical_specs.weight_oz * OUNCE_TO_GRAM;
    }

    if (totalGrams === 0) return null;

    const baseCost = totalGrams * baseSpot.gram;
    const premiumFactor =
      product.premium_multiplier ?? 1 + defaultPremiumPct / 100;

    return baseCost * premiumFactor;
  } catch {
    return null;
  }
}

export function formatIndicativePrice(
  amount: number,
  currency: string,
  lang: "en" | "ar"
): string {
  const fractionDigits = currency === "IQD" ? 0 : 2;
  return amount.toLocaleString(lang === "ar" ? "ar-IQ" : "en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  });
}

/** Iraq-market silver offers — PALM 1kg first, then SAM */
export const IRAQ_SILVER_OFFER_IDS = [
  "pgr-silver-1kg",
  "pgr-silver-500g",
  "pgr-silver-1oz-100g",
] as const;

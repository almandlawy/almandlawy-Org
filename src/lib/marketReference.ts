/**
 * Shared spot / FX helpers — keep SEO pages and calculators aligned with live rates.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { LiveMarketRates } from "../types";
import {
  buildDefaultExchangeRates,
  getAedPerUsd,
  getIqdPerUsd,
} from "./fxRatesClient";

export const OUNCE_TO_GRAM = 31.1034768;
export const GRAMS_PER_KG = 1000;

export const DEFAULT_SPOT_USD_OZ = {
  gold: 4120.5,
  silver: 58.0,
  platinum: 1080.0,
  palladium: 1120.0,
} as const;

export const DEFAULT_FX_TO_USD = buildDefaultExchangeRates();

export type SupportedCurrency = keyof typeof DEFAULT_FX_TO_USD;

export function getSpotUsdOz(
  metal: keyof typeof DEFAULT_SPOT_USD_OZ,
  rates: LiveMarketRates | null
): number {
  const live = rates?.[metal]?.spot_usd_oz;
  if (live && live > 0) return live;
  return DEFAULT_SPOT_USD_OZ[metal];
}

/** How many units of `currency` per 1 USD (e.g. AED per USD). */
export function getFxRate(currency: string, rates: LiveMarketRates | null): number {
  if (currency === "USD") return 1;

  const fromLive = rates?.gold?.currencies?.[currency as SupportedCurrency];
  const spotGold = rates?.gold?.spot_usd_oz;
  if (fromLive?.ounce && spotGold && spotGold > 0) {
    return fromLive.ounce / spotGold;
  }

  if (currency === "IQD") return getIqdPerUsd(rates);
  if (currency === "AED") return getAedPerUsd(rates);

  return DEFAULT_FX_TO_USD[currency as SupportedCurrency] ?? 1;
}

export function usdOunceToLocal(
  usdPerOz: number,
  currency: string,
  rates: LiveMarketRates | null
): number {
  return usdPerOz * getFxRate(currency, rates);
}

export function usdOunceToGramLocal(
  usdPerOz: number,
  currency: string,
  rates: LiveMarketRates | null,
  karatFactor = 1
): number {
  return (usdPerOz / OUNCE_TO_GRAM) * getFxRate(currency, rates) * karatFactor;
}

export function getPriceStatusLabel(
  sourceStatus: LiveMarketRates["source_status"] | undefined,
  lang: "en" | "ar"
): string {
  if (sourceStatus === "live") return lang === "ar" ? "مرجع مباشر" : "Live reference";
  if (sourceStatus === "cached") return lang === "ar" ? "مرجع محدّث" : "Updated reference";
  return lang === "ar" ? "مرجع استرشادي" : "Indicative reference";
}

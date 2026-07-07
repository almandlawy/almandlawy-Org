/**
 * Client-side FX helpers — sync IQD/AED from /api/prices with safe fallbacks.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { LiveMarketRates } from "../types";

export const DEFAULT_IQD_PER_USD = 1310.0;
export const DEFAULT_AED_PER_USD = 3.6725;

let liveIqdPerUsd: number | null = null;
let liveAedPerUsd: number | null = null;

export function setLiveFxFromPriceApi(data: {
  usd_iqd?: number | null;
  usd_aed?: number | null;
}): void {
  if (data.usd_iqd && data.usd_iqd > 0) liveIqdPerUsd = data.usd_iqd;
  if (data.usd_aed && data.usd_aed > 0) liveAedPerUsd = data.usd_aed;
}

/** IQD per 1 USD — live API cache > rates object > default. */
export function getIqdPerUsd(rates?: LiveMarketRates | null): number {
  if (rates?.usd_iqd && rates.usd_iqd > 0) return rates.usd_iqd;
  if (liveIqdPerUsd && liveIqdPerUsd > 0) return liveIqdPerUsd;

  const fromLive = rates?.gold?.currencies?.IQD;
  const spotGold = rates?.gold?.spot_usd_oz;
  if (fromLive?.ounce && spotGold && spotGold > 0) {
    return fromLive.ounce / spotGold;
  }

  return DEFAULT_IQD_PER_USD;
}

export function getAedPerUsd(rates?: LiveMarketRates | null): number {
  if (rates?.usd_aed && rates.usd_aed > 0) return rates.usd_aed;
  if (liveAedPerUsd && liveAedPerUsd > 0) return liveAedPerUsd;

  const fromLive = rates?.gold?.currencies?.AED;
  const spotGold = rates?.gold?.spot_usd_oz;
  if (fromLive?.ounce && spotGold && spotGold > 0) {
    return fromLive.ounce / spotGold;
  }

  return DEFAULT_AED_PER_USD;
}

export function buildDefaultExchangeRates(
  iqd = getIqdPerUsd(),
  aed = getAedPerUsd()
): Record<string, number> {
  return {
    USD: 1.0,
    AED: aed,
    EUR: 0.925,
    GBP: 0.785,
    SAR: 3.7505,
    IQD: iqd,
  };
}

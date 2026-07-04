/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Default public quote currency is AED unless explicitly USD */
export function resolveQuoteCurrency(currency?: string): "AED" | "USD" {
  return currency === "USD" ? "USD" : "AED";
}

export function formatQuoteAmount(amount: number, currency?: string): string {
  const cur = resolveQuoteCurrency(currency);
  return `${cur} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

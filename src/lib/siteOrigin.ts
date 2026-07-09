/**
 * Canonical public site origin — auth PKCE must use one host only.
 * @license SPDX-License-Identifier: Apache-2.0
 */

const PRODUCTION_CANONICAL = "https://www.pgruae.com";

export function getCanonicalSiteOrigin(): string {
  if (typeof window === "undefined") return PRODUCTION_CANONICAL;
  const host = window.location.hostname;
  if (host === "pgruae.com" || host === "www.pgruae.com") {
    return PRODUCTION_CANONICAL;
  }
  return window.location.origin;
}

export function isBareProductionDomain(): boolean {
  return typeof window !== "undefined" && window.location.hostname === "pgruae.com";
}

/** Redirect bare pgruae.com → www before OAuth so PKCE storage matches callback. */
export function redirectBareDomainToWww(): void {
  if (!isBareProductionDomain()) return;
  const target = `${PRODUCTION_CANONICAL}${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(target);
}

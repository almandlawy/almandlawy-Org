/**
 * Canonical path redirects — duplicate SEO pages consolidated.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const PATH_REDIRECTS: Record<string, string> = {
  "/sam-palm-silver-iraq": "/silver-bars-iraq",
  "/silver-bars-erbil": "/silver-bars-iraq",
  "/allocated-storage-dubai": "/allocated-storage",
  "/sell-gold-dubai": "/sell-back",
  "/buy-silver-bars-dubai": "/silver-bars",
  "/buy-gold-bars-dubai": "/gold-bars",
  "/bullion-desk-iraq": "/iraq-bullion-quote",
};

export function resolvePath(pathname: string): string {
  const base = pathname.split("?")[0];
  return PATH_REDIRECTS[base] || base;
}

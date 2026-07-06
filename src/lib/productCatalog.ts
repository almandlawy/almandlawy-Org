/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";
import { PRODUCTS } from "../data";

export const ALLOWED_PRODUCT_IDS = [
  "pgr-bullion-collection",
  "pgr-gold-1g-10g",
  "pgr-gold-20g-50g",
  "pgr-gold-100g",
  "pgr-gold-1kg",
  "pgr-silver-1oz-100g",
  "pgr-silver-500g",
  "pgr-silver-1kg",
  "pgr-mint-bars-coins",
  "custom-bullion-inquiry",
] as const;

export type AllowedProductId = (typeof ALLOWED_PRODUCT_IDS)[number];

export const CATALOG_PRODUCT_COUNT = ALLOWED_PRODUCT_IDS.length;
export const CATALOG_SEED_VERSION = "pgr-catalog-v4-iraq-palm-sam";

export const ALLOWED_PRODUCT_ID_SET = new Set<string>(ALLOWED_PRODUCT_IDS);

const LEGACY_PRODUCT_ID_PATTERN = /^(gb|sb|gc|sc)-/;

export function isLegacyProductId(id: string): boolean {
  return LEGACY_PRODUCT_ID_PATTERN.test(id);
}

export function isAllowedProductId(id: string): boolean {
  return ALLOWED_PRODUCT_ID_SET.has(id);
}

export function getCanonicalProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

/** Public catalog, quote selectors, and related products — exactly 10 allowed products. */
export function resolvePublicCatalog(dbProducts: Product[] = []): Product[] {
  const byId = new Map(
    dbProducts
      .filter((product) => isAllowedProductId(product.id))
      .map((product) => [product.id, product] as const)
  );

  const resolved = ALLOWED_PRODUCT_IDS.map((id) => {
    const canonical = getCanonicalProduct(id);
    if (!canonical) {
      throw new Error(`Missing canonical product definition for ${id}`);
    }
    const fromDb = byId.get(id);
    return fromDb ? { ...canonical, ...fromDb, id } : canonical;
  });

  assertCatalogProducts(resolved, "resolvePublicCatalog");
  return resolved;
}

/** Admin list — canonical 10 plus any non-legacy admin-created products. */
export function resolveAdminCatalog(dbProducts: Product[] = []): Product[] {
  const nonLegacy = dbProducts.filter((product) => !isLegacyProductId(product.id));
  const canonical = resolvePublicCatalog(nonLegacy);
  const extras = nonLegacy.filter((product) => !isAllowedProductId(product.id));
  return [...canonical, ...extras];
}

export function catalogNeedsMigration(storedProducts: Product[] | null | undefined): boolean {
  if (!storedProducts || !Array.isArray(storedProducts) || storedProducts.length === 0) {
    return true;
  }

  if (storedProducts.some((product) => isLegacyProductId(product.id))) {
    return true;
  }

  const allowedPresent = new Set(
    storedProducts.filter((product) => isAllowedProductId(product.id)).map((product) => product.id)
  );

  return allowedPresent.size !== CATALOG_PRODUCT_COUNT;
}

export function resolveProductIdFromLabel(label?: string | null): AllowedProductId {
  if (!label) return "pgr-bullion-collection";

  const normalized = label.trim().toLowerCase();
  const byName = PRODUCTS.find((product) => {
    const en = product.name_en.toLowerCase();
    const ar = product.name_ar;
    return normalized === en.toLowerCase() || normalized === product.id || label === ar;
  });
  if (byName && isAllowedProductId(byName.id)) {
    return byName.id as AllowedProductId;
  }

  const byId = ALLOWED_PRODUCT_IDS.find((id) => normalized === id || normalized.includes(id));
  return (byId || "pgr-bullion-collection") as AllowedProductId;
}

export function assertCatalogProducts(products: Product[], context: string): void {
  if (import.meta.env.PROD) return;

  if (products.length !== CATALOG_PRODUCT_COUNT) {
    console.warn(
      `[PGR Catalog] ${context}: expected ${CATALOG_PRODUCT_COUNT} products, got ${products.length}`
    );
  }

  for (const product of products) {
    if (!isAllowedProductId(product.id)) {
      console.warn(`[PGR Catalog] ${context}: disallowed product ID "${product.id}"`);
    }
  }
}

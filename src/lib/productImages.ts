/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";
import { ALLOWED_PRODUCT_IDS } from "./productCatalog";

/** Bump when poster assets change to bust browser/CDN caches. */
export const PRODUCT_POSTER_VERSION = "branded-1122x1402-v2";

export function productPosterUrl(filename: string): string {
  return `/images/products/${filename}?v=${PRODUCT_POSTER_VERSION}`;
}

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "pgr-bullion-collection": productPosterUrl("01-bullion-collection.webp"),
  "pgr-gold-1g-10g": productPosterUrl("02-gold-bars-1g-5g-10g.webp"),
  "pgr-gold-20g-50g": productPosterUrl("03-gold-bars-20g-50g.webp"),
  "pgr-gold-100g": productPosterUrl("04-gold-bar-100g.webp"),
  "pgr-gold-1kg": productPosterUrl("05-gold-bar-1kg.webp"),
  "pgr-silver-1oz-100g": productPosterUrl("06-silver-bars-1oz-100g.webp"),
  "pgr-silver-500g": productPosterUrl("07-silver-bar-500g.webp"),
  "pgr-silver-1kg": productPosterUrl("08-silver-bar-1kg.webp"),
  "pgr-mint-bars-coins": productPosterUrl("09-mint-bars-coins.webp"),
  "custom-bullion-inquiry": productPosterUrl("10-custom-bullion-inquiry.webp"),
};

export function getProductImage(product: Product): string {
  const mapped = PRODUCT_IMAGE_MAP[product.id || ""];
  if (mapped) {
    return mapped;
  }

  if (product.image_url) {
    const base = product.image_url.split("?")[0];
    if (base.startsWith("/images/products/")) {
      return `${base}?v=${PRODUCT_POSTER_VERSION}`;
    }
    return product.image_url;
  }

  if (!import.meta.env.PROD) {
    console.warn(`[PGR Catalog] No image mapping for product ID "${product.id}"`);
  }

  return PRODUCT_IMAGE_MAP["pgr-bullion-collection"];
}

export function getAllowedProductImageIds(): readonly string[] {
  return ALLOWED_PRODUCT_IDS;
}

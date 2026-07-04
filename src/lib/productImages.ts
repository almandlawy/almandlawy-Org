/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";
import { ALLOWED_PRODUCT_IDS } from "./productCatalog";

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "pgr-bullion-collection": "/images/products/01-bullion-collection.webp",
  "pgr-gold-1g-10g": "/images/products/02-gold-bars-1g-5g-10g.webp",
  "pgr-gold-20g-50g": "/images/products/03-gold-bars-20g-50g.webp",
  "pgr-gold-100g": "/images/products/04-gold-bar-100g.webp",
  "pgr-gold-1kg": "/images/products/05-gold-bar-1kg.webp",
  "pgr-silver-1oz-100g": "/images/products/06-silver-bars-1oz-100g.webp",
  "pgr-silver-500g": "/images/products/07-silver-bar-500g.webp",
  "pgr-silver-1kg": "/images/products/08-silver-bar-1kg.webp",
  "pgr-mint-bars-coins": "/images/products/09-mint-bars-coins.webp",
  "custom-bullion-inquiry": "/images/products/10-custom-bullion-inquiry.webp",
};

export function getProductImage(product: Product): string {
  if (product.image_url) {
    return product.image_url;
  }

  const mapped = PRODUCT_IMAGE_MAP[product.id || ""];
  if (mapped) {
    return mapped;
  }

  if (!import.meta.env.PROD) {
    console.warn(`[PGR Catalog] No image mapping for product ID "${product.id}"`);
  }

  return PRODUCT_IMAGE_MAP["pgr-bullion-collection"];
}

export function getAllowedProductImageIds(): readonly string[] {
  return ALLOWED_PRODUCT_IDS;
}

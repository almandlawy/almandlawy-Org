/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";

export function getProductImage(product: Product): string {
  if (product.image_url) {
    return product.image_url;
  }

  const id = product.id || "";
  const category = product.category || "";
  
  if (id === "custom-bullion-inquiry") {
    return "/images/products/10-custom-bullion-inquiry.webp";
  }

  const isGold = category.includes("gold") || id.startsWith("gb");
  const isSilver = category.includes("silver") || id.startsWith("sb");
  const isCoin = category.includes("coin") || id.startsWith("gc") || id.startsWith("sc");

  if (isCoin) {
    return "/images/products/09-mint-bars-coins.webp";
  }

  if (isGold) {
    // 02-gold-bars-1g-5g-10g.webp: gold bars up to 10g
    // 03-gold-bars-20g-50g.webp: gold bars 20g to 50g, 1oz, 10tolas
    // 04-gold-bar-100g.webp: gold bars exactly 100g
    // 05-gold-bar-1kg.webp: gold bars 250g, 500g, 1kg
    if (id.includes("100g")) {
      return "/images/products/04-gold-bar-100g.webp";
    }
    if (id.includes("1kg") || id.includes("500g") || id.includes("250g")) {
      return "/images/products/05-gold-bar-1kg.webp";
    }
    if (id.includes("1g") || id.includes("2.5g") || id.includes("5g") || id.includes("10g")) {
      return "/images/products/02-gold-bars-1g-5g-10g.webp";
    }
    return "/images/products/03-gold-bars-20g-50g.webp";
  }

  if (isSilver) {
    // 06-silver-bars-1oz-100g.webp: up to 100g
    // 07-silver-bar-500g.webp: exactly 500g
    // 08-silver-bar-1kg.webp: 1kg, 100oz, 5kg
    if (id.includes("500g")) {
      return "/images/products/07-silver-bar-500g.webp";
    }
    if (id.includes("1kg") || id.includes("5kg") || id.includes("100oz")) {
      return "/images/products/08-silver-bar-1kg.webp";
    }
    return "/images/products/06-silver-bars-1oz-100g.webp";
  }

  // Fallback to general collection asset
  return "/images/products/01-bullion-collection.webp";
}

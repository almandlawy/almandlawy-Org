/**
 * Procedural bullion bar dimensions + material hints for R3F showcase.
 * Replace with gltfjsx-generated components when GLB assets are ready.
 */

import { Product } from "../types";

export type BarMetal = "gold" | "silver";

const BAR_DIMENSIONS: Record<string, [number, number, number]> = {
  "pgr-gold-1kg": [2.2, 0.35, 1.0],
  "pgr-silver-1kg": [2.2, 0.35, 1.0],
  "pgr-silver-500g": [1.85, 0.3, 0.88],
  "pgr-gold-100g": [1.25, 0.22, 0.68],
  "pgr-silver-1oz-100g": [1.25, 0.22, 0.68],
  "pgr-gold-20g-50g": [1.05, 0.18, 0.58],
  "pgr-gold-1g-10g": [0.75, 0.14, 0.42],
  "pgr-bullion-collection": [1.85, 0.3, 0.88],
  "pgr-mint-bars-coins": [1.05, 0.18, 0.58],
  "custom-bullion-inquiry": [1.25, 0.22, 0.68],
};

export function getBarDimensions(product: Product): [number, number, number] {
  const preset = BAR_DIMENSIONS[product.id];
  if (preset) return preset;

  const grams = product.technical_specs?.weight_grams ?? 0;
  if (grams >= 1000) return [2.2, 0.35, 1.0];
  if (grams >= 500) return [1.85, 0.3, 0.88];
  if (grams >= 100) return [1.25, 0.22, 0.68];
  if (grams >= 50) return [1.05, 0.18, 0.58];
  return [0.75, 0.14, 0.42];
}

export function getBarMetal(product: Product): BarMetal {
  const metal = product.technical_specs?.metal;
  if (metal === "silver") return "silver";
  if (metal === "gold") return "gold";
  if (product.category === "silver_bars") return "silver";
  if (product.id === "pgr-bullion-collection") return "silver";
  return "gold";
}

export function getBarMaterial(metal: BarMetal) {
  if (metal === "silver") {
    return { color: "#C8C8C8", metalness: 0.96, roughness: 0.16, emissive: "#888888", emissiveIntensity: 0.02 };
  }
  return { color: "#C6A15B", metalness: 0.94, roughness: 0.2, emissive: "#A47C36", emissiveIntensity: 0.04 };
}

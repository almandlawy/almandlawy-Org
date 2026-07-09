/** Default indicative spot references (USD per troy oz) — desk manual fallback. */
export const REFERENCE_GOLD_USD_OZ = 4050;
export const REFERENCE_SILVER_USD_OZ = 56;
export const REFERENCE_PLATINUM_USD_OZ = 1080;
export const REFERENCE_PALLADIUM_USD_OZ = 1120;

export const OUNCE_TO_GRAM = 31.1034768;
export const DEFAULT_USD_AED = 3.6725;

export const REFERENCE_METAL_SPOTS = {
  gold: REFERENCE_GOLD_USD_OZ,
  silver: REFERENCE_SILVER_USD_OZ,
  platinum: REFERENCE_PLATINUM_USD_OZ,
  palladium: REFERENCE_PALLADIUM_USD_OZ,
} as const;

export function dailyReferenceAedPerGram(
  spotUsdOz: number,
  usdAed: number = DEFAULT_USD_AED
): number {
  return parseFloat(((spotUsdOz * usdAed) / OUNCE_TO_GRAM).toFixed(2));
}

export const REFERENCE_GOLD_USD_PER_GRAM = parseFloat(
  (REFERENCE_GOLD_USD_OZ / OUNCE_TO_GRAM).toFixed(2)
);
export const REFERENCE_SILVER_USD_PER_GRAM = parseFloat(
  (REFERENCE_SILVER_USD_OZ / OUNCE_TO_GRAM).toFixed(2)
);
export const REFERENCE_GOLD_AED_PER_GRAM = dailyReferenceAedPerGram(REFERENCE_GOLD_USD_OZ);
export const REFERENCE_SILVER_AED_PER_GRAM = dailyReferenceAedPerGram(REFERENCE_SILVER_USD_OZ);

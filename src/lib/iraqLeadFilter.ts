/** Detect Iraq-focused website quote leads for admin filtering. */

const IRAQ_KEYWORDS = [
  "iraq",
  "baghdad",
  "erbil",
  "basra",
  "karbala",
  "mosul",
  "najaf",
  "kirkuk",
  "sulaymaniyah",
  "العراق",
  "بغداد",
  "أربيل",
  "اربيل",
  "البصرة",
  "النجف",
  "كربلاء",
  "الموصل",
];

const IRAQ_PRODUCT_HINTS = ["sam", "palm", "pgr-silver", "silver 500", "silver 1kg", "فضة"];

export function isIraqLead(quote: Record<string, unknown>): boolean {
  const parts = [
    quote.company,
    quote.countryCity,
    quote.phone,
    quote.message,
    quote.product_category,
    quote.productCategory,
    quote.metal_interest,
    quote.metalInterest,
    quote.weight_preference,
    quote.weight,
    quote.source,
    quote.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (IRAQ_KEYWORDS.some((k) => parts.includes(k))) return true;

  const digits = String(quote.phone || "").replace(/\D/g, "");
  if (digits.startsWith("964") || digits.startsWith("00964")) return true;

  if (String(quote.source || "").toLowerCase().includes("iraq")) return true;

  return IRAQ_PRODUCT_HINTS.some((hint) => parts.includes(hint));
}

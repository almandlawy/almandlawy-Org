/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";
import { productPosterUrl } from "./lib/productImages";

export const BRANDS = [
  { name: "PAMP Suisse", origin: "Switzerland", description: "World-leading bullion brand renowned for artistic craftsmanship and security certificates." },
  { name: "Valcambi", origin: "Switzerland", description: "One of the oldest and largest international precious metal refineries, known for high-purity castings." },
  { name: "Emirates Gold", origin: "United Arab Emirates", description: "The premier gold refinery in the UAE with recognized international accreditation." },
  { name: "SAM Precious Metals", origin: "United Arab Emirates", description: "State-of-the-art Dubai precious metals refinery with high-volume industrial capability." },
  { name: "Al Etihad Gold", origin: "United Arab Emirates", description: "Highly respected UAE refinery producing world-class minted gold and silver bullion." },
  { name: "Metalor", origin: "Switzerland", description: "A premier international group specializing in gold refining and assay services." },
  { name: "Argor-Heraeus", origin: "Switzerland", description: "Globally acclaimed precious metals provider certified by major international exchanges." },
  { name: "Perth Mint", origin: "Australia", description: "Australia's official bullion producer, iconic for official legal tender gold and silver coins." },
  { name: "Royal Canadian Mint", origin: "Canada", description: "Famous for the Maple Leaf series featuring industry-leading anti-counterfeiting laser technology." },
  { name: "Royal Mint", origin: "United Kingdom", description: "The official mint of the UK with over 1,100 years of historic security and design heritage." }
];

/** PGR UAE curated catalog — one product per official collection image */
export const PRODUCTS: Product[] = [
  {
    id: "pgr-bullion-collection",
    name_en: "PGR UAE Bullion Collection",
    name_ar: "مجموعة سبائك PGR UAE",
    category: "gold_bars",
    weight_label: "Full Portfolio Range",
    purity: "999.9 Fine Gold / 999.0 Fine Silver",
    manufacturer: "PGR UAE Partner Refiners",
    country_en: "United Arab Emirates",
    country_ar: "الإمارات العربية المتحدة",
    availability: "In Stock",
    certificate_en: "Assay Certificate & Serial Documentation",
    certificate_ar: "شهادة فحص معتمدة ووثائق تسلسلية",
    description_en: "The complete PGR UAE physical bullion desk portfolio. Accredited gold and silver bars and mint products sourced from LBMA-listed refiners. Indicative market reference pricing available — firm quote confirmed by PGR UAE desk.",
    description_ar: "المجموعة الكاملة لسبائك PGR UAE. سبائك ذهب وفضة ومنتجات مصكوكة من مصافٍ معتمدة. أسعار استرشادية متاحة — السعر النهائي يؤكده ديوان PGR UAE.",
    technical_specs: { weight_grams: 0, purity: "Au 99.99% / Ag 99.9%", metal: "gold", dimensions: "Varies by product", packaging: "Assay-sealed secure packaging", serial_number: true },
    image_placeholder: "gold_bar",
    image_url: productPosterUrl("01-bullion-collection.webp"),
    premium_multiplier: 1.03
  },
  {
    id: "pgr-gold-1g-10g",
    name_en: "Gold Bars 1g – 10g",
    name_ar: "سبائك الذهب ١ – ١٠ جرام",
    category: "gold_bars",
    weight_label: "1g / 5g / 10g",
    purity: "999.9 Fine Gold",
    manufacturer: "PAMP Suisse / Valcambi",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "CertiPAMP Assay Card & Serial",
    certificate_ar: "بطاقة فحص سيرتيبامب ورقم تسلسلي",
    description_en: "Entry-weight accredited minted gold bars from 1g to 10g. Indicative market reference subject to market movement.",
    description_ar: "سبائك ذهب مصكوكة من ١ إلى ١٠ جرام. مرجع سوقي استرشادي خاضع لحركة السوق.",
    technical_specs: { weight_grams: 10, purity: "Au 99.99%", metal: "gold", dimensions: "8.4 – 25.4 mm", packaging: "Tamper-proof assay blister", serial_number: true },
    image_placeholder: "gold_bar",
    image_url: productPosterUrl("02-gold-bars-1g-5g-10g.webp"),
    premium_multiplier: 1.10
  },
  {
    id: "pgr-gold-20g-50g",
    name_en: "Gold Bars 20g – 50g",
    name_ar: "سبائك الذهب ٢٠ – ٥٠ جرام",
    category: "gold_bars",
    weight_label: "20g / 50g / 1oz",
    purity: "999.9 Fine Gold",
    manufacturer: "Emirates Gold / Metalor",
    country_en: "UAE / Switzerland",
    country_ar: "الإمارات / سويسرا",
    availability: "In Stock",
    certificate_en: "Official Assay Certificate",
    certificate_ar: "شهادة فحص رسمية معتمدة",
    description_en: "Mid-weight gold bars from accredited international refiners. Subject to compliance review before firm quote issuance.",
    description_ar: "سبائك ذهب متوسطة الوزن من مصافٍ معتمدة. تخضع لمراجعة الامتثال قبل إصدار عرض السعر المؤكد.",
    technical_specs: { weight_grams: 50, purity: "Au 99.99%", metal: "gold", dimensions: "19 – 47 mm", packaging: "Secure assay blister card", serial_number: true },
    image_placeholder: "gold_bar",
    image_url: productPosterUrl("03-gold-bars-20g-50g.webp"),
    premium_multiplier: 1.05
  },
  {
    id: "pgr-gold-100g",
    name_en: "Gold Bar 100g",
    name_ar: "سبيكة الذهب ١٠٠ جرام",
    category: "gold_bars",
    weight_label: "100 Grams",
    purity: "999.9 Fine Gold",
    manufacturer: "PAMP Suisse",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "CertiPAMP Hard Pack & Assayer Stamp",
    certificate_ar: "علبة سيرتيبامب الرسمية وختم الفاحص",
    description_en: "100g cast gold bar — a cornerstone weight for physical allocation desks. Indicative market reference available on request.",
    description_ar: "سبيكة ذهب ١٠٠ جرام — وزن أساسي للتخصيص المادي. مرجع سوقي استرشادي متاح عند الطلب.",
    technical_specs: { weight_grams: 100, purity: "Au 99.99%", metal: "gold", dimensions: "24.0 x 41.0 mm", thickness: "5.5 mm", packaging: "CertiPAMP hard pack", serial_number: true },
    image_placeholder: "gold_bar",
    image_url: productPosterUrl("04-gold-bar-100g.webp"),
    premium_multiplier: 1.03
  },
  {
    id: "pgr-gold-1kg",
    name_en: "Gold Bar 1kg",
    name_ar: "سبيكة الذهب ١ كيلو جرام",
    category: "gold_bars",
    weight_label: "1 Kilogram (1000g)",
    purity: "999.9 Fine Gold",
    manufacturer: "PAMP Suisse / SAM Precious Metals",
    country_en: "Switzerland / UAE",
    country_ar: "سويسرا / الإمارات",
    availability: "Available on Order",
    certificate_en: "Official Assay Certificate & Executive Box",
    certificate_ar: "شهادة فحص معتمدة وعلبة تنفيذية",
    description_en: "Institutional-weight 1kg gold bar for vault allocation and wholesale desk orders. Final quote confirmed by PGR UAE desk.",
    description_ar: "سبيكة ذهب ١ كيلو جرام للتخصيص المؤسسي. السعر النهائي يؤكده ديوان PGR UAE.",
    technical_specs: { weight_grams: 1000, purity: "Au 99.99%", metal: "gold", dimensions: "52.0 x 115.0 mm", packaging: "Executive box with certificates", serial_number: true },
    image_placeholder: "gold_bar",
    image_url: productPosterUrl("05-gold-bar-1kg.webp"),
    premium_multiplier: 1.015
  },
  {
    id: "pgr-silver-1oz-100g",
    name_en: "Silver Bars 1oz – 100g",
    name_ar: "سبائك الفضة ١ أونصة – ١٠٠ جرام",
    category: "silver_bars",
    weight_label: "1oz / 50g / 100g",
    purity: "999.0 Fine Silver",
    manufacturer: "PAMP Suisse / Valcambi",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "CertiPAMP Assay Blister",
    certificate_ar: "بطاقة فحص سيرتيبامب",
    description_en: "Accredited minted silver bars from 1 troy ounce to 100g. Indicative market reference subject to market movement.",
    description_ar: "سبائك فضة سويسرية من أونصة إلى ١٠٠ جرام. سعر استرشادي خاضع لحركة السوق.",
    technical_specs: { weight_grams: 100, purity: "Ag 99.9%", metal: "silver", dimensions: "15 – 47 mm", packaging: "CertiPAMP blister pack", serial_number: true },
    image_placeholder: "silver_bar",
    image_url: productPosterUrl("06-silver-bars-1oz-100g.webp"),
    premium_multiplier: 1.12
  },
  {
    id: "pgr-silver-500g",
    name_en: "Silver Bar 500g",
    name_ar: "سبيكة الفضة ٥٠٠ جرام",
    category: "silver_bars",
    weight_label: "500 Grams",
    purity: "999.0 Fine Silver",
    manufacturer: "SAM Precious Metals",
    country_en: "United Arab Emirates",
    country_ar: "الإمارات العربية المتحدة",
    availability: "In Stock",
    certificate_en: "UAE Refinery Assay Certificate",
    certificate_ar: "شهادة فحص مصفاة إماراتية",
    description_en: "Half-kilogram UAE-cast silver bar with competitive desk pricing. Subject to compliance review.",
    description_ar: "سبيكة فضة نصف كيلو مصبوبة في الإمارات. تخضع لمراجعة الامتثال.",
    technical_specs: { weight_grams: 500, purity: "Ag 99.9%", metal: "silver", dimensions: "40.0 x 80.0 mm", packaging: "Vacuum-sealed protection", serial_number: true },
    image_placeholder: "silver_bar",
    image_url: productPosterUrl("07-silver-bar-500g.webp"),
    premium_multiplier: 1.06
  },
  {
    id: "pgr-silver-1kg",
    name_en: "Silver Bar 1kg",
    name_ar: "سبيكة الفضة ١ كيلو جرام",
    category: "silver_bars",
    weight_label: "1 Kilogram (1000g)",
    purity: "999.0 Fine Silver",
    manufacturer: "Valcambi",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Assayer Stamp & Certificate",
    certificate_ar: "ختم الفاحص السويسري وشهادة رسمية",
    description_en: "1kg accredited cast silver bar for bulk physical allocation. Firm quote issued after desk availability confirmation.",
    description_ar: "سبيكة فضة ١ كيلو جرام سويسرية للتخصيص بالجملة. عرض سعر مؤكد بعد تأكيد التوفر.",
    technical_specs: { weight_grams: 1000, purity: "Ag 99.9%", metal: "silver", dimensions: "52.0 x 117.0 mm", packaging: "Vacuum sealed wrap", serial_number: true },
    image_placeholder: "silver_bar",
    image_url: productPosterUrl("08-silver-bar-1kg.webp"),
    premium_multiplier: 1.05
  },
  {
    id: "pgr-mint-bars-coins",
    name_en: "Mint Bars & Bullion Coins",
    name_ar: "السبائك المصكوكة وعملات السبائك",
    category: "mint_bars_coins",
    weight_label: "1oz Standard / Fractional",
    purity: "999.9 Fine Gold / 999.0 Fine Silver",
    manufacturer: "Royal Mint / Perth Mint / RCM",
    country_en: "International",
    country_ar: "دولي",
    availability: "In Stock",
    certificate_en: "Government Mint Legal Tender Backing",
    certificate_ar: "إصدار دار سك حكومية معتمدة",
    description_en: "Accredited mint bars and sovereign bullion coins from world-renowned national mints. Indicative market reference pricing available.",
    description_ar: "سبائك مصكوكة وعملات سيادية من دور سك وطنية عالمية. تسعير استرشادي متاح.",
    technical_specs: { weight_oz: 1, purity: "Au 99.99% / Ag 99.9%", metal: "gold", dimensions: "Diameter 22 – 40 mm", packaging: "Protective acrylic capsule", serial_number: false },
    image_placeholder: "gold_coin",
    image_url: productPosterUrl("09-mint-bars-coins.webp"),
    premium_multiplier: 1.06
  },
  {
    id: "custom-bullion-inquiry",
    name_en: "Custom Bullion Sizing & Bulk Sourcing",
    name_ar: "طلبات السبائك المخصصة والتوريد الخاص للجملة",
    category: "custom_inquiry",
    weight_label: "Custom Weights / Bulk Sourcing",
    purity: "999.9 Fine Gold / 999.0 Silver",
    manufacturer: "PGR UAE Partner Refiners",
    country_en: "International",
    country_ar: "دولي",
    availability: "Available on Order",
    certificate_en: "Official Assayer Certificate & Full Documents",
    certificate_ar: "مرفق بشهادة فحص معتمدة وكافة المستندات الرسمية",
    description_en: "Bespoke sourcing and refining for institutional clients, custom weight cast bars, and family offices. Subject to compliance review.",
    description_ar: "خدمات التوريد المخصصة للمؤسسات والسبائك بأوزان خاصة. تخضع لمراجعة الامتثال.",
    technical_specs: { weight_grams: 0, purity: "Au 99.99% / Ag 99.9%", metal: "gold", dimensions: "Varies by request", packaging: "Segregated secure boxing", serial_number: true },
    image_placeholder: "gold_bar",
    image_url: productPosterUrl("10-custom-bullion-inquiry.webp"),
    premium_multiplier: 1.02
  }
];

export const WHY_US_ITEMS = [
  {
    title_en: "International Institutional Compliance",
    title_ar: "امتثال مؤسسي بمعايير دولية",
    desc_en: "Operating from Dubai, a global centre for physical precious metals, with strict international standards of compliance.",
    desc_ar: "نعمل من قلب دبي، العاصمة العالمية لتداول الذهب والمعادن الثمينة، بامتثال تام للأنظمة المرعية والاعتمادات الدولية."
  },
  {
    title_en: "Wholesale Global Solutions",
    title_ar: "حلول تداول بالجملة وعالمية",
    desc_en: "We offer tailored, competitive desk pricing for institutional bullion procurement, private clients, high-volume orders, and institutional reserves.",
    desc_ar: "نقدم تسعيراً مباشراً وتنافسياً مخصصاً لعمليات شراء السبائك الكبرى للمؤسسات، الصناديق الخاصة، تداول الكميات الضخمة، والاحتياطيات المؤسسية."
  },
  {
    title_en: "Secure Global Vaulting",
    title_ar: "تخزين وشحن عالمي آمن",
    desc_en: "Fully covered door-to-door transit via desk-confirmed secure delivery with direct storage options in UAE premium, certified vaults.",
    desc_ar: "شحن مغطى بالكامل من الباب إلى الباب عبر تسليم آمن يؤكده الديوان مع خيارات تخزين مباشر في أرقى الخزائن المؤمنة والمعتمدة في دبي."
  },
  {
    title_en: "Absolute Pricing Transparency",
    title_ar: "شفافية مطلقة في التسعير",
    desc_en: "PGR UAE is founded on absolute transparency. Our digital rates align directly with global gold/silver spot tickers with zero hidden broker premiums.",
    desc_ar: "تأسست بي جي آر على مبدأ الشفافية الكاملة. أسعارنا الرقمية تتبع شاشات التداول العالمية مباشرة بدون أي رسوم وساطة خفية."
  }
];

/** Default daily pricing control values for admin panel */
export const DEFAULT_DAILY_PRICING = {
  gold_daily_reference_price: 288.30,
  silver_daily_reference_price: 4.04,
  currency: "AED" as const,
  unit: "per_gram" as const,
  manual_pricing_enabled: false,
  effective_date: new Date().toISOString().split("T")[0],
  reason_for_update: "",
  updated_by_admin: "",
  last_updated_at: ""
};

/** Default payment gateway settings — no secrets stored client-side */
export const DEFAULT_PAYMENT_SETTINGS = {
  payment_gateway_enabled: false,
  provider: "Manual Bank Transfer" as const,
  payment_mode: "Bank transfer only" as const,
  public_payment_note:
    "Payment is arranged only after your firm quote is accepted. PGR UAE desk will issue a payment link or bank transfer instructions. Subject to compliance review.",
  internal_payment_note:
    "Gateway API keys must be set in server environment variables only. Never expose secrets to the client bundle.",
  payment_link_instructions:
    "After quote acceptance, the desk will send a secure payment link or UAE bank transfer details. Upload payment proof if paying by bank transfer.",
  supported_currencies: ["AED", "USD"] as ("AED" | "USD")[],
  minimum_payment_amount: 1000,
  max_payment_amount_before_manual_review: 250000,
  require_kyc_before_payment: true
};

/** Default shipping settings for admin panel */
export const DEFAULT_SHIPPING_SETTINGS = {
  shipping_enabled: true,
  shipping_company_name: "PGR Arranged Delivery",
  shipping_method: "Desk-confirmed secure delivery",
  shipping_price: 150,
  currency: "AED" as const,
  destination_country: "United Arab Emirates",
  destination_city_region: "Dubai Marina / UAE Wide",
  estimated_delivery_time: "1–3 business days (UAE)",
  public_shipping_note: "Desk-confirmed secure delivery. Subject to KYC verification and compliance review before dispatch.",
  internal_shipping_notes: "Default UAE domestic route. Iraq/Baghdad routes require separate customs clearance dossier."
};

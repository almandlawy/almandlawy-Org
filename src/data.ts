/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

export const BRANDS = [
  { name: "PAMP Suisse", origin: "Switzerland", description: "World-leading bullion brand renowned for artistic craftsmanship and security certificates." },
  { name: "Valcambi", origin: "Switzerland", description: "One of the oldest and largest Swiss precious metal refineries, known for high-purity castings." },
  { name: "Metalor", origin: "Switzerland", description: "A premier international Swiss group specializing in gold refining and assay services." },
  { name: "Argor-Heraeus", origin: "Switzerland", description: "Globally acclaimed precious metals provider certified by major international exchanges." },
  { name: "Perth Mint", origin: "Australia", description: "Australia's official bullion producer, iconic for official legal tender gold and silver coins." },
  { name: "Royal Canadian Mint", origin: "Canada", description: "Famous for the Maple Leaf series featuring industry-leading anti-counterfeiting laser technology." },
  { name: "Royal Mint", origin: "United Kingdom", description: "The sovereign mint of the UK with over 1,100 years of historic security and design heritage." }
];

export const PRODUCTS: Product[] = [
  // --- GOLD BARS ---
  {
    id: "gb-1g",
    name_en: "PAMP Suisse 1g Cast Gold Bar",
    name_ar: "سبيكة ذهب بامب سويس ١ جرام",
    category: "gold_bars",
    weight_label: "1 Gram",
    purity: "999.9 Fine Gold",
    manufacturer: "PAMP Suisse",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Assay Certificate Included",
    certificate_ar: "مرفق بشهادة فحص معتمدة",
    description_en: "A perfect entry point for physical gold investors. This 1g bar features the iconic Lady Fortuna design and comes sealed in a high-security assay card.",
    description_ar: "سبيكة ذهب نقي فئة ١ جرام من مصفاة بامب سويس الشهيرة. تحمل تصميم سيدة الحظ العريق، وتأتي مغلفة ببطاقة أمان وفحص معتمدة لضمان الجودة.",
    technical_specs: {
      weight_grams: 1,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "8.4 mm x 14.7 mm",
      thickness: "0.5 mm",
      packaging: "Sealed tamper-proof assay card",
      serial_number: true
    },
    image_placeholder: "gold_bar",
    premium_multiplier: 1.15
  },
  {
    id: "gb-5g",
    name_en: "Valcambi 5g Minted Gold Bar",
    name_ar: "سبيكة ذهب فالكامبي ٥ جرام",
    category: "gold_bars",
    weight_label: "5 Grams",
    purity: "999.9 Fine Gold",
    manufacturer: "Valcambi",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Assay Certificate & Unique Serial Number",
    certificate_ar: "مرفق بشهادة فحص مع رقم تسلسلي فريد",
    description_en: "Precision crafted by Valcambi, one of Switzerland's most prestigious refineries. Exceptionally polished with crisp edges and brilliant specular sheen.",
    description_ar: "سبيكة مصكوكة بدقة عالية من مصفاة فالكامبي السويسرية الشهيرة. تتميز بتشطيب صقيل عاكس وحواف دقيقة، ومحمية ببطاقة الفحص المعتمدة.",
    technical_specs: {
      weight_grams: 5,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "14.0 mm x 23.0 mm",
      thickness: "0.9 mm",
      packaging: "Auspicious secure assay pack",
      serial_number: true
    },
    image_placeholder: "gold_bar",
    premium_multiplier: 1.08
  },
  {
    id: "gb-10g",
    name_en: "Argor-Heraeus 10g Gold Bar",
    name_ar: "سبيكة ذهب أرغور هيريوس ١٠ جرام",
    category: "gold_bars",
    weight_label: "10 Grams",
    purity: "999.9 Fine Gold",
    manufacturer: "Argor-Heraeus",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Certified LBMA Good Delivery Refiner Certificate",
    certificate_ar: "شهادة معتمدة من مصفاة LBMA المعتمدة",
    description_en: "This Swiss-made 10g gold bar is recognized globally for liquidity and represents a highly liquid wealth preservation asset.",
    description_ar: "سبيكة ذهب سويسرية وزن ١٠ جرام ممتازة للاستثمار المتوسط. تحظى بقبول عالمي فوري وسيولة تامة بفضل اعتمادها الدولي من جمعية سوق لندن لسبائك الذهب.",
    technical_specs: {
      weight_grams: 10,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "15.0 mm x 25.4 mm",
      thickness: "1.6 mm",
      packaging: "Sovereign Assay blister card",
      serial_number: true
    },
    image_placeholder: "gold_bar",
    premium_multiplier: 1.06
  },
  {
    id: "gb-50g",
    name_en: "Metalor 50g Cast Gold Bar",
    name_ar: "سبيكة ذهب ميتالور ٥٠ جرام",
    category: "gold_bars",
    weight_label: "50 Grams",
    purity: "999.9 Fine Gold",
    manufacturer: "Metalor",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Individually Numbered Certificate of Authenticity",
    certificate_ar: "شهادة أصالة مرقمة بشكل فردي",
    description_en: "Metalor Swiss casting delivers timeless, rustic allure. This 50g cast gold bar features a traditional poured finish with unique physical cooling ripples.",
    description_ar: "سبيكة ذهب ميتالور سويسرية مصبوبة يدوياً بأسلوب كلاسيكي فاخر. تتموج السبيكة بتأثيرات تبريد فريدة لتمنحك إحساساً أصيلاً بالسبائك الكلاسيكية الراقية.",
    technical_specs: {
      weight_grams: 50,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "18.5 mm x 32.5 mm",
      thickness: "4.2 mm",
      packaging: "Protected velvet pouch & certificate card",
      serial_number: true
    },
    image_placeholder: "gold_bar",
    premium_multiplier: 1.04
  },
  {
    id: "gb-100g",
    name_en: "PAMP Suisse 100g Cast Gold Bar",
    name_ar: "سبيكة ذهب بامب سويس ١٠٠ جرام",
    category: "gold_bars",
    weight_label: "100 Grams",
    purity: "999.9 Fine Gold",
    manufacturer: "PAMP Suisse",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Official PAMP CertiPAMP Packaging & Assayer Stamp",
    certificate_ar: "مغلفة ببطاقة سيرتيبامب الرسمية والختم المعتمد",
    description_en: "A cornerstone for serious physical portfolios. Combining high metal volume with Swiss prestige refining, this 100g cast bar is highly liquid and globally coveted.",
    description_ar: "حجر الأساس للمحافظ الاستثمارية القيمة. تجمع السبيكة بين الوزن المثالي والبريق السويسري الأخاذ لتجعلها السبيكة الأكثر طلباً لسهولة التداول والادخار.",
    technical_specs: {
      weight_grams: 100,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "24.0 mm x 41.0 mm",
      thickness: "5.5 mm",
      packaging: "High-security CertiPAMP hard pack",
      serial_number: true
    },
    image_placeholder: "gold_bar",
    premium_multiplier: 1.03
  },
  {
    id: "gb-1kg",
    name_en: "PAMP Suisse 1kg Good Delivery Gold Bar",
    name_ar: "سبيكة ذهب نقي ١ كيلو جرام بامب سويس",
    category: "gold_bars",
    weight_label: "1 Kilogram (1000g)",
    purity: "999.9 Fine Gold",
    manufacturer: "PAMP Suisse",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "Available on Order",
    certificate_en: "LBMA Good Delivery Certificate & Hard Box Serialized",
    certificate_ar: "شهادة معتمدة من جمعية سوق لندن ومحفوظة في علبة فاخرة مرقمة",
    description_en: "The ultimate standard of sovereign and institutional wealth preservation. Hand-poured in Switzerland, this 1kg bar of pure gold offers the tightest spread and lowest premium.",
    description_ar: "المعيار الأسمى للثروات السيادية والمؤسساتية وصناديق التحوط الفاخرة. سبيكة مصبوبة بعناية في سويسرا بوزن ١٠٠٠ جرام تضمن لك أفضل أسعار شراء وأقل هوامش ربحية للجرام الواحد.",
    technical_specs: {
      weight_grams: 1000,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "52.0 mm x 115.0 mm",
      thickness: "9.0 mm",
      packaging: "Custom executive box with official paper certificates",
      serial_number: true
    },
    image_placeholder: "gold_bar",
    premium_multiplier: 1.015
  },

  // --- SILVER BARS ---
  {
    id: "sb-1oz",
    name_en: "PAMP Suisse 1 oz Minted Silver Bar",
    name_ar: "سبيكة فضة بامب سويس ١ أونصة",
    category: "silver_bars",
    weight_label: "1 Troy Ounce (31.1g)",
    purity: "999.0 Fine Silver",
    manufacturer: "PAMP Suisse",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Sealed Assay Blister CertiPAMP",
    certificate_ar: "مرفق ببطاقة سيرتيبامب محكمة الإغلاق",
    description_en: "Featuring the glorious details of the Lady Fortuna icon, this 1oz silver bar reflects light like water on glass, offering absolute Swiss excellence.",
    description_ar: "سبيكة فضة ناعمة بوزن أونصة واحدة تحمل النقش التاريخي لسيدة الحظ. تتألق السبيكة ببريق فضي أخاذ يعكس أرقى معايير الصقل السويسرية.",
    technical_specs: {
      weight_oz: 1,
      purity: "Ag 99.9%",
      metal: "silver",
      dimensions: "27.0 mm x 47.0 mm",
      thickness: "2.6 mm",
      packaging: "CertiPAMP signature security package",
      serial_number: true
    },
    image_placeholder: "silver_bar",
    premium_multiplier: 1.15
  },
  {
    id: "sb-1kg",
    name_en: "Valcambi 1kg Pure Silver Cast Bar",
    name_ar: "سبيكة فضة فالكامبي ١ كيلو جرام مصبوبة",
    category: "silver_bars",
    weight_label: "1 Kilogram (1000g)",
    purity: "999.0 Fine Silver",
    manufacturer: "Valcambi",
    country_en: "Switzerland",
    country_ar: "سويسرا",
    availability: "In Stock",
    certificate_en: "Serialized Swiss Assayer Stamp & Paper Certificate",
    certificate_ar: "مختومة بختم الفاحص السويسري مع شهادة ورقية رسمية",
    description_en: "High bulk silver storage refined with absolute Swiss purity. Stamped with the iconic Valcambi square logo, this bar is perfect for hedging and robust physical holdings.",
    description_ar: "سبيكة فضة نقية بوزن ١ كيلو جرام لتأمين السيولة في المحفظة. توفر حجماً استثمارياً ممتازاً بهامش سعري ضئيل ومصنعة باعتماد LBMA العريق.",
    technical_specs: {
      weight_grams: 1000,
      purity: "Ag 99.9%",
      metal: "silver",
      dimensions: "52.0 mm x 117.0 mm",
      thickness: "15.0 mm",
      packaging: "Vacuum sealed wrap with certificate",
      serial_number: true
    },
    image_placeholder: "silver_bar",
    premium_multiplier: 1.05
  },

  // --- GOLD COINS ---
  {
    id: "gc-britannia",
    name_en: "Royal Mint Britannia Gold Coin",
    name_ar: "عملة بريتانيا الذهبية - دار السك الملكية",
    category: "gold_coins",
    weight_label: "1 Troy Ounce (31.1g)",
    purity: "999.9 Fine Gold",
    manufacturer: "Royal Mint",
    country_en: "United Kingdom",
    country_ar: "المملكة المتحدة",
    availability: "In Stock",
    certificate_en: "Official Legal Tender Status with Micro-Laser Security",
    certificate_ar: "عملة رسمية قانونية مع ميزة الأمان المجهري بالليزر",
    description_en: "The most secure gold bullion coin in the world. Features four innovative security features including a holographic trident that shifts to a padlock upon movement.",
    description_ar: "العملة الذهبية الأكثر أماناً في العالم بفضل تقنيات دار السك البريطانية. تحمل أربع ميزات أمان متقدمة من بينها صورة هولوجرامية تتبدل بين قفل وثلاثي الرمح عند الإمالة.",
    technical_specs: {
      weight_oz: 1,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "Diameter 32.69 mm",
      thickness: "2.8 mm",
      packaging: "Premium protective acrylic coin capsule",
      serial_number: false
    },
    image_placeholder: "gold_coin",
    premium_multiplier: 1.05
  },
  {
    id: "gc-maple",
    name_en: "Royal Canadian Mint Maple Leaf Gold Coin",
    name_ar: "عملة ورقة القيقب الكندية الذهبية",
    category: "gold_coins",
    weight_label: "1 Troy Ounce (31.1g)",
    purity: "999.9 Fine Gold",
    manufacturer: "Royal Canadian Mint",
    country_en: "Canada",
    country_ar: "كندا",
    availability: "In Stock",
    certificate_en: "Bullion DNA Anti-Counterfeit Verification Certified",
    certificate_ar: "مسجلة بتقنية التحقق الرقمي من تزييف السبائك DNA",
    description_en: "Made of 99.99% pure Canadian gold, this globally celebrated coin integrates light-diffracting radial lines and a micro-engraved maple leaf with the year of minting.",
    description_ar: "مصنوعة من الذهب الكندي فائق النقاوة بنسبة ٩٩.٩٩٪. تنفرد العملة بخطوط قطرية تشتت الضوء وتمنع التزييف، مع نقش ورقة قيقب مجهري يحمل سنة الإصدار لدقة متناهية.",
    technical_specs: {
      weight_oz: 1,
      purity: "Au 99.99%",
      metal: "gold",
      dimensions: "Diameter 30.0 mm",
      thickness: "2.87 mm",
      packaging: "High-grade optical archival capsule",
      serial_number: false
    },
    image_placeholder: "gold_coin",
    premium_multiplier: 1.05
  },
  {
    id: "gc-eagle",
    name_en: "US Mint American Eagle Gold Coin",
    name_ar: "عملة النسر الأمريكي الذهبية",
    category: "gold_coins",
    weight_label: "1 Troy Ounce (31.1g)",
    purity: "22 Karat (91.67% Gold, Crown Alloy)",
    manufacturer: "Valcambi", // Disclaiming manufacturing, note: US Mint manufactured, distributed through PGR
    country_en: "United States",
    country_ar: "الولايات المتحدة",
    availability: "In Stock",
    certificate_en: "US Treasury Backed Sovereign Weight & Purity Guarantee",
    certificate_ar: "مضمونة الوزن والنقاوة من الخزانة الأمريكية مباشرة",
    description_en: "A historic classic. The American Eagle is minted in durable Crown Gold (alloyed with silver and copper for hardwearing scratch resistance) and backed by the United States government.",
    description_ar: "العملة الكلاسيكية الأشهر على الإطلاق. تُصك بذهب عيار ٢٢ قيراطاً لزيادة الصلابة ومقاومة الخدوش الفضية مع الحفاظ التام على محتوى أونصة واحدة كاملة من الذهب الخالص.",
    technical_specs: {
      weight_oz: 1,
      purity: "91.67% Gold (31.1g pure Au)",
      metal: "gold",
      dimensions: "Diameter 32.70 mm",
      thickness: "2.87 mm",
      packaging: "Airtight hard capsule package",
      serial_number: false
    },
    image_placeholder: "gold_coin",
    premium_multiplier: 1.06
  },
  {
    id: "gc-krugerrand",
    name_en: "Rand Refinery Krugerrand Gold Coin",
    name_ar: "عملة كروغران الذهبية - جنوب أفريقيا",
    category: "gold_coins",
    weight_label: "1 Troy Ounce (31.1g)",
    purity: "22 Karat (91.67% Gold, Copper Alloy)",
    manufacturer: "Valcambi", // Represented / Available
    country_en: "South Africa",
    country_ar: "جنوب أفريقيا",
    availability: "Limited Stock",
    certificate_en: "The world's first and most widely traded bullion gold coin",
    certificate_ar: "العملة الاستثمارية الأولى تاريخياً والأوسع تداولاً في العالم",
    description_en: "Introduced in 1967 to allow private gold ownership. The Krugerrand carries a rich coppery-gold warmth and is recognized instantly by precious metals desks globally.",
    description_ar: "تم إطلاقها لأول مرة عام ١٩٦٧ لتكون الرمز التاريخي لادخار الذهب الخاص. تتميز بلونها الدافئ المائل للاحمرار بسبب سبيكة النحاس التي تمنحها صلابة ومقاومة أسطورية.",
    technical_specs: {
      weight_oz: 1,
      purity: "91.67% Au (31.1g pure content)",
      metal: "gold",
      dimensions: "Diameter 32.77 mm",
      thickness: "2.83 mm",
      packaging: "Protective dynamic capsule",
      serial_number: false
    },
    image_placeholder: "gold_coin",
    premium_multiplier: 1.055
  },

  // --- SILVER COINS ---
  {
    id: "sc-britannia",
    name_en: "Royal Mint Britannia Silver Coin",
    name_ar: "عملة بريتانيا الفضية - دار السك البريطانية",
    category: "silver_coins",
    weight_label: "1 Troy Ounce (31.1g)",
    purity: "999.0 Fine Silver",
    manufacturer: "Royal Mint",
    country_en: "United Kingdom",
    country_ar: "المملكة المتحدة",
    availability: "In Stock",
    certificate_en: "Sovereign Backed & High Security Anti-Counterfeit Verification",
    certificate_ar: "مضمونة سيادياً وتحتوي على خطوط مجهرية مانعة للتزييف",
    description_en: "Strikingly beautiful and secure, the Britannia 1oz Silver Coin features the iconic figure standing firm amidst wind and waves, a legendary symbol of resilience and premium trade.",
    description_ar: "إحدى أجمل العملات الفضية العالمية وأكثرها تعقيداً في التصميم. تحمل الرمز الشهير لبريتانيا شامخة أمام عواصف البحر، ما يجعلها ملاذاً آمناً وأنيقاً.",
    technical_specs: {
      weight_oz: 1,
      purity: "Ag 99.9%",
      metal: "silver",
      dimensions: "Diameter 38.61 mm",
      thickness: "3.0 mm",
      packaging: "Custom acrylic collector capsule",
      serial_number: false
    },
    image_placeholder: "silver_coin",
    premium_multiplier: 1.18
  },
  {
    id: "sc-maple",
    name_en: "Royal Canadian Mint Maple Leaf Silver Coin",
    name_ar: "عملة ورقة القيقب الكندية الفضية",
    category: "silver_coins",
    weight_label: "1 Troy Ounce (31.1g)",
    purity: "999.9 Fine Silver",
    manufacturer: "Royal Canadian Mint",
    country_en: "Canada",
    country_ar: "كندا",
    availability: "In Stock",
    certificate_en: "Sovereign 1oz Coin with Royal Bullion DNA technology",
    certificate_ar: "عملة سيادية نقاوة ٩٩٩٩ مع ميزة الحمض النووي السبيكي DNA",
    description_en: "Boasting unparalleled purity at 99.99% (four-nines) fine silver, the Canadian Silver Maple Leaf is an essential component of any physical silver reserve.",
    description_ar: "تحظى عملة ورقة القيقب بنقاوة لا تضاهى تصل إلى ٩٩.٩٩٪ من الفضة الخالصة (أربعة تسعات)، وتعتبر خيار الادخار الأقوى لجامعي الفضة والمحافظ الاستثمارية.",
    technical_specs: {
      weight_oz: 1,
      purity: "Ag 99.99%",
      metal: "silver",
      dimensions: "Diameter 38.0 mm",
      thickness: "3.29 mm",
      packaging: "Archival clear-seal capsule",
      serial_number: false
    },
    image_placeholder: "silver_coin",
    premium_multiplier: 1.18
  }
];

export const WHY_US_ITEMS = [
  {
    title_en: "Dubai Institutional Compliance",
    title_ar: "امتثال مؤسسي بمعايير دبي",
    desc_en: "Operating in the heart of Dubai, the absolute global epicentre of precious metals trading, with strict DMCC and international LBMA standards of compliance.",
    desc_ar: "نعمل من قلب دبي، العاصمة العالمية لتداول الذهب والمعادن الثمينة، بامتثال تام لمعايير مركز دبي للسلع المتعددة والاعتمادات الدولية."
  },
  {
    title_en: "Wholesale Global Solutions",
    title_ar: "حلول تداول بالجملة وعالمية",
    desc_en: "We offer tailored, highly competitive direct pricing for institutional bullion procurement, private funds, high-volume trading, and sovereign reserves.",
    desc_ar: "نقدم تسعيراً مباشراً وتنافسياً مخصصاً لعمليات شراء السبائك الكبرى للمؤسسات، الصناديق الخاصة، تداول الكميات الضخمة، والاحتياطيات السيادية."
  },
  {
    title_en: "Secure Global Vaulting",
    title_ar: "تخزين وشحن عالمي آمن",
    desc_en: "Fully insured door-to-door transit via high-security logistics (Brink's / Transguard) with direct storage options in UAE premium, certified vaults.",
    desc_ar: "شحن مؤمن بالكامل من الباب إلى الباب عبر كبرى شركات الأمن (برينكس / ترانسجارد) مع خيارات تخزين مباشر في أرقى الخزائن المؤمنة والمعتمدة في دبي."
  },
  {
    title_en: "Absolute Pricing Transparency",
    title_ar: "شفافية مطلقة في التسعير",
    desc_en: "PGR UAE is founded on absolute transparency. Our digital rates align directly with global gold/silver spot tickers with zero hidden broker premiums.",
    desc_ar: "تأسست بي جي آر على مبدأ الشفافية الكاملة. أسعارنا الرقمية تتبع شاشات التداول العالمية مباشرة بدون أي رسوم وساطة خفية."
  }
];

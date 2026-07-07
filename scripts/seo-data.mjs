/** Shared SEO route data for build-time generators (sitemap + static HTML). */
export const SITE_ORIGIN = "https://www.pgruae.com";
export const OG_IMAGE = `${SITE_ORIGIN}/brand/pgr-uae-logo.png`;

export const PRODUCTS = [
  "PGR UAE Bullion Collection",
  "Gold Bars 1g – 10g",
  "Gold Bars 20g – 50g",
  "Gold Bar 100g",
  "Gold Bar 1kg",
  "Silver Bars 1oz – 100g",
  "Silver Bar 500g",
  "Silver Bar 1kg",
  "Mint Bars & Bullion Coins",
  "Custom Bullion Sizing & Bulk Sourcing"
];

export const IRAQ_BULLION_FAQ_EN = [
  {
    q: "Do you sell physical gold and silver to Iraqi customers?",
    a: "Yes. PGR UAE sources physical gold bars, silver bars, and bullion coins from accredited refineries in Dubai. Iraqi customers can request desk-confirmed quotes subject to compliance review."
  },
  {
    q: "Are prices final on the website?",
    a: "No. Prices shown are indicative market references only and are not a firm offer. Final pricing is confirmed by the PGR UAE desk after review."
  },
  {
    q: "How is the final quote confirmed?",
    a: "After you request a quote, the PGR UAE desk reviews product availability, compliance requirements, and current market conditions, then issues a desk-confirmed quote before any payment arrangement."
  },
  {
    q: "Is KYC required?",
    a: "KYC and AML review may be required before payment and dispatch. Requirements depend on order value, customer profile, and applicable regulations."
  },
  {
    q: "Can I request a quote by WhatsApp?",
    a: "Yes. Iraqi customers can contact the PGR UAE WhatsApp Quote Desk to request a firm quote for physical gold or silver bullion."
  },
  {
    q: "Do you provide delivery or collection options?",
    a: "Collection and delivery options for Iraqi customers are arranged after desk review, compliance clearance, and confirmation of availability. Options are subject to documentation and applicable customs requirements."
  }
];

/** Sitemap URLs — keep in sync with src/lib/seoRoutes.ts */
export const PUBLIC_PAGES = [
  {
    path: "/",
    title: "PGR UAE | Gold & Silver Bullion Quote Desk Dubai to Iraq",
    desc: "Request desk-confirmed quotes for physical gold bars, silver bars and bullion coins from Dubai to Iraq. Indicative market reference only. Final quote after compliance review.",
    h1: "Gold & Silver Bullion Quote Desk from Dubai to Iraq",
    priority: "1.0",
    changefreq: "daily"
  },
  {
    path: "/request-quote",
    title: "Request Firm Quote | PGR UAE",
    desc: "Request a desk-confirmed bullion quote from PGR UAE. Indicative market reference only. Final quote after compliance review.",
    h1: "Request Firm Quote",
    priority: "0.9",
    changefreq: "weekly"
  },
  {
    path: "/iraq-bullion-quote",
    title: "Gold & Silver Bullion Quotes for Iraq | PGR UAE Dubai",
    desc: "Request desk-confirmed quotes for physical gold bars, silver bars and bullion coins from Dubai to Iraq. Indicative market reference only, final quote after compliance review.",
    h1: "Gold & Silver Bullion Quotes for Iraqi Customers",
    priority: "0.9",
    changefreq: "weekly",
    faq: IRAQ_BULLION_FAQ_EN
  },
  {
    path: "/gold-bars",
    title: "Gold Bars Catalog | PGR UAE",
    desc: "Physical gold bars from 1g to 1kg. Indicative market reference. Desk-confirmed quote from PGR UAE.",
    h1: "Gold Bars Catalog",
    priority: "0.85",
    changefreq: "weekly"
  },
  {
    path: "/silver-bars",
    title: "Silver Bars Catalog | PGR UAE",
    desc: "Physical silver bars from 1oz to 1kg. Indicative market reference. Desk-confirmed quote from PGR UAE.",
    h1: "Silver Bars Catalog",
    priority: "0.85",
    changefreq: "weekly"
  },
  {
    path: "/bullion-coins",
    title: "Mint Bars & Bullion Coins | PGR UAE",
    desc: "Mint bars and bullion coins via PGR UAE desk. Desk-confirmed quote after compliance review.",
    h1: "Mint Bars & Bullion Coins",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/custom-inquiry",
    title: "Custom Bullion Inquiry | PGR UAE",
    desc: "Custom bullion sizing and bulk sourcing. Desk-confirmed quote from PGR UAE desk.",
    h1: "Custom Bullion Inquiry",
    priority: "0.75",
    changefreq: "monthly"
  },
  {
    path: "/allocated-storage",
    title: "Allocated Bullion Storage | PGR UAE",
    desc: "Allocated physical bullion storage inquiry. Subject to compliance review. Not a financial wallet.",
    h1: "Allocated Bullion Storage",
    priority: "0.65",
    changefreq: "monthly"
  },
  {
    path: "/sell-back",
    title: "Sell-Back Desk Inquiry | PGR UAE",
    desc: "Desk inquiry for physical gold and silver sell-back. Subject to compliance review and desk-confirmed quote.",
    h1: "Sell-Back Desk Inquiry",
    priority: "0.65",
    changefreq: "weekly"
  },
  {
    path: "/faq",
    title: "FAQ | PGR UAE Bullion Desk",
    desc: "Frequently asked questions about physical gold and silver bullion quotes, desk-confirmed pricing, and compliance.",
    h1: "Frequently Asked Questions",
    priority: "0.6",
    changefreq: "monthly"
  },
  {
    path: "/contact",
    title: "Contact PGR UAE | Bullion Quote Desk",
    desc: "Contact the PGR UAE bullion quote desk in Dubai. WhatsApp, phone, and email for firm quote requests.",
    h1: "Contact PGR UAE",
    priority: "0.7",
    changefreq: "monthly"
  },
  {
    path: "/compliance",
    title: "Compliance & KYC | PGR UAE",
    desc: "AML/KYC policies and pricing disclaimer for PGR UAE bullion desk transactions.",
    h1: "Compliance & KYC",
    priority: "0.6",
    changefreq: "monthly"
  },
  {
    path: "/terms",
    title: "Terms & Conditions | PGR UAE",
    desc: "Terms and conditions for PGR UAE precious metals desk services.",
    h1: "Terms & Conditions",
    priority: "0.4",
    changefreq: "yearly"
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | PGR UAE",
    desc: "Privacy policy for PGR UAE client data and KYC documentation.",
    h1: "Privacy Policy",
    priority: "0.4",
    changefreq: "yearly"
  },
  {
    path: "/kyc-aml-policy",
    title: "KYC & AML Policy | PGR UAE",
    desc: "Know Your Customer and anti-money laundering policy for PGR UAE.",
    h1: "KYC & AML Policy",
    priority: "0.5",
    changefreq: "yearly"
  },
  {
    path: "/pricing-disclaimer",
    title: "Pricing Disclaimer | PGR UAE",
    desc: "Indicative market reference only. Desk-confirmed quote from PGR UAE before settlement.",
    h1: "Pricing Disclaimer",
    priority: "0.5",
    changefreq: "yearly"
  },
  {
    path: "/refund-cancellation-policy",
    title: "Refund & Cancellation Policy | PGR UAE",
    desc: "Refund and cancellation policy for PGR UAE bullion desk orders.",
    h1: "Refund & Cancellation Policy",
    priority: "0.4",
    changefreq: "yearly"
  },
  {
    path: "/delivery-collection-policy",
    title: "Delivery & Collection Policy | PGR UAE",
    desc: "Delivery and collection arrangements for physical bullion. Subject to desk confirmation and compliance.",
    h1: "Delivery & Collection Policy",
    priority: "0.4",
    changefreq: "yearly"
  },
  {
    path: "/risk-disclosure",
    title: "Risk Disclosure | PGR UAE",
    desc: "Risk disclosure for physical precious metals. PGR UAE does not provide financial or investment advice.",
    h1: "Risk Disclosure",
    priority: "0.4",
    changefreq: "yearly"
  },
  {
    path: "/buy-gold-bars-dubai",
    title: "Buy Gold Bars in Dubai | PGR UAE Bullion Desk",
    desc: "Request physical gold bars in Dubai from PGR UAE. Indicative market reference. Desk-confirmed quote.",
    h1: "Buy Gold Bars in Dubai",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/buy-silver-bars-dubai",
    title: "Buy Silver Bars in Dubai | PGR UAE",
    desc: "Request physical silver bars in Dubai including SAM and PALM. Indicative market reference. Desk-confirmed quote.",
    h1: "Buy Silver Bars in Dubai",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/gold-rate-dubai-today",
    title: "Gold Rate Dubai Today | Indicative Reference | PGR UAE",
    desc: "Indicative gold market reference for Dubai. Subject to market movement. Request a desk-confirmed quote from PGR UAE.",
    h1: "Gold Rate Dubai Today",
    priority: "0.75",
    changefreq: "daily"
  },
  {
    path: "/silver-rate-dubai-today",
    title: "Silver Rate Dubai Today | Indicative Reference | PGR UAE",
    desc: "Indicative silver market reference for Dubai. Subject to market movement. Request a desk-confirmed quote from PGR UAE.",
    h1: "Silver Rate Dubai Today",
    priority: "0.75",
    changefreq: "daily"
  },
  {
    path: "/sell-gold-dubai",
    title: "Sell Gold in Dubai | PGR UAE Desk",
    desc: "Sell-back desk inquiry for physical gold in Dubai. Subject to compliance review and desk-confirmed quote.",
    h1: "Sell Gold in Dubai",
    priority: "0.7",
    changefreq: "weekly"
  },
  {
    path: "/bullion-desk-dubai",
    title: "Bullion Desk Dubai | PGR UAE",
    desc: "Dubai bullion quote desk for physical gold and silver. Indicative market reference only.",
    h1: "Bullion Desk Dubai",
    priority: "0.7",
    changefreq: "weekly"
  },
  {
    path: "/allocated-storage-dubai",
    title: "Allocated Storage Dubai | PGR UAE",
    desc: "Allocated physical bullion storage inquiry in Dubai. Subject to compliance review.",
    h1: "Allocated Storage Dubai",
    priority: "0.65",
    changefreq: "monthly"
  },
  {
    path: "/24k-gold-bars-uae",
    title: "24K Gold Bars UAE | PGR UAE",
    desc: "999.9 fine physical gold bars in the UAE. Indicative market reference. Desk-confirmed quote from PGR UAE.",
    h1: "24K Gold Bars UAE",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/silver-bars-iraq",
    title: "Silver Bars for Iraq | SAM & PALM from Dubai | PGR UAE",
    desc: "Request desk-confirmed silver bar quotes for Iraq — SAM and PALM 500g and 1kg from PGR UAE Dubai.",
    h1: "Silver Bars for Iraq",
    priority: "0.85",
    changefreq: "weekly"
  },
  {
    path: "/sam-palm-silver-iraq",
    title: "SAM & PALM Silver Iraq | PGR UAE Dubai Desk",
    desc: "SAM and PALM 999.9 silver bars for Iraqi customers. Desk-confirmed quote from Dubai.",
    h1: "SAM & PALM Silver for Iraq",
    priority: "0.85",
    changefreq: "weekly"
  },
  {
    path: "/gold-bars-baghdad",
    title: "Gold Bars Baghdad | Dubai to Iraq | PGR UAE",
    desc: "Physical gold bar quotes for Baghdad and Iraq from PGR UAE Dubai desk.",
    h1: "Gold Bars for Baghdad",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/silver-bars-erbil",
    title: "Silver Bars Erbil | SAM & PALM from Dubai | PGR UAE",
    desc: "Silver bar quotes for Erbil and Kurdistan from PGR UAE Dubai.",
    h1: "Silver Bars for Erbil",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/bullion-desk-iraq",
    title: "Bullion Desk Iraq | Dubai to Iraq Corridor | PGR UAE",
    desc: "PGR UAE bullion quote desk for Iraqi customers. Physical gold and silver from Dubai.",
    h1: "Bullion Desk for Iraq",
    priority: "0.8",
    changefreq: "weekly"
  }
];

export const STATIC_ROUTE_MAP = Object.fromEntries(
  PUBLIC_PAGES.map((p) => [
    p.path,
    p.path === "/" ? "/static-seo/index.html" : `/static-seo${p.path}.html`
  ])
);

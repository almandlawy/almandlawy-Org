/** Shared SEO route data for build-time generators (sitemap + static HTML). */
export const SITE_ORIGIN = "https://www.pgruae.com";
export const OG_IMAGE = `${SITE_ORIGIN}/images/products/01-bullion-collection.webp`;

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

export const PUBLIC_PAGES = [
  {
    path: "/",
    title: "PGR UAE | Firm Quote Bullion Desk Dubai",
    desc: "PGR UAE is a Dubai firm-quote bullion desk for accredited gold and silver bars. Indicative market reference. Final quote confirmed by PGR UAE desk.",
    h1: "PGR UAE Firm Quote Bullion Desk",
    priority: "1.0",
    changefreq: "daily"
  },
  {
    path: "/request-quote",
    title: "Request Firm Quote | PGR UAE",
    desc: "Request a firm quote from the PGR UAE desk. Subject to market movement and compliance review.",
    h1: "Request Firm Quote",
    priority: "0.9",
    changefreq: "weekly"
  },
  {
    path: "/gold-bars",
    title: "Gold Bars Catalog | PGR UAE",
    desc: "Accredited gold bars from 1g to 1kg in Dubai. Indicative market reference. Firm quote confirmed by PGR UAE desk.",
    h1: "Gold Bars Catalog",
    priority: "0.85",
    changefreq: "weekly"
  },
  {
    path: "/silver-bars",
    title: "Silver Bars Catalog | PGR UAE",
    desc: "Accredited silver bars from 1oz to 1kg in Dubai. Indicative market reference. Firm quote confirmed by PGR UAE desk.",
    h1: "Silver Bars Catalog",
    priority: "0.85",
    changefreq: "weekly"
  },
  {
    path: "/bullion-coins",
    title: "Mint Bars & Bullion Coins | PGR UAE",
    desc: "Mint bars and bullion coins via PGR UAE desk. Firm quote after compliance review.",
    h1: "Mint Bars & Bullion Coins",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/custom-inquiry",
    title: "Custom Bullion Inquiry | PGR UAE",
    desc: "Custom bullion sizing and bulk sourcing. Firm quote confirmed by PGR UAE desk.",
    h1: "Custom Bullion Inquiry",
    priority: "0.75",
    changefreq: "monthly"
  },
  {
    path: "/buy-gold-bars-dubai",
    title: "Buy Gold Bars in Dubai | PGR UAE Bullion Desk",
    desc: "Request accredited gold bars in Dubai from PGR UAE. Indicative market reference. Firm quote confirmed by desk.",
    h1: "Buy Gold Bars in Dubai",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/buy-silver-bars-dubai",
    title: "Buy Silver Bars in Dubai | PGR UAE",
    desc: "Request accredited silver bars in Dubai. Indicative pricing. Firm quote confirmed by PGR UAE desk.",
    h1: "Buy Silver Bars in Dubai",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/gold-rate-dubai-today",
    title: "Gold Rate Dubai Today | Indicative Reference | PGR UAE",
    desc: "Indicative gold market reference for Dubai. Subject to market movement. Request a firm quote from PGR UAE.",
    h1: "Gold Rate Dubai Today",
    priority: "0.75",
    changefreq: "daily"
  },
  {
    path: "/silver-rate-dubai-today",
    title: "Silver Rate Dubai Today | Indicative Reference | PGR UAE",
    desc: "Indicative silver market reference for Dubai. Subject to market movement. Request a firm quote from PGR UAE.",
    h1: "Silver Rate Dubai Today",
    priority: "0.75",
    changefreq: "daily"
  },
  {
    path: "/sell-gold-dubai",
    title: "Sell Gold in Dubai | PGR UAE Desk",
    desc: "Sell-back and desk inquiry for physical gold in Dubai. Subject to compliance review and firm quote.",
    h1: "Sell Gold in Dubai",
    priority: "0.7",
    changefreq: "weekly"
  },
  {
    path: "/bullion-desk-dubai",
    title: "Bullion Desk Dubai | PGR UAE",
    desc: "Dubai firm-quote bullion desk for physical gold and silver. Indicative market reference only.",
    h1: "Bullion Desk Dubai",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    path: "/allocated-storage-dubai",
    title: "Allocated Storage Dubai | PGR UAE",
    desc: "Allocated bullion storage inquiry in Dubai. Subject to compliance review.",
    h1: "Allocated Storage Dubai",
    priority: "0.65",
    changefreq: "monthly"
  },
  {
    path: "/24k-gold-bars-uae",
    title: "24K Gold Bars UAE | PGR UAE",
    desc: "999.9 fine gold bars in the UAE. Indicative market reference. Firm quote confirmed by PGR UAE desk.",
    h1: "24K Gold Bars UAE",
    priority: "0.75",
    changefreq: "weekly"
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
    desc: "Indicative market reference only. Subject to market movement. Firm quote confirmed by PGR UAE desk.",
    h1: "Pricing Disclaimer",
    priority: "0.5",
    changefreq: "yearly"
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
  }
];

export const STATIC_ROUTE_MAP = Object.fromEntries(
  PUBLIC_PAGES.map((p) => [
    p.path,
    p.path === "/" ? "/static-seo/index.html" : `/static-seo${p.path}.html`
  ])
);

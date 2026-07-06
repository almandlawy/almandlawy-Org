/** Homepage JSON-LD schemas for Google rich results (FAQ + Video + Products). */

export const SITE_ORIGIN = "https://www.pgruae.com";
export const OG_IMAGE = `${SITE_ORIGIN}/images/products/01-bullion-collection.webp`;
export const VIDEO_UPLOAD_DATE = "2026-07-04T21:45:19+04:00";

export const OFFICIAL_SAME_AS = [
  "https://www.linkedin.com/company/pgr-uae",
  "https://twitter.com/pgruae"
];

export const FAQ_SCHEMA_EN = [
  {
    q: "Can I pay before receiving a firm quote?",
    a: "No. Customers cannot pay before a firm quote is accepted. The flow is: select product, request firm quote, desk review, quote acceptance, then payment arrangement."
  },
  {
    q: "Are prices on the website final?",
    a: "No. Displayed prices are indicative market references only, subject to market movement. Final quote confirmed by PGR UAE desk before settlement."
  },
  {
    q: "What is required before payment?",
    a: "KYC/AML review may be required before payment and dispatch. Subject to compliance review."
  },
  {
    q: "How do I request a firm quote?",
    a: "Use Request Firm Quote on any product, the request-quote page, or WhatsApp Quote Desk."
  },
  {
    q: "How many products are in the catalog?",
    a: "The public catalog shows exactly 10 approved PGR UAE products across gold, silver, mint, and custom inquiry categories."
  }
];

export const CATALOG_PRODUCTS = [
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

export function buildHomepageSchemaGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": `${SITE_ORIGIN}/#organization`,
        name: "PGR UAE Precious Metals Trading",
        alternateName: "PGR UAE",
        url: `${SITE_ORIGIN}/`,
        image: OG_IMAGE,
        logo: OG_IMAGE,
        description:
          "Dubai precious metals and bullion quote desk serving Iraq and UAE. Physical gold and silver. Indicative market reference. Final quote confirmed by PGR UAE desk.",
        telephone: "+971559688837",
        email: "desk@pgruae.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Almas Tower, Dubai Marina",
          addressLocality: "Dubai",
          addressRegion: "Dubai",
          addressCountry: "AE"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 25.0792,
          longitude: 55.1415
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00"
          }
        ],
        areaServed: [
          { "@type": "Country", name: "Iraq" },
          { "@type": "Country", name: "United Arab Emirates" }
        ],
        sameAs: OFFICIAL_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: SITE_ORIGIN,
        name: "PGR UAE",
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
        inLanguage: ["en", "ar"]
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_ORIGIN}/#faq`,
        mainEntity: FAQ_SCHEMA_EN.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a }
        }))
      },
      {
        "@type": "VideoObject",
        "@id": `${SITE_ORIGIN}/#hero-video`,
        name: "PGR UAE Bullion Collection",
        description:
          "PGR UAE bullion collection showcase — gold bars, silver bars, mint bars and bullion coins.",
        thumbnailUrl: `${SITE_ORIGIN}/videos/pgr-bullion-collection-poster.webp`,
        contentUrl: `${SITE_ORIGIN}/videos/pgr-bullion-collection.mp4`,
        embedUrl: SITE_ORIGIN,
        uploadDate: VIDEO_UPLOAD_DATE,
        duration: "PT10S",
        publisher: { "@id": `${SITE_ORIGIN}/#organization` }
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_ORIGIN}/#catalog`,
        name: "PGR UAE Bullion Product Catalog",
        numberOfItems: CATALOG_PRODUCTS.length,
        itemListElement: CATALOG_PRODUCTS.map((name, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name
        }))
      }
    ]
  };
}

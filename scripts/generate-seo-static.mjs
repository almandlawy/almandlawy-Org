#!/usr/bin/env node
/**
 * Generates static SEO HTML snapshots for public routes (crawler-friendly fallback).
 * Written to public/static-seo/ — served as static files, not SPA routes.
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "public", "static-seo");
const ORIGIN = "https://www.pgruae.com";

const PRODUCTS = [
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

const PAGES = [
  { path: "/", title: "PGR UAE | Firm Quote Bullion Desk Dubai", h1: "PGR UAE Firm Quote Bullion Desk" },
  { path: "/request-quote", title: "Request Firm Quote | PGR UAE", h1: "Request Firm Quote" },
  { path: "/gold-bars", title: "Gold Bars | PGR UAE", h1: "Gold Bars Catalog" },
  { path: "/silver-bars", title: "Silver Bars | PGR UAE", h1: "Silver Bars Catalog" },
  { path: "/bullion-coins", title: "Mint Bars & Bullion Coins | PGR UAE", h1: "Mint Bars & Bullion Coins" },
  { path: "/custom-inquiry", title: "Custom Bullion Inquiry | PGR UAE", h1: "Custom Bullion Inquiry" }
];

const DESC =
  "Indicative market reference only. Firm quote confirmed by PGR UAE desk. Subject to market movement and compliance review.";

function pageHtml({ path: p, title, h1 }) {
  const url = p === "/" ? ORIGIN + "/" : ORIGIN + p;
  const productList =
    p === "/"
      ? `<ul>${PRODUCTS.map((n) => `<li>${n}</li>`).join("")}</ul>`
      : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${DESC}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${DESC}" />
  <meta property="og:url" content="${url}" />
  <meta name="robots" content="index, follow" />
</head>
<body>
  <main>
    <h1>${h1}</h1>
    <p>${DESC}</p>
    ${productList}
    <p><a href="${ORIGIN}/">Open PGR UAE application</a></p>
  </main>
</body>
</html>`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const page of PAGES) {
  const fileName = page.path === "/" ? "index.html" : page.path.slice(1) + ".html";
  const outPath = path.join(OUT_DIR, fileName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pageHtml(page), "utf-8");
}

console.log(`Generated ${PAGES.length} static SEO pages in public/static-seo/`);

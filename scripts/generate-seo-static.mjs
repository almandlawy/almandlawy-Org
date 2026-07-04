#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { PUBLIC_PAGES, PRODUCTS, SITE_ORIGIN, OG_IMAGE } from "./seo-data.mjs";

const OUT_DIR = path.join(process.cwd(), "public", "static-seo");

function faqJsonLd(faqItems) {
  if (!faqItems?.length) return "";
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a }
    }))
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function pageHtml(page) {
  const url = page.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${page.path}`;
  const productList =
    page.path === "/"
      ? `<h2>Product Catalog</h2><ul>${PRODUCTS.map((n) => `<li>${n}</li>`).join("")}</ul>`
      : "";
  const faqBlock =
    page.faq?.length
      ? `<h2>FAQ</h2>${page.faq.map((f) => `<h3>${f.q}</h3><p>${f.a}</p>`).join("")}`
      : "";
  const links = PUBLIC_PAGES.filter((p) => p.path !== page.path)
    .slice(0, 8)
    .map((p) => {
      const href = p.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${p.path}`;
      return `<li><a href="${href}">${p.h1}</a></li>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.title}</title>
  <meta name="description" content="${page.desc}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${page.title}" />
  <meta property="og:description" content="${page.desc}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${page.title}" />
  <meta name="twitter:description" content="${page.desc}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta name="robots" content="index, follow" />
  ${faqJsonLd(page.faq)}
</head>
<body>
  <main>
    <h1>${page.h1}</h1>
    <p>${page.desc}</p>
    ${productList}
    ${faqBlock}
    <p><a href="${SITE_ORIGIN}/">Open PGR UAE application</a> · <a href="${SITE_ORIGIN}/request-quote">Request firm quote</a></p>
    <nav aria-label="Related pages"><ul>${links}</ul></nav>
  </main>
</body>
</html>`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const page of PUBLIC_PAGES) {
  const fileName = page.path === "/" ? "index.html" : `${page.path.slice(1)}.html`;
  const outPath = path.join(OUT_DIR, fileName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pageHtml(page), "utf-8");
}

console.log(`Generated ${PUBLIC_PAGES.length} static SEO pages in public/static-seo/`);

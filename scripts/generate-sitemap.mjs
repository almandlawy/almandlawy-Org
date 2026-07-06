#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { PUBLIC_PAGES, SITE_ORIGIN } from "./seo-data.mjs";

const today = new Date().toISOString().slice(0, 10);
const urls = PUBLIC_PAGES.map(
  (p) => `  <url>
    <loc>${p.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${p.path}`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outPath = path.join(process.cwd(), "public", "sitemap.xml");
fs.writeFileSync(outPath, xml, "utf-8");
console.log(`Generated sitemap with ${PUBLIC_PAGES.length} URLs → public/sitemap.xml`);

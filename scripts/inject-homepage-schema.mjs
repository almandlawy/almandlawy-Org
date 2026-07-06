#!/usr/bin/env node
/**
 * Injects homepage JSON-LD @graph into index.html and static-seo/index.html.
 */
import fs from "fs";
import path from "path";
import { buildHomepageSchemaGraph } from "./seo-schema.mjs";

const schemaScript = `<script type="application/ld+json" id="pgr-homepage-schema">\n${JSON.stringify(buildHomepageSchemaGraph(), null, 2)}\n</script>`;

function injectSchema(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, "utf-8");

  // Remove legacy separate JSON-LD blocks and prior injected graph
  html = html.replace(/\s*<!-- JSON-LD baseline[\s\S]*?<\/script>\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, "");
  html = html.replace(/\s*<script type="application\/ld\+json" id="pgr-homepage-schema">[\s\S]*?<\/script>/, "");

  html = html.replace("</head>", `\n    ${schemaScript}\n  </head>`);
  fs.writeFileSync(filePath, html, "utf-8");
  return true;
}

const rootIndex = path.join(process.cwd(), "index.html");
const staticIndex = path.join(process.cwd(), "public", "static-seo", "index.html");

injectSchema(rootIndex);
injectSchema(staticIndex);

console.log("Injected homepage JSON-LD graph (FAQ + Video + ItemList) into index.html");

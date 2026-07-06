#!/usr/bin/env node
/**
 * Injects optional Google Search Console verification meta into dist/index.html.
 */
import fs from "fs";
import path from "path";

const token = process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION;
const indexPath = path.join(process.cwd(), "dist", "index.html");

if (!token) {
  console.log("Skip GSC verification inject (GOOGLE_SITE_VERIFICATION not set)");
  process.exit(0);
}

if (!fs.existsSync(indexPath)) {
  console.warn("dist/index.html not found — skip verification inject");
  process.exit(0);
}

let html = fs.readFileSync(indexPath, "utf-8");
const tag = `<meta name="google-site-verification" content="${token}" />`;

if (html.includes("google-site-verification")) {
  html = html.replace(/<meta name="google-site-verification"[^>]*>/, tag);
} else {
  html = html.replace("</head>", `    ${tag}\n  </head>`);
}

fs.writeFileSync(indexPath, html, "utf-8");
console.log("Injected Google Search Console verification meta tag");

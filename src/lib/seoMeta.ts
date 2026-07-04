/**
 * Client-side SEO helpers — meta tags, hreflang, JSON-LD injection.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { OG_IMAGE, SITE_ORIGIN, canonicalUrl, shouldNoindex } from "./seoRoutes";

function upsertMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector(selector);
  if (!el) {
    const isProperty = selector.includes("property=");
    el = document.createElement("meta");
    if (isProperty) {
      el.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] || "");
    } else {
      el.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applyPageSeo(opts: {
  path: string;
  title: string;
  description: string;
  lang: "en" | "ar";
}) {
  const { path, title, description, lang } = opts;
  const url = canonicalUrl(path);
  const noindex = shouldNoindex(path);

  document.title = title;
  document.documentElement.lang = lang;

  upsertMeta('meta[name="description"]', "content", description);
  upsertMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");
  upsertMeta('meta[property="og:type"]', "content", "website");
  upsertMeta('meta[property="og:title"]', "content", title);
  upsertMeta('meta[property="og:description"]', "content", description);
  upsertMeta('meta[property="og:url"]', "content", url);
  upsertMeta('meta[property="og:image"]', "content", OG_IMAGE);
  upsertMeta('meta[property="og:site_name"]', "content", "PGR UAE");
  upsertMeta('meta[name="twitter:card"]', "content", "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', "content", title);
  upsertMeta('meta[name="twitter:description"]', "content", description);
  upsertMeta('meta[name="twitter:image"]', "content", OG_IMAGE);

  upsertLink("canonical", url);
  upsertLink("alternate", url, "x-default");
  upsertLink("alternate", `${url}${url.includes("?") ? "&" : "?"}lang=en`, "en");
  upsertLink("alternate", `${url}${url.includes("?") ? "&" : "?"}lang=ar`, "ar");
}

export function injectJsonLd(id: string, data: object) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "JewelryStore"],
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "PGR UAE Precious Metals Trading",
    alternateName: "PGR UAE",
    url: SITE_ORIGIN,
    image: OG_IMAGE,
    description:
      "Dubai firm-quote bullion desk for physical gold and silver. Indicative market reference. Final quote confirmed by PGR UAE desk.",
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
    areaServed: { "@type": "Country", name: "United Arab Emirates" }
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: SITE_ORIGIN,
    name: "PGR UAE",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    inLanguage: ["en", "ar"]
  };
}

export function buildFaqSchema(
  items: { qEn: string; qAr: string; aEn: string; aAr: string }[],
  lang: "en" | "ar"
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: lang === "ar" ? item.qAr : item.qEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: lang === "ar" ? item.aAr : item.aEn
      }
    }))
  };
}

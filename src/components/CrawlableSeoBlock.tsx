/**
 * Semantic crawlable product list for SEO — real HTML text, not image-only.
 * Visually hidden but available to crawlers and screen readers.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PRODUCTS } from "../data";
import { resolvePublicCatalog } from "../lib/productCatalog";

interface CrawlableSeoBlockProps {
  currentLang: "en" | "ar";
}

export default function CrawlableSeoBlock({ currentLang }: CrawlableSeoBlockProps) {
  const isAr = currentLang === "ar";
  const products = resolvePublicCatalog(PRODUCTS);

  return (
    <section
      aria-label={isAr ? "فهرس منتجات السبائك" : "Bullion product index"}
      className="sr-only"
    >
      <h2>{isAr ? "كتالوج سبائك PGR UAE" : "PGR UAE Bullion Product Catalog"}</h2>
      <p>
        {isAr
          ? "ديوان PGR UAE لعروض الأسعار المعتمدة من دبي إلى العراق. مرجع سوقي استرشادي. خاضع لحركة السوق ومراجعة الامتثال."
          : "PGR UAE bullion quote desk from Dubai to Iraq. Indicative market reference. Subject to market movement and compliance review."}
      </p>
      <p>
        <a href="/iraq-bullion-quote">
          {isAr ? "عروض أسعار سبائك الذهب والفضة للعراق" : "Gold & Silver Bullion Quotes for Iraq"}
        </a>
      </p>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <h3>{isAr ? p.name_ar : p.name_en}</h3>
            <p>
              {isAr ? "المعدن:" : "Metal:"} {p.technical_specs.metal} · {isAr ? "الوزن:" : "Weight:"}{" "}
              {p.weight_label} · {isAr ? "النقاوة:" : "Purity:"} {p.purity}
            </p>
            <p>{isAr ? p.description_ar : p.description_en}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

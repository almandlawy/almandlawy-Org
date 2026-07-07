/**
 * Minimal crawlable index — avoids duplicating full product catalog (see ProductShowroom).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface CrawlableSeoBlockProps {
  currentLang: "en" | "ar";
}

export default function CrawlableSeoBlock({ currentLang }: CrawlableSeoBlockProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      aria-label={isAr ? "فهرس الموقع" : "Site index"}
      className="sr-only"
    >
      <h2>{isAr ? "مكتب PGR UAE لعروض السبائك" : "PGR UAE Bullion Quote Desk"}</h2>
      <p>
        {isAr
          ? "اطلب عروض أسعار مؤكدة لسبائك الذهب والفضة من دبي إلى العراق."
          : "Request desk-confirmed quotes for physical gold and silver bullion from Dubai to Iraq."}
      </p>
      <p>
        <a href="/gold-bars">{isAr ? "كتالوج سبائك الذهب" : "Gold bars catalog"}</a>
        {" · "}
        <a href="/silver-bars">{isAr ? "كتالوج سبائك الفضة" : "Silver bars catalog"}</a>
        {" · "}
        <a href="/iraq-bullion-quote">{isAr ? "عروض العراق" : "Iraq bullion quotes"}</a>
        {" · "}
        <a href="/faq">{isAr ? "الأسئلة الشائعة" : "FAQ"}</a>
      </p>
    </section>
  );
}

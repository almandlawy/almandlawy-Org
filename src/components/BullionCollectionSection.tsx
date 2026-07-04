/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText } from "lucide-react";
import { productPosterUrl } from "../lib/productImages";

interface BullionCollectionSectionProps {
  currentLang: "en" | "ar";
  onOpenQuote: () => void;
  onScrollToCatalog: () => void;
}

export default function BullionCollectionSection({
  currentLang,
  onOpenQuote,
  onScrollToCatalog
}: BullionCollectionSectionProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      id="bullion-collection"
      className="py-20 px-4 md:px-8 bg-brand-section border-b border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] max-h-[560px] w-full rounded border border-soft-border bg-brand-bg p-6 flex items-center justify-center">
          <img
            src={productPosterUrl("01-bullion-collection.webp")}
            alt={isAr ? "مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection"}
            className="w-full h-full object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
            {isAr ? "المجموعة الرئيسية" : "Flagship Collection"}
          </p>
          <h2 className="text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection"}
          </h2>
          <p className="text-sm text-text-secondary font-sans leading-relaxed">
            {isAr
              ? "عشرة منتجات معتمدة فقط — سبائك ذهب وفضة ومسكوكات وطلبات مخصصة. مرجع سوقي استرشادي. عرض السعر النهائي يؤكده ديوان PGR UAE قبل التسوية."
              : "Ten approved products only — gold bars, silver bars, mint products, and custom inquiry. Indicative market reference. Final quote confirmed by PGR UAE desk before settlement."}
          </p>
          <ul className="text-xs font-sans text-text-secondary space-y-2">
            <li>{isAr ? "• سبائك ذهب ١ج – ١كج" : "• Gold bars 1g – 1kg"}</li>
            <li>{isAr ? "• سبائك فضة ١أونصة – ١كج" : "• Silver bars 1oz – 1kg"}</li>
            <li>{isAr ? "• مسكوكات وعملات سبائك" : "• Mint bars & bullion coins"}</li>
            <li>{isAr ? "• طلبات مخصصة بالجملة" : "• Custom sizing & bulk sourcing"}</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onScrollToCatalog}
              className="px-6 py-3 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded"
            >
              {isAr ? "عرض الكتالوج" : "View Showroom"}
            </button>
            <button
              type="button"
              onClick={onOpenQuote}
              className="px-6 py-3 border border-gold-base text-text-charcoal hover:bg-gold-base/10 font-mono text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
            >
              <FileText size={14} />
              {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

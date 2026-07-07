/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Star } from "lucide-react";
import { LiveMarketRates, Product } from "../types";
import { PRODUCTS } from "../data";
import {
  calculateIndicativePrice,
  canShowIndicativePrice,
  formatIndicativePrice,
  getPriceStatusLabel,
  IRAQ_SILVER_OFFER_IDS,
} from "../lib/indicativePricing";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";
import DeskProductCard from "./DeskProductCard";
import { getProductImage } from "../lib/productImages";

interface IraqSilverOffersProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onSelectProduct: (product: Product) => void;
  onOpenQuote: (product?: Product) => void;
}

const RANK_LABELS: Record<number, { en: string; ar: string }> = {
  1: { en: "Most Popular in Iraq", ar: "الأكثر طلباً في العراق" },
  2: { en: "Best Value per Gram", ar: "أفضل قيمة للجرام" },
  3: { en: "Entry Weight", ar: "وزن البداية" },
};

export default function IraqSilverOffers({
  currentLang,
  rates,
  selectedCurrency,
  onSelectProduct,
  onOpenQuote,
}: IraqSilverOffersProps) {
  const isAr = currentLang === "ar";

  const offerProducts = IRAQ_SILVER_OFFER_IDS.map((id) =>
    PRODUCTS.find((p) => p.id === id)
  ).filter(Boolean) as Product[];

  const getWhatsAppLink = (product: Product) => {
    const pName = isAr ? product.name_ar : product.name_en;
    const msg = isAr
      ? `مرحباً، أريد عرض سعر لسبيكة فضة ${pName} للتوصيل للعراق`
      : `Hello, I would like a firm quote for ${pName} with Iraq delivery`;
    return buildWhatsAppLink(msg);
  };

  const priceStatus = getPriceStatusLabel(rates?.source_status, currentLang);

  return (
    <section
      className="py-20 px-4 md:px-8 bg-gradient-to-b from-brand-section to-brand-bg border-t border-soft-border/60"
      id="iraq-silver-offers"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-gold-dark font-mono uppercase text-xs tracking-[0.3em] font-bold flex items-center justify-center gap-2">
            <Star size={12} className="text-gold-base" />
            {isAr ? "عروض الفضة للعراق" : "Iraq Silver Offers"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-text-charcoal font-medium">
            {isAr
              ? "سبائك PALM و SAM — الأكثر مبيعاً في العراق"
              : "PALM & SAM Silver — Iraq's Bestsellers"}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {isAr
              ? "أسعار استرشادية واقعية مبنية على سوق دبي الحالي مع علاوات المصافي الإماراتية. SAM ٥٠٠ جرام وPALM ١ كيلو الأكثر طلباً لتوصيل بغداد وأربيل والبصرة."
              : "Realistic indicative prices based on current Dubai bullion market rates with UAE refinery premiums. SAM 500g and PALM 1kg are the top-requested weights for Baghdad, Erbil, and Basra delivery."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offerProducts.map((product, index) => {
            const indicativePrice = calculateIndicativePrice(
              product,
              rates,
              selectedCurrency
            );
            const showPrice = canShowIndicativePrice(rates?.source_status) && indicativePrice;
            const rank = product.iraq_offer_rank || 99;
            const rankLabel = RANK_LABELS[rank];

            const aedPrice =
              selectedCurrency !== "AED"
                ? calculateIndicativePrice(product, rates, "AED")
                : indicativePrice;
            const iqdPrice =
              selectedCurrency !== "IQD"
                ? calculateIndicativePrice(product, rates, "IQD")
                : indicativePrice;

            const priceBlock = showPrice ? (
              <div className="space-y-1">
                <p className="text-2xl font-mono font-bold text-text-charcoal">
                  {formatIndicativePrice(indicativePrice!, selectedCurrency, currentLang)}{" "}
                  <span className="text-sm text-gold-dark">{selectedCurrency}</span>
                </p>
                {selectedCurrency === "IQD" && aedPrice && (
                  <p className="text-xs font-mono text-text-secondary">
                    ≈ {formatIndicativePrice(aedPrice, "AED", currentLang)} AED
                  </p>
                )}
                {selectedCurrency === "AED" && iqdPrice && (
                  <p className="text-xs font-mono text-text-secondary">
                    ≈ {formatIndicativePrice(iqdPrice, "IQD", currentLang)} IQD
                  </p>
                )}
                {selectedCurrency === "USD" && (
                  <div className="text-xs font-mono text-text-secondary space-y-0.5">
                    {aedPrice && <p>≈ {formatIndicativePrice(aedPrice, "AED", currentLang)} AED</p>}
                    {iqdPrice && <p>≈ {formatIndicativePrice(iqdPrice, "IQD", currentLang)} IQD</p>}
                  </div>
                )}
                <p className="text-[10px] text-text-secondary/70 leading-normal">
                  {isAr
                    ? "سعر استرشادي — يؤكده المكتب قبل الطلب"
                    : "Indicative — desk confirms before order"}
                </p>
              </div>
            ) : (
              <p className="text-sm font-bold text-gold-dark">
                {isAr ? "طلب تسعير فوري" : "Request Quote"}
              </p>
            );

            return (
              <DeskProductCard
                key={product.id}
                product={product}
                isAr={isAr}
                imageSrc={getProductImage(product)}
                rankLabel={rankLabel}
                priceStatusLabel={priceStatus}
                priceBlock={priceBlock}
                whatsappHref={getWhatsAppLink(product)}
                onSelect={() => onSelectProduct(product)}
                onOpenQuote={() => onOpenQuote(product)}
                onWhatsAppClick={() => trackWhatsAppClick(`iraq_silver_${product.id}`)}
                index={index}
              />
            );
          })}
        </div>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => onOpenQuote()}
            className="px-8 py-3 border-2 border-gold-base text-gold-dark hover:bg-gold-base hover:text-text-charcoal font-mono text-[11px] font-bold uppercase tracking-widest rounded transition-all"
          >
            {isAr ? "طلب عرض سعر مخصص للعراق" : "Request Custom Iraq Quote"}
          </button>
        </div>
      </div>
    </section>
  );
}

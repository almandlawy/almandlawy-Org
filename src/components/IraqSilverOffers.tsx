/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, TrendingUp, Phone, FileText, Star } from "lucide-react";
import { LiveMarketRates, Product } from "../types";
import { PRODUCTS } from "../data";
import { getProductImage } from "../lib/productImages";
import {
  calculateIndicativePrice,
  canShowIndicativePrice,
  formatIndicativePrice,
  getPriceStatusLabel,
  IRAQ_SILVER_OFFER_IDS,
} from "../lib/indicativePricing";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";

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
          {offerProducts.map((product) => {
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

            return (
              <div
                key={product.id}
                className="relative bg-brand-card rounded-lg border-2 border-gold-base/30 shadow-md hover:shadow-xl hover:border-gold-base transition-all duration-300 overflow-hidden flex flex-col"
              >
                {rankLabel && (
                  <div className="absolute top-0 left-0 right-0 bg-gold-base text-text-charcoal text-center py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest z-10">
                    {isAr ? rankLabel.ar : rankLabel.en}
                  </div>
                )}

                <div
                  className="pt-10 pb-4 px-6 flex flex-col flex-1 cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <div className="h-40 flex items-center justify-center mb-4 bg-brand-section rounded border border-soft-border/40">
                    <img
                      src={getProductImage(product)}
                      alt={isAr ? product.name_ar : product.name_en}
                      className="h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-olive-accent shrink-0" />
                      <span className="text-[10px] font-mono text-gold-dark uppercase tracking-wider font-bold">
                        {product.brand || product.manufacturer}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif text-text-charcoal font-medium leading-snug">
                      {isAr ? product.name_ar : product.name_en}
                    </h3>

                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-text-secondary">
                      <span className="px-2 py-0.5 bg-brand-section rounded border border-soft-border/50">
                        {product.weight_label}
                      </span>
                      <span className="px-2 py-0.5 bg-brand-section rounded border border-soft-border/50">
                        {product.purity.split(" ")[0]}
                      </span>
                      <span className="px-2 py-0.5 bg-brand-section rounded border border-soft-border/50">
                        {isAr ? "الإمارات" : "UAE"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-soft-border/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-text-secondary font-mono uppercase">
                      <TrendingUp size={11} className="text-olive-accent" />
                      {getPriceStatusLabel(rates?.source_status, currentLang)}
                    </div>

                    {showPrice ? (
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
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gold-dark">
                        {isAr ? "طلب تسعير فوري" : "Request Quote"}
                      </p>
                    )}

                    <p className="text-[10px] text-text-secondary/70 leading-normal">
                      {isAr
                        ? "سعر استرشادي — يؤكده المكتب قبل الطلب"
                        : "Indicative — desk confirms before order"}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenQuote(product);
                    }}
                    className="w-full py-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileText size={12} />
                    {isAr ? "طلب عرض سعر" : "Request Quote"}
                  </button>
                  <a
                    href={getWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`iraq_silver_${product.id}`)}
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <Phone size={12} />
                    {isAr ? "واتساب" : "WhatsApp"}
                  </a>
                </div>
              </div>
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

/**
 * Luxury category cards — quote desk navigation, not e-commerce grid.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText, Phone } from "lucide-react";
import { productPosterUrl } from "../lib/productImages";
import { categoryWhatsAppLink, CategoryKey } from "../lib/categoryWhatsApp";
import { trackWhatsAppClick } from "../lib/gtag";
import { trackQuoteFormStart } from "../lib/gtag";

interface ProductCategoryCardsProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

interface CategoryCard {
  key: CategoryKey;
  path: string;
  image: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  weightsEn: string;
  weightsAr: string;
  quoteLabel?: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    key: "gold_bars",
    path: "/gold-bars",
    image: productPosterUrl("05-gold-bar-1kg.webp"),
    titleEn: "Gold Bars",
    titleAr: "سبائك الذهب",
    descEn: "Physical 999.9 fine gold bars for desk-confirmed quotes. Subject to refiner availability.",
    descAr: "سبائك ذهب مادية 999.9 لعروض أسعار مؤكدة. حسب توفر المصافي.",
    weightsEn: "1g · 2.5g · 5g · 10g · 20g · 50g · 100g · 1kg",
    weightsAr: "١ج · ٢.٥ج · ٥ج · ١٠ج · ٢٠ج · ٥٠ج · ١٠٠ج · ١كغ",
  },
  {
    key: "silver_bars",
    path: "/silver-bars",
    image: productPosterUrl("08-silver-bar-1kg.webp"),
    titleEn: "Silver Bars",
    titleAr: "سبائك الفضة",
    descEn: "SAM, PALM and accredited silver bars. Indicative reference only until desk confirmation.",
    descAr: "سبائك فضة SAM وPALM ومعتمدة. مرجع استرشادي حتى تأكيد المكتب.",
    weightsEn: "1oz · 50g · 100g · 500g · 1kg",
    weightsAr: "١ أونصة · ٥٠ج · ١٠٠ج · ٥٠٠ج · ١كغ",
  },
  {
    key: "bullion_coins",
    path: "/bullion-coins",
    image: productPosterUrl("09-mint-bars-coins.webp"),
    titleEn: "Bullion Coins",
    titleAr: "عملات السبائك",
    descEn: "Mint bars and sovereign bullion coins sourced through the Dubai desk.",
    descAr: "سبائك مصكوكة وعملات سيادية عبر مكتب دبي.",
    weightsEn: "Various mint formats",
    weightsAr: "أوزان مصكوكة متنوعة",
  },
  {
    key: "custom_inquiry",
    path: "/custom-inquiry",
    image: productPosterUrl("10-custom-bullion-inquiry.webp"),
    titleEn: "Custom Bullion Sourcing",
    titleAr: "توريد سبائك مخصص",
    descEn: "Bulk, bespoke weights and institutional sourcing. Coordinated with accredited refiners.",
    descAr: "أوزان خاصة وتوريد مؤسسي بالتنسيق مع مصافٍ معتمدة.",
    weightsEn: "Custom weights & volumes",
    weightsAr: "أوزان وحجم مخصص",
  },
  {
    key: "iraq_desk",
    path: "/iraq-bullion-quote",
    image: productPosterUrl("07-silver-bar-500g.webp"),
    titleEn: "Iraq Quote Desk",
    titleAr: "مكتب عروض العراق",
    descEn: "Dubai desk-confirmed quotes for Iraqi customers. Documentation and delivery arranged case by case.",
    descAr: "عروض مؤكدة من دبي للعملاء العراقيين. المستندات والتسليم حسب كل حالة.",
    weightsEn: "Gold & silver · Dubai → Iraq",
    weightsAr: "ذهب وفضة · دبي → العراق",
  },
  {
    key: "sell_back",
    path: "/sell-back",
    image: productPosterUrl("02-gold-bars-1g-5g-10g.webp"),
    titleEn: "Sell-Back Inquiry",
    titleAr: "استفسار إعادة البيع",
    descEn: "Desk inquiry for physical gold and silver sell-back. Subject to compliance review.",
    descAr: "استفسار إعادة شراء الذهب والفضة المادي. خاضع لمراجعة الامتثال.",
    weightsEn: "Physical bullion only",
    weightsAr: "سبائك مادية فقط",
  },
];

export default function ProductCategoryCards({ currentLang, onNavigate }: ProductCategoryCardsProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      id="categories"
      className="py-16 md:py-20 bg-brand-bg border-b border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        <header className="max-w-2xl space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-gold-dark font-bold">
            {isAr ? "فئات المكتب" : "Desk Categories"}
          </p>
          <h2 className="text-2xl md:text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "اختر فئة السبائك لطلب عرض سعر" : "Select a Bullion Category"}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {isAr
              ? "مكتب عروض أسعار — وليس متجراً. كل فئة تؤدي إلى صفحة مخصصة ونموذج طلب عرض سعر مؤكد."
              : "A quote desk — not a shop. Each category leads to a dedicated page and firm quote request."}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.key}
              className="group flex flex-col rounded-lg border border-soft-border bg-brand-card overflow-hidden hover:border-gold-base/60 transition-colors shadow-sm"
            >
              <div className="relative h-44 sm:h-48 bg-[#141816] overflow-hidden">
                <img
                  src={cat.image}
                  alt={isAr ? cat.titleAr : cat.titleEn}
                  className="h-full w-full object-cover object-center opacity-90 group-hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              <div className="flex flex-col flex-1 p-5 space-y-3">
                <h3 className="text-lg font-serif text-text-charcoal font-medium">
                  {isAr ? cat.titleAr : cat.titleEn}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed flex-1">
                  {isAr ? cat.descAr : cat.descEn}
                </p>
                <p className="text-[10px] font-mono text-gold-dark/90 uppercase tracking-wider">
                  {isAr ? cat.weightsAr : cat.weightsEn}
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      trackQuoteFormStart(`category_${cat.key}`);
                      onNavigate(`/request-quote?${new URLSearchParams({ name: isAr ? cat.titleAr : cat.titleEn }).toString()}`);
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText size={12} />
                    {isAr ? "طلب عرض سعر" : "Request Quote"}
                  </button>
                  <a
                    href={categoryWhatsAppLink(cat.key, currentLang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`category_${cat.key}`)}
                    className="w-full min-h-[44px] px-4 py-2.5 border border-soft-border hover:border-emerald-600/40 bg-brand-bg hover:bg-emerald-600/5 text-text-charcoal font-mono text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone size={12} className="text-emerald-700" />
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => onNavigate(cat.path)}
                    className="text-[10px] font-mono text-text-secondary hover:text-gold-dark transition-colors py-1"
                  >
                    {isAr ? `عرض صفحة ${cat.titleAr} ←` : `View ${cat.titleEn} page →`}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

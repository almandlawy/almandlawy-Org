/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Premium product showroom — exactly 10 PGR catalog products.
 */

import React from "react";
import { Phone, FileText, AlertCircle } from "lucide-react";
import { Product, LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import { dbService } from "../lib/supabase";
import { getProductImage } from "../lib/productImages";
import { resolvePublicCatalog } from "../lib/productCatalog";

interface CatalogProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onSelectProduct: (product: Product) => void;
  selectedCategoryFilter?: string;
  onOpenQuote?: () => void;
}

const CATEGORY_TABS = ["all", "gold_bars", "silver_bars", "mint_bars_coins", "custom_inquiry"] as const;

export default function Catalog({
  currentLang,
  rates,
  selectedCurrency,
  onSelectProduct,
  selectedCategoryFilter,
  onOpenQuote
}: CatalogProps) {
  const isAr = currentLang === "ar";
  const [products, setProducts] = React.useState<Product[]>(() => resolvePublicCatalog(PRODUCTS));
  const [selectedFilter, setSelectedFilter] = React.useState<string>(selectedCategoryFilter || "all");
  const [shippingNote, setShippingNote] = React.useState<string>("");

  React.useEffect(() => {
    const load = async () => {
      try {
        const [ship, sObj] = await Promise.all([
          fetch("/api/shipping").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          dbService.settings.get().catch(() => null)
        ]);
        if (ship?.shipping_enabled && ship?.public_shipping_note) {
          setShippingNote(ship.public_shipping_note);
        } else if (sObj?.shipping_settings?.shipping_enabled && sObj?.shipping_settings?.public_shipping_note) {
          setShippingNote(sObj.shipping_settings.public_shipping_note);
        }
      } catch (err) {
        console.error("Catalog shipping load failed:", err);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const list = await dbService.products.list("public");
        setProducts(list.length > 0 ? list : resolvePublicCatalog(PRODUCTS));
      } catch {
        setProducts(resolvePublicCatalog(PRODUCTS));
      }
    };
    fetchProducts();
  }, []);

  React.useEffect(() => {
    if (selectedCategoryFilter) setSelectedFilter(selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  const getFilterLabel = (id: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      all: { en: "All", ar: "الجميع" },
      gold_bars: { en: "Gold Bars", ar: "سبائك الذهب" },
      silver_bars: { en: "Silver Bars", ar: "سبائك الفضة" },
      mint_bars_coins: { en: "Mint Bars & Bullion Coins", ar: "السبائك المصكوكة وعملات السبائك" },
      custom_inquiry: { en: "Custom Inquiry", ar: "طلبات مخصصة" }
    };
    return isAr ? labels[id]?.ar || id : labels[id]?.en || id;
  };

  const getMetalLabel = (product: Product) => {
    const metal = product?.technical_specs?.metal;
    if (metal === "gold") return isAr ? "ذهب" : "Gold";
    if (metal === "silver") return isAr ? "فضة" : "Silver";
    if (product.category === "custom_inquiry") return isAr ? "مخصص" : "Custom";
    if (product.category === "mint_bars_coins") return isAr ? "ذهب / فضة" : "Gold / Silver";
    return isAr ? "معادن ثمينة" : "Precious Metals";
  };

  const getIndicativeWording = (product: Product) => {
    const hasLive =
      rates &&
      (rates.source_status === "live" || rates.source_status === "cached") &&
      product.price_mode !== "fixed";
    if (hasLive) {
      return isAr ? "مرجع سوقي استرشادي متوفر" : "Indicative market reference available";
    }
    return isAr ? "اطلب مرجع سوقي من الديوان" : "Request market reference from desk";
  };

  const getWhatsAppLink = (product: Product) => {
    const pName = isAr ? product.name_ar : product.name_en;
    const msg = isAr
      ? `مرحباً، أريد طلب عرض سعر معتمد من ديوان PGR UAE لمنتج: ${pName}`
      : `Hello, I would like to request a firm quote from the PGR UAE desk for: ${pName}`;
    return `https://wa.me/971559688837?text=${encodeURIComponent(msg)}`;
  };

  const filteredProducts = products.filter((product) => {
    if (!product || product.published === false) return false;
    const matchesCategory = selectedFilter === "all" || product.category === selectedFilter;
    return matchesCategory;
  });

  return (
    <section
      className="py-20 px-4 md:px-8 bg-brand-bg border-t border-soft-border"
      id="catalog"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
            {isAr ? "معرض المنتجات" : "Product Showroom"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-text-charcoal font-medium">
            {isAr ? "كتالوج السبائك المعتمد" : "Accredited Bullion Catalog"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {isAr
              ? `تم العثور على ${filteredProducts.length} منتجاً — عروض الأسعار المعتمدة من ديوان PGR UAE`
              : `${filteredProducts.length} products — firm quotes confirmed by PGR UAE desk`}
          </p>
        </div>

        {/* Horizontally scrollable category tabs on mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex gap-2 min-w-max md:flex-wrap md:min-w-0 md:justify-center">
            {CATEGORY_TABS.map((filterId) => (
              <button
                key={filterId}
                type="button"
                onClick={() => setSelectedFilter(filterId)}
                className={`shrink-0 px-4 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-colors ${
                  selectedFilter === filterId
                    ? "bg-gold-base text-text-charcoal border-gold-base"
                    : "bg-brand-card text-text-secondary border-soft-border hover:border-gold-base hover:text-text-charcoal"
                }`}
              >
                {getFilterLabel(filterId)}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center border border-soft-border rounded bg-brand-card">
            <AlertCircle size={28} className="mx-auto text-gold-base mb-3" />
            <p className="text-sm text-text-secondary">
              {isAr ? "لا توجد منتجات في هذا القسم." : "No products in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="flex flex-col rounded border border-soft-border bg-[#FFFDF8] overflow-hidden shadow-sm hover:border-gold-base transition-colors duration-300 min-h-[520px]"
              >
                {/* Image area ~65% — portrait 4:5 */}
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="relative w-full aspect-[4/5] bg-brand-bg flex items-center justify-center p-4 border-b border-soft-border cursor-pointer group"
                >
                  <img
                    src={getProductImage(product)}
                    alt={isAr ? product.name_ar : product.name_en}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getProductImage(product);
                    }}
                    className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </button>

                {/* Text/data area ~35% */}
                <div className="flex flex-col flex-1 p-5 space-y-3 bg-[#FFFDF8]">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="text-left cursor-pointer"
                  >
                    <h3 className="text-base font-serif font-medium text-text-charcoal leading-snug line-clamp-2 hover:text-gold-dark transition-colors">
                      {isAr ? product.name_ar : product.name_en}
                    </h3>
                  </button>

                  <dl className="space-y-1.5 text-xs font-sans">
                    {[
                      [isAr ? "نوع المعدن" : "Metal", getMetalLabel(product)],
                      [isAr ? "الوزن" : "Weight", product.weight_label],
                      [isAr ? "النقاوة" : "Purity", product.purity],
                      [isAr ? "المرجع السوقي" : "Market reference", getIndicativeWording(product)]
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex justify-between gap-2 border-b border-soft-border/60 pb-1">
                        <dt className="text-text-secondary">{label}</dt>
                        <dd className="text-text-charcoal font-mono font-bold text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {shippingNote && (
                    <p className="text-[10px] text-olive-accent font-mono leading-relaxed border-l-2 border-olive-accent pl-2">
                      {shippingNote}
                    </p>
                  )}

                  <p className="text-[10px] text-text-secondary font-mono leading-relaxed pt-1">
                    {isAr
                      ? "يتم تأكيد عرض السعر النهائي من ديوان PGR UAE."
                      : "Final quote confirmed by PGR UAE desk."}
                  </p>

                  <div className="flex flex-col gap-2 pt-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProduct(product);
                        onOpenQuote?.();
                      }}
                      className="w-full py-3 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[10px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileText size={12} />
                      {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
                    </button>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={12} />
                      {isAr ? "ديوان واتساب" : "WhatsApp Quote Desk"}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="text-[10px] text-center text-text-secondary font-mono max-w-3xl mx-auto leading-relaxed">
          {isAr
            ? "الأسعار استرشادية وخاضعة لحركة السوق. لا يوجد دفع مباشر — عرض سعر معتمد أولاً."
            : "Indicative market reference only. Subject to market movement. No direct checkout — firm quote first."}
        </p>
      </div>
    </section>
  );
}

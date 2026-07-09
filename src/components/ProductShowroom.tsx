/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Luxury bullion desk showroom — 10-product catalog, mockup layout.
 */

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Phone } from "lucide-react";
import { Product, LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import { dbService } from "../lib/supabase";
import { getProductImage } from "../lib/productImages";
import { resolvePublicCatalog, ALLOWED_PRODUCT_IDS } from "../lib/productCatalog";
import PricingDisclaimer from "./PricingDisclaimer";
import {
  calculateIndicativePrice,
  canShowIndicativePrice,
  formatIndicativePrice,
  getPriceStatusLabel,
} from "../lib/indicativePricing";
import { trackWhatsAppClick } from "../lib/gtag";
import { buildWhatsAppLink } from "../lib/whatsapp";
import DeskProductCard from "./DeskProductCard";
import { useShowroomStore } from "../stores/showroomStore";

interface ProductShowroomProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onSelectProduct: (product: Product) => void;
  selectedCategoryFilter?: string;
  onOpenQuote?: (product?: Product) => void;
}

const SHOWROOM_GROUPS: {
  id: string;
  labelEn: string;
  labelAr: string;
  productIds: string[];
}[] = [
  {
    id: "gold_bars",
    labelEn: "Gold Bars",
    labelAr: "سبائك الذهب",
    productIds: ["pgr-gold-1g-10g", "pgr-gold-20g-50g", "pgr-gold-100g", "pgr-gold-1kg"]
  },
  {
    id: "silver_bars",
    labelEn: "Silver Bars",
    labelAr: "سبائك الفضة",
    productIds: ["pgr-silver-1oz-100g", "pgr-silver-500g", "pgr-silver-1kg"]
  },
  {
    id: "mint_bars_coins",
    labelEn: "Mint & Coins",
    labelAr: "المسكوكات والعملات",
    productIds: ["pgr-mint-bars-coins"]
  },
  {
    id: "custom_inquiry",
    labelEn: "Custom",
    labelAr: "مخصص",
    productIds: ["custom-bullion-inquiry"]
  }
];

const COLLECTION_ID = "pgr-bullion-collection";

export default function ProductShowroom({
  currentLang,
  rates,
  selectedCurrency,
  onSelectProduct,
  selectedCategoryFilter,
  onOpenQuote
}: ProductShowroomProps) {
  const isAr = currentLang === "ar";
  const selectedId = useShowroomStore((s) => s.selectedProductId);
  const setSelectedProductId = useShowroomStore((s) => s.setSelectedProductId);
  const [products, setProducts] = useState<Product[]>(() => resolvePublicCatalog(PRODUCTS));
  const [shippingNote, setShippingNote] = useState("");
  const [mobileGroup, setMobileGroup] = useState("gold_bars");

  useEffect(() => {
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
        console.error("Showroom shipping load failed:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (!selectedCategoryFilter || selectedCategoryFilter === "all") return;
    const group = SHOWROOM_GROUPS.find((g) => g.id === selectedCategoryFilter);
    if (group?.productIds[0]) {
      setSelectedProductId(group.productIds[0]);
      setMobileGroup(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter, setSelectedProductId]);

  const catalog = useMemo(() => resolvePublicCatalog(products), [products]);
  const productMap = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);

  const orderedProducts = useMemo(() => {
    const ids = [COLLECTION_ID, ...ALLOWED_PRODUCT_IDS.filter((id) => id !== COLLECTION_ID)];
    return ids.map((id) => productMap.get(id)).filter((p): p is Product => !!p && p.published !== false);
  }, [productMap]);

  const selectedProduct = productMap.get(selectedId) || orderedProducts[0];

  const getMetalLabel = (product: Product) => {
    const metal = product?.technical_specs?.metal;
    if (metal === "gold") return isAr ? "ذهب" : "Gold";
    if (metal === "silver") return isAr ? "فضة" : "Silver";
    if (product.category === "custom_inquiry") return isAr ? "مخصص" : "Custom";
    if (product.category === "mint_bars_coins") return isAr ? "ذهب / فضة" : "Gold / Silver";
    return isAr ? "معادن ثمينة" : "Precious Metals";
  };

  const getMarketRef = (product: Product) => {
    const price = calculateIndicativePrice(product, rates, selectedCurrency);
    if (canShowIndicativePrice(rates?.source_status) && price) {
      return `${formatIndicativePrice(price, selectedCurrency, currentLang)} ${selectedCurrency}`;
    }
    return isAr ? "اطلب مرجعاً من الديوان" : "Request reference from desk";
  };

  const navigateProduct = (dir: -1 | 1) => {
    const idx = orderedProducts.findIndex((p) => p.id === selectedId);
    if (idx < 0) return;
    const next = (idx + dir + orderedProducts.length) % orderedProducts.length;
    setSelectedProductId(orderedProducts[next].id);
  };

  const selectProduct = (id: string) => {
    setSelectedProductId(id);
    const group = SHOWROOM_GROUPS.find((g) => g.productIds.includes(id));
    if (group) setMobileGroup(group.id);
  };

  const getWhatsAppLink = (product: Product) => {
    const pName = isAr ? product.name_ar : product.name_en;
    const msg = isAr
      ? `مرحباً، أريد طلب عرض سعر معتمد من ديوان PGR UAE لمنتج: ${pName}`
      : `Hello, I would like to request a firm quote from the PGR UAE desk for: ${pName}`;
    return buildWhatsAppLink(msg);
  };

  const mobileGroupProducts = useMemo(() => {
    const group = SHOWROOM_GROUPS.find((g) => g.id === mobileGroup);
    if (!group) return orderedProducts;
    return group.productIds
      .map((id) => productMap.get(id))
      .filter(Boolean) as Product[];
  }, [mobileGroup, orderedProducts, productMap]);

  const priceStatus = getPriceStatusLabel(rates?.source_status, currentLang);

  const renderProductPriceBlock = (product: Product) => {
    const indicativePrice = calculateIndicativePrice(product, rates, selectedCurrency);
    const showPrice = canShowIndicativePrice(rates?.source_status) && indicativePrice;
    if (!showPrice) {
      return (
        <p className="text-sm font-bold text-gold-dark">
          {isAr ? "طلب مرجع من الديوان" : "Request reference from desk"}
        </p>
      );
    }
    return (
      <div className="space-y-1">
        <p className="text-xl font-mono font-bold text-text-charcoal">
          {formatIndicativePrice(indicativePrice!, selectedCurrency, currentLang)}{" "}
          <span className="text-sm text-gold-dark">{selectedCurrency}</span>
        </p>
        <p className="text-[10px] text-text-secondary/70">
          {isAr ? "استرشادي — يؤكده المكتب" : "Indicative — desk confirms"}
        </p>
      </div>
    );
  };

  if (!selectedProduct) return null;

  const pName = isAr ? selectedProduct.name_ar : selectedProduct.name_en;

  return (
    <section
      className="py-16 md:py-20 px-4 md:px-8 bg-brand-bg border-y border-soft-border"
      id="catalog"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold-dark font-bold">
            {isAr ? "معرض المنتجات الرئيسي" : "Main Product Showroom"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-text-charcoal font-medium">
            {isAr ? "معرض السبائك" : "Bullion Showroom"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {isAr
              ? `${orderedProducts.length} منتجات معتمدة — عروض الأسعار النهائية يؤكدها PGR UAE`
              : `${orderedProducts.length} approved products — final quote confirmed by PGR UAE desk`}
          </p>
        </div>

        {/* Mobile group tabs */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 min-w-max pb-1">
            {SHOWROOM_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setMobileGroup(g.id);
                  if (g.productIds[0]) setSelectedProductId(g.productIds[0]);
                }}
                className={`shrink-0 px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-colors ${
                  mobileGroup === g.id
                    ? "bg-gold-base text-text-charcoal border-gold-base"
                    : "bg-brand-card text-text-secondary border-soft-border"
                }`}
              >
                {isAr ? g.labelAr : g.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop 3-column showroom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 min-h-[520px]">
          {/* Left — dark product selector */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col rounded-xl bg-panel-dark border border-champagne/20 shadow-premium overflow-hidden">
            <div className="px-4 py-3 border-b border-champagne/15">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-base font-bold">
                {isAr ? "اختر المنتج" : "Choose Product"}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {/* Collection highlight */}
              {productMap.get(COLLECTION_ID) && (
                <div>
                  <p className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-panel-muted">
                    {isAr ? "المجموعة" : "Collection"}
                  </p>
                  <SelectorRow
                    product={productMap.get(COLLECTION_ID)!}
                    isActive={selectedId === COLLECTION_ID}
                    isAr={isAr}
                    onSelect={() => selectProduct(COLLECTION_ID)}
                  />
                </div>
              )}
              {SHOWROOM_GROUPS.map((group) => (
                <div key={group.id}>
                  <p className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-panel-muted">
                    {isAr ? group.labelAr : group.labelEn}
                  </p>
                  <ul className="space-y-0.5">
                    {group.productIds.map((id) => {
                      const product = productMap.get(id);
                      if (!product) return null;
                      return (
                        <li key={id}>
                          <SelectorRow
                            product={product}
                            isActive={selectedId === id}
                            isAr={isAr}
                            onSelect={() => selectProduct(id)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Center — large product image */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative flex-1 rounded-xl border-2 border-champagne bg-brand-card shadow-premium overflow-hidden min-h-[320px] sm:min-h-[400px]">
              <button
                type="button"
                onClick={() => navigateProduct(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-brand-card/90 border border-champagne text-text-charcoal hover:bg-gold-base/20 transition-colors flex items-center justify-center"
                aria-label={isAr ? "المنتج السابق" : "Previous product"}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => navigateProduct(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-brand-card/90 border border-champagne text-text-charcoal hover:bg-gold-base/20 transition-colors flex items-center justify-center"
                aria-label={isAr ? "المنتج التالي" : "Next product"}
              >
                <ChevronRight size={20} />
              </button>
              <button
                type="button"
                onClick={() => onSelectProduct(selectedProduct)}
                className="relative w-full h-full flex items-center justify-center p-6 sm:p-10 cursor-pointer group min-h-[320px] sm:min-h-[400px]"
              >
                <img
                  src={getProductImage(selectedProduct)}
                  alt={pName}
                  className="max-h-full max-w-full object-contain group-hover:scale-[1.02] transition-transform duration-500 relative z-[1]"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max px-1">
                {orderedProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => selectProduct(product.id)}
                    className={`shrink-0 h-16 w-14 rounded border-2 overflow-hidden bg-brand-card transition-colors ${
                      selectedId === product.id ? "border-gold-base" : "border-soft-border hover:border-champagne"
                    }`}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={isAr ? product.name_ar : product.name_en}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — product details */}
          <div className="lg:col-span-4 flex flex-col rounded-xl border border-champagne bg-brand-card shadow-premium p-5 sm:p-6 space-y-4">
            <div>
              <button
                type="button"
                onClick={() => onSelectProduct(selectedProduct)}
                className="text-left w-full cursor-pointer group"
              >
                <h3 className="text-xl sm:text-2xl font-serif text-text-charcoal font-medium group-hover:text-gold-dark transition-colors">
                  {pName}
                </h3>
              </button>
              <p className="text-sm text-gold-dark font-mono mt-1">{selectedProduct.purity}</p>
            </div>

            <dl className="space-y-2 text-sm font-sans">
              {[
                [isAr ? "المعدن" : "Metal", getMetalLabel(selectedProduct)],
                [isAr ? "الوزن" : "Weight", selectedProduct.weight_label],
                [isAr ? "النقاوة" : "Purity", selectedProduct.purity],
                [isAr ? "التوفر" : "Availability", selectedProduct.availability],
                [isAr ? "مرجع السوق" : "Market Reference", getMarketRef(selectedProduct)],
                [isAr ? "الشحن" : "Shipping", shippingNote || (isAr ? "يؤكد الديوان" : "Confirmed by desk")],
                [isAr ? "الامتثال" : "Compliance", isAr ? "خاضع لمراجعة KYC/AML" : "Subject to KYC/AML review"]
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex justify-between gap-3 py-2 border-b border-soft-border/70"
                >
                  <dt className="text-text-secondary shrink-0">{label}</dt>
                  <dd className="text-text-charcoal font-mono text-right text-xs sm:text-sm">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="p-3 rounded-lg border border-gold-base/40 bg-gold-light/30">
              <p className="text-xs font-mono text-text-charcoal leading-relaxed">
                {isAr
                  ? "يتم تأكيد عرض السعر النهائي من ديوان PGR UAE."
                  : "Final quote confirmed by PGR UAE desk."}
              </p>
            </div>

            <p className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">
              {getPriceStatusLabel(rates?.source_status, currentLang)}
            </p>

            <PricingDisclaimer currentLang={currentLang} compact />

            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              {isAr ? selectedProduct.description_ar : selectedProduct.description_en}
            </p>

            <div className="flex flex-col gap-2 mt-auto pt-2">
              <button
                type="button"
                onClick={() => {
                  onSelectProduct(selectedProduct);
                  onOpenQuote?.(selectedProduct);
                }}
                className="w-full py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[10px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors"
              >
                <FileText size={12} />
                {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
              </button>
              <a
                href={getWhatsAppLink(selectedProduct)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`showroom_${selectedProduct.id}`)}
                className="w-full py-3.5 bg-panel-dark hover:bg-panel-charcoal text-brand-bg font-mono text-[10px] font-bold uppercase tracking-widest rounded border border-champagne/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Phone size={12} />
                {isAr ? "واتساب" : "WhatsApp"}
              </a>
              <button
                type="button"
                onClick={() => onSelectProduct(selectedProduct)}
                className="w-full py-2 text-[10px] font-mono text-gold-dark uppercase tracking-widest hover:text-gold-base transition-colors"
              >
                {isAr ? "عرض التفاصيل الكاملة" : "View full product details"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / tablet — desk product cards */}
        <div className="lg:hidden space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-secondary text-center">
            {isAr ? "تصفح المنتجات — طلب عرض سعر" : "Browse products — request quote"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mobileGroupProducts.map((product, index) => (
              <DeskProductCard
                key={product.id}
                product={product}
                isAr={isAr}
                imageSrc={getProductImage(product)}
                priceStatusLabel={priceStatus}
                priceBlock={renderProductPriceBlock(product)}
                whatsappHref={getWhatsAppLink(product)}
                onSelect={() => selectProduct(product.id)}
                onOpenQuote={() => onOpenQuote?.(product)}
                onWhatsAppClick={() => trackWhatsAppClick(`showroom_card_${product.id}`)}
                index={index}
                compact
              />
            ))}
          </div>
        </div>

        {/* Desktop — quick browse cards */}
        <div className="hidden lg:block space-y-4 pt-4 border-t border-soft-border">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">
            {isAr ? "تصفح سريع للكتالوج" : "Quick catalog browse"}
          </p>
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {orderedProducts.slice(0, 10).map((product, index) => (
              <DeskProductCard
                key={product.id}
                product={product}
                isAr={isAr}
                imageSrc={getProductImage(product)}
                priceBlock={renderProductPriceBlock(product)}
                whatsappHref={getWhatsAppLink(product)}
                onSelect={() => selectProduct(product.id)}
                onOpenQuote={() => onOpenQuote?.(product)}
                onWhatsAppClick={() => trackWhatsAppClick(`showroom_desktop_${product.id}`)}
                index={index}
                compact
              />
            ))}
          </div>
        </div>

            <PricingDisclaimer currentLang={currentLang} className="max-w-3xl mx-auto" />
      </div>
    </section>
  );
}

function SelectorRow({
  product,
  isActive,
  isAr,
  onSelect
}: {
  product: Product;
  isActive: boolean;
  isAr: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
        isActive
          ? "bg-gold-base/15 border border-gold-base/50"
          : "hover:bg-white/5 border border-transparent"
      }`}
    >
      <img
        src={getProductImage(product)}
        alt=""
        className="h-9 w-7 object-contain shrink-0 rounded bg-panel-charcoal/50"
        loading="lazy"
      />
      <span
        className={`text-[11px] font-sans leading-tight line-clamp-2 ${
          isActive ? "text-gold-base font-medium" : "text-brand-bg/90"
        }`}
      >
        {isAr ? product.name_ar : product.name_en}
      </span>
    </button>
  );
}

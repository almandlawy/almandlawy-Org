/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Premium product detail — 10-product catalog only.
 */

import React, { useEffect, useState } from "react";
import { X, Phone, FileText, ShieldCheck } from "lucide-react";
import { Product, LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import { dbService } from "../lib/supabase";
import { getProductImage } from "../lib/productImages";
import { resolvePublicCatalog } from "../lib/productCatalog";
import {
  calculateIndicativePrice,
  canShowIndicativePrice,
  formatIndicativePrice,
  getPriceStatusLabel,
} from "../lib/indicativePricing";

interface ProductDetailModalProps {
  currentLang: "en" | "ar";
  product: Product | null;
  onClose: () => void;
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onOpenQuote: (prefill?: Product | string) => void;
}

export default function ProductDetailModal({
  currentLang,
  product,
  onClose,
  rates,
  selectedCurrency,
  onOpenQuote
}: ProductDetailModalProps) {
  const isAr = currentLang === "ar";
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [shippingNote, setShippingNote] = useState("");

  useEffect(() => {
    if (product) setActiveProduct(product);
  }, [product]);

  useEffect(() => {
    fetch("/api/shipping")
      .then((r) => (r.ok ? r.json() : null))
      .then((ship) => {
        if (ship?.shipping_enabled && ship?.public_shipping_note) {
          setShippingNote(ship.public_shipping_note);
        }
      })
      .catch(() => {});
  }, []);

  if (!activeProduct) return null;

  const catalog = resolvePublicCatalog(PRODUCTS);
  const relatedProducts = catalog
    .filter((p) => p.id !== activeProduct.id && p.category === activeProduct.category)
    .slice(0, 3);
  if (relatedProducts.length < 3) {
    const extra = catalog
      .filter((p) => p.id !== activeProduct.id && !relatedProducts.find((r) => r.id === p.id))
      .slice(0, 3 - relatedProducts.length);
    relatedProducts.push(...extra);
  }

  const metal = activeProduct.technical_specs?.metal;
  const metalLabel =
    metal === "gold" ? (isAr ? "ذهب" : "Gold") :
    metal === "silver" ? (isAr ? "فضة" : "Silver") :
    activeProduct.category === "mint_bars_coins" ? (isAr ? "ذهب / فضة" : "Gold / Silver") :
    (isAr ? "مخصص" : "Custom");

  const indicativePrice = calculateIndicativePrice(activeProduct, rates, selectedCurrency);
  const showPrice = canShowIndicativePrice(rates?.source_status) && indicativePrice;

  const pName = isAr ? activeProduct.name_ar : activeProduct.name_en;
  const waLink = `https://wa.me/971559688837?text=${encodeURIComponent(
    isAr
      ? `مرحباً، أريد عرض سعر معتمد لـ: ${pName}`
      : `Hello, I need a firm quote for: ${pName}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="fixed inset-0 bg-text-charcoal/70 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-5xl bg-[#FFFDF8] border border-soft-border rounded-lg shadow-2xl overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-brand-card border border-soft-border text-text-secondary hover:text-text-charcoal"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 md:p-8 bg-brand-bg border-b lg:border-b-0 lg:border-r border-soft-border">
              <div className="aspect-[4/5] w-full max-h-[70vh] flex items-center justify-center p-4 rounded border border-soft-border bg-brand-card relative">
                {activeProduct.iraq_popular && (
                  <span className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-[#C6A15B] text-[#1F1A17] text-[9px] font-mono uppercase font-bold">
                    {isAr ? "الأكثر طلباً — العراق" : "Iraq Bestseller"}
                  </span>
                )}
                <img
                  src={getProductImage(activeProduct)}
                  alt={pName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getProductImage(activeProduct);
                  }}
                />
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-mono text-gold-dark uppercase tracking-widest font-bold">
                  {activeProduct.manufacturer}
                </p>
                <h1 className="text-2xl md:text-3xl font-serif text-text-charcoal font-medium mt-2">
                  {pName}
                </h1>
                <p className="text-sm text-text-secondary font-sans mt-3 leading-relaxed">
                  {isAr ? activeProduct.description_ar : activeProduct.description_en}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs font-sans">
                {[
                  [isAr ? "المعدن" : "Metal", metalLabel],
                  [isAr ? "الوزن" : "Weight", activeProduct.weight_label],
                  [isAr ? "النقاوة" : "Purity", activeProduct.purity],
                  [isAr ? "التوفر" : "Availability", activeProduct.availability]
                ].map(([label, value]) => (
                  <div key={String(label)} className="p-3 rounded border border-soft-border bg-brand-card">
                    <dt className="text-text-secondary text-[10px] font-mono uppercase">{label}</dt>
                    <dd className="text-text-charcoal font-bold mt-1">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="p-4 rounded border border-soft-border bg-brand-card space-y-2">
                <p className="text-[10px] font-mono text-olive-accent uppercase font-bold">
                  {getPriceStatusLabel(rates?.source_status, currentLang)}
                </p>
                {showPrice ? (
                  <p className="text-xl font-mono font-bold text-text-charcoal">
                    {formatIndicativePrice(indicativePrice!, selectedCurrency, currentLang)}{" "}
                    <span className="text-sm text-gold-dark">{selectedCurrency}</span>
                  </p>
                ) : (
                  <p className="text-sm text-text-charcoal font-sans">
                    {isAr
                      ? "اطلب مرجع سوقي معتمد من الديوان"
                      : "Request firm market reference from desk"}
                  </p>
                )}
                <p className="text-[10px] text-text-secondary">
                  {isAr
                    ? "سعر استرشادي — يؤكده الديوان قبل الطلب"
                    : "Indicative — desk confirms before order"}
                </p>
              </div>

              {shippingNote && (
                <p className="text-xs text-olive-accent font-mono border-l-2 border-olive-accent pl-3">
                  {shippingNote}
                </p>
              )}

              <div className="flex items-start gap-2 p-3 rounded bg-soft-danger border border-soft-border text-xs text-text-secondary">
                <ShieldCheck size={14} className="text-olive-accent shrink-0 mt-0.5" />
                <p>
                  {isAr
                    ? "تخضع المعاملة لمراجعة AML/KYC. عرض السعر المعتمد يُؤكد من ديوان PGR UAE قبل التسوية."
                    : "Transaction subject to AML/KYC review. Firm quote confirmed by PGR UAE desk before settlement."}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenQuote(activeProduct || product);
                    onClose();
                  }}
                  className="w-full py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 border border-gold-base text-text-charcoal hover:bg-gold-base/10 font-mono text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  {isAr ? "ديوان واتساب" : "WhatsApp Quote Desk"}
                </a>
              </div>

              {relatedProducts.length > 0 && (
                <div className="pt-4 border-t border-soft-border">
                  <p className="text-[10px] font-mono uppercase text-text-secondary mb-3">
                    {isAr ? "منتجات ذات صلة" : "Related products"}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {relatedProducts.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => setActiveProduct(rel)}
                        className="shrink-0 w-24 text-center"
                      >
                        <div className="aspect-square rounded border border-soft-border bg-brand-bg p-1 mb-1 overflow-hidden">
                          <img
                            src={getProductImage(rel)}
                            alt={rel.name_en}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[9px] font-mono text-text-charcoal line-clamp-2">
                          {isAr ? rel.name_ar : rel.name_en}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

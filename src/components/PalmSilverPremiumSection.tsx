/**
 * Premium PALM Silver 1kg showcase — dark luxury layout inspired by branded product creative.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import {
  Award,
  FileText,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { PRODUCTS } from "../data";
import { LiveMarketRates, Product } from "../types";
import {
  calculateIndicativePrice,
  canShowIndicativePrice,
  formatIndicativePrice,
  getPriceStatusLabel,
} from "../lib/indicativePricing";
import { getProductImage } from "../lib/productImages";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";

const PALM_1KG_ID = "pgr-silver-1kg";

const FEATURES = [
  {
    icon: Sparkles,
    en: "999.9 Fine Silver",
    ar: "فضة 999.9",
  },
  {
    icon: Award,
    en: "Melter & Assayer Certified",
    ar: "شهادة مصهر وفاحص",
  },
  {
    icon: ShieldCheck,
    en: "PALM UAE Hallmark",
    ar: "ختم PALM الإماراتي",
  },
  {
    icon: Truck,
    en: "Iraq Delivery 4–5 Days",
    ar: "توصيل العراق ٤–٥ أيام",
  },
] as const;

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface PalmSilverPremiumSectionProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onOpenQuote: (product?: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export default function PalmSilverPremiumSection({
  currentLang,
  rates,
  selectedCurrency,
  onOpenQuote,
  onSelectProduct,
}: PalmSilverPremiumSectionProps) {
  const isAr = currentLang === "ar";
  const product = PRODUCTS.find((p) => p.id === PALM_1KG_ID);
  if (!product) return null;

  const imageSrc = getProductImage(product);
  const indicativePrice = calculateIndicativePrice(product, rates, selectedCurrency);
  const showPrice = canShowIndicativePrice(rates?.source_status) && indicativePrice;
  const priceStatus = getPriceStatusLabel(rates?.source_status, currentLang);

  const iqdPrice =
    selectedCurrency !== "IQD"
      ? calculateIndicativePrice(product, rates, "IQD")
      : indicativePrice;
  const aedPrice =
    selectedCurrency !== "AED"
      ? calculateIndicativePrice(product, rates, "AED")
      : indicativePrice;

  const waHref = buildWhatsAppLink(
    isAr
      ? "مرحباً، أريد عرض سعر لسبيكة فضة PALM ١ كيلو للتوصيل للعراق."
      : "Hello, I would like a firm quote for the PALM Silver 1kg bar with Iraq delivery."
  );

  return (
    <section
      id="palm-silver-premium"
      className="relative overflow-hidden border-y border-champagne/15"
      style={{ direction: isAr ? "rtl" : "ltr" }}
      aria-label={isAr ? "سبيكة PALM فضة ١ كيلو" : "PALM Silver 1kg bar"}
    >
      {/* Marble-dark backdrop */}
      <div className="absolute inset-0 bg-[#0d0f0e]" aria-hidden />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(198, 161, 91, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 20%, rgba(232, 222, 201, 0.06) 0%, transparent 50%),
            linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(255,255,255,0.02) 100%)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            125deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.4) 2px,
            rgba(255,255,255,0.4) 3px
          )`,
        }}
        aria-hidden
      />

      <div className="relative z-[1] max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Product visual */}
          <motion.div
            className="relative order-1"
            initial={{ opacity: 0, x: isAr ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Gold halo */}
              <div
                className="absolute -inset-6 rounded-3xl bg-gold-base/10 blur-3xl"
                aria-hidden
              />

              {/* Marble pedestal */}
              <div className="relative rounded-2xl border border-champagne/20 bg-gradient-to-b from-[#1a1c1a] to-[#0f1110] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                <div
                  className="absolute inset-x-8 bottom-0 h-24 rounded-t-full bg-gradient-to-t from-white/[0.04] to-transparent blur-sm"
                  aria-hidden
                />

                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-base rounded-xl"
                  aria-label={isAr ? "عرض تفاصيل سبيكة PALM" : "View PALM bar details"}
                >
                  <div className="relative aspect-[4/5] max-h-[420px] mx-auto flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={isAr ? "سبيكة فضة PALM ١ كيلو 999.9" : "PALM Silver 1kg bar 999.9"}
                      className="max-h-full w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </button>

                {/* Assay stamp */}
                <div className="mt-5 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gold-base/40 bg-black/40 backdrop-blur-sm">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold-base font-bold">
                      {isAr ? "مصهر وفاحص" : "Melter Assayer"}
                    </span>
                    <span className="w-px h-3 bg-champagne/30" aria-hidden />
                    <span className="text-[9px] font-mono text-champagne/70 tracking-wider">
                      UAE · 999.9
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy & CTAs */}
          <motion.div
            className="order-2 space-y-7"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease, delay: 0.1 }}
          >
            <div className="space-y-4">
              <p className="text-gold-base font-mono uppercase text-[11px] tracking-[0.35em] font-bold">
                PALM SILVER
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-medium text-white leading-[1.15] tracking-tight">
                {isAr ? (
                  <>
                    سبيكة فضة{" "}
                    <span className="text-gold-gradient">١ كيلو</span>
                  </>
                ) : (
                  <>
                    1 Kilo{" "}
                    <span className="text-gold-gradient">Silver Bar</span>
                  </>
                )}
              </h2>
              <p className="text-lg sm:text-xl font-mono font-semibold text-gold-base tracking-wide">
                {isAr ? "فضة 999.9 نقية" : "999.9 Fine Silver"}
              </p>
              <p className="text-sm text-panel-muted leading-relaxed max-w-lg">
                {isAr
                  ? "سبيكة PALM من مصفاة الإمارات — الأكثر طلباً للمشترين العراقيين بالجملة. ختم رسمي، رقم تسلسلي، وعرض سعر مؤكد من ديوان PGR UAE في دبي."
                  : "PALM cast bar from UAE Gold Refinery — the top-requested weight for Iraqi bulk buyers. Official hallmark, serial numbered, with a firm quote confirmed by the PGR UAE desk in Dubai."}
              </p>
            </div>

            {/* Feature grid */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((item, i) => (
                <motion.li
                  key={item.en}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease }}
                  className="flex items-center gap-3 rounded-lg border border-champagne/15 bg-white/[0.03] px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-base/30 bg-gold-base/10">
                    <item.icon size={16} className="text-gold-base" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-medium text-champagne leading-snug">
                    {isAr ? item.ar : item.en}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Delivery badge */}
            <div className="inline-flex items-center gap-3 rounded-lg border-2 border-gold-base/50 bg-gold-base/10 px-5 py-3">
              <Truck size={20} className="text-gold-base shrink-0" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-base/80 font-bold">
                  {isAr ? "توصيل للعراق" : "Iraq Delivery"}
                </p>
                <p className="text-sm font-mono font-bold text-white tracking-wide">
                  {isAr ? "٤–٥ أيام عمل" : "4–5 Business Days"}
                </p>
              </div>
            </div>

            {/* Indicative price */}
            {showPrice ? (
              <div className="rounded-xl border border-champagne/20 bg-black/30 px-5 py-4 space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gold-base/80">
                  {priceStatus}
                </p>
                <p className="text-3xl font-mono font-bold text-white">
                  {formatIndicativePrice(indicativePrice!, selectedCurrency, currentLang)}{" "}
                  <span className="text-base text-gold-base">{selectedCurrency}</span>
                </p>
                {selectedCurrency === "IQD" && aedPrice && (
                  <p className="text-xs font-mono text-panel-muted">
                    ≈ {formatIndicativePrice(aedPrice, "AED", currentLang)} AED
                  </p>
                )}
                {selectedCurrency === "AED" && iqdPrice && (
                  <p className="text-xs font-mono text-panel-muted">
                    ≈ {formatIndicativePrice(iqdPrice, "IQD", currentLang)} IQD
                  </p>
                )}
                <p className="text-[10px] text-panel-muted pt-1">
                  {isAr
                    ? "سعر استرشادي — يؤكده الديوان قبل الطلب"
                    : "Indicative — desk confirms before order"}
                </p>
              </div>
            ) : null}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenQuote(product)}
                className="btn-desk-primary flex-1 py-3.5 px-6 rounded font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <FileText size={15} />
                {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
              </button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("palm_silver_premium")}
                className="flex-1 py-3.5 px-6 rounded font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white transition-colors"
              >
                <Phone size={15} />
                WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Editorial split hero — cream desk panel + cinematic PALM Silver video.
 */

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, FileText, Phone, Shield, Truck } from "lucide-react";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";

const VIDEO_MP4 = "/videos/palm_silver_hero_banner_optimized.mp4";
const VIDEO_WEBM = "/videos/palm_silver_hero_banner_optimized.webm";
const VIDEO_POSTER = "/videos/palm-silver-hero-poster.webp";
const FALLBACK_POSTER = "/images/products/08-silver-bar-1kg.webp";

interface HeroProps {
  currentLang: "en" | "ar";
  onScrollToCatalog: (category?: string) => void;
  onScrollToMarket: () => void;
  onOpenQuote: () => void;
  onScrollToIraqOffers?: () => void;
}

const TRUST_ITEMS = [
  { icon: FileText, en: "Desk-Confirmed Quotes", ar: "عروض أسعار مؤكدة من المكتب" },
  { icon: Shield, en: "KYC & Compliance", ar: "التحقق والامتثال" },
  { icon: Truck, en: "Iraq Collection & Delivery", ar: "استلام وتوصيل للعراق" },
];

const SPEC_CHIPS = [
  { en: "999.9 Fine Silver", ar: "فضة 999.9" },
  { en: "1kg Cast Bar", ar: "سبيكة ١ كيلو" },
  { en: "UAE Assay", ar: "فحص إماراتي" },
];

function shouldPreferPosterOnly(): boolean {
  if (typeof window === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return true;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return true;
  return false;
}

export default function Hero({
  currentLang,
  onScrollToCatalog,
  onScrollToMarket,
  onOpenQuote,
  onScrollToIraqOffers,
}: HeroProps) {
  const isAr = currentLang === "ar";
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterOnly, setPosterOnly] = useState(false);

  const showPoster = reduceMotion || videoFailed || posterOnly;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    setPosterOnly(shouldPreferPosterOnly());
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || showPoster) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showPoster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo || showPoster) return;

    const tryPlay = () => {
      video.muted = true;
      video.play().catch(() => setVideoFailed(true));
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    return () => video.removeEventListener("loadeddata", tryPlay);
  }, [shouldLoadVideo, showPoster]);

  const waHref = buildWhatsAppLink(
    isAr
      ? "مرحباً، أريد الاستفسار عن توفر سبيكة فضة PALM ١ كيلو من PGR UAE."
      : "Hello, I would like to check availability for the PALM Silver 1kg bar from PGR UAE."
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full bg-brand-bg border-b border-soft-border overflow-hidden"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] min-h-0 lg:min-h-[calc(100vh-4.5rem)] lg:max-h-[920px]">
        {/* Copy panel — cream editorial column */}
        <div className="relative z-20 order-2 lg:order-1 flex flex-col justify-center px-5 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-12 lg:py-16">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-champagne to-transparent lg:hidden" />

          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-gold-base shrink-0" aria-hidden />
            <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-gold-dark font-bold">
              PGR UAE · {isAr ? "ديوان دبي" : "Dubai Desk"}
            </p>
          </div>

          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-olive-accent font-bold mb-3">
            PALM SILVER
          </p>

          <h1 className="text-[2rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-serif text-text-charcoal leading-[1.08] font-medium max-w-xl">
            {isAr ? "سبيكة فضة PALM ١ كيلو" : "Palm Silver 1kg Bar"}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-text-secondary leading-relaxed max-w-md font-sans">
            {isAr
              ? "فضة استثمارية 999.9 من مصفاة الإمارات — معايير سبائك احترافية للمشترين في العراق."
              : "999.9 investment-grade silver from UAE refinery — professional bullion standards for Iraq buyers."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SPEC_CHIPS.map((chip) => (
              <span
                key={chip.en}
                className="px-3 py-1 rounded-full border border-champagne bg-brand-card text-[10px] font-mono uppercase tracking-wider text-text-secondary"
              >
                {isAr ? chip.ar : chip.en}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg">
            <button
              type="button"
              onClick={onOpenQuote}
              className="flex-1 px-6 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[11px] font-bold uppercase tracking-widest rounded shadow-premium transition-colors"
            >
              {isAr ? "طلب التوفر" : "Request Availability"}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("hero_whatsapp")}
              className="flex-1 px-6 py-3.5 border border-panel-charcoal/20 bg-brand-card hover:bg-panel-charcoal hover:text-brand-bg text-text-charcoal font-mono text-[11px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={14} />
              {isAr ? "واتساب الديوان" : "WhatsApp Desk"}
            </a>
          </div>

          <ul className="mt-8 pt-6 border-t border-soft-border flex flex-col gap-2.5">
            {TRUST_ITEMS.map(({ icon: Icon, en, ar }) => (
              <li key={en} className="flex items-center gap-2.5 text-xs text-text-secondary font-sans">
                <span className="h-7 w-7 rounded-full border border-champagne bg-brand-card flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-gold-dark" />
                </span>
                <span>{isAr ? ar : en}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-mono uppercase tracking-widest">
            <button
              type="button"
              onClick={() =>
                onScrollToIraqOffers
                  ? onScrollToIraqOffers()
                  : onScrollToCatalog("silver_bars")
              }
              className="inline-flex items-center gap-1.5 text-gold-dark hover:text-gold-base transition-colors font-bold"
            >
              {isAr ? "عروض فضة العراق" : "Iraq Silver Offers"}
              {isAr ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
            </button>
            <button
              type="button"
              onClick={() => onScrollToCatalog()}
              className="text-text-secondary hover:text-text-charcoal transition-colors"
            >
              {isAr ? "معرض المنتجات" : "Product showroom"}
            </button>
            <button
              type="button"
              onClick={onScrollToMarket}
              className="text-text-secondary hover:text-text-charcoal transition-colors"
            >
              {isAr ? "مرجع السوق" : "Market reference"}
            </button>
          </div>
        </div>

        {/* Video column — cinematic showcase */}
        <div className="relative order-1 lg:order-2 min-h-[44vh] sm:min-h-[52vh] lg:min-h-full bg-panel-charcoal">
          {showPoster ? (
            <img
              src={VIDEO_POSTER}
              alt={isAr ? "سبيكة فضة PALM ١ كيلو" : "PALM Silver 1kg bar"}
              className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_POSTER;
              }}
            />
          ) : (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-[center_42%] scale-[1.02]"
              autoPlay
              muted
              loop
              playsInline
              preload={shouldLoadVideo ? "metadata" : "none"}
              poster={VIDEO_POSTER}
              aria-label={isAr ? "عرض سبيكة فضة PALM" : "PALM Silver bar showcase"}
              onError={() => setVideoFailed(true)}
            >
              {shouldLoadVideo && (
                <>
                  <source src={VIDEO_WEBM} type="video/webm" />
                  <source src={VIDEO_MP4} type="video/mp4" />
                </>
              )}
            </video>
          )}

          {/* Seam blend into cream panel */}
          <div
            className={`pointer-events-none absolute inset-y-0 w-16 sm:w-24 lg:w-32 from-brand-bg to-transparent ${
              isAr
                ? "right-0 bg-gradient-to-l"
                : "left-0 bg-gradient-to-r"
            }`}
            aria-hidden
          />

          {/* Cinematic vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-panel-charcoal/50 via-transparent to-panel-charcoal/15" aria-hidden />

          {/* Product caption on video */}
          <div
            className={`absolute bottom-0 inset-x-0 p-5 sm:p-6 lg:p-8 ${
              isAr ? "text-right" : "text-left"
            }`}
          >
            <div className="inline-flex flex-col gap-1 rounded-lg border border-white/10 bg-panel-charcoal/55 backdrop-blur-sm px-4 py-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-champagne">
                {isAr ? "الأكثر طلباً للعراق" : "Iraq Bestseller"}
              </p>
              <p className="text-sm sm:text-base font-serif text-white font-medium">
                PALM · 1kg · 999.9
              </p>
            </div>
          </div>

          {/* Champagne frame accent */}
          <div className="pointer-events-none absolute inset-3 sm:inset-4 lg:inset-5 border border-champagne/20 rounded-sm" aria-hidden />
        </div>
      </div>
    </section>
  );
}

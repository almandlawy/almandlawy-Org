/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Editorial split hero — cream panel + cinematic PALM Silver video.
 */

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, FileText, Phone, Shield, Truck } from "lucide-react";
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
  { icon: FileText, en: "Firm Quotes", ar: "عروض أسعار مؤكدة" },
  { icon: Shield, en: "KYC Ready", ar: "امتثال وتحقق" },
  { icon: Truck, en: "Iraq Delivery", ar: "توصيل للعراق" },
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
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0 lg:min-h-[min(88vh,860px)]">
        {/* Copy panel */}
        <div className="relative z-20 order-2 lg:order-1 flex flex-col justify-center px-5 sm:px-10 lg:px-14 xl:px-16 py-10 sm:py-12 lg:py-14 border-b lg:border-b-0 border-soft-border lg:border-e border-champagne/60">
          <div
            className="pointer-events-none absolute inset-y-8 start-0 w-1 bg-gradient-to-b from-transparent via-gold-base/70 to-transparent hidden lg:block"
            aria-hidden
          />

          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="px-3 py-1 rounded-full bg-brand-card border border-champagne text-[10px] font-mono uppercase tracking-[0.2em] text-gold-dark font-bold">
              PGR UAE
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-secondary">
              {isAr ? "دبي → العراق" : "Dubai → Iraq"}
            </span>
          </div>

          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold mb-2">
            PALM SILVER
          </p>

          <h1 className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] xl:text-[2.85rem] font-serif text-text-charcoal leading-[1.12] font-medium max-w-lg">
            {isAr ? (
              <>
                سبيكة فضة <span className="text-gold-dark">PALM</span>
                <br />
                ١ كيلو جرام
              </>
            ) : (
              <>
                Palm Silver
                <br />
                <span className="text-gold-dark">1kg Bar</span>
              </>
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-[15px] text-text-secondary leading-relaxed max-w-md font-sans">
            {isAr
              ? "فضة استثمارية 999.9 من مصفاة الإمارات — معايير سبائك احترافية للمشترين في العراق."
              : "999.9 investment-grade silver from UAE refinery — professional bullion standards for Iraq buyers."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SPEC_CHIPS.map((chip) => (
              <span
                key={chip.en}
                className="px-3 py-1.5 rounded-md border border-champagne/80 bg-brand-card/80 text-[10px] font-mono uppercase tracking-wider text-text-secondary"
              >
                {isAr ? chip.ar : chip.en}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md">
            <button
              type="button"
              onClick={onOpenQuote}
              className="flex-1 min-h-[48px] px-6 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[11px] font-bold uppercase tracking-widest rounded-md shadow-premium transition-colors"
            >
              {isAr ? "طلب التوفر" : "Request Availability"}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("hero_whatsapp")}
              className="flex-1 min-h-[48px] px-6 py-3.5 border border-emerald-600/25 bg-brand-card hover:bg-emerald-600 hover:text-white text-text-charcoal font-mono text-[11px] font-bold uppercase tracking-widest rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={14} />
              {isAr ? "واتساب مباشر" : "WhatsApp"}
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-soft-border">
            {TRUST_ITEMS.map(({ icon: Icon, en, ar }) => (
              <div
                key={en}
                className="flex sm:flex-col items-center sm:items-start gap-2.5 sm:gap-2 text-xs text-text-secondary font-sans"
              >
                <span className="h-8 w-8 rounded-full border border-champagne bg-brand-card flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-gold-dark" />
                </span>
                <span className="sm:leading-snug">{isAr ? ar : en}</span>
              </div>
            ))}
          </div>

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

        {/* Video column */}
        <div className="relative order-1 lg:order-2 min-h-[40vh] sm:min-h-[46vh] lg:min-h-full bg-[#141816]">
          {showPoster ? (
            <img
              src={VIDEO_POSTER}
              alt={isAr ? "سبيكة فضة PALM ١ كيلو" : "PALM Silver 1kg bar"}
              className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_POSTER;
              }}
            />
          ) : (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
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

          <div
            className={`pointer-events-none absolute inset-y-0 w-20 sm:w-28 lg:w-36 from-brand-bg to-transparent ${
              isAr ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
            }`}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141816]/55 via-transparent to-[#141816]/10" aria-hidden />

          <div className={`absolute bottom-5 sm:bottom-7 ${isAr ? "left-5 sm:left-7" : "right-5 sm:right-7"}`}>
            <div className="rounded-md border border-white/15 bg-black/45 backdrop-blur-md px-4 py-2.5 shadow-lg">
              <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-champagne/90">
                {isAr ? "الأكثر طلباً للعراق" : "Iraq Bestseller"}
              </p>
              <p className="text-sm font-serif text-white font-medium mt-0.5">PALM · 1kg · 999.9</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

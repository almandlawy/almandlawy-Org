/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Full-width PALM Silver hero — video background with overlay copy.
 */

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Shield, Truck } from "lucide-react";

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
  const posterSrc = VIDEO_POSTER;

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
      { rootMargin: "120px", threshold: 0.05 }
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

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full min-h-[72vh] sm:min-h-[80vh] overflow-hidden bg-black"
        id="hero"
        style={{ direction: isAr ? "rtl" : "ltr" }}
      >
        {showPoster ? (
          <img
            src={posterSrc}
            alt={isAr ? "سبيكة فضة PALM ١ كيلو" : "PALM Silver 1kg bar"}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_POSTER;
            }}
          />
        ) : (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload={shouldLoadVideo ? "metadata" : "none"}
            poster={posterSrc}
            aria-hidden
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

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-[#1F1A17]/55" />
        <div className="absolute inset-0 bg-[#FAF9F5]/[0.06]" />

        <div className="relative z-10 flex min-h-[72vh] sm:min-h-[80vh] flex-col items-center justify-center px-6 pt-24 pb-12 text-center text-white">
          <p className="mb-3 text-[10px] sm:text-sm font-mono tracking-[0.35em] text-[#d6b66a] uppercase font-bold">
            PALM SILVER
          </p>

          <h1 className="max-w-4xl text-3xl sm:text-4xl md:text-6xl font-serif font-semibold tracking-wide leading-tight">
            {isAr ? "سبيكة فضة PALM ١ كيلو" : "Palm Silver 1kg Bar"}
          </h1>

          <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-xl text-white/85 font-sans leading-relaxed">
            {isAr
              ? "فضة 999.9 · معايير سبائك احترافية"
              : "999.9 Fine Silver · Professional Bullion Standards"}
          </p>

          <button
            type="button"
            onClick={onOpenQuote}
            className="mt-7 sm:mt-8 rounded-full border border-[#d6b66a] bg-[#1f3b2d]/80 px-7 sm:px-8 py-3 text-[11px] sm:text-sm font-mono font-bold uppercase tracking-widest text-white transition hover:bg-[#d6b66a] hover:text-black"
          >
            {isAr ? "طلب التوفر" : "Request Availability"}
          </button>
        </div>
      </section>

      <section
        className="relative w-full bg-brand-bg border-b border-soft-border py-6 px-4 md:px-8"
        aria-label={isAr ? "مزايا الديوان" : "Desk highlights"}
      >
        <div className="max-w-7xl mx-auto space-y-4">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, en, ar }) => (
              <li key={en} className="flex items-center gap-2 text-xs text-text-secondary font-sans">
                <CheckCircle2 size={14} className="text-gold-base shrink-0" />
                <span>{isAr ? ar : en}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono uppercase tracking-widest">
            <button
              type="button"
              onClick={() =>
                onScrollToIraqOffers
                  ? onScrollToIraqOffers()
                  : onScrollToCatalog("silver_bars")
              }
              className="text-gold-dark hover:text-gold-base transition-colors font-bold"
            >
              {isAr ? "عروض فضة العراق ←" : "Iraq Silver Offers →"}
            </button>
            <button
              type="button"
              onClick={() => onScrollToCatalog()}
              className="text-gold-dark hover:text-gold-base transition-colors"
            >
              {isAr ? "معرض المنتجات ←" : "Product showroom →"}
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
      </section>
    </>
  );
}

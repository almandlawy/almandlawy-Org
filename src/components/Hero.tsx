/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Luxury hero — copy left, framed bullion video right (mockup direction).
 */

import React, { useEffect, useRef, useState } from "react";
import { Phone, FileText, Shield, Truck, CheckCircle2 } from "lucide-react";

const VIDEO_MP4 = "/videos/pgr-bullion-collection.mp4";
const VIDEO_WEBM = "/videos/pgr-bullion-collection.webm";
const VIDEO_POSTER = "/videos/pgr-bullion-collection-poster.webp";
const WHATSAPP_BASE = "https://wa.me/971559688837";

interface HeroProps {
  currentLang: "en" | "ar";
  onScrollToCatalog: (category?: string) => void;
  onScrollToMarket: () => void;
  onOpenQuote: () => void;
}

const TRUST_ITEMS = [
  { icon: FileText, en: "Desk-Confirmed Quotes", ar: "عروض أسعار مؤكدة من المكتب" },
  { icon: Shield, en: "KYC & Compliance", ar: "التحقق والامتثال" },
  { icon: Truck, en: "Iraq Collection & Delivery", ar: "استلام وتوصيل للعراق" }
];

export default function Hero({
  currentLang,
  onScrollToCatalog,
  onScrollToMarket,
  onOpenQuote
}: HeroProps) {
  const isAr = currentLang === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduceMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "80px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo || reduceMotion) return;
    const tryPlay = () => {
      video.muted = true;
      video.play().catch(() => {});
    };
    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    return () => video.removeEventListener("loadeddata", tryPlay);
  }, [shouldLoadVideo, reduceMotion]);

  const waMsg = isAr
    ? "مرحباً، أريد التواصل مع ديوان تسعير PGR UAE لطلب عرض سعر معتمد."
    : "Hello, I would like to contact the PGR UAE Quote Desk for a firm quote.";
  const waLink = `${WHATSAPP_BASE}?text=${encodeURIComponent(waMsg)}`;

  return (
    <section
      className="relative w-full pt-28 pb-16 md:pb-20 bg-brand-bg"
      id="hero"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left — headline & CTAs */}
          <div className="space-y-6 order-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-champagne bg-brand-card text-[10px] font-mono uppercase tracking-[0.25em] text-gold-dark font-bold">
              PGR UAE
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-serif text-text-charcoal leading-[1.1] font-medium">
              {isAr ? (
                <span className="font-arabic block">
                  ديوان عروض أسعار
                  <br />
                  <span className="text-gold-dark">سبائك الذهب والفضة من دبي إلى العراق</span>
                </span>
              ) : (
                <>
                  Gold &amp; Silver Bullion
                  <br />
                  <span className="text-gold-dark">Quote Desk from Dubai to Iraq</span>
                </>
              )}
            </h1>

            <div className="space-y-2">
              <p className="text-base text-text-secondary font-sans leading-relaxed max-w-lg">
                {isAr
                  ? "اطلب عروض أسعار مؤكدة لسبائك الذهب والفضة وعملات السبائك المادية. يخدم PGR UAE العملاء العراقيين بتسعير مؤكد من المكتب ومراجعة الامتثال وخيارات الاستلام أو التوصيل المرتبة."
                  : "Request confirmed quotes for physical gold bars, silver bars and bullion coins. PGR UAE serves Iraqi customers with desk-confirmed pricing, compliance review, and arranged collection or delivery options."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onOpenQuote}
                className="w-full sm:flex-1 px-6 py-4 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded shadow-premium transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={14} />
                {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
              </button>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 px-6 py-4 bg-panel-dark hover:bg-panel-charcoal text-brand-bg font-mono text-xs font-bold uppercase tracking-widest rounded border border-champagne/30 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={14} />
                {isAr ? "ديوان واتساب" : "WhatsApp Desk"}
              </a>
            </div>

            <ul className="flex flex-wrap gap-4 pt-2">
              {TRUST_ITEMS.map(({ icon: Icon, en, ar }) => (
                <li key={en} className="flex items-center gap-2 text-xs text-text-secondary font-sans">
                  <CheckCircle2 size={14} className="text-gold-base shrink-0" />
                  <span>{isAr ? ar : en}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-widest">
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

          {/* Right — luxury framed video */}
          <div ref={containerRef} className="order-2 w-full">
            <div className="relative rounded-2xl border-2 border-champagne bg-brand-card shadow-premium overflow-hidden">
              <div className="relative aspect-[4/3] sm:aspect-video bg-panel-charcoal">
                {reduceMotion ? (
                  <img
                    src={VIDEO_POSTER}
                    alt={isAr ? "مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection"}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={shouldLoadVideo ? "metadata" : "none"}
                    poster={VIDEO_POSTER}
                    aria-label={
                      isAr ? "عرض مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection showcase video"
                    }
                  >
                    {shouldLoadVideo && (
                      <>
                        <source src={VIDEO_WEBM} type="video/webm" />
                        <source src={VIDEO_MP4} type="video/mp4" />
                      </>
                    )}
                  </video>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-panel-charcoal via-panel-charcoal/90 to-transparent px-5 py-5 sm:py-6">
                  <p className="text-sm sm:text-base font-serif text-brand-bg font-medium">
                    {isAr ? "مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection"}
                  </p>
                  <p className="text-[10px] sm:text-xs font-mono text-champagne uppercase tracking-wider mt-1">
                    {isAr
                      ? "سبائك الذهب • سبائك الفضة • مسكوكات وعملات السبائك"
                      : "Gold Bars • Silver Bars • Mint Bars & Bullion Coins"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

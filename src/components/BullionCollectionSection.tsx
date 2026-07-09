/**
 * Premium homepage video showcase — PGR UAE Bullion Collection.
 * Video is showcase-only; product card posters remain separate WebP assets.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { FileText, Phone } from "lucide-react";

const VIDEO_MP4 = "/videos/pgr-bullion-collection.mp4";
const VIDEO_WEBM = "/videos/pgr-bullion-collection.webm";
const VIDEO_POSTER = "/videos/pgr-bullion-collection-poster.webp";

const WHATSAPP_BASE = "https://wa.me/971559688837";

interface BullionCollectionSectionProps {
  currentLang: "en" | "ar";
  onOpenQuote: () => void;
  onScrollToCatalog?: () => void;
}

export default function BullionCollectionSection({
  currentLang,
  onOpenQuote,
  onScrollToCatalog
}: BullionCollectionSectionProps) {
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
      { rootMargin: "120px", threshold: 0.15 }
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
    ? "مرحباً، أريد التواصل مع ديوان PGR UAE بخصوص مجموعة السبائك."
    : "Hello, I would like to contact the PGR UAE desk about the bullion collection.";
  const waLink = `${WHATSAPP_BASE}?text=${encodeURIComponent(waMsg)}`;

  return (
    <section
      id="bullion-collection"
      className="py-16 md:py-20 px-4 md:px-8 bg-brand-section border-b border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left: headline, copy, CTAs */}
        <div className="space-y-5 order-2 lg:order-1">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif text-text-charcoal font-medium leading-tight">
              {isAr ? "مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection"}
            </h2>
            <p className="text-sm font-mono text-gold-dark uppercase tracking-widest font-bold">
              {isAr
                ? "سبائك الذهب • سبائك الفضة • مسكوكات وعملات السبائك"
                : "Gold Bars • Silver Bars • Mint Bars & Bullion Coins"}
            </p>
          </div>

          <p className="text-sm text-text-secondary font-sans leading-relaxed max-w-lg">
            {isAr
              ? "ديوان تداول سبائك معتمد في دبي — عشرة منتجات فقط، عروض أسعار معتمدة، وتسوية بعد مراجعة الامتثال."
              : "Dubai firm-quote bullion desk — ten approved products, firm quotes, and settlement after compliance review."}
          </p>

          <p className="text-[11px] text-text-secondary font-mono leading-relaxed border-l-2 border-olive-accent pl-3">
            {isAr
              ? "مراجع السوق استرشادية. عروض الأسعار المعتمدة النهائية يؤكدها ديوان PGR UAE وتخضع لحركة السوق ومراجعة الامتثال."
              : "Market references are indicative. Final firm quotes are confirmed by PGR UAE desk and subject to market movement and compliance review."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onOpenQuote}
              className="w-full sm:flex-1 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors"
            >
              <FileText size={14} />
              {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Phone size={14} />
              {isAr ? "ديوان واتساب" : "WhatsApp Quote Desk"}
            </a>
          </div>

          {onScrollToCatalog && (
            <button
              type="button"
              onClick={onScrollToCatalog}
              className="text-xs font-mono text-gold-dark uppercase tracking-widest hover:text-gold-base transition-colors"
            >
              {isAr ? "استعرض معرض المنتجات ←" : "Browse product showroom →"}
            </button>
          )}
        </div>

        {/* Right: premium video frame */}
        <div ref={containerRef} className="order-1 lg:order-2 w-full">
          <div className="relative aspect-video max-h-[280px] sm:max-h-[340px] lg:max-h-none w-full mx-auto lg:mx-0 rounded-3xl border border-soft-border bg-brand-bg shadow-xl overflow-hidden">
            {reduceMotion ? (
              <img
                src={VIDEO_POSTER}
                alt={isAr ? "مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection showcase"}
                className="w-full h-full object-cover"
                loading="lazy"
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
                aria-label={isAr ? "عرض مجموعة سبائك PGR UAE" : "PGR UAE Bullion Collection showcase video"}
              >
                {shouldLoadVideo && (
                  <>
                    <source src={VIDEO_WEBM} type="video/webm" />
                    <source src={VIDEO_MP4} type="video/mp4" />
                  </>
                )}
              </video>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

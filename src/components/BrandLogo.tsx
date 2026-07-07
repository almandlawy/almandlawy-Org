/**
 * PGR monogram — gold & black, minimal institutional mark.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BRAND, BRAND_LOGO_ALT } from "../lib/brand";

export type BrandLogoVariant = "header" | "footer" | "emblem" | "full";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  onClick?: () => void;
  currentLang?: "en" | "ar";
}

function PgrMonogram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="8" fill="#0A0A0A" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="7.5" stroke="#C6A15B" strokeOpacity="0.35" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill="#C6A15B"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="14"
        fontWeight="600"
        letterSpacing="2"
      >
        PGR
      </text>
    </svg>
  );
}

export default function BrandLogo({
  variant = "header",
  className = "",
  onClick,
  currentLang = "en",
}: BrandLogoProps) {
  const Tag = onClick ? "button" : "div";
  const isAr = currentLang === "ar";

  if (variant === "full" || variant === "footer") {
    return (
      <Tag
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`inline-flex shrink-0 items-center gap-3 rounded-lg bg-black border border-champagne/30 px-4 py-3 shadow-sm ${onClick ? "cursor-pointer hover:border-gold-base/40 transition-colors" : ""} ${className}`}
        aria-label={BRAND_LOGO_ALT}
      >
        <PgrMonogram className="h-12 w-12 shrink-0" />
        <span className="flex flex-col leading-none text-start">
          <span className="text-lg font-serif font-semibold tracking-[0.16em] text-white">
            PGR <span className="text-gold-base">UAE</span>
          </span>
          <span className="text-[8px] uppercase tracking-[0.32em] text-champagne/70 mt-1 font-mono">
            {isAr ? BRAND.taglineAr : BRAND.taglineEn}
          </span>
        </span>
      </Tag>
    );
  }

  if (variant === "emblem") {
    return (
      <Tag
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`inline-flex shrink-0 ${onClick ? "cursor-pointer" : ""} ${className}`}
        aria-label={BRAND_LOGO_ALT}
      >
        <PgrMonogram className="h-full w-full max-h-14 max-w-14" />
      </Tag>
    );
  }

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 shrink-0 text-left ${onClick ? "cursor-pointer" : ""} ${className}`}
      aria-label={BRAND_LOGO_ALT}
    >
      <PgrMonogram className="h-10 w-10 md:h-11 md:w-11 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-base md:text-lg font-serif font-semibold tracking-[0.18em] text-text-charcoal">
          PGR <span className="text-gold-base">UAE</span>
        </span>
        <span className="text-[7px] md:text-[8px] uppercase tracking-[0.35em] text-text-secondary mt-1 font-mono">
          {isAr ? BRAND.taglineAr : BRAND.taglineEn}
        </span>
      </span>
    </Tag>
  );
}

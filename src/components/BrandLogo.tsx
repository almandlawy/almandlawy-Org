/**
 * PGR UAE brand mark — original logo assets, transparent background.
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
        className={`inline-flex shrink-0 bg-transparent ${onClick ? "cursor-pointer opacity-95 hover:opacity-100 transition-opacity" : ""} ${className}`}
        aria-label={BRAND_LOGO_ALT}
      >
        <img
          src={BRAND.logoFull}
          alt={BRAND_LOGO_ALT}
          width={200}
          height={267}
          className="h-auto w-[min(200px,65vw)] object-contain"
          loading="eager"
          decoding="async"
        />
      </Tag>
    );
  }

  if (variant === "emblem") {
    return (
      <Tag
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`inline-flex shrink-0 bg-transparent ${onClick ? "cursor-pointer" : ""} ${className}`}
        aria-label={BRAND_LOGO_ALT}
      >
        <img
          src={BRAND.logoEmblem}
          alt=""
          width={48}
          height={48}
          className="h-full w-full max-h-14 max-w-14 object-contain"
          loading="eager"
          decoding="async"
        />
      </Tag>
    );
  }

  // header — emblem + wordmark, no black pill
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 shrink-0 text-left bg-transparent ${onClick ? "cursor-pointer" : ""} ${className}`}
      aria-label={BRAND_LOGO_ALT}
    >
      <img
        src={BRAND.logoEmblem}
        alt=""
        width={44}
        height={44}
        className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 shrink-0 object-contain"
        loading="eager"
        decoding="async"
      />
      <span className="flex flex-col leading-none min-w-0">
        <span className="latin-brand text-sm sm:text-base md:text-lg font-serif font-semibold text-text-charcoal whitespace-nowrap">
          PGR <span className="text-gold-base">UAE</span>
        </span>
        <span
          className={`hidden sm:block text-[8px] md:text-[9px] text-text-secondary mt-1 leading-snug ${
            isAr ? "font-arabic" : "latin-brand-tight font-mono"
          }`}
        >
          {isAr ? BRAND.taglineAr : BRAND.taglineEn}
        </span>
      </span>
    </Tag>
  );
}

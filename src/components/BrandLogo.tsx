/**
 * PGR UAE brand mark — header emblem or full logo.
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

  if (variant === "full" || variant === "footer") {
    return (
      <Tag
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`inline-flex shrink-0 ${onClick ? "cursor-pointer" : ""} ${className}`}
        aria-label={BRAND_LOGO_ALT}
      >
        <img
          src={BRAND.logoFull}
          alt={BRAND_LOGO_ALT}
          width={220}
          height={293}
          className="h-auto w-[min(220px,70vw)] object-contain"
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
        className={`inline-flex shrink-0 ${onClick ? "cursor-pointer" : ""} ${className}`}
        aria-label={BRAND_LOGO_ALT}
      >
        <img
          src={BRAND.logoEmblem}
          alt=""
          width={40}
          height={40}
          className="h-9 w-9 md:h-10 md:w-10 object-contain rounded-sm"
          loading="eager"
          decoding="async"
        />
      </Tag>
    );
  }

  const isAr = currentLang === "ar";

  // header — emblem + wordmark on light background
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 shrink-0 text-left ${onClick ? "cursor-pointer" : ""} ${className}`}
      aria-label={BRAND_LOGO_ALT}
    >
      <img
        src={BRAND.logoEmblem}
        alt=""
        width={40}
        height={40}
        className="h-9 w-9 md:h-10 md:w-10 object-contain rounded-sm"
        loading="eager"
        decoding="async"
      />
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

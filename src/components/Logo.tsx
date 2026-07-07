import React from "react";
import { BRAND, BRAND_LOGO_ALT } from "../lib/brand";

interface LogoProps {
  className?: string;
  showText?: boolean;
  currentLang?: "en" | "ar";
  variant?: "emblem" | "full";
}

export default function Logo({
  className = "w-10 h-10",
  showText = true,
  currentLang = "en",
  variant = "emblem",
}: LogoProps) {
  const isAr = currentLang === "ar";

  if (variant === "full" || !showText) {
    return (
      <div className="flex items-center gap-3 select-none">
        <img
          src={variant === "full" ? BRAND.logoFull : BRAND.logoEmblem}
          alt={BRAND_LOGO_ALT}
          className={showText && variant === "full" ? "h-24 w-auto object-contain" : className}
          loading="eager"
          decoding="async"
        />
        {showText && variant === "full" ? null : !showText ? null : (
          <div className={`flex flex-col ${isAr ? "text-right" : "text-left"}`}>
            <span className="text-white font-serif font-bold text-lg tracking-[0.25em] leading-none uppercase">
              PGR <span className="text-gold-gradient font-extrabold">UAE</span>
            </span>
            <span className="text-[8px] uppercase tracking-[0.45em] text-gray-500 font-mono mt-1 font-semibold leading-none">
              {isAr ? BRAND.taglineAr : BRAND.taglineEn}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 select-none">
      <img
        src={BRAND.logoEmblem}
        alt=""
        className={className}
        loading="eager"
        decoding="async"
      />
      <div className={`flex flex-col ${isAr ? "text-right" : "text-left"}`}>
        <span className="text-white font-serif font-bold text-lg tracking-[0.25em] leading-none uppercase">
          PGR <span className="text-gold-gradient font-extrabold">UAE</span>
        </span>
        <span className="text-[8px] uppercase tracking-[0.45em] text-gray-500 font-mono mt-1 font-semibold leading-none">
          {isAr ? BRAND.taglineAr : BRAND.taglineEn}
        </span>
      </div>
    </div>
  );
}

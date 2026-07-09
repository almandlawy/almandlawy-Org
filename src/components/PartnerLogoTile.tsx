/**
 * Partner logo tile with graceful fallback when image URL fails or is invalid.
 */

import React, { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import type { PartnerLogo } from "../types";

type PartnerPublic = Omit<PartnerLogo, "internal_note">;

function normalizeLogoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;
  return `https://${trimmed}`;
}

function looksLikeImageUrl(url: string): boolean {
  if (!url) return false;
  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return true;
  if (url.includes("supabase.co/storage") || url.includes("blob:")) return true;
  return /^https?:\/\//i.test(url);
}

export function PartnerLogoTile({
  partner,
  isAr,
  className = "",
}: {
  partner: PartnerPublic;
  isAr?: boolean;
  className?: string;
}) {
  const src = normalizeLogoUrl(partner.logo_url || "");
  const [failed, setFailed] = useState(!looksLikeImageUrl(src));

  useEffect(() => {
    setFailed(!looksLikeImageUrl(src));
  }, [src]);

  const showImage = src && !failed;

  return (
    <div
      className={`flex flex-col items-center justify-center p-5 rounded-xl border border-champagne bg-brand-card shadow-premium min-h-[110px] gap-2 ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={partner.name}
          className="max-h-14 sm:max-h-16 max-w-[85%] object-contain"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5 text-center px-2">
          <div className="h-10 w-10 rounded-full bg-gold-base/10 border border-gold-base/25 flex items-center justify-center text-gold-dark">
            {failed && src ? (
              <ImageOff size={16} aria-hidden />
            ) : (
              <span className="text-sm font-serif font-bold">
                {(partner.name || "?").slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-serif font-medium text-text-charcoal leading-tight">
            {partner.name || (isAr ? "شريك" : "Partner")}
          </span>
          {failed && src ? (
            <span className="text-[8px] font-mono text-text-secondary">
              {isAr ? "الصورة غير متاحة" : "Image unavailable"}
            </span>
          ) : null}
        </div>
      )}
      <span className="text-[9px] font-mono text-text-secondary uppercase text-center">
        {partner.category}
      </span>
    </div>
  );
}

export function PartnerLogoPreview({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string;
}) {
  const src = normalizeLogoUrl(logoUrl);
  const [status, setStatus] = useState<"idle" | "ok" | "error">(
    looksLikeImageUrl(src) ? "idle" : "error"
  );

  useEffect(() => {
    setStatus(looksLikeImageUrl(src) ? "idle" : "error");
  }, [src]);

  if (!src) {
    return (
      <p className="text-[10px] text-text-secondary font-mono">
        Enter a direct image URL (.png, .jpg, .webp, .svg)
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-soft-border bg-brand-bg">
      <div className="w-20 h-12 flex items-center justify-center shrink-0">
        {status === "error" ? (
          <span className="text-[10px] font-serif text-text-secondary text-center">{name || "—"}</span>
        ) : (
          <img
            src={src}
            alt={name || "Preview"}
            className="max-h-12 max-w-full object-contain"
            referrerPolicy="no-referrer"
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("error")}
          />
        )}
      </div>
      <p
        className={`text-[10px] font-mono ${
          status === "ok" ? "text-olive-accent" : status === "error" ? "text-red-600" : "text-text-secondary"
        }`}
      >
        {status === "ok"
          ? "Preview OK — will show on site"
          : status === "error"
            ? "Image failed — use a direct link ending in .png/.jpg/.webp or Supabase Storage URL"
            : "Loading preview…"}
      </p>
    </div>
  );
}

export { normalizeLogoUrl, looksLikeImageUrl };

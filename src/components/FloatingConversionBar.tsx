/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Mobile-first sticky conversion bar — Account + Quote + WhatsApp.
 */

import React from "react";
import { FileText, User, LogIn } from "lucide-react";
import { buildWhatsAppLink, defaultDeskMessage } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";

interface FloatingConversionBarProps {
  currentLang: "en" | "ar";
  onOpenQuote: () => void;
  onOpenAccount?: () => void;
  isLoggedIn?: boolean;
  whatsappMessage?: string;
  trackingSource?: string;
}

export default function FloatingConversionBar({
  currentLang,
  onOpenQuote,
  onOpenAccount,
  isLoggedIn = false,
  whatsappMessage,
  trackingSource = "floating_fab",
}: FloatingConversionBarProps) {
  const isAr = currentLang === "ar";
  const href = buildWhatsAppLink(whatsappMessage || defaultDeskMessage(currentLang));
  const AccountIcon = isLoggedIn ? User : LogIn;

  const accountLabel = isLoggedIn ? (isAr ? "حسابي" : "Account") : isAr ? "دخول" : "Login";
  const quoteLabel = isAr ? "طلب عرض" : "Get Quote";

  const waBtn = (
    <a
      key="wa"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick("floating_fab_mobile")}
      className="mobile-cta-btn bg-emerald-600 hover:bg-emerald-500 text-white latin-brand-tight"
      aria-label={isAr ? "واتساب" : "WhatsApp"}
    >
      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.015 14.113.99 11.48.99c-5.437 0-9.863 4.37-9.868 9.799-.001 1.77.475 3.493 1.378 5.017l-.972 3.548 3.639-.949zM15.75 12.83c-.279-.139-1.647-.812-1.9-1.04-.253-.115-.438-.174-.621.115-.185.289-.713.89-.873 1.077-.159.186-.319.21-.599.07-.28-.14-1.18-.43-2.246-1.38-.83-.741-1.39-1.657-1.554-1.938-.163-.28-.017-.431.122-.571.125-.127.28-.323.419-.485.14-.162.18-.279.279-.465.1-.186.05-.349-.02-.489-.07-.139-.62-1.49-.85-2.04-.224-.54-.47-.465-.62-.473-.15-.008-.323-.01-.497-.01-.174 0-.458.065-.697.325-.24.26-.915.894-.915 2.182 0 1.288.937 2.532 1.068 2.71.13.178 1.841 2.81 4.46 3.94.622.269 1.108.43 1.488.55.626.198 1.196.17 1.645.104.5-.074 1.647-.674 1.881-1.325.234-.65.234-1.207.164-1.325-.07-.11-.26-.18-.54-.319z" />
      </svg>
      <span>WhatsApp</span>
    </a>
  );

  const quoteBtn = (
    <button
      key="quote"
      type="button"
      onClick={onOpenQuote}
      className="mobile-cta-btn bg-gold-base hover:bg-gold-dark text-text-charcoal"
    >
      <FileText size={16} className="shrink-0" />
      <span>{quoteLabel}</span>
    </button>
  );

  const accountBtn = onOpenAccount ? (
    <button
      key="account"
      type="button"
      onClick={onOpenAccount}
      className={`mobile-cta-btn border ${
        isLoggedIn
          ? "bg-gold-base/20 text-gold-dark border-gold-base/30"
          : "bg-brand-section text-text-charcoal border-soft-border"
      }`}
      aria-label={accountLabel}
    >
      <AccountIcon size={16} className="shrink-0" />
      <span>{accountLabel}</span>
    </button>
  ) : null;

  const ctaItems = isAr
    ? [accountBtn, quoteBtn, waBtn].filter(Boolean)
    : [waBtn, quoteBtn, accountBtn].filter(Boolean);

  return (
    <>
      <div
        className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-soft-border bg-brand-card/98 backdrop-blur-md px-2 py-2 safe-area-pb"
        style={{ direction: isAr ? "rtl" : "ltr" }}
      >
        <div className="mobile-cta-grid max-w-lg mx-auto">{ctaItems}</div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick("floating_fab_desktop")}
        aria-label={isAr ? "تواصل مع PGR UAE عبر واتساب" : "Contact PGR UAE on WhatsApp"}
        className="hidden md:flex fixed bottom-6 end-6 z-40 h-12 w-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
        title={isAr ? "واتساب" : "WhatsApp"}
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden>
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.015 14.113.99 11.48.99c-5.437 0-9.863 4.37-9.868 9.799-.001 1.77.475 3.493 1.378 5.017l-.972 3.548 3.639-.949zM15.75 12.83c-.279-.139-1.647-.812-1.9-1.04-.253-.115-.438-.174-.621.115-.185.289-.713.89-.873 1.077-.159.186-.319.21-.599.07-.28-.14-1.18-.43-2.246-1.38-.83-.741-1.39-1.657-1.554-1.938-.163-.28-.017-.431.122-.571.125-.127.28-.323.419-.485.14-.162.18-.279.279-.465.1-.186.05-.349-.02-.489-.07-.139-.62-1.49-.85-2.04-.224-.54-.47-.465-.62-.473-.15-.008-.323-.01-.497-.01-.174 0-.458.065-.697.325-.24.26-.915.894-.915 2.182 0 1.288.937 2.532 1.068 2.71.13.178 1.841 2.81 4.46 3.94.622.269 1.108.43 1.488.55.626.198 1.196.17 1.645.104.5-.074 1.647-.674 1.881-1.325.234-.65.234-1.207.164-1.325-.07-.11-.26-.18-.54-.319z" />
        </svg>
      </a>
    </>
  );
}

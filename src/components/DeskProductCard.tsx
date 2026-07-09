/**
 * Luxury desk product card — catalog display with quote + WhatsApp CTAs (no cart).
 */

import React from "react";
import { motion } from "motion/react";
import { FileText, Phone, ShieldCheck } from "lucide-react";
import { Product } from "../types";

interface DeskProductCardProps {
  product: Product;
  isAr: boolean;
  imageSrc: string;
  rankLabel?: { en: string; ar: string };
  brandLabel?: string;
  priceBlock?: React.ReactNode;
  priceStatusLabel?: string;
  whatsappHref: string;
  onSelect: () => void;
  onOpenQuote: () => void;
  onWhatsAppClick: () => void;
  index?: number;
  compact?: boolean;
  /** Richer motion for Iraq offers showcase */
  offerAnimated?: boolean;
  isTopOffer?: boolean;
}

export default function DeskProductCard({
  product,
  isAr,
  imageSrc,
  rankLabel,
  brandLabel,
  priceBlock,
  priceStatusLabel,
  whatsappHref,
  onSelect,
  onOpenQuote,
  onWhatsAppClick,
  index = 0,
  compact = false,
  offerAnimated = false,
  isTopOffer = false,
}: DeskProductCardProps) {
  const name = isAr ? product.name_ar : product.name_en;

  const entrance = offerAnimated
    ? {
        initial: { opacity: 0, y: 28, scale: 0.96 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        transition: {
          duration: 0.55,
          delay: index * 0.12,
          ease: [0.16, 1, 0.3, 1] as const,
        },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <motion.article
      initial={entrance.initial}
      whileInView={entrance.whileInView}
      viewport={{ once: true, margin: "-40px" }}
      transition={entrance.transition}
      whileHover={offerAnimated ? { y: -8, scale: 1.01 } : { y: -4 }}
      className={`relative bg-brand-card rounded-lg border-2 overflow-hidden flex flex-col h-full desk-card ${
        offerAnimated
          ? "offer-card-hover border-gold-base/40 hover:border-gold-base shadow-premium hover:shadow-xl"
          : "border-gold-base/25 hover:shadow-xl hover:border-gold-base/60"
      } transition-colors duration-300`}
    >
      {rankLabel && (
        <motion.div
          initial={offerAnimated ? { opacity: 0, y: -8 } : false}
          whileInView={offerAnimated ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ delay: index * 0.12 + 0.15, duration: 0.4 }}
          className={`absolute top-0 left-0 right-0 bg-gold-base text-text-charcoal text-center py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest z-10 ${
            isTopOffer && offerAnimated ? "offer-rank-pulse" : ""
          }`}
        >
          {isAr ? rankLabel.ar : rankLabel.en}
        </motion.div>
      )}

      <button
        type="button"
        onClick={onSelect}
        className={`${compact ? "pt-6 pb-3 px-4" : "pt-10 pb-4 px-6"} flex flex-col flex-1 text-left w-full ${isAr ? "text-right" : "text-left"}`}
      >
        <motion.div
          whileHover={offerAnimated ? { scale: 1.02 } : undefined}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`${compact ? "h-28" : "h-40"} flex items-center justify-center mb-3 bg-brand-section rounded border border-soft-border/40 overflow-hidden group relative`}
        >
          {offerAnimated && (
            <div className="absolute inset-0 shimmer-mask-gold pointer-events-none opacity-60" />
          )}
          <motion.img
            src={imageSrc}
            alt={name}
            loading="lazy"
            whileHover={{ scale: offerAnimated ? 1.08 : 1.05 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full object-contain relative z-[1]"
          />
        </motion.div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-olive-accent shrink-0" />
            <span className="text-[10px] font-mono text-gold-dark uppercase tracking-wider font-bold">
              {brandLabel || product.brand || product.manufacturer}
            </span>
          </div>

          <h3 className={`${compact ? "text-base" : "text-lg"} font-serif text-text-charcoal font-medium leading-snug`}>
            {name}
          </h3>

          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-text-secondary">
            <span className="px-2 py-0.5 bg-brand-section rounded border border-soft-border/50">
              {product.weight_label}
            </span>
            <span className="px-2 py-0.5 bg-brand-section rounded border border-soft-border/50">
              {product.purity.split(" ")[0]}
            </span>
            <span className="px-2 py-0.5 bg-brand-section rounded border border-soft-border/50">
              {isAr ? "الإمارات" : "UAE"}
            </span>
          </div>
        </div>

        {(priceBlock || priceStatusLabel) && (
          <motion.div
            initial={offerAnimated ? { opacity: 0, y: 8 } : false}
            whileInView={offerAnimated ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 + 0.25, duration: 0.45 }}
            className="mt-4 pt-4 border-t border-soft-border/60 space-y-2 w-full"
          >
            {priceStatusLabel && (
              <p className="text-[10px] text-text-secondary font-mono uppercase">{priceStatusLabel}</p>
            )}
            {priceBlock}
          </motion.div>
        )}
      </button>

      <div className="p-4 pt-0 flex flex-col gap-2 mt-auto">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuote();
          }}
          className="w-full py-2.5 btn-desk-primary text-[10px]"
        >
          <FileText size={12} />
          {isAr ? "طلب عرض سعر" : "Request Quote"}
        </motion.button>
        <motion.a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onWhatsAppClick();
          }}
          className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-colors flex items-center justify-center gap-1.5"
        >
          <Phone size={12} />
          {isAr ? "واتساب" : "WhatsApp"}
        </motion.a>
      </div>
    </motion.article>
  );
}

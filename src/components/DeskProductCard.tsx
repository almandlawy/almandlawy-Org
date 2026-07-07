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
}: DeskProductCardProps) {
  const name = isAr ? product.name_ar : product.name_en;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="relative bg-brand-card rounded-lg border-2 border-gold-base/25 hover:shadow-xl hover:border-gold-base/60 transition-colors duration-300 overflow-hidden flex flex-col h-full desk-card"
    >
      {rankLabel && (
        <div className="absolute top-0 left-0 right-0 bg-gold-base text-text-charcoal text-center py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest z-10">
          {isAr ? rankLabel.ar : rankLabel.en}
        </div>
      )}

      <button
        type="button"
        onClick={onSelect}
        className={`pt-10 pb-4 px-6 flex flex-col flex-1 text-left w-full ${isAr ? "text-right" : "text-left"}`}
      >
        <div className="h-40 flex items-center justify-center mb-4 bg-brand-section rounded border border-soft-border/40 overflow-hidden group">
          <img
            src={imageSrc}
            alt={name}
            className="h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-olive-accent shrink-0" />
            <span className="text-[10px] font-mono text-gold-dark uppercase tracking-wider font-bold">
              {brandLabel || product.brand || product.manufacturer}
            </span>
          </div>

          <h3 className="text-lg font-serif text-text-charcoal font-medium leading-snug">{name}</h3>

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
          <div className="mt-4 pt-4 border-t border-soft-border/60 space-y-2 w-full">
            {priceStatusLabel && (
              <p className="text-[10px] text-text-secondary font-mono uppercase">{priceStatusLabel}</p>
            )}
            {priceBlock}
          </div>
        )}
      </button>

      <div className="p-4 pt-0 flex flex-col gap-2 mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuote();
          }}
          className="w-full py-2.5 btn-desk-primary text-[10px]"
        >
          <FileText size={12} />
          {isAr ? "طلب عرض سعر" : "Request Quote"}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onWhatsAppClick();
          }}
          className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-all flex items-center justify-center gap-1.5"
        >
          <Phone size={12} />
          {isAr ? "واتساب" : "WhatsApp"}
        </a>
      </div>
    </motion.article>
  );
}

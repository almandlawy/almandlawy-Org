/**
 * Institutional desk services — wholesale quote desk positioning (not ecommerce).
 */

import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Coins, Package, Shield, Undo2 } from "lucide-react";
import { DESK_SERVICES } from "../lib/deskServices";

interface DeskServicesSectionProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

const ICONS = {
  wholesale: Coins,
  storage: Package,
  minting: Shield,
  sellback: Undo2,
} as const;

export default function DeskServicesSection({
  currentLang,
  onNavigate,
}: DeskServicesSectionProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      id="desk-services"
      className="py-16 md:py-20 px-4 md:px-8 bg-brand-section border-y border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="desk-section-label">
            {isAr ? "خدمات المكتب" : "Desk Services"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-text-charcoal font-medium">
            {isAr ? "مكتب سبائك مؤسسي في دبي" : "Institutional Bullion Desk in Dubai"}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {isAr
              ? "تسعير مؤكد من المكتب، امتثال، تخزين، وتوريد — بدون متجر إلكتروني تقليدي أو دفع مباشر."
              : "Desk-confirmed pricing, compliance, storage, and sourcing — not a traditional checkout store."}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DESK_SERVICES.map((service, index) => {
            const Icon = ICONS[service.icon];
            return (
              <motion.article
                key={service.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="desk-card p-5 flex flex-col gap-4 h-full"
              >
                <div className="h-10 w-10 rounded-lg bg-gold-base/15 border border-gold-base/25 flex items-center justify-center text-gold-dark">
                  <Icon size={18} />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-base font-serif text-text-charcoal font-medium">
                    {isAr ? service.titleAr : service.titleEn}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {isAr ? service.bodyAr : service.bodyEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(service.path)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-gold-dark hover:text-gold-base transition-colors"
                >
                  {isAr ? service.ctaAr : service.ctaEn}
                  {isAr ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

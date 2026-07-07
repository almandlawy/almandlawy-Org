/**
 * Rich editorial sections for gold/silver desk pages + FAQ schema injection.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Phone, FileText } from "lucide-react";
import { DeskContentSection, DeskFaq } from "../lib/deskPageContent";
import { categoryWhatsAppLink } from "../lib/categoryWhatsApp";
import { trackWhatsAppClick } from "../lib/gtag";

interface DeskRichContentProps {
  currentLang: "en" | "ar";
  category: "gold_bars" | "silver_bars";
  introEn: string;
  introAr: string;
  weightsEn: string;
  weightsAr: string;
  purityEn: string;
  purityAr: string;
  brandsEn?: string;
  brandsAr?: string;
  sections: DeskContentSection[];
  faqs: DeskFaq[];
  onNavigate: (path: string) => void;
  onOpenQuote: () => void;
  pagePath: string;
}

export default function DeskRichContent({
  currentLang,
  category,
  introEn,
  introAr,
  weightsEn,
  weightsAr,
  purityEn,
  purityAr,
  brandsEn,
  brandsAr,
  sections,
  faqs,
  onNavigate,
  onOpenQuote,
  pagePath,
}: DeskRichContentProps) {
  const isAr = currentLang === "ar";
  const waLink = categoryWhatsAppLink(category, currentLang);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: isAr ? f.qAr : f.qEn,
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr ? f.aAr : f.aEn,
        },
      })),
    };
    const id = `desk-faq-schema-${pagePath.replace(/\//g, "")}`;
    const existing = document.getElementById(id);
    existing?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => document.getElementById(id)?.remove();
  }, [faqs, isAr, pagePath]);

  return (
    <div className="space-y-10">
      <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
        {isAr ? introAr : introEn}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: isAr ? "الأوزان" : "Available weights", value: isAr ? weightsAr : weightsEn },
          { label: isAr ? "النقاوة" : "Purity", value: isAr ? purityAr : purityEn },
          ...(brandsEn
            ? [{ label: isAr ? "المصافي" : "Brands/Refiners", value: isAr ? brandsAr : brandsEn }]
            : []),
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-lg border border-soft-border bg-brand-card">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gold-dark font-bold">{item.label}</p>
            <p className="text-xs text-text-charcoal mt-1 leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>

      {sections.map((sec) => (
        <section key={sec.h2En} className="space-y-3 max-w-3xl">
          <h2 className="text-xl font-serif text-text-charcoal font-medium">
            {isAr ? sec.h2Ar : sec.h2En}
          </h2>
          {(isAr ? sec.paragraphsAr : sec.paragraphsEn).map((p, i) => (
            <p key={i} className="text-sm text-text-secondary leading-relaxed">
              {p}
            </p>
          ))}
        </section>
      ))}

      <section className="space-y-4">
        <h2 className="text-xl font-serif text-text-charcoal font-medium">
          {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-3 max-w-3xl">
          {faqs.map((faq) => (
            <article key={faq.qEn} className="p-4 rounded-lg border border-soft-border bg-brand-card">
              <h3 className="text-sm font-medium text-text-charcoal">{isAr ? faq.qAr : faq.qEn}</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">{isAr ? faq.aAr : faq.aEn}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-soft-border">
        <button
          type="button"
          onClick={onOpenQuote}
          className="px-6 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={14} />
          {isAr ? "طلب عرض سعر" : "Request Quote"}
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick(`${category}_page_whatsapp`)}
          className="px-6 py-3.5 border border-soft-border hover:border-emerald-600/40 bg-brand-card font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
        >
          <Phone size={14} />
          {isAr ? "واتساب المكتب" : "WhatsApp Quote Desk"}
        </a>
        <button
          type="button"
          onClick={() => onNavigate("/iraq-bullion-quote")}
          className="px-6 py-3.5 text-text-secondary hover:text-gold-dark font-mono text-xs uppercase tracking-widest transition-colors"
        >
          {isAr ? "مكتب عروض العراق ←" : "Iraq Quote Desk →"}
        </button>
      </div>
    </div>
  );
}

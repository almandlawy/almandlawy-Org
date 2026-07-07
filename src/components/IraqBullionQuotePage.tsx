/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Iraq-focused bullion quote landing page — Google Ads & SEO safe copy.
 */

import React, { useEffect, useState } from "react";
import {
  Shield,
  FileText,
  Phone,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Package
} from "lucide-react";
import PricingDisclaimer from "./PricingDisclaimer";
import {
  IRAQ_BULLION_FAQ_AR,
  IRAQ_BULLION_FAQ_EN,
  buildIraqFaqJsonLd
} from "../lib/iraqBullionFaq";

import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";
import { IRAQ_EXTRA_SECTIONS } from "../lib/deskPageContent";

interface IraqBullionQuotePageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

const SECTIONS_EN = [
  {
    icon: Package,
    title: "Physical gold and silver only",
    body: "PGR UAE handles physical gold bars, silver bars, and bullion coins sourced from accredited refineries. No paper products or speculative instruments."
  },
  {
    icon: Phone,
    title: "Request quote by WhatsApp or form",
    body: "Iraqi customers can request a desk-confirmed quote via WhatsApp Quote Desk or the firm quote request form."
  },
  {
    icon: FileText,
    title: "Indicative price vs final desk-confirmed quote",
    body: "Any market reference on this site is indicative only. Your final quote is issued by the PGR UAE desk after product and compliance review."
  },
  {
    icon: Shield,
    title: "KYC / compliance review",
    body: "Orders may require identity verification and AML review before payment and dispatch. Requirements depend on order profile and applicable rules."
  },
  {
    icon: MapPin,
    title: "Dubai sourcing and Iraq customer support",
    body: "Products are sourced through PGR UAE in Dubai. Iraqi customer coordination, documentation, and collection or delivery options are arranged after desk confirmation."
  }
];

const SECTIONS_AR = [
  {
    icon: Package,
    title: "ذهب وفضة مادية فقط",
    body: "يتعامل PGR UAE مع سبائك ذهب وفضة وعملات سبائك مادية من مصافٍ معتمدة. لا منتجات ورقية ولا أدوات مضاربة."
  },
  {
    icon: Phone,
    title: "طلب عرض سعر عبر واتساب أو النموذج",
    body: "يمكن للعملاء العراقيين طلب عرض سعر مؤكد من المكتب عبر واتساب أو نموذج طلب عرض السعر."
  },
  {
    icon: FileText,
    title: "السعر الإرشادي مقابل عرض السعر المؤكد من المكتب",
    body: "أي مرجع سوقي على هذا الموقع إرشادي فقط. يصدر عرض السعر النهائي من مكتب PGR UAE بعد مراجعة المنتج والامتثال."
  },
  {
    icon: Shield,
    title: "مراجعة KYC والامتثال",
    body: "قد تتطلب الطلبات التحقق من الهوية ومراجعة AML قبل الدفع والتسليم. تعتمد المتطلبات على ملف الطلب والأنظمة المعمول بها."
  },
  {
    icon: MapPin,
    title: "توريد من دبي ودعم العملاء العراقيين",
    body: "يتم توريد المنتجات عبر PGR UAE في دبي. يتم تنسيق دعم العملاء العراقيين والمستندات وخيارات الاستلام أو التوصيل بعد تأكيد المكتب."
  }
];

export default function IraqBullionQuotePage({
  currentLang,
  onNavigate
}: IraqBullionQuotePageProps) {
  const isAr = currentLang === "ar";
  const sections = isAr ? SECTIONS_AR : SECTIONS_EN;
  const faqs = isAr ? IRAQ_BULLION_FAQ_AR : IRAQ_BULLION_FAQ_EN;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const scriptId = "pgr-iraq-faq-schema";
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = scriptId;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(buildIraqFaqJsonLd());
    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, []);

  const waText = isAr
    ? "مرحباً، أنا عميل عراقي وأريد طلب عرض سعر مؤكد لسبائك الذهب أو الفضة من PGR UAE."
    : "Hello, I am an Iraqi customer and would like to request a desk-confirmed quote for physical gold or silver bullion from PGR UAE.";
  const waLink = buildWhatsAppLink(waText);

  return (
    <div className="space-y-16" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <header className="space-y-5 max-w-3xl">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
          {isAr ? "العراق · دبي" : "Iraq · Dubai"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-text-charcoal font-medium leading-tight">
          {isAr
            ? "عروض أسعار سبائك الذهب والفضة للعملاء العراقيين"
            : "Gold & Silver Bullion Quotes for Iraqi Customers"}
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          {isAr
            ? "اطلب عروض أسعار مؤكدة لسبائك الذهب والفضة وعملات السبائك المادية. يخدم PGR UAE العملاء العراقيين بتسعير مؤكد من المكتب ومراجعة الامتثال وخيارات الاستلام أو التوصيل المرتبة."
            : "Request confirmed quotes for physical gold bars, silver bars and bullion coins. PGR UAE serves Iraqi customers with desk-confirmed pricing, compliance review, and arranged collection or delivery options."}
        </p>
        <PricingDisclaimer currentLang={currentLang} />
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate("/request-quote")}
            className="px-6 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={14} />
            {isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("iraq_bullion_page_whatsapp")}
            className="px-6 py-3.5 bg-panel-dark hover:bg-panel-charcoal text-brand-bg font-mono text-xs font-bold uppercase tracking-widest rounded border border-champagne/30 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={14} />
            {isAr ? "واتساب المكتب" : "WhatsApp Quote Desk"}
          </a>
        </div>
      </header>

      {(isAr ? IRAQ_EXTRA_SECTIONS.ar : IRAQ_EXTRA_SECTIONS.en).map((block) => (
        <section key={block.h2} className="max-w-3xl space-y-3">
          <h2 className="text-xl font-serif text-text-charcoal font-medium">{block.h2}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{block.body}</p>
        </section>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="p-5 rounded-lg border border-soft-border bg-brand-card space-y-2"
          >
            <div className="flex items-center gap-2 text-gold-dark">
              <Icon size={16} />
              <h2 className="text-sm font-serif font-medium text-text-charcoal">{title}</h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
          </article>
        ))}
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-text-charcoal font-medium">
          {isAr ? "الأسئلة الشائعة للمشترين العراقيين" : "FAQ for Iraqi Buyers"}
        </h2>
        <div className="space-y-2">
          {faqs.map((item, idx) => (
            <div
              key={item.q}
              className="border border-soft-border rounded-lg bg-brand-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-text-charcoal">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-gold-dark transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                />
              </button>
              {openFaq === idx && (
                <p className="px-4 pb-4 text-xs text-text-secondary leading-relaxed border-t border-soft-border pt-3">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
        {[
          isAr ? "سبائك مادية" : "Physical bullion",
          isAr ? "طلب عرض سعر" : "Request quote",
          isAr ? "سعر مؤكد من المكتب" : "Desk-confirmed price",
          isAr ? "مرجع سوقي إرشادي" : "Market reference"
        ].map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-gold-base" />
            {tag}
          </span>
        ))}
      </div>

      <section className="rounded-xl border border-soft-border bg-brand-card p-6 sm:p-8 space-y-5 text-center">
        <h2 className="text-xl font-serif text-text-charcoal font-medium">
          {isAr ? "جاهز لطلب عرض سعر؟" : "Ready to request a quote?"}
        </h2>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          {isAr
            ? "أرسل نموذج طلب عرض السعر أو تواصل مباشرة مع مكتب واتساب PGR UAE في دبي."
            : "Submit the quote request form or contact the PGR UAE WhatsApp quote desk in Dubai directly."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <button
            type="button"
            onClick={() => onNavigate("/request-quote")}
            className="px-6 py-3.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={14} />
            {isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("iraq_bullion_page_bottom_whatsapp")}
            className="px-6 py-3.5 bg-panel-dark hover:bg-panel-charcoal text-brand-bg font-mono text-xs font-bold uppercase tracking-widest rounded border border-champagne/30 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={14} />
            {isAr ? "واتساب المكتب" : "WhatsApp Quote Desk"}
          </a>
        </div>
      </section>
    </div>
  );
}

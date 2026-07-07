/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Post-submit thank-you page — used for Google Ads conversion URL tracking.
 */

import React, { useEffect } from "react";
import { CheckCircle2, Phone, ArrowLeft, ArrowRight, Home } from "lucide-react";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackWhatsAppClick } from "../lib/gtag";
import PricingDisclaimer from "./PricingDisclaimer";

interface QuoteReceivedPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

export default function QuoteReceivedPage({ currentLang, onNavigate }: QuoteReceivedPageProps) {
  const isAr = currentLang === "ar";

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const inquiryId = params.get("ref") || "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const waHref = buildWhatsAppLink(
    isAr
      ? `مرحباً، أرسلت طلب عرض سعر${inquiryId ? ` (REF: ${inquiryId})` : ""}. أريد متابعة الطلب.`
      : `Hello, I submitted a quote request${inquiryId ? ` (REF: ${inquiryId})` : ""}. I would like to follow up.`
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="rounded-xl border border-gold-base/30 bg-brand-card p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-olive-accent font-bold">
            {isAr ? "تم استلام الطلب" : "Request received"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "شكراً — طلبك وصل إلى ديوان PGR UAE" : "Thank you — your request reached PGR UAE desk"}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            {isAr
              ? "سيراجع المكتب التوفر ويتواصل معك على واتساب بعرض سعر مؤكد بعد مراجعة الامتثال."
              : "The desk will review availability and contact you on WhatsApp with a firm quote after compliance review."}
          </p>
          {inquiryId && (
            <p className="text-sm font-mono text-gold-dark font-bold tracking-wider">
              REF: {inquiryId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("quote_received_page")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-panel-dark hover:bg-panel-charcoal text-brand-bg text-xs font-mono font-bold uppercase tracking-widest transition-colors"
          >
            <Phone size={14} />
            {isAr ? "متابعة عبر واتساب" : "Follow up on WhatsApp"}
          </a>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-soft-border bg-brand-bg text-text-charcoal text-xs font-mono font-bold uppercase tracking-widest hover:bg-brand-card transition-colors"
          >
            <Home size={14} />
            {isAr ? "العودة للرئيسية" : "Back to home"}
          </button>
        </div>
      </div>

      <PricingDisclaimer currentLang={currentLang} />

      <button
        type="button"
        onClick={() => onNavigate("/iraq-bullion-quote")}
        className="flex items-center gap-2 text-text-secondary hover:text-text-charcoal transition-colors text-xs font-mono uppercase tracking-wider mx-auto"
      >
        {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
        {isAr ? "عروض سبائك العراق" : "Iraq bullion offers"}
      </button>
    </div>
  );
}

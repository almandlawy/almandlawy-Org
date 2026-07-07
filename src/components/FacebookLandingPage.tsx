/**
 * Facebook traffic landing — quote desk CTAs with attribution capture.
 */

import React, { useEffect } from "react";
import { FileText, Phone, Shield, Truck } from "lucide-react";
import BrandLogo from "./BrandLogo";
import PricingDisclaimer from "./PricingDisclaimer";
import { captureAttributionFromUrl, appendAttributionToPath } from "../lib/attribution";
import { FACEBOOK_WHATSAPP } from "../lib/facebookLinks";
import { trackWhatsAppClick } from "../lib/gtag";

interface FacebookLandingPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

export default function FacebookLandingPage({
  currentLang,
  onNavigate,
}: FacebookLandingPageProps) {
  const isAr = currentLang === "ar";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("utm_source")) {
      const next = new URL(window.location.href);
      next.searchParams.set("utm_source", "facebook");
      next.searchParams.set("utm_medium", "organic_social");
      next.searchParams.set("utm_campaign", "facebook_landing");
      window.history.replaceState(null, "", next.pathname + next.search);
    }
    captureAttributionFromUrl(window.location.search, "/facebook");
  }, []);

  const waHref = isAr ? FACEBOOK_WHATSAPP.arGeneral : FACEBOOK_WHATSAPP.general;

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <BrandLogo variant="emblem" className="h-16 w-16 mx-auto" />
      <div className="space-y-3">
        <p className="desk-section-label">{isAr ? "من فيسبوك" : "From Facebook"}</p>
        <h1 className="text-3xl sm:text-4xl font-serif text-text-charcoal font-medium">
          {isAr ? "مكتب عروض سبائك PGR UAE" : "PGR UAE Bullion Quote Desk"}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          {isAr
            ? "ذهب وفضة مادي في دبي — اطلب عرض سعر معتمد عبر واتساب أو النموذج. مرجع سوقي استرشادي على الموقع. السعر النهائي يؤكده المكتب."
            : "Physical gold & silver in Dubai — request a firm desk-confirmed quote via WhatsApp or our form. Indicative market reference on site."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {[
          { icon: FileText, en: "Desk-confirmed quote", ar: "عرض سعر معتمد" },
          { icon: Shield, en: "KYC-ready desk", ar: "امتثال KYC" },
          { icon: Truck, en: "Iraq logistics quotes", ar: "عروض توصيل العراق" },
        ].map(({ icon: Icon, en, ar }) => (
          <div key={en} className="desk-card p-4 flex items-center gap-3">
            <Icon size={16} className="text-gold-dark shrink-0" />
            <span className="text-xs font-sans text-text-secondary">{isAr ? ar : en}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => onNavigate(appendAttributionToPath("/request-quote"))}
          className="btn-desk-primary min-h-[48px] text-[11px]"
        >
          <FileText size={14} />
          {isAr ? "طلب عرض سعر معتمد" : "Request Firm Quote"}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("facebook_landing")}
          className="min-h-[48px] px-6 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors"
        >
          <Phone size={14} />
          {isAr ? "واتساب المكتب" : "WhatsApp Desk"}
        </a>
      </div>

      <p className="text-[10px] text-text-secondary/80 font-mono leading-relaxed">
        {isAr
          ? "ليس متجر دفع مباشر. ليس استشارة مالية. حسب التوفر ومراجعة KYC."
          : "Not a checkout store. Not financial advice. Subject to availability & KYC review."}
      </p>

      <PricingDisclaimer currentLang={currentLang} compact />
    </div>
  );
}

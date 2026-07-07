/**
 * About PGR UAE Quote Desk — institutional trust section.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MapPin, Clock, Mail, Phone, Shield } from "lucide-react";

interface AboutQuoteDeskSectionProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

export default function AboutQuoteDeskSection({ currentLang, onNavigate }: AboutQuoteDeskSectionProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      id="about"
      className="py-16 md:py-20 bg-brand-card border-y border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-gold-dark font-bold">
              {isAr ? "من نحن" : "About Us"}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-text-charcoal font-medium">
              {isAr ? "عن مكتب PGR UAE لعروض الأسعار" : "About PGR UAE Quote Desk"}
            </h2>

            <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
              <p>
                {isAr
                  ? "PGR UAE مكتب عروض أسعار للسبائك المادية مقره دبي. نساعد العملاء في الإمارات والعراق وخارجها على طلب عروض أسعار مؤكدة للذهب والفضة — دون بيع مباشر عبر السلة أو ضمان عوائد."
                  : "PGR UAE is a Dubai-based physical bullion quote desk. We help customers in the UAE, Iraq, and internationally request desk-confirmed quotes for gold and silver — without cart checkout or return guarantees."}
              </p>
              <p>
                {isAr
                  ? "المنتجات: سبائك ذهب وفضة، عملات سبائك، وتوريد مخصص حسب التوفر. طريقة العمل: تقديم طلب عرض سعر، مراجعة امتثال عند الحاجة، ثم تأكيد السعر والتوفر والتسليم من المكتب."
                  : "Products: gold bars, silver bars, bullion coins, and custom sourcing subject to availability. Process: submit a quote request, compliance review when required, then desk confirmation of price, availability, and delivery."}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-soft-border bg-brand-bg text-xs text-text-secondary leading-relaxed flex gap-3">
              <Shield size={16} className="text-gold-dark shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? "ملاحظة امتثال: الأسعار المعروضة مرجع سوقي استرشادي. لا نقدم نصائح استثمارية. عرض السعر النهائي يصدر من المكتب بعد المراجعة."
                  : "Compliance note: displayed prices are indicative market references only. We do not provide investment advice. Final quotes are issued by the desk after review."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-serif text-text-charcoal font-medium">
              {isAr ? "بيانات التواصل وساعات العمل" : "Contact & Desk Hours"}
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={16} className="text-gold-dark shrink-0 mt-0.5" />
                <span className="text-text-secondary">
                  {isAr
                    ? "دبي، الإمارات العربية المتحدة — مكتب عروض السبائك"
                    : "Dubai, United Arab Emirates — Bullion Quote Desk"}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="text-gold-dark shrink-0 mt-0.5" />
                <a href="tel:+971559688837" className="text-text-charcoal hover:text-gold-dark font-mono font-bold">
                  +971 55 968 8837
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="text-gold-dark shrink-0 mt-0.5" />
                <a href="mailto:desk@pgruae.com" className="text-text-charcoal hover:text-gold-dark">
                  desk@pgruae.com
                </a>
              </li>
              <li className="flex gap-3">
                <Clock size={16} className="text-gold-dark shrink-0 mt-0.5" />
                <span className="text-text-secondary">
                  {isAr
                    ? "الأحد – الخميس · ٩:٠٠ – ١٨:٠٠ (توقيت دبي) · واتساب خارج الساعات"
                    : "Sun – Thu · 9:00 – 18:00 (Dubai time) · WhatsApp outside hours"}
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate("/request-quote")}
                className="px-5 py-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
              >
                {isAr ? "طلب عرض سعر" : "Request Quote"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("/contact")}
                className="px-5 py-2.5 border border-soft-border hover:border-gold-base text-text-charcoal font-mono text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
              >
                {isAr ? "اتصل بنا" : "Contact"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

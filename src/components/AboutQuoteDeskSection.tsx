/**
 * About PGR UAE Quote Desk — compact trust section.
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
      className="py-12 md:py-14 bg-brand-card border-y border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <p
              className={`text-[10px] text-gold-dark font-bold ${
                isAr ? "font-arabic" : "latin-brand-tight font-mono"
              }`}
            >
              {isAr ? "من نحن" : "About Us"}
            </p>
            <h2 className="text-2xl font-serif text-text-charcoal font-medium">
              {isAr ? "مكتب PGR UAE — دبي إلى العراق" : "PGR UAE Desk — Dubai to Iraq"}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {isAr
                ? "مكتب عروض أسعار للسبائك المادية في دبي. نؤكد عروض الذهب والفضة بعد مراجعة الامتثال — بدون دفع مباشر أو ضمان عوائد."
                : "Dubai physical bullion quote desk. We confirm gold and silver quotes after compliance review — no direct checkout or return guarantees."}
            </p>
            <div className="p-3 rounded-lg border border-soft-border bg-brand-bg text-xs text-text-secondary leading-relaxed flex gap-2">
              <Shield size={14} className="text-gold-dark shrink-0 mt-0.5" />
              <p className={isAr ? "font-arabic" : ""}>
                {isAr
                  ? "الأسعار المعروضة مرجع استرشادي. عرض السعر النهائي يصدر من المكتب."
                  : "Displayed prices are indicative references. Final quotes are issued by the desk."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin size={15} className="text-gold-dark shrink-0 mt-0.5" />
                <span className="text-text-secondary">
                  {isAr ? "دبي، الإمارات — مكتب عروض السبائك" : "Dubai, UAE — Bullion Quote Desk"}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={15} className="text-gold-dark shrink-0 mt-0.5" />
                <a href="tel:+971559688837" className="text-text-charcoal hover:text-gold-dark font-mono font-bold">
                  +971 55 968 8837
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={15} className="text-gold-dark shrink-0 mt-0.5" />
                <a href="mailto:desk@pgruae.com" className="text-text-charcoal hover:text-gold-dark">
                  desk@pgruae.com
                </a>
              </li>
              <li className="flex gap-3">
                <Clock size={15} className="text-gold-dark shrink-0 mt-0.5" />
                <span className="text-text-secondary">
                  {isAr ? "الأحد – الخميس · ٩–١٨ (دبي) · واتساب ٢٤/٧" : "Sun – Thu · 9–18 Dubai · WhatsApp 24/7"}
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigate("/request-quote")}
                className={`px-5 py-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal font-bold rounded text-[12px] ${
                  isAr ? "font-arabic" : "latin-brand-tight font-mono"
                }`}
              >
                {isAr ? "طلب عرض سعر" : "Request Quote"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("contact")}
                className={`px-5 py-2.5 border border-soft-border hover:border-gold-base text-text-charcoal font-bold rounded text-[12px] ${
                  isAr ? "font-arabic" : "latin-brand-tight font-mono"
                }`}
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

/**
 * Institutional trust strip — immediately below hero.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Phone, Package, FileText, Shield, FileCheck } from "lucide-react";

interface TrustBarProps {
  currentLang: "en" | "ar";
  phone?: string;
}

const ITEMS = [
  { icon: Phone, en: "UAE desk contact", ar: "رقم مكتب الإمارات", key: "phone" },
  { icon: Package, en: "Physical bullion products", ar: "سبائك مادية فقط", key: "physical" },
  { icon: FileText, en: "Desk-confirmed quotes", ar: "عروض أسعار مؤكدة", key: "quotes" },
  { icon: Shield, en: "KYC/AML when required", ar: "اعرف عميلك عند الحاجة", key: "kyc" },
  { icon: FileCheck, en: "Secure documentation flow", ar: "توثيق آمن ومنظم", key: "docs" },
];

export default function TrustBar({ currentLang, phone = "+971 55 968 8837" }: TrustBarProps) {
  const isAr = currentLang === "ar";

  return (
    <section
      className="bg-brand-card border-b border-soft-border"
      style={{ direction: isAr ? "rtl" : "ltr" }}
      aria-label={isAr ? "شريط الثقة" : "Trust bar"}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {ITEMS.map(({ icon: Icon, en, ar, key }) => (
            <div key={key} className="flex items-center gap-2.5 min-w-0">
              <span className="h-8 w-8 shrink-0 rounded-full border border-champagne bg-brand-bg flex items-center justify-center">
                <Icon size={14} className="text-gold-dark" />
              </span>
              <div className="min-w-0">
                {key === "phone" ? (
                  <a
                    href="tel:+971559688837"
                    className="text-[11px] font-mono font-bold text-text-charcoal hover:text-gold-dark transition-colors block truncate"
                  >
                    {phone}
                  </a>
                ) : (
                  <p className="text-[11px] font-sans font-bold text-text-charcoal leading-snug">
                    {isAr ? ar : en}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

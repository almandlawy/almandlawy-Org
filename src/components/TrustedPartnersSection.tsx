/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trusted service network — admin logos or elegant placeholders.
 */

import React, { useEffect, useState } from "react";
import { Building2, CreditCard, Truck, Shield } from "lucide-react";
import { PartnerLogo } from "../types";
import { dbService } from "../lib/supabase";

interface TrustedPartnersSectionProps {
  currentLang: "en" | "ar";
}

const PLACEHOLDER_CHANNELS = [
  { icon: Building2, en: "Banking Channel", ar: "قناة مصرفية" },
  { icon: CreditCard, en: "Payment Channel", ar: "قناة الدفع" },
  { icon: Truck, en: "Logistics Channel", ar: "قناة اللوجستيات" },
  { icon: Shield, en: "Secure Delivery", ar: "تسليم آمن" }
];

export default function TrustedPartnersSection({ currentLang }: TrustedPartnersSectionProps) {
  const isAr = currentLang === "ar";
  const [partners, setPartners] = useState<Omit<PartnerLogo, "internal_note">[]>([]);

  useEffect(() => {
    dbService.partnerLogos.listPublic().then(setPartners).catch(() => setPartners([]));
  }, []);

  return (
    <section
      className="py-16 md:py-20 px-4 md:px-8 bg-brand-bg border-b border-soft-border"
      id="trusted-network"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold-dark font-bold">
              {isAr ? "شبكة الخدمات" : "Service Network"}
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
              {isAr ? "شبكة الخدمات المعتمدة" : "Trusted Service Network"}
            </h2>
            <p className="text-sm text-text-secondary font-sans leading-relaxed max-w-lg">
              {isAr
                ? "يتم تأكيد قنوات الدفع واللوجستيات والتسوية من قبل ديوان PGR UAE وفق متطلبات المعاملة."
                : "Payment, logistics and settlement channels are confirmed by PGR UAE desk according to transaction requirements."}
            </p>
            <p className="text-xs text-text-secondary font-mono">
              {isAr
                ? "لا نستخدم مصطلح شريك رسمي إلا عند الموافقة والتكوين من الإدارة."
                : "Official partner wording is used only when approved and configured in admin."}
            </p>
          </div>

          {partners.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-champagne bg-brand-card shadow-premium min-h-[110px] gap-2"
                >
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-h-10 max-w-full object-contain"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-serif text-text-charcoal text-center">{partner.name}</span>
                  )}
                  <span className="text-[9px] font-mono text-text-secondary uppercase text-center">
                    {partner.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {PLACEHOLDER_CHANNELS.map(({ icon: Icon, en, ar }) => (
                <div
                  key={en}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-champagne bg-brand-card shadow-premium min-h-[120px] gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-gold-base/10 border border-gold-base/30 flex items-center justify-center text-gold-dark">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-serif text-text-charcoal text-center">
                    {isAr ? ar : en}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

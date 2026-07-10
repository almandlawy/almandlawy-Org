/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trusted partners — unified grid on all devices (no mobile-only hide).
 */

import React, { useEffect, useState } from "react";
import { Building2, CreditCard, Truck, Shield } from "lucide-react";
import { PartnerLogo } from "../types";
import { dbService } from "../lib/supabase";
import { PartnerLogoTile } from "./PartnerLogoTile";

interface TrustedPartnersSectionProps {
  currentLang: "en" | "ar";
}

const PLACEHOLDER_CHANNELS = [
  { icon: Building2, en: "Banking", ar: "مصرفي" },
  { icon: CreditCard, en: "Payment", ar: "دفع" },
  { icon: Truck, en: "Logistics", ar: "لوجستيات" },
  { icon: Shield, en: "Delivery", ar: "تسليم" },
];

export default function TrustedPartnersSection({ currentLang }: TrustedPartnersSectionProps) {
  const isAr = currentLang === "ar";
  const [partners, setPartners] = useState<Omit<PartnerLogo, "internal_note">[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    dbService.partnerLogos
      .listPublic()
      .then((list) => {
        if (!cancelled) {
          setPartners(list);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="py-10 md:py-12 px-4 md:px-8 bg-brand-card border-y border-soft-border"
      id="trusted-network"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto space-y-5">
        <header className="text-center max-w-2xl mx-auto space-y-2">
          <p
            className={`text-[10px] text-gold-dark font-bold ${
              isAr ? "font-arabic" : "latin-brand-tight font-mono"
            }`}
          >
            {isAr ? "شركاؤنا المعتمدون" : "Trusted Partners"}
          </p>
          <h2 className="text-xl sm:text-2xl font-serif text-text-charcoal font-medium">
            {isAr ? "شبكة الخدمات والتسوية" : "Service & Settlement Network"}
          </h2>
        </header>

        {!loaded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[120px] rounded-xl bg-brand-bg border border-soft-border animate-pulse"
              />
            ))}
          </div>
        ) : partners.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {partners.map((partner) => (
              <PartnerLogoTile key={partner.id} partner={partner} isAr={isAr} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PLACEHOLDER_CHANNELS.map(({ icon: Icon, en, ar }) => (
              <div
                key={en}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-champagne bg-brand-bg min-h-[100px] gap-2"
              >
                <div className="h-9 w-9 rounded-full bg-gold-base/10 border border-gold-base/30 flex items-center justify-center text-gold-dark">
                  <Icon size={16} />
                </div>
                <span className={`text-xs text-text-charcoal text-center ${isAr ? "font-arabic" : ""}`}>
                  {isAr ? ar : en}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

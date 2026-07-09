/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trusted partners — visible logo strip on mobile (horizontal scroll).
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

  useEffect(() => {
    dbService.partnerLogos.listPublic().then(setPartners).catch(() => setPartners([]));
  }, []);

  return (
    <section
      className="py-10 md:py-14 px-4 md:px-8 bg-brand-card border-y border-soft-border"
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

        {partners.length > 0 ? (
          <>
            {/* Mobile — horizontal scroll strip (logos always visible) */}
            <div
              className="flex md:hidden gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin"
              aria-label={isAr ? "شعارات الشركاء" : "Partner logos"}
            >
              {partners.map((partner) => (
                <PartnerLogoTile
                  key={partner.id}
                  partner={partner}
                  isAr={isAr}
                  variant="strip"
                  className="snap-start shrink-0 w-[42vw] max-w-[160px]"
                />
              ))}
            </div>

            {/* Desktop — grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {partners.map((partner) => (
                <PartnerLogoTile key={partner.id} partner={partner} isAr={isAr} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-4 md:overflow-visible pb-1 md:pb-0">
            {PLACEHOLDER_CHANNELS.map(({ icon: Icon, en, ar }) => (
              <div
                key={en}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-champagne bg-brand-bg min-h-[100px] min-w-[120px] shrink-0 md:min-w-0 gap-2"
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

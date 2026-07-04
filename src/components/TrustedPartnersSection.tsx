/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { PartnerLogo } from "../types";
import { dbService } from "../lib/supabase";

interface TrustedPartnersSectionProps {
  currentLang: "en" | "ar";
}

export default function TrustedPartnersSection({ currentLang }: TrustedPartnersSectionProps) {
  const isAr = currentLang === "ar";
  const [partners, setPartners] = useState<Omit<PartnerLogo, "internal_note">[]>([]);

  useEffect(() => {
    dbService.partnerLogos.listPublic().then(setPartners).catch(() => setPartners([]));
  }, []);

  if (partners.length === 0) {
    return (
      <section className="py-16 px-4 md:px-8 bg-brand-section border-b border-soft-border" id="trusted-network">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-serif text-text-charcoal font-medium">
            {isAr ? "شبكة الخدمات المعتمدة" : "Trusted Service Network"}
          </h2>
          <p className="text-sm text-text-secondary font-sans leading-relaxed">
            {isAr
              ? "يتم تأكيد خيارات الدفع واللوجستيات والتسوية من قبل ديوان PGR UAE وفق متطلبات المعاملة. قنوات الخدمة المتاحة/المعتمدة حيث ينطبق ذلك."
              : "Payment, logistics and settlement options are confirmed by PGR UAE desk according to transaction requirements. Available/approved service channels where applicable."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 md:px-8 bg-brand-section border-b border-soft-border" id="trusted-network">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
            {isAr ? "شبكة الخدمات المعتمدة" : "Trusted Service Network"}
          </h2>
          <p className="text-sm text-text-secondary font-sans">
            {isAr
              ? "يتم تأكيد خيارات الدفع واللوجستيات والتسوية من قبل ديوان PGR UAE وفق متطلبات المعاملة."
              : "Payment, logistics and settlement options are confirmed by PGR UAE desk according to transaction requirements."}
          </p>
          <p className="text-xs text-text-secondary font-mono">
            {isAr
              ? "قنوات الخدمة المتاحة/المعتمدة حيث ينطبق ذلك"
              : "Available/approved service channels where applicable"}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex flex-col items-center justify-center p-4 rounded border border-soft-border bg-brand-card min-h-[100px] gap-2"
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain"
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
      </div>
    </section>
  );
}

/**
 * Compact partner logo strip — visible high on homepage (mobile + desktop).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { PartnerLogo } from "../types";
import { dbService } from "../lib/supabase";
import { normalizeLogoUrl } from "./PartnerLogoTile";

interface PartnerLogosBarProps {
  currentLang: "en" | "ar";
}

export default function PartnerLogosBar({ currentLang }: PartnerLogosBarProps) {
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

  if (loaded && partners.length === 0) return null;

  return (
    <section
      className="bg-brand-section border-b border-soft-border py-3"
      aria-label={isAr ? "شعارات الشركاء" : "Partner logos"}
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <p
          className={`text-[9px] text-text-secondary text-center mb-2 ${
            isAr ? "font-arabic" : "font-mono uppercase"
          }`}
        >
          {isAr ? "شركاؤنا المعتمدون" : "Trusted partners"}
        </p>
        {!loaded ? (
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-24 rounded-lg bg-brand-card border border-soft-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {partners.map((partner) => {
              const src = normalizeLogoUrl(partner.logo_url || "");
              return (
                <div
                  key={partner.id}
                  className="flex flex-col items-center gap-1 min-w-[88px] max-w-[140px]"
                >
                  {src ? (
                    <img
                      src={src}
                      alt={partner.name}
                      className="h-11 sm:h-12 w-auto max-w-[120px] object-contain"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-serif font-bold text-text-charcoal">{partner.name}</span>
                  )}
                  <span
                    className={`text-[8px] text-text-secondary text-center line-clamp-1 ${
                      isAr ? "font-arabic" : ""
                    }`}
                  >
                    {partner.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

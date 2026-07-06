/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Standard indicative pricing disclaimer for calculators, products, and quote forms.
 */

import React from "react";
import { PRICING_DISCLAIMER_AR, PRICING_DISCLAIMER_EN } from "../lib/pricingDisclaimer";

interface PricingDisclaimerProps {
  currentLang: "en" | "ar";
  className?: string;
  compact?: boolean;
}

export default function PricingDisclaimer({
  currentLang,
  className = "",
  compact = false
}: PricingDisclaimerProps) {
  const isAr = currentLang === "ar";
  const text = isAr ? PRICING_DISCLAIMER_AR : PRICING_DISCLAIMER_EN;

  return (
    <p
      className={`text-[11px] leading-relaxed text-text-secondary font-sans border border-soft-border bg-brand-card/60 rounded px-3 py-2.5 ${
        compact ? "" : "mt-3"
      } ${className}`}
      role="note"
    >
      {text}
    </p>
  );
}

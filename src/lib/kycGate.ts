/**
 * KYC gating — quote requests require a submitted compliance profile.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { KYCProfile } from "../types";

export type KycGateStatus = KYCProfile["status"] | "Not submitted" | undefined;

/** User may submit a quote after KYC form is submitted (desk may still review). */
export function canRequestQuote(status: KycGateStatus): boolean {
  return status === "Pending review" || status === "Verified";
}

export function needsKycCompletion(status: KycGateStatus): boolean {
  return !canRequestQuote(status);
}

export function kycStatusLabel(status: KycGateStatus, lang: "en" | "ar"): string {
  const map: Record<string, { en: string; ar: string }> = {
    "Not submitted": { en: "Not submitted", ar: "لم يُقدَّم بعد" },
    "Pending review": { en: "Under desk review", ar: "قيد مراجعة المكتب" },
    "More information required": { en: "More info required", ar: "مطلوب معلومات إضافية" },
    Verified: { en: "Verified", ar: "موثّق" },
    Rejected: { en: "Rejected", ar: "مرفوض" },
  };
  const key = status || "Not submitted";
  return map[key]?.[lang] ?? key;
}

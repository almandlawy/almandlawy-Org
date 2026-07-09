/**
 * KYC document slots shared between onboarding and My Documents page.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export interface KycUploadedFileMeta {
  name: string;
  size: number;
  date: string;
  storage_path?: string;
  mime_type?: string;
}

export type KycUploadedFiles = Record<string, KycUploadedFileMeta>;

export interface KycDocumentSlot {
  key: string;
  labelEn: string;
  labelAr: string;
  optional?: boolean;
  companyOnly?: boolean;
}

export const KYC_DOCUMENT_SLOTS: KycDocumentSlot[] = [
  { key: "id_front", labelEn: "ID / passport — front", labelAr: "الهوية / الجواز — الوجه", optional: true },
  { key: "id_back", labelEn: "ID — back", labelAr: "الهوية — الخلف", optional: true },
  { key: "passport", labelEn: "Passport (full page)", labelAr: "جواز السفر", optional: true },
  { key: "proof_address", labelEn: "Proof of address", labelAr: "إثبات العنوان", optional: true },
  { key: "trade_license", labelEn: "Trade license", labelAr: "الرخصة التجارية", optional: true, companyOnly: true },
  { key: "source_of_funds", labelEn: "Source of funds proof", labelAr: "إثبات مصدر الأموال", optional: true },
];

export function slotsForAccountType(accountType: "individual" | "company"): KycDocumentSlot[] {
  return KYC_DOCUMENT_SLOTS.filter((s) => !s.companyOnly || accountType === "company");
}

export function mergeUploadedFiles(
  existing: KycUploadedFiles | undefined,
  slotKey: string,
  meta: KycUploadedFileMeta
): KycUploadedFiles {
  return { ...(existing || {}), [slotKey]: meta };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** User-friendly message when Supabase schema is not provisioned. */
export function friendlyKycDbError(message: string, lang: "en" | "ar"): string {
  const lower = message.toLowerCase();
  if (lower.includes("kyc_profiles") && (lower.includes("schema") || lower.includes("not find") || lower.includes("does not exist"))) {
    return lang === "ar"
      ? "جدول KYC غير مُعدّ في Supabase بعد. يرجى تشغيل scripts/supabase-admin-setup.sql من لوحة SQL ثم إعادة المحاولة."
      : "The KYC database table is not set up yet. Run scripts/supabase-admin-setup.sql in the Supabase SQL editor, then try again.";
  }
  return message;
}

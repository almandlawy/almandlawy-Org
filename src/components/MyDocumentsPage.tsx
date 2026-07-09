/**
 * Client My Documents — optional KYC file uploads & status.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { dbService } from "../lib/supabase";
import { getCurrentUser, type AppUser } from "../lib/clientAuth";
import { kycStatusLabel, normalizeKycStatus } from "../lib/kycGate";
import {
  slotsForAccountType,
  formatFileSize,
  friendlyKycDbError,
  type KycUploadedFiles,
} from "../lib/kycDocuments";

interface MyDocumentsPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

export default function MyDocumentsPage({ currentLang, onNavigate }: MyDocumentsPageProps) {
  const isAr = currentLang === "ar";
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [kycStatus, setKycStatus] = useState("Not submitted");
  const [uploadedFiles, setUploadedFiles] = useState<KycUploadedFiles>({});
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const slots = slotsForAccountType(accountType);

  const loadProfile = async (u: AppUser) => {
    const profile = await dbService.kyc.get(u.id);
    setKycStatus(profile?.status || "Not submitted");
    setUploadedFiles((profile?.uploaded_files as KycUploadedFiles) || {});
    setAccountType(profile?.kyc_type === "company" ? "company" : "individual");

    const urls: Record<string, string> = {};
    const files = (profile?.uploaded_files as KycUploadedFiles) || {};
    for (const [key, meta] of Object.entries(files)) {
      if (meta.storage_path) {
        const signed = await dbService.storage.getKycDocumentSignedUrl(meta.storage_path);
        if (signed) urls[key] = signed;
      }
    }
    setPreviewUrls(urls);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        onNavigate(`/login?next=${encodeURIComponent("/my-documents")}`);
        return;
      }
      if (cancelled) return;
      setUser(u);
      try {
        await loadProfile(u);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Load failed";
        setError(friendlyKycDbError(msg, currentLang));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onNavigate, currentLang]);

  const handleUpload = async (slotKey: string, file: File | null) => {
    if (!user || !file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError(isAr ? "الحد الأقصى 10 ميجابايت لكل ملف." : "Maximum 10 MB per file.");
      return;
    }

    setSavingSlot(slotKey);
    setError("");
    setSuccess("");

    try {
      const uploaded = await dbService.storage.uploadKycDocument(user.id, slotKey, file);
      const slotMeta = {
        name: uploaded.name,
        size: uploaded.size,
        date: new Date().toISOString(),
        storage_path: uploaded.storage_path,
        mime_type: uploaded.mime_type,
      };

      await dbService.kyc.save(user.id, {
        id: user.id,
        uploaded_files: { [slotKey]: slotMeta },
      });

      setUploadedFiles((prev) => ({ ...prev, [slotKey]: slotMeta }));
      const signed = uploaded.storage_path
        ? await dbService.storage.getKycDocumentSignedUrl(uploaded.storage_path)
        : null;
      if (signed) setPreviewUrls((prev) => ({ ...prev, [slotKey]: signed }));

      setSuccess(isAr ? "تم حفظ المستند بنجاح." : "Document saved successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(friendlyKycDbError(msg, currentLang));
    } finally {
      setSavingSlot(null);
    }
  };

  const handleRemove = async (slotKey: string) => {
    if (!user) return;
    setSavingSlot(slotKey);
    setError("");
    try {
      const next = { ...uploadedFiles };
      delete next[slotKey];
      await dbService.kyc.save(user.id, {
        id: user.id,
        uploaded_files: { [slotKey]: null },
      });
      setUploadedFiles(next);
      setPreviewUrls((prev) => {
        const copy = { ...prev };
        delete copy[slotKey];
        return copy;
      });
      setSuccess(isAr ? "تمت إزالة المستند من ملفك." : "Document removed from your profile.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Remove failed";
      setError(friendlyKycDbError(msg, currentLang));
    } finally {
      setSavingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-text-secondary text-sm">
        {isAr ? "جاري تحميل مستنداتك…" : "Loading your documents…"}
      </div>
    );
  }

  const displayStatus = normalizeKycStatus(kycStatus as any);
  const uploadedCount = Object.keys(uploadedFiles).length;

  return (
    <div className="space-y-8 max-w-2xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={() => onNavigate("/dashboard")}
        className="flex items-center gap-2 text-text-secondary hover:text-text-charcoal text-xs font-mono uppercase tracking-wider"
      >
        {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
        {isAr ? "لوحة حسابي" : "My account"}
      </button>

      <header className="space-y-3">
        <div className="flex items-center gap-2 text-olive-accent">
          <FileText size={20} />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
            {isAr ? "مستنداتي" : "My documents"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
          {isAr ? "مستندات الامتثال والهوية" : "Compliance & identity documents"}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          {isAr
            ? "رفع الجواز والهوية والمستندات اختياري. يمكنك إكمال ملف KYC أولاً ورفع المستندات لاحقاً — أو العكس. يراجع المكتب الملفات خلال ساعات العمل."
            : "Passport, ID, and supporting documents are optional. Complete KYC first or upload files later — the desk reviews during business hours."}
        </p>
      </header>

      <div className="rounded-xl border border-soft-border bg-brand-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck size={18} className="text-gold-base" />
          <span className="text-text-secondary">{isAr ? "حالة KYC:" : "KYC status:"}</span>
          <strong className="text-olive-accent">{kycStatusLabel(displayStatus, currentLang)}</strong>
        </div>
        <span className="text-[11px] font-mono text-text-secondary">
          {uploadedCount} / {slots.length} {isAr ? "مستندات مرفوعة" : "documents uploaded"}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm flex gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm flex gap-2">
          <CheckCircle size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="rounded-xl border border-soft-border bg-brand-card p-5 sm:p-6 space-y-4 shadow-sm">
        <p className="text-[10px] font-mono uppercase tracking-wider text-text-secondary font-bold">
          {isAr ? "المستندات (اختياري)" : "Documents (optional)"}
        </p>

        {slots.map((slot) => {
          const meta = uploadedFiles[slot.key];
          const isSaving = savingSlot === slot.key;
          const preview = previewUrls[slot.key];

          return (
            <div
              key={slot.key}
              className="p-4 rounded-lg border border-soft-border bg-brand-bg space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-charcoal">
                    {isAr ? slot.labelAr : slot.labelEn}
                  </p>
                  <p className="text-[10px] text-text-secondary font-mono mt-0.5">
                    {isAr ? "اختياري · PDF أو صورة · حتى 10 MB" : "Optional · PDF or image · up to 10 MB"}
                  </p>
                </div>
                {meta ? (
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-soft-success text-olive-accent shrink-0">
                    {isAr ? "مرفوع" : "Uploaded"}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-text-secondary shrink-0">
                    {isAr ? "غير مرفوع" : "Not uploaded"}
                  </span>
                )}
              </div>

              {meta && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary font-mono">
                  <span>{meta.name}</span>
                  <span>·</span>
                  <span>{formatFileSize(meta.size)}</span>
                  <span>·</span>
                  <span>{new Date(meta.date).toLocaleDateString()}</span>
                  {preview && (
                    <a
                      href={preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gold-dark hover:underline ml-1"
                    >
                      <ExternalLink size={12} />
                      {isAr ? "عرض" : "View"}
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <label
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gold-base/40 hover:border-gold-base text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors ${
                    isSaving ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <Upload size={12} className="text-gold-base" />
                  {isSaving
                    ? isAr
                      ? "جاري الرفع…"
                      : "Uploading…"
                    : meta
                      ? isAr
                        ? "استبدال"
                        : "Replace"
                      : isAr
                        ? "رفع ملف"
                        : "Upload file"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    disabled={isSaving}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleUpload(slot.key, f);
                      e.target.value = "";
                    }}
                  />
                </label>

                {meta && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleRemove(slot.key)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-soft-border text-[10px] font-mono text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 size={12} />
                    {isAr ? "إزالة" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onNavigate("/kyc?next=/my-documents")}
          className="flex-1 py-3 border border-soft-border rounded-lg text-text-charcoal font-mono text-xs font-bold uppercase tracking-wider hover:border-gold-base"
        >
          {isAr ? "تحديث بيانات KYC" : "Update KYC details"}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("/request-quote")}
          className="flex-1 py-3 bg-gold-base hover:bg-gold-dark text-text-charcoal rounded-lg font-mono text-xs font-bold uppercase tracking-wider"
        >
          {isAr ? "طلب عرض سعر" : "Request a quote"}
        </button>
      </div>

      <p className="text-[10px] text-text-secondary text-center font-mono leading-relaxed">
        {isAr
          ? `جميع المستندات مشفرة ومرتبطة بحسابك فقط (${user?.email || ""}).`
          : `All documents are encrypted and linked to your account only (${user?.email || ""}).`}
      </p>
    </div>
  );
}

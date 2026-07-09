/**
 * Mandatory KYC onboarding before quote requests.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import ClientAccountStepper from "./ClientAccountStepper";
import { dbService } from "../lib/supabase";
import { getCurrentUser, getLoginRedirectPath, type AppUser } from "../lib/clientAuth";
import { canRequestQuote, kycStatusLabel } from "../lib/kycGate";

interface KYCOnboardingPageProps {
  currentLang: "en" | "ar";
  onNavigate: (path: string) => void;
}

const ID_TYPES_INDIVIDUAL = [
  "Iraqi National Card",
  "Iraqi Passport",
  "Emirates ID",
  "UAE Residence Visa",
  "Passport",
] as const;

export default function KYCOnboardingPage({ currentLang, onNavigate }: KYCOnboardingPageProps) {
  const isAr = currentLang === "ar";
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string>("Not submitted");

  const [kycType, setKycType] = useState<"individual" | "company">("individual");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("Iraq");
  const [city, setCity] = useState("Baghdad");
  const [nationality, setNationality] = useState("Iraqi");
  const [dob, setDob] = useState("");
  const [idType, setIdType] = useState<string>(ID_TYPES_INDIVIDUAL[0]);
  const [idNumber, setIdNumber] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, { name: string; size: number; date: string }>
  >({});

  const nextPath = (() => {
    if (typeof window === "undefined") return "/request-quote";
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    return next && next.startsWith("/") ? next : "/request-quote";
  })();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        onNavigate(`/login?next=${encodeURIComponent(`/kyc?next=${encodeURIComponent(nextPath)}`)}`);
        return;
      }
      if (cancelled) return;
      setUser(u);

      const profile = await dbService.kyc.get(u.id);
      if (profile) {
        setExistingStatus(profile.status || "Not submitted");
        setFullName(profile.full_name || u.name);
        setEmail(profile.email || u.email);
        setPhone(profile.phone || u.phone || "");
        setWhatsapp(profile.whatsapp || u.phone || "");
        setCountry(profile.country || "Iraq");
        setCity(profile.city || "Baghdad");
        setNationality(profile.nationality || "Iraqi");
        setDob(profile.dob || "");
        setIdType(profile.documents?.[0]?.type || ID_TYPES_INDIVIDUAL[0]);
        setIdNumber(profile.documents?.[0]?.number || "");
        setSourceOfFunds(profile.source_of_funds_declaration || "");
        setAgreeTerms(Boolean(profile.agreement_accepted));
        setAgreePrivacy(Boolean(profile.privacy_consent));
        if (canRequestQuote(profile.status)) {
          // Already submitted — allow skip to quote
        }
      } else {
        setFullName(u.name);
        setEmail(u.email);
        setPhone(u.phone || "");
        setWhatsapp(u.phone || "");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [onNavigate, nextPath]);

  const inputClass =
    "w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2.5 text-sm text-text-charcoal outline-none transition-colors";
  const labelClass =
    "text-[10px] font-mono uppercase tracking-wider text-text-secondary font-bold block mb-1";

  const handleFilePick = (key: string, file: File | null) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError(isAr ? "الحد الأقصى 8 ميجابايت لكل ملف." : "Maximum 8 MB per file.");
      return;
    }
    setUploadedFiles((prev) => ({
      ...prev,
      [key]: { name: file.name, size: file.size, date: new Date().toISOString() },
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!agreeTerms || !agreePrivacy) {
      setError(
        isAr
          ? "يجب الموافقة على شروط KYC/AML وسياسة الخصوصية."
          : "You must accept KYC/AML terms and the privacy policy."
      );
      return;
    }
    if (Object.keys(uploadedFiles).length < 1) {
      setError(
        isAr
          ? "يرجى إرفاق صورة الهوية أو جواز السفر على الأقل."
          : "Please attach at least one ID or passport image."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await dbService.kyc.save(user.id, {
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim().toLowerCase(),
        country: country.trim(),
        city: city.trim(),
        nationality: nationality.trim(),
        dob,
        source_of_funds_declaration: sourceOfFunds.trim(),
        agreement_accepted: agreeTerms,
        privacy_consent: agreePrivacy,
            status: "Pending",
        documents: [
          {
            id: `doc-${Date.now()}`,
            type: kycType === "company" ? "Trade License" : idType,
            number: idNumber.trim(),
            status: "Pending",
            updated_at: new Date().toISOString(),
          },
        ],
        uploaded_files: uploadedFiles,
      });
      setExistingStatus("Pending review");
      setSuccess(true);
      setTimeout(() => onNavigate(nextPath), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "KYC save failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-text-secondary text-sm">
        {isAr ? "جاري تحميل ملف الامتثال…" : "Loading compliance profile…"}
      </div>
    );
  }

  if (canRequestQuote(existingStatus as any) && !success) {
    return (
      <div className="max-w-xl mx-auto space-y-6" dir={isAr ? "rtl" : "ltr"}>
        <ClientAccountStepper currentLang={currentLang} activeStep="kyc" kycComplete />
        <div className="rounded-xl border border-soft-border bg-brand-card p-6 text-center space-y-4">
          <CheckCircle className="mx-auto text-olive-accent" size={40} />
          <h1 className="text-xl font-serif text-text-charcoal">
            {isAr ? "ملف KYC مقدّم" : "KYC profile on file"}
          </h1>
          <p className="text-sm text-text-secondary">
            {isAr ? "الحالة:" : "Status:"}{" "}
            <strong>{kycStatusLabel(existingStatus as any, currentLang)}</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate(nextPath)}
              className="px-6 py-3 bg-gold-base hover:bg-gold-dark text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded-lg"
            >
              {isAr ? "متابعة لطلب العرض" : "Continue to quote request"}
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/dashboard")}
              className="px-6 py-3 border border-soft-border rounded-lg text-text-secondary hover:text-text-charcoal text-xs font-mono uppercase tracking-widest"
            >
              {isAr ? "لوحة حسابي" : "My account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      <ClientAccountStepper currentLang={currentLang} activeStep="kyc" />

      <header className="space-y-3">
        <div className="flex items-center gap-2 text-olive-accent">
          <ShieldCheck size={20} />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
            {isAr ? "الخطوة ٢ · التحقق KYC" : "Step 2 · KYC verification"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-text-charcoal font-medium">
          {isAr ? "إكمال ملف الامتثال قبل طلب السعر" : "Complete compliance before requesting a quote"}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          {isAr
            ? "وفقاً لقوانين مكافحة غسيل الأموال في الإمارات، يجب إكمال KYC قبل إرسال أي طلب شراء سبائك. يراجع المكتب ملفك خلال ساعات العمل."
            : "Under UAE AML rules, KYC must be completed before any bullion purchase request. The desk reviews your file during business hours."}
        </p>
      </header>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm flex gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm flex gap-2">
          <CheckCircle size={18} className="shrink-0" />
          <span>
            {isAr
              ? "تم إرسال ملف KYC. جاري تحويلك لطلب العرض…"
              : "KYC submitted. Redirecting to quote request…"}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-soft-border bg-brand-card p-5 sm:p-8 space-y-5 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-2 bg-brand-bg p-1 rounded-lg border border-soft-border">
          <button
            type="button"
            onClick={() => setKycType("individual")}
            className={`py-2 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold ${
              kycType === "individual" ? "bg-gold-base text-text-charcoal" : "text-text-secondary"
            }`}
          >
            {isAr ? "فردي" : "Individual"}
          </button>
          <button
            type="button"
            onClick={() => setKycType("company")}
            className={`py-2 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold ${
              kycType === "company" ? "bg-gold-base text-text-charcoal" : "text-text-secondary"
            }`}
          >
            {isAr ? "شركة" : "Company"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{isAr ? "الاسم القانوني الكامل" : "Full legal name"} *</label>
            <input required className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isAr ? "البريد الإلكتروني" : "Email"} *</label>
            <input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isAr ? "الهاتف / واتساب" : "Phone / WhatsApp"} *</label>
            <input required className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isAr ? "واتساب للتوثيق" : "WhatsApp for verification"} *</label>
            <input required className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isAr ? "الدولة" : "Country"} *</label>
            <input required className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isAr ? "المدينة" : "City"} *</label>
            <input required className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isAr ? "الجنسية" : "Nationality"} *</label>
            <input required className={inputClass} value={nationality} onChange={(e) => setNationality(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>
              {kycType === "company"
                ? isAr
                  ? "تاريخ التأسيس"
                  : "Date of incorporation"
                : isAr
                  ? "تاريخ الميلاد"
                  : "Date of birth"}{" "}
              *
            </label>
            <input required type="date" className={inputClass} value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
        </div>

        {kycType === "individual" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{isAr ? "نوع الهوية" : "ID type"} *</label>
              <select className={inputClass} value={idType} onChange={(e) => setIdType(e.target.value)}>
                {ID_TYPES_INDIVIDUAL.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{isAr ? "رقم الهوية" : "ID number"} *</label>
              <input required className={inputClass} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
            </div>
          </div>
        ) : (
          <div>
            <label className={labelClass}>{isAr ? "رقم الرخصة التجارية" : "Trade license number"} *</label>
            <input required className={inputClass} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
          </div>
        )}

        <div>
          <label className={labelClass}>{isAr ? "مصدر الأموال" : "Source of funds"} *</label>
          <textarea
            required
            rows={3}
            className={inputClass}
            value={sourceOfFunds}
            onChange={(e) => setSourceOfFunds(e.target.value)}
            placeholder={
              isAr ? "مثال: دخل تجاري، مدخرات شخصية…" : "e.g. business income, personal savings…"
            }
          />
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-soft-border bg-brand-bg">
          <p className={labelClass}>{isAr ? "المستندات (صور واضحة)" : "Documents (clear images)"} *</p>
          {[
            { key: "id_front", en: "ID / passport — front", ar: "الهوية / الجواز — الوجه" },
            { key: "id_back", en: "ID — back (if applicable)", ar: "الهوية — الخلف (إن وُجد)" },
            { key: "proof_address", en: "Proof of address", ar: "إثبات العنوان" },
          ].map((slot) => (
            <label
              key={slot.key}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-dashed border-soft-border hover:border-gold-base/50 cursor-pointer"
            >
              <span className="text-xs text-text-secondary">
                {isAr ? slot.ar : slot.en}
                {uploadedFiles[slot.key] ? ` ✓ ${uploadedFiles[slot.key].name}` : ""}
              </span>
              <Upload size={16} className="text-gold-base shrink-0" />
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFilePick(slot.key, e.target.files?.[0] || null)}
              />
            </label>
          ))}
        </div>

        <div className="space-y-2 text-xs text-text-secondary">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 accent-gold-base" />
            <span>
              {isAr
                ? "أوافق على شروط KYC/AML وسياسة مكافحة غسيل الأموال لـ PGR UAE."
                : "I agree to PGR UAE KYC/AML and anti–money laundering policies."}
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="mt-0.5 accent-gold-base" />
            <span>
              {isAr
                ? "أوافق على معالجة بياناتي الشخصية لأغراض الامتثال فقط."
                : "I consent to processing my personal data for compliance purposes only."}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || success}
          className="w-full py-3.5 bg-gold-base hover:bg-gold-dark disabled:opacity-60 text-text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
        >
          {submitting
            ? isAr
              ? "جاري الإرسال…"
              : "Submitting…"
            : isAr
              ? "إرسال ملف KYC والمتابعة"
              : "Submit KYC & continue"}
        </button>
      </form>
    </div>
  );
}

/**
 * Mandatory KYC onboarding before quote requests.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import ClientAccountStepper from "./ClientAccountStepper";
import { dbService } from "../lib/supabase";
import { notifyDesk } from "../lib/deskNotify";
import { getCurrentUser, getLoginRedirectPath, type AppUser } from "../lib/clientAuth";
import { canRequestQuote, kycStatusLabel } from "../lib/kycGate";
import { friendlyKycDbError } from "../lib/kycDocuments";
import { checkKycSchemaReady } from "../lib/kycApi";

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
  const [schemaReady, setSchemaReady] = useState<boolean | null>(null);
  const [schemaReason, setSchemaReason] = useState("");

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

      const schema = await checkKycSchemaReady();
      if (cancelled) return;
      setSchemaReady(schema.ready);
      setSchemaReason(schema.reason || "");

      if (!schema.ready) {
        setFullName(u.name);
        setEmail(u.email);
        setPhone(u.phone || "");
        setWhatsapp(u.phone || "");
        setLoading(false);
        return;
      }

      try {
        const profile = await dbService.kyc.get(u.id);
        if (cancelled) return;
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
          setKycType(profile.kyc_type === "company" ? "company" : "individual");
        } else {
          setFullName(u.name);
          setEmail(u.email);
          setPhone(u.phone || "");
          setWhatsapp(u.phone || "");
        }
      } catch (loadErr: unknown) {
        if (!cancelled) {
          const msg = loadErr instanceof Error ? loadErr.message : "Load failed";
          setError(friendlyKycDbError(msg, currentLang));
          setSchemaReady(false);
          setFullName(u.name);
          setEmail(u.email);
          setPhone(u.phone || "");
          setWhatsapp(u.phone || "");
        }
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
        kyc_type: kycType,
        source_of_funds_declaration: sourceOfFunds.trim(),
        agreement_accepted: agreeTerms,
        privacy_consent: agreePrivacy,
        status: "Pending review",
        documents: idNumber.trim()
          ? [
              {
                id: `doc-${Date.now()}`,
                type: kycType === "company" ? "Trade License" : idType,
                number: idNumber.trim(),
                status: "Pending review",
                updated_at: new Date().toISOString(),
              },
            ]
          : [],
      });
      setExistingStatus("Pending review");
      setSuccess(true);
      void notifyDesk("kyc", {
        customerId: user.id,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        status: "Pending review",
      });
      setTimeout(() => onNavigate(nextPath), 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "KYC save failed";
      setError(friendlyKycDbError(msg, currentLang));
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
              onClick={() => onNavigate("/my-documents")}
              className="px-6 py-3 border border-soft-border rounded-lg text-text-secondary hover:text-text-charcoal text-xs font-mono uppercase tracking-widest"
            >
              {isAr ? "مستنداتي" : "My documents"}
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
            ? "أكمل بياناتك الأساسية لطلب عرض سعر. رفع الجواز والمستندات اختياري — يمكنك رفعها لاحقاً من صفحة مستنداتي."
            : "Complete your basic details to request a quote. Passport and document uploads are optional — you can add them later in My Documents."}
        </p>
      </header>

      {schemaReady === false && (
        <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 text-sm space-y-2">
          <p className="font-bold">
            {isAr ? "تعذر الاتصال بجدول KYC" : "Could not reach KYC table"}
          </p>
          <p className="text-[11px]">
            {schemaReason ||
              (isAr
                ? "تحقق من صلاحيات RLS في Supabase لجدول kyc_profiles"
                : "Check RLS policies on kyc_profiles in Supabase")}
          </p>
        </div>
      )}

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

        <div className="rounded-lg border border-soft-border bg-brand-bg p-4 space-y-3">
          <p className={labelClass}>{isAr ? "المستندات (اختياري)" : "Documents (optional)"}</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isAr
              ? "لا يلزم رفع جواز أو هوية الآن. إذا رغبت، ارفع المستندات من صفحة مستنداتي بعد إرسال النموذج."
              : "You do not need to upload a passport or ID now. Upload anytime from My Documents after submitting this form."}
          </p>
          <button
            type="button"
            onClick={() => onNavigate("/my-documents")}
            className="text-[11px] font-mono font-bold text-gold-dark hover:underline uppercase tracking-wider"
          >
            {isAr ? "الذهاب إلى مستنداتي ←" : "Go to My Documents →"}
          </button>
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
          disabled={submitting || success || schemaReady === false}
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

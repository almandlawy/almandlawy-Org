/**
 * Visual onboarding steps: Account → KYC → Quote → Track
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, ShieldCheck, FileText, LayoutDashboard } from "lucide-react";

export type AccountStep = "account" | "kyc" | "quote" | "track";

interface ClientAccountStepperProps {
  currentLang: "en" | "ar";
  activeStep: AccountStep;
  kycComplete?: boolean;
  compact?: boolean;
}

const STEPS: { id: AccountStep; icon: React.ElementType }[] = [
  { id: "account", icon: User },
  { id: "kyc", icon: ShieldCheck },
  { id: "quote", icon: FileText },
  { id: "track", icon: LayoutDashboard },
];

export default function ClientAccountStepper({
  currentLang,
  activeStep,
  kycComplete = false,
  compact = false,
}: ClientAccountStepperProps) {
  const isAr = currentLang === "ar";
  const labels: Record<AccountStep, { en: string; ar: string }> = {
    account: { en: "Account", ar: "الحساب" },
    kyc: { en: "KYC", ar: "التحقق KYC" },
    quote: { en: "Quote", ar: "طلب عرض" },
    track: { en: "Track", ar: "متابعة" },
  };

  const activeIndex = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <div
      className={`rounded-xl border border-soft-border bg-brand-card/80 ${
        compact ? "p-3" : "p-4 sm:p-5"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-olive-accent font-bold mb-3">
        {isAr ? "مسار العميل المعتمد" : "Accredited client journey"}
      </p>
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const done = index < activeIndex || (step.id === "kyc" && kycComplete && index <= 1);
          const current = step.id === activeStep;
          return (
            <li key={step.id} className="flex flex-1 items-center min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                    done
                      ? "bg-olive-accent/15 border-olive-accent/40 text-olive-accent"
                      : current
                        ? "bg-gold-base/15 border-gold-base text-gold-dark"
                        : "bg-brand-bg border-soft-border text-text-secondary"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-center truncate w-full ${
                    current ? "text-text-charcoal font-bold" : "text-text-secondary"
                  }`}
                >
                  {isAr ? labels[step.id].ar : labels[step.id].en}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 mx-0.5 sm:mx-1 mb-5 ${
                    index < activeIndex ? "bg-olive-accent/40" : "bg-soft-border"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

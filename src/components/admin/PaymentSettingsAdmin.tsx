/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { PaymentSettings, PaymentProvider, PaymentMode, WalletPaymentMethod } from "../../types";
import { DEFAULT_PAYMENT_SETTINGS } from "../../data";
import { dbService } from "../../lib/supabase";

const PROVIDERS: PaymentProvider[] = [
  "Stripe",
  "PayTabs",
  "N-Genius / Network International",
  "Amazon Payment Services",
  "Manual Bank Transfer",
  "Other"
];

const MODES: PaymentMode[] = [
  "Payment Link after firm quote",
  "Deposit after firm quote",
  "Full payment after firm quote",
  "Bank transfer only"
];

interface PaymentSettingsAdminProps {
  adminEmail: string;
  onAudit: (action: string, details: string) => void;
}

export default function PaymentSettingsAdmin({ adminEmail, onAudit }: PaymentSettingsAdminProps) {
  const [settings, setSettings] = useState<PaymentSettings>({ ...DEFAULT_PAYMENT_SETTINGS });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    dbService.paymentSettings.get().then((s) =>
      setSettings({
        ...DEFAULT_PAYMENT_SETTINGS,
        ...s,
        bank_transfer: { ...DEFAULT_PAYMENT_SETTINGS.bank_transfer, ...(s.bank_transfer || {}) },
        desk_payment_methods: {
          ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods,
          ...(s.desk_payment_methods || {}),
          zain_cash: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.zain_cash,
            ...(s.desk_payment_methods?.zain_cash || {}),
          },
          superqi: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.superqi,
            ...(s.desk_payment_methods?.superqi || {}),
          },
          usdt: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.usdt,
            ...(s.desk_payment_methods?.usdt || {}),
          },
        },
      })
    );
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await dbService.paymentSettings.update(settings, adminEmail);
      await onAudit(
        "payment_settings_update",
        `Payment settings updated by ${adminEmail}. Gateway enabled: ${settings.payment_gateway_enabled}. Provider: ${settings.provider}. Mode: ${settings.payment_mode}. KYC required: ${settings.require_kyc_before_payment}`
      );
      setMsg("Payment settings saved. Gateway secrets must remain in server env vars only.");
    } catch {
      setMsg("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCurrency = (cur: "AED" | "USD" | "IQD" | "USDT") => {
    setSettings((prev) => {
      const has = prev.supported_currencies.includes(cur);
      const next = has
        ? prev.supported_currencies.filter((c) => c !== cur)
        : [...prev.supported_currencies, cur];
      return { ...prev, supported_currencies: next.length ? next : [cur] };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-serif text-text-charcoal">Payment Settings</h4>
        <p className="text-xs text-text-secondary font-mono">
          No gateway secret keys here — use server environment variables only. Customers cannot pay before firm quote.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-5 bg-brand-card rounded border border-soft-border space-y-5 font-mono text-xs">
        <label className="flex items-center gap-3 text-text-charcoal/85 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.payment_gateway_enabled}
            onChange={(e) => setSettings({ ...settings, payment_gateway_enabled: e.target.checked })}
            className="accent-gold-base h-4 w-4"
          />
          Payment gateway enabled
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-text-secondary uppercase text-[9px] font-bold">Provider</label>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value as PaymentProvider })}
              className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-text-secondary uppercase text-[9px] font-bold">Payment mode</label>
            <select
              value={settings.payment_mode}
              onChange={(e) => setSettings({ ...settings, payment_mode: e.target.value as PaymentMode })}
              className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-text-secondary uppercase text-[9px] font-bold">Supported currencies</label>
          <div className="flex gap-4">
            {(["AED", "USD", "IQD", "USDT"] as const).map((cur) => (
              <label key={cur} className="flex items-center gap-2 text-text-charcoal/85 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.supported_currencies.includes(cur)}
                  onChange={() => toggleCurrency(cur)}
                  className="accent-gold-base"
                />
                {cur}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-text-secondary uppercase text-[9px] font-bold">Minimum payment amount</label>
            <input
              type="number"
              min={0}
              value={settings.minimum_payment_amount}
              onChange={(e) => setSettings({ ...settings, minimum_payment_amount: Number(e.target.value) })}
              className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
            />
          </div>
          <div className="space-y-2">
            <label className="text-text-secondary uppercase text-[9px] font-bold">Max before manual review</label>
            <input
              type="number"
              min={0}
              value={settings.max_payment_amount_before_manual_review}
              onChange={(e) => setSettings({ ...settings, max_payment_amount_before_manual_review: Number(e.target.value) })}
              className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 text-text-charcoal/85 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.require_kyc_before_payment}
            onChange={(e) => setSettings({ ...settings, require_kyc_before_payment: e.target.checked })}
            className="accent-gold-base h-4 w-4"
          />
          Require KYC before payment
        </label>

        <div className="space-y-2">
          <label className="text-text-secondary uppercase text-[9px] font-bold">Public payment note</label>
          <textarea
            rows={3}
            value={settings.public_payment_note}
            onChange={(e) => setSettings({ ...settings, public_payment_note: e.target.value })}
            className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base font-sans"
          />
        </div>

        <div className="space-y-2">
          <label className="text-text-secondary uppercase text-[9px] font-bold">Payment link instructions (public)</label>
          <textarea
            rows={2}
            value={settings.payment_link_instructions}
            onChange={(e) => setSettings({ ...settings, payment_link_instructions: e.target.value })}
            className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base font-sans"
          />
        </div>

        <div className="border-t border-soft-border pt-4 space-y-3">
          <h5 className="text-sm font-serif text-text-charcoal">Bank transfer details (public)</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-text-secondary uppercase text-[9px] font-bold">Beneficiary name</label>
              <input
                value={settings.bank_transfer.beneficiary_name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_transfer: { ...settings.bank_transfer, beneficiary_name: e.target.value },
                  })
                }
                className="w-full bg-brand-bg border border-soft-border rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-text-secondary uppercase text-[9px] font-bold">Bank name</label>
              <input
                value={settings.bank_transfer.bank_name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_transfer: { ...settings.bank_transfer, bank_name: e.target.value },
                  })
                }
                className="w-full bg-brand-bg border border-soft-border rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary uppercase text-[9px] font-bold">IBAN</label>
              <input
                value={settings.bank_transfer.iban}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_transfer: { ...settings.bank_transfer, iban: e.target.value },
                  })
                }
                className="w-full bg-brand-bg border border-soft-border rounded-lg px-3 py-2 text-text-charcoal font-mono outline-none focus:border-gold-base"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary uppercase text-[9px] font-bold">SWIFT</label>
              <input
                value={settings.bank_transfer.swift_code}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_transfer: { ...settings.bank_transfer, swift_code: e.target.value },
                  })
                }
                className="w-full bg-brand-bg border border-soft-border rounded-lg px-3 py-2 text-text-charcoal font-mono outline-none focus:border-gold-base"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-text-secondary uppercase text-[9px] font-bold">Reference hint (shown to customer)</label>
              <input
                value={settings.bank_transfer.reference_hint}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_transfer: { ...settings.bank_transfer, reference_hint: e.target.value },
                  })
                }
                className="w-full bg-brand-bg border border-soft-border rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-text-secondary uppercase text-[9px] font-bold">Additional notes</label>
              <textarea
                rows={2}
                value={settings.bank_transfer.additional_notes || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_transfer: { ...settings.bank_transfer, additional_notes: e.target.value },
                  })
                }
                className="w-full bg-brand-bg border border-soft-border rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base font-sans"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-soft-border pt-4 space-y-4">
          <h5 className="text-sm font-serif text-text-charcoal">Iraq desk wallets (public)</h5>
          <p className="text-[10px] text-text-secondary">
            Zain Cash, SuperQi, and USDT details shown to customers after quote acceptance.
          </p>
          {(
            [
              ["zain_cash", "Zain Cash"],
              ["superqi", "SuperQi"],
              ["usdt", "USDT"],
            ] as const
          ).map(([key, title]) => {
            const wallet = settings.desk_payment_methods[key] as WalletPaymentMethod;
            return (
              <div key={key} className="p-4 bg-brand-bg rounded-lg border border-soft-border space-y-3">
                <label className="flex items-center gap-3 text-text-charcoal/85 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wallet.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        desk_payment_methods: {
                          ...settings.desk_payment_methods,
                          [key]: { ...wallet, enabled: e.target.checked },
                        },
                      })
                    }
                    className="accent-gold-base h-4 w-4"
                  />
                  <span className="font-bold">{title} enabled</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-text-secondary uppercase text-[9px] font-bold">Wallet ID / address</label>
                    <input
                      value={wallet.wallet_id}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          desk_payment_methods: {
                            ...settings.desk_payment_methods,
                            [key]: { ...wallet, wallet_id: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-brand-card border border-soft-border rounded-lg px-3 py-2 text-text-charcoal font-mono outline-none focus:border-gold-base"
                    />
                  </div>
                  {key === "usdt" && (
                    <div className="space-y-1">
                      <label className="text-text-secondary uppercase text-[9px] font-bold">Network</label>
                      <input
                        value={wallet.network || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            desk_payment_methods: {
                              ...settings.desk_payment_methods,
                              [key]: { ...wallet, network: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-brand-card border border-soft-border rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
                      />
                    </div>
                  )}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-text-secondary uppercase text-[9px] font-bold">Instructions (EN)</label>
                    <textarea
                      rows={2}
                      value={wallet.instructions_en}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          desk_payment_methods: {
                            ...settings.desk_payment_methods,
                            [key]: { ...wallet, instructions_en: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-brand-card border border-soft-border rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base font-sans"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-text-secondary uppercase text-[9px] font-bold">Instructions (AR)</label>
                    <textarea
                      rows={2}
                      value={wallet.instructions_ar}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          desk_payment_methods: {
                            ...settings.desk_payment_methods,
                            [key]: { ...wallet, instructions_ar: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-brand-card border border-soft-border rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base font-sans"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-text-secondary uppercase text-[9px] font-bold flex items-center gap-2">
            Internal payment note (admin only)
          </label>
          <textarea
            rows={2}
            value={settings.internal_payment_note}
            onChange={(e) => setSettings({ ...settings, internal_payment_note: e.target.value })}
            className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gold-base text-black font-bold rounded text-xs uppercase"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save payment settings"}
        </button>
        {msg && <p className="text-xs text-olive-accent">{msg}</p>}
      </form>
    </div>
  );
}

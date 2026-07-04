/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { PaymentSettings, PaymentProvider, PaymentMode } from "../../types";
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
    dbService.paymentSettings.get().then((s) => setSettings({ ...DEFAULT_PAYMENT_SETTINGS, ...s }));
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

  const toggleCurrency = (cur: "AED" | "USD") => {
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
        <h4 className="text-lg font-serif text-white">Payment Settings</h4>
        <p className="text-xs text-gray-500 font-mono">
          No gateway secret keys here — use server environment variables only. Customers cannot pay before firm quote.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.03] space-y-5 font-mono text-xs">
        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
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
            <label className="text-gray-400 uppercase text-[9px] font-bold">Provider</label>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value as PaymentProvider })}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold-base"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-gray-400 uppercase text-[9px] font-bold">Payment mode</label>
            <select
              value={settings.payment_mode}
              onChange={(e) => setSettings({ ...settings, payment_mode: e.target.value as PaymentMode })}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold-base"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 uppercase text-[9px] font-bold">Supported currencies</label>
          <div className="flex gap-4">
            {(["AED", "USD"] as const).map((cur) => (
              <label key={cur} className="flex items-center gap-2 text-gray-300 cursor-pointer">
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
            <label className="text-gray-400 uppercase text-[9px] font-bold">Minimum payment amount</label>
            <input
              type="number"
              min={0}
              value={settings.minimum_payment_amount}
              onChange={(e) => setSettings({ ...settings, minimum_payment_amount: Number(e.target.value) })}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold-base"
            />
          </div>
          <div className="space-y-2">
            <label className="text-gray-400 uppercase text-[9px] font-bold">Max before manual review</label>
            <input
              type="number"
              min={0}
              value={settings.max_payment_amount_before_manual_review}
              onChange={(e) => setSettings({ ...settings, max_payment_amount_before_manual_review: Number(e.target.value) })}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold-base"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.require_kyc_before_payment}
            onChange={(e) => setSettings({ ...settings, require_kyc_before_payment: e.target.checked })}
            className="accent-gold-base h-4 w-4"
          />
          Require KYC before payment
        </label>

        <div className="space-y-2">
          <label className="text-gray-400 uppercase text-[9px] font-bold">Public payment note</label>
          <textarea
            rows={3}
            value={settings.public_payment_note}
            onChange={(e) => setSettings({ ...settings, public_payment_note: e.target.value })}
            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold-base font-sans"
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 uppercase text-[9px] font-bold">Payment link instructions (public)</label>
          <textarea
            rows={2}
            value={settings.payment_link_instructions}
            onChange={(e) => setSettings({ ...settings, payment_link_instructions: e.target.value })}
            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold-base font-sans"
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 uppercase text-[9px] font-bold flex items-center gap-2">
            Internal payment note (admin only)
          </label>
          <textarea
            rows={2}
            value={settings.internal_payment_note}
            onChange={(e) => setSettings({ ...settings, internal_payment_note: e.target.value })}
            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold-base font-sans"
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { PartnerLogo, PartnerLogoCategory } from "../../types";
import { dbService } from "../../lib/supabase";

const CATEGORIES: PartnerLogoCategory[] = [
  "Bank",
  "Payment Gateway",
  "Logistics",
  "Security Delivery",
  "Compliance",
  "Market Data",
  "Other"
];

interface PartnerLogosAdminProps {
  adminEmail: string;
  onAudit: (action: string, details: string) => void;
}

const emptyPartner = (): PartnerLogo => ({
  id: `partner-${Date.now()}`,
  name: "",
  category: "Other",
  logo_url: "",
  website_url: "",
  public_display_enabled: false,
  display_order: 0,
  internal_note: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export default function PartnerLogosAdmin({ adminEmail, onAudit }: PartnerLogosAdminProps) {
  const [partners, setPartners] = useState<PartnerLogo[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    dbService.partnerLogos.list().then(setPartners).catch(() => setPartners([]));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const sorted = [...partners]
        .map((p, i) => ({ ...p, display_order: p.display_order ?? i, updated_at: new Date().toISOString() }))
        .sort((a, b) => a.display_order - b.display_order);
      await dbService.partnerLogos.saveAll(sorted, adminEmail);
      await onAudit(
        "partner_logos_update",
        `Partner logos updated by ${adminEmail}. Count: ${sorted.length}. Public: ${sorted.filter((p) => p.public_display_enabled).length}`
      );
      setPartners(sorted);
      setMsg("Partner logos saved.");
    } catch {
      setMsg("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updatePartner = (id: string, patch: Partial<PartnerLogo>) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addPartner = () => setPartners((prev) => [...prev, emptyPartner()]);

  const removePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-serif text-text-charcoal">Partners & Trust Logos</h4>
        <p className="text-xs text-text-secondary font-mono">
          Only logos with public display enabled appear on the site. Internal notes are never shown to customers.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {partners.map((partner) => (
          <div key={partner.id} className="p-4 bg-brand-card rounded border border-soft-border space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary uppercase text-[9px]">Partner entry</span>
              <button type="button" onClick={() => removePartner(partner.id)} className="text-red-400 hover:text-red-300">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company name"
                value={partner.name}
                onChange={(e) => updatePartner(partner.id, { name: e.target.value })}
                className="bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
              />
              <select
                value={partner.category}
                onChange={(e) => updatePartner(partner.id, { category: e.target.value as PartnerLogoCategory })}
                className="bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Logo URL"
                value={partner.logo_url}
                onChange={(e) => updatePartner(partner.id, { logo_url: e.target.value })}
                className="bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base sm:col-span-2"
              />
              <input
                type="url"
                placeholder="Website URL (optional)"
                value={partner.website_url || ""}
                onChange={(e) => updatePartner(partner.id, { website_url: e.target.value })}
                className="bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
              />
              <input
                type="number"
                placeholder="Display order"
                value={partner.display_order}
                onChange={(e) => updatePartner(partner.id, { display_order: Number(e.target.value) })}
                className="bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base"
              />
            </div>
            <label className="flex items-center gap-2 text-text-charcoal/85 cursor-pointer">
              <input
                type="checkbox"
                checked={partner.public_display_enabled}
                onChange={(e) => updatePartner(partner.id, { public_display_enabled: e.target.checked })}
                className="accent-gold-base"
              />
              Public display enabled
            </label>
            <textarea
              rows={2}
              placeholder="Internal note (admin only)"
              value={partner.internal_note || ""}
              onChange={(e) => updatePartner(partner.id, { internal_note: e.target.value })}
              className="w-full bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-2 text-text-charcoal outline-none focus:border-gold-base font-sans"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addPartner}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-soft-border rounded text-text-secondary hover:text-gold-dark text-xs"
        >
          <Plus size={14} /> Add partner
        </button>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gold-base text-black font-bold rounded text-xs uppercase"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save all partners"}
        </button>
        {msg && <p className="text-xs text-olive-accent">{msg}</p>}
      </form>
    </div>
  );
}

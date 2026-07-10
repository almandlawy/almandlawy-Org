import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/** Inline defaults — avoids _lib import chain on Vercel serverless */
const DEFAULT_PUBLIC_PAYMENT = {
  payment_gateway_enabled: false,
  provider: "Manual Bank Transfer",
  payment_mode: "Bank transfer only",
  public_payment_note:
    "بعد قبول عرض السعر المؤكد، يمكنك الدفع عبر: تحويل بنكي، زين كاش، سوبر كي، أو USDT (TRC20).",
  payment_link_instructions:
    "اختر طريقة الدفع المناسبة (تحويل بنكي · زين كاش · سوبر كي · USDT). أرسل المبلغ ثم ارفع إثبات الدفع.",
  bank_transfer: {
    beneficiary_name: "PGR UAE Precious Metals LLC",
    bank_name: "Emirates NBD Bank PJSC, Dubai Marina Branch",
    iban: "AE83 0260 0000 1209 8903 1721",
    swift_code: "EBILAEAD",
    reference_hint: "Include your quote/order reference in the wire description.",
    additional_notes: "AED/USD multi-currency account.",
  },
  desk_payment_methods: {
    bank_transfer: { enabled: true },
    zain_cash: {
      enabled: true,
      wallet_label_en: "Zain Cash wallet (Iraq)",
      wallet_label_ar: "محفظة زين كاش (العراق)",
      wallet_id: "+964 7XX XXX XXXX",
      instructions_en: "Send via Zain Cash with your order reference, then upload proof.",
      instructions_ar: "أرسل عبر زين كاش مع مرجع الطلب، ثم ارفع الإثبات.",
    },
    superqi: {
      enabled: true,
      wallet_label_en: "SuperQi wallet (Iraq)",
      wallet_label_ar: "محفظة سوبر كي (العراق)",
      wallet_id: "+964 7XX XXX XXXX",
      instructions_en: "Pay via SuperQi with your order reference, then upload proof.",
      instructions_ar: "ادفع عبر سوبر كي مع مرجع الطلب، ثم ارفع الإثبات.",
    },
    usdt: {
      enabled: true,
      wallet_label_en: "USDT wallet",
      wallet_label_ar: "محفظة USDT",
      wallet_id: "TBD — desk confirms address",
      network: "TRC20 (Tron)",
      instructions_en: "USDT TRC20 — desk confirms wallet and amount before you send.",
      instructions_ar: "USDT شبكة TRC20 — المكتب يؤكد العنوان والمبلغ قبل الإرسال.",
    },
  },
  supported_currencies: ["AED", "USD", "IQD", "USDT"],
  require_kyc_before_payment: true,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (url && serviceKey) {
      const service = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await service
        .from("platform_settings")
        .select("value")
        .eq("key", "pgr_admin_settings")
        .maybeSingle();

      const ps = (data?.value as { payment_settings?: Record<string, unknown> })?.payment_settings;
      if (ps && typeof ps === "object") {
        const { internal_payment_note: _i, minimum_payment_amount: _a, max_payment_amount_before_manual_review: _b, ...pub } =
          ps as Record<string, unknown>;
        return res.status(200).json({ ...DEFAULT_PUBLIC_PAYMENT, ...pub });
      }
    }

    return res.status(200).json(DEFAULT_PUBLIC_PAYMENT);
  } catch (err: unknown) {
    console.error("[api/payment-public]", err);
    return res.status(200).json(DEFAULT_PUBLIC_PAYMENT);
  }
}

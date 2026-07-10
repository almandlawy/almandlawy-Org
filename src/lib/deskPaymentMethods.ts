/**
 * Iraqi / desk payment method details — public-safe fields only.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export interface WalletPaymentMethod {
  enabled: boolean;
  wallet_label_en: string;
  wallet_label_ar: string;
  wallet_id: string;
  instructions_en: string;
  instructions_ar: string;
  network?: string;
}

export interface DeskPaymentMethods {
  bank_transfer: { enabled: boolean };
  zain_cash: WalletPaymentMethod;
  superqi: WalletPaymentMethod;
  usdt: WalletPaymentMethod;
}

export const DEFAULT_DESK_PAYMENT_METHODS: DeskPaymentMethods = {
  bank_transfer: { enabled: true },
  zain_cash: {
    enabled: true,
    wallet_label_en: "Zain Cash wallet (Iraq)",
    wallet_label_ar: "محفظة زين كاش (العراق)",
    wallet_id: "+964 7XX XXX XXXX",
    instructions_en:
      "Send the exact quoted amount in IQD via Zain Cash. Add your order reference in the transfer note. Screenshot the receipt and upload below.",
    instructions_ar:
      "أرسل المبلغ المؤكد بالدينار عبر زين كاش. اكتب مرجع الطلب في الملاحظة. ارفع لقطة الشاشة أدناه.",
  },
  superqi: {
    enabled: true,
    wallet_label_en: "SuperQi wallet (Iraq)",
    wallet_label_ar: "محفظة سوبر كي (العراق)",
    wallet_id: "+964 7XX XXX XXXX",
    instructions_en:
      "Pay via SuperQi to the PGR UAE desk wallet. Include your order reference. Upload payment proof after sending.",
    instructions_ar:
      "ادفع عبر سوبر كي لمحفظة مكتب PGR UAE. ضع مرجع الطلب. ارفع إثبات الدفع بعد الإرسال.",
  },
  usdt: {
    enabled: true,
    wallet_label_en: "USDT wallet",
    wallet_label_ar: "محفظة USDT",
    wallet_id: "TBD — desk sends address after quote acceptance",
    network: "TRC20 (Tron)",
    instructions_en:
      "USDT (TRC20) is available for international clients. The desk will confirm the wallet address and exact USDT amount on your firm quote. Never send without desk confirmation.",
    instructions_ar:
      "USDT (شبكة TRC20) متاح للعملاء الدوليين. المكتب يؤكد عنوان المحفظة والمبلغ على عرض السعر المعتمد. لا ترسل قبل تأكيد المكتب.",
  },
};

export type PaymentMethodId = "bank" | "zain_cash" | "superqi" | "usdt";

export const PAYMENT_METHOD_LABELS: Record<
  PaymentMethodId,
  { en: string; ar: string; icon: string }
> = {
  bank: { en: "Bank transfer", ar: "تحويل بنكي", icon: "🏦" },
  zain_cash: { en: "Zain Cash", ar: "زين كاش", icon: "📱" },
  superqi: { en: "SuperQi", ar: "سوبر كي", icon: "💳" },
  usdt: { en: "USDT", ar: "يو إس دي تي", icon: "₮" },
};

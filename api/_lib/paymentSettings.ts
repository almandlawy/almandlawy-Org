/**
 * Public payment settings — strip internal fields.
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

export interface BankTransferDetails {
  beneficiary_name: string;
  bank_name: string;
  iban: string;
  swift_code: string;
  account_number?: string;
  reference_hint: string;
  additional_notes?: string;
}

export interface PaymentSettings {
  payment_gateway_enabled: boolean;
  provider: string;
  payment_mode: string;
  public_payment_note: string;
  internal_payment_note: string;
  payment_link_instructions: string;
  bank_transfer: BankTransferDetails;
  desk_payment_methods: DeskPaymentMethods;
  supported_currencies: string[];
  minimum_payment_amount: number;
  max_payment_amount_before_manual_review: number;
  require_kyc_before_payment: boolean;
}

export type PublicPaymentSettings = Omit<
  PaymentSettings,
  "internal_payment_note" | "minimum_payment_amount" | "max_payment_amount_before_manual_review"
>;

const DEFAULT_DESK_PAYMENT_METHODS: DeskPaymentMethods = {
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

const DEFAULT_BANK_TRANSFER: BankTransferDetails = {
  beneficiary_name: "PGR UAE Precious Metals LLC",
  bank_name: "Emirates NBD Bank PJSC, Dubai Marina Branch",
  iban: "AE83 0260 0000 1209 8903 1721",
  swift_code: "EBILAEAD",
  account_number: "",
  reference_hint: "Include your quote/order reference in the wire description.",
  additional_notes: "AED/USD multi-currency account.",
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  payment_gateway_enabled: false,
  provider: "Manual Bank Transfer",
  payment_mode: "Bank transfer only",
  public_payment_note:
    "بعد قبول عرض السعر المؤكد، يمكنك الدفع عبر: تحويل بنكي، زين كاش، سوبر كي، أو USDT (TRC20). ارفع إثبات الدفع من لوحة حسابك.",
  internal_payment_note: "Gateway secrets in server env only.",
  payment_link_instructions:
    "اختر طريقة الدفع المناسبة (تحويل بنكي · زين كاش · سوبر كي · USDT). أرسل المبلغ المؤكد مع مرجع الطلب، ثم ارفع صورة الإيصال.",
  bank_transfer: { ...DEFAULT_BANK_TRANSFER },
  desk_payment_methods: DEFAULT_DESK_PAYMENT_METHODS,
  supported_currencies: ["AED", "USD", "IQD", "USDT"],
  minimum_payment_amount: 1000,
  max_payment_amount_before_manual_review: 250000,
  require_kyc_before_payment: true,
};

function mergeDeskMethods(raw: unknown): DeskPaymentMethods {
  const d = (raw && typeof raw === "object" ? raw : {}) as Partial<DeskPaymentMethods>;
  return {
    bank_transfer: {
      ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.bank_transfer,
      ...(d.bank_transfer || {}),
    },
    zain_cash: {
      ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.zain_cash,
      ...(d.zain_cash || {}),
    },
    superqi: {
      ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.superqi,
      ...(d.superqi || {}),
    },
    usdt: {
      ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.usdt,
      ...(d.usdt || {}),
    },
  };
}

export function mergePaymentSettings(raw: unknown): PaymentSettings {
  const ps = (raw && typeof raw === "object" ? raw : {}) as Partial<PaymentSettings>;
  return {
    ...DEFAULT_PAYMENT_SETTINGS,
    ...ps,
    bank_transfer: {
      ...DEFAULT_PAYMENT_SETTINGS.bank_transfer,
      ...(ps.bank_transfer || {}),
    },
    desk_payment_methods: mergeDeskMethods(ps.desk_payment_methods),
  };
}

export function toPublicPaymentSettings(ps: PaymentSettings): PublicPaymentSettings {
  const {
    internal_payment_note: _i,
    minimum_payment_amount: _min,
    max_payment_amount_before_manual_review: _max,
    ...publicFields
  } = ps;
  return publicFields;
}

export function paymentSettingsFromPlatform(settings: Record<string, unknown>): PaymentSettings {
  return mergePaymentSettings(settings.payment_settings);
}

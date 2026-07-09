/**
 * Public payment settings — strip internal fields.
 * @license SPDX-License-Identifier: Apache-2.0
 */

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
  supported_currencies: string[];
  minimum_payment_amount: number;
  max_payment_amount_before_manual_review: number;
  require_kyc_before_payment: boolean;
}

export type PublicPaymentSettings = Omit<
  PaymentSettings,
  "internal_payment_note" | "minimum_payment_amount" | "max_payment_amount_before_manual_review"
>;

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
    "Payment is arranged only after your firm quote is accepted. Transfer to the PGR UAE desk account below, then upload your payment proof.",
  internal_payment_note: "Gateway secrets in server env only.",
  payment_link_instructions:
    "After accepting your firm quote, transfer the total amount to the bank details below. Use your order reference in the transfer description, then upload a screenshot or PDF receipt.",
  bank_transfer: { ...DEFAULT_BANK_TRANSFER },
  supported_currencies: ["AED", "USD", "IQD"],
  minimum_payment_amount: 1000,
  max_payment_amount_before_manual_review: 250000,
  require_kyc_before_payment: true,
};

export function mergePaymentSettings(raw: unknown): PaymentSettings {
  const ps = (raw && typeof raw === "object" ? raw : {}) as Partial<PaymentSettings>;
  return {
    ...DEFAULT_PAYMENT_SETTINGS,
    ...ps,
    bank_transfer: {
      ...DEFAULT_PAYMENT_SETTINGS.bank_transfer,
      ...(ps.bank_transfer || {}),
    },
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

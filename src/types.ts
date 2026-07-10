/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CurrencyPrice {
  ounce: number;
  gram: number;
}

export interface MetalPriceData {
  spot_usd_oz: number;
  currencies: {
    USD: CurrencyPrice;
    AED: CurrencyPrice;
    EUR: CurrencyPrice;
    GBP: CurrencyPrice;
    SAR: CurrencyPrice;
    IQD?: CurrencyPrice;
  };
}

export interface LiveMarketRates {
  gold: MetalPriceData;
  silver: MetalPriceData;
  platinum: MetalPriceData;
  palladium: MetalPriceData;
  source_status?: "live" | "cached" | "fallback" | "reference";
  updated_at?: string;
  cache_timestamp?: string;
  /** USD/IQD from admin settings or price API */
  usd_iqd?: number;
  /** USD/AED from admin settings or price API */
  usd_aed?: number;
}

export type MetalCategory =
  | "gold_bars"
  | "silver_bars"
  | "mint_bars_coins"
  | "custom_inquiry";

export interface TechnicalSpecifications {
  weight_grams?: number;
  weight_oz?: number;
  purity: string;
  metal: "gold" | "silver" | "platinum" | "palladium";
  dimensions?: string;
  thickness?: string;
  packaging?: string;
  serial_number?: boolean;
}

export interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  category: MetalCategory;
  weight_label: string;
  purity: string;
  manufacturer: string;
  country_en: string;
  country_ar: string;
  availability: "In Stock" | "Available on Order" | "Limited Stock" | "متوفر" | "متوفر عند الطلب" | "كمية محدودة";
  certificate_en: string;
  certificate_ar: string;
  description_en: string;
  description_ar: string;
  technical_specs: TechnicalSpecifications;
  image_placeholder: "gold_bar" | "silver_bar" | "gold_coin" | "silver_coin";
  premium_multiplier: number; // Applied to spot price for realistic pricing on request estimations
  brand?: string;
  price?: number;
  price_mode?: "spot" | "fixed";
  image_url?: string;
  stock_status?: "In Stock" | "Out of Stock" | "Pre-order";
  certificate_url?: string;
  published?: boolean;
  /** Highlighted for Iraq retail demand (Palm / SAM silver) */
  iraq_popular?: boolean;
  /** Lower number = higher priority in Iraq offers section */
  iraq_offer_rank?: number;
  /** Internal desk inventory (admin only — StakTrakr-inspired) */
  storage_location?: string;
  lot_reference?: string;
  qty_on_hand?: number;
  inventory_notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface QuoteRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  metalInterest: "gold" | "silver" | "both";
  productCategory?: string;
  weightPreference?: string;
  message?: string;
  status?: "Pending" | "Approved" | "Rejected";
  created_at?: string;
}

export interface KYCDocument {
  id: string;
  type: string; // "Emirates ID" | "Iraqi National Card" | "Iraqi Passport" | "UAE Residence Visa" | "Trade License" | "Authorized Letter"
  number: string;
  front_url?: string;
  back_url?: string;
  passport_url?: string;
  proof_of_address_url?: string;
  status: "Pending" | "Verified" | "Rejected";
  updated_at: string;
}

export interface KYCProfile {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
  nationality: string;
  dob: string;
  source_of_funds_declaration: string;
  agreement_accepted: boolean;
  privacy_consent: boolean;
  status: "Not submitted" | "Pending review" | "More information required" | "Verified" | "Rejected";
  documents: KYCDocument[];
  verified_at?: string;
}

export interface PickupPoint {
  id: string;
  name_en: string;
  name_ar: string;
  city_en: string;
  city_ar: string;
  address_en: string;
  address_ar: string;
  phone: string;
  whatsapp: string;
  working_hours_en: string;
  working_hours_ar: string;
  maps_link?: string;
  status: "Active" | "Coming Soon" | "Partner Pickup Point";
}

export interface IraqDeliveryRequest {
  id: string;
  customer_id: string;
  order_id: string;
  governorate: string; // Baghdad, Basra, Erbil, Najaf, Karbala, Mosul, etc.
  address_details: string;
  phone: string;
  status: "Request received" | "Customer verified" | "Product confirmed" | "Payment confirmed" | "Preparing shipment" | "Shipped" | "Ready for pickup" | "Delivered";
  created_at: string;
  customs_docs_status: "Pending" | "Approved" | "Not Required";
}

export interface BullionOwnershipAccount {
  id: string;
  customer_id: string;
  metal: "gold" | "silver";
  weight_grams: number;
  average_purchase_price_usd: number;
  total_purchase_amount_usd: number;
  current_market_value_usd: number;
  daily_change_percent: number;
  monthly_change_percent: number;
}

export interface BuybackRequest {
  id: string;
  customer_id: string;
  metal: "gold" | "silver";
  weight_grams: number;
  purity: string;
  status: "Pending" | "Estimated" | "Approved" | "Completed" | "Rejected";
  estimated_payout_usd?: number;
  exchange_rate_iqd?: number;
  created_at: string;
}

export type PricingCurrency = "AED" | "USD";
export type PricingUnit = "per_gram" | "per_kg" | "per_troy_ounce";
export type ShippingCurrency = "AED" | "USD" | "IQD";

export interface DailyPricingSettings {
  gold_daily_reference_price: number;
  silver_daily_reference_price: number;
  currency: PricingCurrency;
  unit: PricingUnit;
  manual_pricing_enabled: boolean;
  effective_date: string;
  reason_for_update: string;
  updated_by_admin: string;
  last_updated_at: string;
}

export interface ShippingSettings {
  shipping_enabled: boolean;
  shipping_company_name: string;
  shipping_method: string;
  shipping_price: number;
  currency: ShippingCurrency;
  destination_country: string;
  destination_city_region: string;
  estimated_delivery_time: string;
  public_shipping_note: string;
  internal_shipping_notes: string;
}

export interface QuoteSignaturePayload {
  quoteId: string;
  customerId: string;
  productFirmPrice: number;
  shippingFee: number;
  totalFirmQuote: number;
  currency: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}

export type PartnerLogoCategory =
  | "Bank"
  | "Payment Gateway"
  | "Logistics"
  | "Security Delivery"
  | "Compliance"
  | "Market Data"
  | "Other";

export interface PartnerLogo {
  id: string;
  name: string;
  category: PartnerLogoCategory;
  logo_url: string;
  website_url?: string;
  public_display_enabled: boolean;
  display_order: number;
  internal_note?: string;
  created_at?: string;
  updated_at?: string;
}

export type PaymentProvider =
  | "N-Genius / Network International"
  | "PayTabs"
  | "Amazon Payment Services"
  | "Stripe"
  | "Manual Bank Transfer"
  | "Other";

export type PaymentMode =
  | "Payment Link after firm quote"
  | "Deposit after firm quote"
  | "Full payment after firm quote"
  | "Bank transfer only";

export interface BankTransferDetails {
  beneficiary_name: string;
  bank_name: string;
  iban: string;
  swift_code: string;
  account_number?: string;
  reference_hint: string;
  additional_notes?: string;
}

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

export interface PaymentSettings {
  payment_gateway_enabled: boolean;
  provider: PaymentProvider;
  payment_mode: PaymentMode;
  public_payment_note: string;
  internal_payment_note: string;
  payment_link_instructions: string;
  bank_transfer: BankTransferDetails;
  desk_payment_methods: DeskPaymentMethods;
  supported_currencies: ("AED" | "USD" | "IQD" | "USDT")[];
  minimum_payment_amount: number;
  max_payment_amount_before_manual_review: number;
  require_kyc_before_payment: boolean;
}

/** Public-safe subset — never expose internal notes or gateway secrets */
export interface PublicPaymentSettings {
  payment_gateway_enabled: boolean;
  provider: PaymentProvider;
  payment_mode: PaymentMode;
  public_payment_note: string;
  payment_link_instructions: string;
  bank_transfer: BankTransferDetails;
  desk_payment_methods: DeskPaymentMethods;
  supported_currencies: ("AED" | "USD" | "IQD" | "USDT")[];
  require_kyc_before_payment: boolean;
}


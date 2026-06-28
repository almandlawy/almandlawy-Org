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
  };
}

export interface LiveMarketRates {
  gold: MetalPriceData;
  silver: MetalPriceData;
  platinum: MetalPriceData;
  palladium: MetalPriceData;
}

export type MetalCategory = "gold_bars" | "silver_bars" | "gold_coins" | "silver_coins";

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
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type QuoteStatus =
  | "awaiting_confirmation"
  | "price_confirmed"
  | "awaiting_payment"
  | "rejected"
  | "cancelled"
  | "order_created"
  | "Pending"
  | "Approved"
  | "Rejected";

export type OrderStatus =
  | "awaiting_confirmation"
  | "price_confirmed"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled"
  | "Quoted"
  | "Awaiting Payment"
  | "Paid / In Vault"
  | "Shipped"
  | "Delivered";

export type PaymentStatus = "unpaid" | "pending_review" | "paid" | "Pending" | "Paid";

export interface QuoteRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  metalInterest?: "gold" | "silver" | "both";
  productCategory?: string;
  weightPreference?: string;
  message?: string;
  status?: QuoteStatus;
  created_at?: string;
}

export interface QuoteRequestRecord {
  id?: string;
  customer_id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  metal_interest?: "gold" | "silver" | "both";
  weight_preference?: string;
  message?: string;
  status?: QuoteStatus;
  confirmed_price?: number;
  currency?: string;
  admin_notes?: string;
  quote_expiry?: string;
  created_at?: string;
}

export interface OrderRecord {
  id?: string;
  customer_id?: string;
  quote_id?: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  status?: OrderStatus;
  confirmed_price?: number;
  currency?: string;
  payment_status?: PaymentStatus;
  payment_link?: string;
  bank_transfer_details?: string;
  payment_receipt_url?: string;
  delivery_status?: string;
  invoice_url?: string;
  certificate_url?: string;
  admin_notes?: string;
  quote_expiry?: string;
  shipping_method?: string;
  shipping_address?: string;
  items?: Array<{ product_id?: string; product_name?: string; quantity?: number; unit_price?: number }>;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerProfile {
  id?: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  preferred_language?: "en" | "ar";
  company_name?: string;
  delivery_destination?: string;
  created_at?: string;
  updated_at?: string;
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


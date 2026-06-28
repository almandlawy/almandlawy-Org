/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CustomerProfile, OrderRecord, QuoteRequestRecord } from "../types";

export const ORDER_STATUSES = [
  "awaiting_confirmation",
  "price_confirmed",
  "awaiting_payment",
  "paid",
  "processing",
  "ready_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const QUOTE_STATUSES = [
  "awaiting_confirmation",
  "price_confirmed",
  "awaiting_payment",
  "rejected",
  "cancelled",
  "order_created",
] as const;

export function normalizeQuote(raw: any): QuoteRequestRecord {
  return {
    id: raw.id,
    customer_id: raw.customer_id || raw.customerId,
    name: raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    company: raw.company,
    product_id: raw.product_id || raw.productId,
    product_name: raw.product_name || raw.productCategory || raw.product_category || "General Bullion",
    quantity: raw.quantity ?? 1,
    metal_interest: raw.metal_interest || raw.metalInterest || "gold",
    weight_preference: raw.weight_preference || raw.weightPreference || raw.weight,
    message: raw.message || "",
    status: raw.status || "awaiting_confirmation",
    confirmed_price: raw.confirmed_price ?? raw.confirmedPrice,
    currency: raw.currency || "USD",
    admin_notes: raw.admin_notes || raw.adminNotes,
    quote_expiry: raw.quote_expiry || raw.quoteExpiry,
    created_at: raw.created_at || raw.createdAt,
  };
}

export function normalizeOrder(raw: any): OrderRecord {
  return {
    id: raw.id,
    customer_id: raw.customer_id || raw.customerId,
    quote_id: raw.quote_id || raw.quoteId,
    product_id: raw.product_id || raw.productId,
    product_name: raw.product_name || raw.productName,
    quantity: raw.quantity ?? 1,
    status: raw.status || "awaiting_confirmation",
    confirmed_price: raw.confirmed_price ?? raw.confirmedPrice ?? raw.total_amount ?? raw.totalAmount,
    currency: raw.currency || "USD",
    payment_status: raw.payment_status || raw.paymentStatus || "unpaid",
    payment_link: raw.payment_link || raw.paymentLink,
    bank_transfer_details: raw.bank_transfer_details || raw.bankTransferDetails,
    payment_receipt_url: raw.payment_receipt_url || raw.paymentReceiptUrl,
    delivery_status: raw.delivery_status || raw.deliveryStatus || raw.status,
    invoice_url: raw.invoice_url || raw.invoiceUrl,
    certificate_url: raw.certificate_url || raw.certificateUrl,
    admin_notes: raw.admin_notes || raw.adminNotes,
    quote_expiry: raw.quote_expiry || raw.quoteExpiry,
    shipping_method: raw.shipping_method || raw.shippingMethod,
    shipping_address: raw.shipping_address || raw.shippingAddress,
    items: raw.items || raw.order_items,
    created_at: raw.created_at || raw.createdAt,
    updated_at: raw.updated_at || raw.updatedAt,
  };
}

export function orderStatusLabel(status: string, isAr: boolean): string {
  const map: Record<string, { en: string; ar: string }> = {
    awaiting_confirmation: { en: "Awaiting confirmation", ar: "بانتظار التأكيد" },
    price_confirmed: { en: "Price confirmed", ar: "تم تأكيد السعر" },
    awaiting_payment: { en: "Awaiting payment", ar: "بانتظار الدفع" },
    paid: { en: "Paid", ar: "مدفوع" },
    processing: { en: "Processing", ar: "قيد المعالجة" },
    ready_for_delivery: { en: "Ready for delivery", ar: "جاهز للتسليم" },
    delivered: { en: "Delivered", ar: "تم التسليم" },
    cancelled: { en: "Cancelled", ar: "ملغى" },
    rejected: { en: "Rejected", ar: "مرفوض" },
    order_created: { en: "Order created", ar: "تم إنشاء الطلب" },
    Pending: { en: "Awaiting confirmation", ar: "بانتظار التأكيد" },
    Approved: { en: "Price confirmed", ar: "تم تأكيد السعر" },
    Rejected: { en: "Rejected", ar: "مرفوض" },
    Quoted: { en: "Price confirmed", ar: "تم تأكيد السعر" },
    "Awaiting Payment": { en: "Awaiting payment", ar: "بانتظار الدفع" },
  };
  const entry = map[status] || { en: status, ar: status };
  return isAr ? entry.ar : entry.en;
}

export function paymentStatusLabel(status: string, isAr: boolean): string {
  const map: Record<string, { en: string; ar: string }> = {
    unpaid: { en: "Unpaid", ar: "غير مدفوع" },
    pending_review: { en: "Receipt under review", ar: "الإيصال قيد المراجعة" },
    paid: { en: "Paid", ar: "مدفوع" },
    Pending: { en: "Awaiting payment", ar: "بانتظار الدفع" },
    Paid: { en: "Paid", ar: "مدفوع" },
  };
  const entry = map[status] || { en: status, ar: status };
  return isAr ? entry.ar : entry.en;
}

export function quoteToDbPayload(quote: Partial<QuoteRequestRecord>): Record<string, unknown> {
  return {
    id: quote.id,
    customer_id: quote.customer_id,
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    company: quote.company,
    product_id: quote.product_id,
    product_name: quote.product_name,
    quantity: quote.quantity,
    metal_interest: quote.metal_interest,
    weight_preference: quote.weight_preference,
    message: quote.message,
    status: quote.status,
    confirmed_price: quote.confirmed_price,
    currency: quote.currency,
    admin_notes: quote.admin_notes,
    quote_expiry: quote.quote_expiry,
  };
}

export function orderToDbPayload(order: Partial<OrderRecord>): Record<string, unknown> {
  return {
    id: order.id,
    customer_id: order.customer_id,
    quote_id: order.quote_id,
    product_id: order.product_id,
    product_name: order.product_name,
    quantity: order.quantity,
    status: order.status,
    confirmed_price: order.confirmed_price,
    currency: order.currency,
    payment_status: order.payment_status,
    payment_link: order.payment_link,
    bank_transfer_details: order.bank_transfer_details,
    payment_receipt_url: order.payment_receipt_url,
    delivery_status: order.delivery_status,
    invoice_url: order.invoice_url,
    certificate_url: order.certificate_url,
    admin_notes: order.admin_notes,
    quote_expiry: order.quote_expiry,
    shipping_method: order.shipping_method,
    shipping_address: order.shipping_address,
    updated_at: new Date().toISOString(),
  };
}

export function customerToDbPayload(customer: Partial<CustomerProfile>): Record<string, unknown> {
  return {
    id: customer.id,
    auth_user_id: customer.auth_user_id || customer.id,
    full_name: customer.full_name,
    email: customer.email,
    phone: customer.phone,
    country: customer.country,
    city: customer.city,
    preferred_language: customer.preferred_language,
    company_name: customer.company_name,
    delivery_destination: customer.delivery_destination,
    updated_at: new Date().toISOString(),
  };
}

export const PAYMENT_WHATSAPP_URL =
  "https://wa.me/971559688837?text=" +
  encodeURIComponent("Hello, I have a question about payment for a confirmed PGR UAE order.");

export const PAYMENT_WHATSAPP_URL_AR =
  "https://wa.me/971559688837?text=" +
  encodeURIComponent("مرحباً، لدي استفسار بخصوص دفع طلب مؤكد في PGR UAE.");

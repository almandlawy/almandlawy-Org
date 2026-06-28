/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  FileText,
  Clipboard,
  Truck,
  CreditCard,
  User,
  LayoutDashboard,
  Upload,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { dbService, isLive, supabase } from "../lib/supabase";
import {
  normalizeOrder,
  normalizeQuote,
  orderStatusLabel,
  paymentStatusLabel,
  PAYMENT_WHATSAPP_URL,
  PAYMENT_WHATSAPP_URL_AR,
} from "../lib/accountHelpers";
import type { CustomerProfile, OrderRecord, QuoteRequestRecord } from "../types";

type DashboardTab =
  | "overview"
  | "quotes"
  | "orders"
  | "payments"
  | "delivery"
  | "documents"
  | "profile";

interface CustomerAccountDashboardProps {
  currentLang: "en" | "ar";
  user: any;
  onClose: () => void;
  onLogout: () => void;
}

export default function CustomerAccountDashboard({
  currentLang,
  user,
  onClose,
  onLogout,
}: CustomerAccountDashboardProps) {
  const isAr = currentLang === "ar";
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [quotes, setQuotes] = useState<QuoteRequestRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiptUploading, setReceiptUploading] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    preferred_language: currentLang as "en" | "ar",
    company_name: "",
    delivery_destination: "",
  });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [customerProfile, quoteList, orderList, deliveryList] = await Promise.all([
        dbService.customers.getByAuthId(user.id),
        dbService.quoteRequests.listByCustomer(user.id, user.email),
        dbService.orders.listByCustomer(user.id, user.email),
        dbService.iraqDelivery.list(user.id),
      ]);

      const normalizedQuotes = (quoteList || []).map(normalizeQuote);
      const normalizedOrders = (orderList || []).map(normalizeOrder);

      setQuotes(normalizedQuotes);
      setOrders(normalizedOrders);
      setDeliveries(deliveryList || []);

      const p: CustomerProfile = customerProfile || {
        id: user.id,
        auth_user_id: user.id,
        full_name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: "",
        city: "",
        preferred_language: currentLang,
        company_name: "",
        delivery_destination: "",
      };
      setProfile(p);
      setProfileForm({
        full_name: p.full_name || user.name || "",
        email: p.email || user.email || "",
        phone: p.phone || "",
        country: p.country || "",
        city: p.city || "",
        preferred_language: (p.preferred_language as "en" | "ar") || currentLang,
        company_name: p.company_name || "",
        delivery_destination: p.delivery_destination || "",
      });
    } catch (err) {
      console.error("Failed to load customer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const activeQuotes = useMemo(
    () =>
      quotes.filter((q) =>
        ["awaiting_confirmation", "price_confirmed", "Pending", "Approved"].includes(q.status || "")
      ),
    [quotes]
  );

  const confirmedOrders = useMemo(
    () =>
      orders.filter((o) =>
        !["cancelled", "Cancelled"].includes(o.status || "")
      ),
    [orders]
  );

  const pendingPayments = useMemo(
    () =>
      orders.filter((o) =>
        ["awaiting_payment", "Awaiting Payment", "price_confirmed"].includes(o.status || "") &&
        !["paid", "Paid"].includes(o.payment_status || "")
      ),
    [orders]
  );

  const deliveryOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["processing", "ready_for_delivery", "delivered", "Shipped", "Delivered", "Paid / In Vault"].includes(
          o.status || o.delivery_status || ""
        )
      ),
    [orders]
  );

  const documentItems = useMemo(() => {
    const docs: Array<{ id: string; label: string; url?: string; type: string }> = [];
    orders.forEach((o) => {
      if (o.invoice_url) docs.push({ id: `${o.id}-inv`, label: `${o.id} — Invoice`, url: o.invoice_url, type: "invoice" });
      if (o.certificate_url) docs.push({ id: `${o.id}-cert`, label: `${o.id} — Certificate`, url: o.certificate_url, type: "certificate" });
    });
    return docs;
  }, [orders]);

  const handleReceiptUpload = async (orderId: string, file: File) => {
    setReceiptUploading(orderId);
    try {
      let receiptUrl = "";
      if (isLive && supabase) {
        const ext = file.name.split(".").pop();
        const path = `receipts/${orderId}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("payment-receipts").upload(path, file);
        if (!error) {
          const { data } = supabase.storage.from("payment-receipts").getPublicUrl(path);
          receiptUrl = data.publicUrl;
        }
      }
      if (!receiptUrl) {
        receiptUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      await dbService.orders.update(orderId, {
        payment_receipt_url: receiptUrl,
        payment_status: "pending_review",
      });
      await loadData();
    } catch (err) {
      console.error("Receipt upload failed:", err);
      alert(isAr ? "تعذر رفع الإيصال. حاول مرة أخرى." : "Could not upload receipt. Please try again.");
    } finally {
      setReceiptUploading(null);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      await dbService.customers.upsert({
        id: user.id,
        auth_user_id: user.id,
        ...profileForm,
      });
      setProfileMessage(isAr ? "تم حفظ الملف الشخصي." : "Profile saved successfully.");
      await loadData();
    } catch (err) {
      setProfileMessage(isAr ? "تعذر حفظ الملف الشخصي." : "Could not save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const tabs: { id: DashboardTab; label_en: string; label_ar: string; icon: React.ReactNode }[] = [
    { id: "overview", label_en: "Overview", label_ar: "نظرة عامة", icon: <LayoutDashboard size={14} /> },
    { id: "quotes", label_en: "Quote Requests", label_ar: "طلبات التسعير", icon: <Clipboard size={14} /> },
    { id: "orders", label_en: "Confirmed Orders", label_ar: "الطلبات المؤكدة", icon: <CheckCircle size={14} /> },
    { id: "payments", label_en: "Pending Payments", label_ar: "المدفوعات المعلقة", icon: <CreditCard size={14} /> },
    { id: "delivery", label_en: "Delivery", label_ar: "التسليم", icon: <Truck size={14} /> },
    { id: "documents", label_en: "Documents", label_ar: "المستندات", icon: <FileText size={14} /> },
    { id: "profile", label_en: "Profile", label_ar: "الملف الشخصي", icon: <User size={14} /> },
  ];

  const renderOrderCard = (order: OrderRecord, showPaymentActions = false) => (
    <div key={order.id} className="p-4 bg-[#0d0d0e] border border-white/[0.04] rounded space-y-3">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <p className="text-white font-mono text-sm font-bold">{order.id}</p>
          <p className="text-gray-400 text-xs">{order.product_name}</p>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-950/30 text-gold-base text-[10px] uppercase">
          {orderStatusLabel(order.status || "", isAr)}
        </span>
      </div>

      {order.confirmed_price != null && (
        <p className="text-gold-light text-sm font-semibold">
          {order.confirmed_price.toLocaleString()} {order.currency}
          <span className="text-gray-500 text-[10px] ml-2 font-normal">
            {isAr ? "السعر النهائي مؤكد قبل الدفع" : "Final price confirmed before payment"}
          </span>
        </p>
      )}

      {order.admin_notes && (
        <p className="text-gray-400 text-xs border-l-2 border-gold-base/30 pl-2">{order.admin_notes}</p>
      )}

      {showPaymentActions && (
        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            {isAr ? "يتم قبول الدفع فقط بعد تأكيد السعر والتوفر." : "Payment is accepted only after price and availability are confirmed."}
          </p>

          {order.payment_link && (
            <a
              href={order.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gold-base text-black text-xs font-semibold rounded hover:bg-gold-light transition-colors"
            >
              <ExternalLink size={12} />
              {isAr ? "الدفع للطلب المؤكد" : "Pay for confirmed order"}
            </a>
          )}

          {order.bank_transfer_details && (
            <div className="p-3 bg-black/40 border border-white/[0.05] rounded text-xs text-gray-300 whitespace-pre-wrap">
              <p className="text-gold-base text-[10px] uppercase mb-1">
                {isAr ? "تعليمات التحويل البنكي" : "Bank transfer instructions"}
              </p>
              {order.bank_transfer_details}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-white/10 rounded text-xs text-gray-300 cursor-pointer hover:border-gold-base/40">
              <Upload size={12} />
              {receiptUploading === order.id
                ? isAr ? "جاري الرفع..." : "Uploading..."
                : isAr ? "رفع إيصال الدفع" : "Upload payment receipt"}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                disabled={receiptUploading === order.id}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && order.id) handleReceiptUpload(order.id, file);
                }}
              />
            </label>
            <span className="text-[10px] text-gray-500">
              {paymentStatusLabel(order.payment_status || "unpaid", isAr)}
            </span>
          </div>

          <a
            href={isAr ? PAYMENT_WHATSAPP_URL_AR : PAYMENT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300"
          >
            <MessageCircle size={12} />
            {isAr ? "استفسار دفع عبر واتساب" : "Payment question on WhatsApp"}
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-[90vh]" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/[0.05]">
        <div>
          <p className="text-[10px] font-mono text-gold-base uppercase tracking-widest">
            {isAr ? "حساب العميل" : "Customer Account"}
          </p>
          <h2 className="text-xl font-serif text-white">{profileForm.full_name || user.name}</h2>
          <p className="text-xs text-gray-500">{profileForm.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-white/10 rounded hover:text-white cursor-pointer"
          >
            <LogOut size={12} />
            {isAr ? "خروج" : "Logout"}
          </button>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <nav className="md:w-52 border-b md:border-b-0 md:border-r border-white/[0.05] p-2 md:p-4 flex md:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gold-base/15 text-gold-base border border-gold-base/25"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {tab.icon}
              {isAr ? tab.label_ar : tab.label_en}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <p className="text-gray-500 text-sm">{isAr ? "جاري التحميل..." : "Loading account data..."}</p>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-serif text-white">
                      {isAr ? "نشاط الحساب" : "Platform activity"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {isAr
                        ? "الأرقام داخل الحساب مؤشرات تشغيلية للطلبات ولا تمثل عوائد استثمارية."
                        : "Account figures are operational order indicators and do not represent investment returns."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label_en: "Active quote requests", label_ar: "طلبات تسعير نشطة", value: activeQuotes.length },
                      { label_en: "Confirmed orders", label_ar: "طلبات مؤكدة", value: confirmedOrders.length },
                      { label_en: "Pending payments", label_ar: "مدفوعات معلقة", value: pendingPayments.length },
                      { label_en: "Delivery requests", label_ar: "طلبات تسليم", value: deliveries.length },
                    ].map((card) => (
                      <div key={card.label_en} className="p-4 bg-[#0d0d0e] border border-white/[0.04] rounded">
                        <p className="text-2xl font-bold text-gold-base">{card.value}</p>
                        <p className="text-[10px] text-gray-500 uppercase mt-1">{isAr ? card.label_ar : card.label_en}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-950/10 border border-amber-900/20 rounded text-xs text-amber-200/80">
                    {isAr
                      ? "يتم تأكيد السعر النهائي قبل الدفع. اطلب تسعيراً أولاً، ثم ادفع للطلب المؤكد فقط."
                      : "Final price is confirmed before payment. Request a quote first, then pay only for confirmed orders."}
                  </div>

                  {pendingPayments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm text-white font-semibold">
                        {isAr ? "مدفوعات تحتاج إجراء" : "Payments requiring action"}
                      </h4>
                      {pendingPayments.slice(0, 2).map((o) => renderOrderCard(o, true))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "quotes" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-white">{isAr ? "طلبات التسعير" : "My quote requests"}</h3>
                  {quotes.length === 0 ? (
                    <p className="text-gray-500 text-sm">{isAr ? "لا توجد طلبات تسعير." : "No quote requests yet."}</p>
                  ) : (
                    quotes.map((q) => (
                      <div key={q.id} className="p-4 bg-[#0d0d0e] border border-white/[0.04] rounded space-y-2">
                        <div className="flex justify-between gap-2">
                          <p className="text-white font-mono text-sm">{q.id}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/30 text-gold-base">
                            {orderStatusLabel(q.status || "awaiting_confirmation", isAr)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{q.product_name}</p>
                        {q.confirmed_price != null && (
                          <p className="text-gold-light text-sm">
                            {q.confirmed_price.toLocaleString()} {q.currency}
                          </p>
                        )}
                        {q.message && <p className="text-gray-500 text-xs">{q.message}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-white">{isAr ? "الطلبات المؤكدة" : "My confirmed orders"}</h3>
                  {confirmedOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm">{isAr ? "لا توجد طلبات مؤكدة." : "No confirmed orders yet."}</p>
                  ) : (
                    confirmedOrders.map((o) => renderOrderCard(o, false))
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-white">
                    {isAr ? "الدفع للطلبات المؤكدة" : "Payment for confirmed orders"}
                  </h3>
                  <div className="p-4 bg-[#0d0d0e] border border-white/[0.04] rounded space-y-2 text-xs text-gray-400">
                    <p>{isAr ? "١. اطلب تسعيراً أولاً" : "1. Request a quote first"}</p>
                    <p>{isAr ? "٢. انتظر تأكيد السعر" : "2. Wait for price confirmation"}</p>
                    <p>{isAr ? "٣. ادفع عبر رابط الدفع أو التحويل البنكي" : "3. Pay using payment link or bank transfer"}</p>
                    <p>{isAr ? "٤. ارفع الإيصال إذا لزم الأمر" : "4. Upload receipt if needed"}</p>
                    <p>{isAr ? "٥. تتبع الطلب من لوحة الحساب" : "5. Track order from your dashboard"}</p>
                  </div>
                  {pendingPayments.length === 0 && orders.filter((o) => o.payment_status === "paid" || o.payment_status === "Paid").length === 0 ? (
                    <p className="text-gray-500 text-sm">{isAr ? "لا توجد مدفوعات معلقة." : "No pending payments."}</p>
                  ) : (
                    <>
                      {pendingPayments.map((o) => renderOrderCard(o, true))}
                      {orders
                        .filter((o) => o.payment_status === "paid" || o.payment_status === "Paid")
                        .map((o) => renderOrderCard(o, false))}
                    </>
                  )}
                </div>
              )}

              {activeTab === "delivery" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-white">{isAr ? "حالة التسليم" : "Delivery status"}</h3>
                  {deliveryOrders.length === 0 && deliveries.length === 0 ? (
                    <p className="text-gray-500 text-sm">{isAr ? "لا توجد شحنات نشطة." : "No active deliveries."}</p>
                  ) : (
                    <>
                      {deliveryOrders.map((o) => (
                        <div key={o.id} className="p-4 bg-[#0d0d0e] border border-white/[0.04] rounded">
                          <p className="text-white font-mono text-sm">{o.id}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {orderStatusLabel(o.delivery_status || o.status || "", isAr)}
                          </p>
                          {o.shipping_address && <p className="text-gray-500 text-xs mt-1">{o.shipping_address}</p>}
                        </div>
                      ))}
                      {deliveries.map((d: any) => (
                        <div key={d.id} className="p-4 bg-[#0d0d0e] border border-white/[0.04] rounded">
                          <p className="text-white text-sm">{d.governorate}</p>
                          <p className="text-gray-400 text-xs">{d.status}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-white">
                    {isAr ? "المستندات والفواتير والشهادات" : "Documents, invoices & certificates"}
                  </h3>
                  {documentItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      {isAr ? "لا توجد مستندات متاحة بعد." : "No documents available yet."}
                    </p>
                  ) : (
                    documentItems.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-[#0d0d0e] border border-white/[0.04] rounded text-sm text-gold-base hover:border-gold-base/30"
                      >
                        <FileText size={14} />
                        {doc.label}
                        <ExternalLink size={12} className="ml-auto" />
                      </a>
                    ))
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                  <h3 className="text-lg font-serif text-white">{isAr ? "الملف الشخصي" : "Profile"}</h3>
                  {[
                    { key: "full_name", label_en: "Full name", label_ar: "الاسم الكامل" },
                    { key: "email", label_en: "Email", label_ar: "البريد الإلكتروني", type: "email", readOnly: true },
                    { key: "phone", label_en: "Phone / WhatsApp", label_ar: "الهاتف / واتساب" },
                    { key: "country", label_en: "Country", label_ar: "الدولة" },
                    { key: "city", label_en: "City", label_ar: "المدينة" },
                    { key: "company_name", label_en: "Company (optional)", label_ar: "الشركة (اختياري)" },
                    { key: "delivery_destination", label_en: "Delivery destination (optional)", label_ar: "وجهة التسليم (اختياري)" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase">
                        {isAr ? field.label_ar : field.label_en}
                      </label>
                      <input
                        type={field.type || "text"}
                        readOnly={field.readOnly}
                        value={(profileForm as any)[field.key]}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="w-full bg-[#111] border border-white/[0.08] rounded px-3 py-2 text-sm text-white outline-none focus:border-gold-base/40"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">
                      {isAr ? "اللغة المفضلة" : "Preferred language"}
                    </label>
                    <select
                      value={profileForm.preferred_language}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          preferred_language: e.target.value as "en" | "ar",
                        }))
                      }
                      className="w-full bg-[#111] border border-white/[0.08] rounded px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  {profileMessage && (
                    <p className={`text-xs ${profileMessage.includes("Could") || profileMessage.includes("تعذر") ? "text-red-400" : "text-green-400"}`}>
                      {profileMessage}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-4 py-2 bg-gold-base text-black text-xs font-semibold rounded hover:bg-gold-light cursor-pointer disabled:opacity-50"
                  >
                    {profileSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ الملف" : "Save profile"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

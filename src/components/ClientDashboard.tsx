import React, { useState, useEffect, useMemo } from "react";
import BrandLogo from "./BrandLogo";
import {
  Search,
  CheckCircle,
  Phone,
  ArrowLeft,
  ArrowRight,
  Clock,
  Upload,
  ShieldCheck,
  RefreshCw,
  FileText,
  Package,
  FolderOpen,
} from "lucide-react";
import { dbService } from "../lib/supabase";
import { generateQuotePDF } from "../lib/pdfGenerator";
import { formatQuoteAmount } from "../lib/quoteUtils";
import { kycStatusLabel, canRequestQuote, normalizeKycStatus } from "../lib/kycGate";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { notifyDesk } from "../lib/deskNotify";
import { trackWhatsAppClick } from "../lib/gtag";
import PaymentInstructionsPanel from "./PaymentInstructionsPanel";
import type { AppUser } from "../lib/clientAuth";
import type { PublicPaymentSettings } from "../types";

interface ClientDashboardProps {
  currentLang: "en" | "ar";
  user: AppUser;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onRequestQuote: () => void;
}

function formatCustomerRef(userId: string): string {
  return `PGR-${userId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

const TERMINAL_QUOTE_STATUSES = new Set([
  "Cancelled",
  "Rejected",
  "Expired Quote",
  "Completed",
]);

function QuoteItem({
  q,
  handleClientUploadKYC,
  handleClientAcceptQuote,
  loadData,
  currentLang,
}: {
  q: any;
  handleClientUploadKYC: (quoteId: string) => void;
  handleClientAcceptQuote: (quoteId: string) => void;
  loadData: () => void;
  currentLang: "en" | "ar";
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const isAr = currentLang === "ar";

  useEffect(() => {
    if (q.status !== "Quote Sent" || !q.expires_at) return;

    const updateTimer = () => {
      const expTime = new Date(q.expires_at).getTime();
      const diff = expTime - Date.now();

      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsExpired(true);
        if (q.status === "Quote Sent") {
          dbService.quoteRequests.updateStatus(q.id, "Expired Quote").then(() => loadData());
        }
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [q.status, q.expires_at, q.id, loadData]);

  const isNew =
    q.status === "New Request" ||
    q.status === "Pending" ||
    q.status === "Desk Review";

  const displayStatus = (() => {
    const s = q.status || "New";
    if (!isAr) return s;
    const map: Record<string, string> = {
      "New Request": "طلب جديد",
      "Desk Review": "قيد مراجعة المكتب",
      Pending: "قيد الانتظار",
      "Quote Sent": "عرض مُرسل",
      "KYC Required": "KYC مطلوب",
      "Customer Accepted": "مقبول",
      Completed: "مكتمل",
      Cancelled: "ملغي",
      Rejected: "مرفوض",
      "Expired Quote": "منتهي",
    };
    return map[s] || s;
  })();
  const isKycReq = q.status === "KYC Required";
  const isQuoteSent = q.status === "Quote Sent" && !isExpired;
  const isAccepted = q.status === "Customer Accepted";
  const needsPayment = q.status === "Customer Accepted" || q.status === "Payment Pending";
  const isCompleted = q.status === "Completed";
  const isCancelled =
    q.status === "Cancelled" || q.status === "Rejected" || q.status === "Expired Quote" || isExpired;

  return (
    <div
      className={`p-4 bg-brand-bg border border-soft-border rounded-lg space-y-2 relative ${
        isCancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="text-text-charcoal font-serif font-bold text-sm leading-tight">
          {q.productCategory || q.product_category || q.metalInterest || q.metal_interest || (isAr ? "سبائك" : "Bullion")}
        </div>
        <span
          className={`text-[8px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded shrink-0 border border-soft-border ${
            isNew
              ? "bg-brand-section text-text-secondary"
              : isKycReq
                ? "bg-soft-danger text-gold-dark animate-pulse"
                : isQuoteSent
                  ? "bg-gold-base/10 text-gold-dark"
                  : isAccepted || isCompleted
                    ? "bg-soft-success text-olive-accent"
                    : isCancelled
                      ? "bg-brand-section text-text-secondary"
                      : "bg-brand-section text-text-secondary"
          }`}
        >
          {isCancelled ? (isAr ? "منتهي" : "Closed") : displayStatus}
        </span>
      </div>

      <div className="text-text-secondary text-[9px] font-mono flex justify-between">
        <span>Ref: {q.id}</span>
        <span>{q.weight || q.weight_preference || ""}</span>
      </div>

      {q.quoted_price != null && (
        <div className="p-2.5 bg-brand-section border border-soft-border rounded-lg mt-1">
          <div className="flex justify-between text-[10px] font-mono font-bold">
            <span className="text-text-secondary">{isAr ? "السعر المؤكد" : "Firm quote"}</span>
            <span className="text-gold-dark">{formatQuoteAmount(Number(q.quoted_price), q.currency)}</span>
          </div>
          {isQuoteSent && timeLeft && (
            <div className="flex justify-end mt-1">
              <span className="text-[9px] bg-soft-danger text-gold-dark border border-soft-border px-1.5 py-0.5 rounded font-mono font-bold">
                ⏱ {timeLeft}
              </span>
            </div>
          )}
        </div>
      )}

      {isKycReq && (
        <button
          onClick={() => handleClientUploadKYC(q.id)}
          className="w-full py-2 bg-soft-danger hover:bg-rose-100 text-gold-dark border border-soft-border rounded-lg font-mono font-bold text-[9px] uppercase flex items-center justify-center gap-1.5"
        >
          <Upload size={10} />
          {isAr ? "إكمال KYC" : "Complete KYC"}
        </button>
      )}

      {isQuoteSent && (
        <button
          onClick={() => handleClientAcceptQuote(q.id)}
          className="w-full py-2 bg-olive-accent hover:opacity-90 text-white rounded-lg font-mono font-bold text-[9px] uppercase flex items-center justify-center gap-1"
        >
          <CheckCircle size={10} />
          {isAr ? "قبول السعر المؤكد" : "Accept firm quote"}
        </button>
      )}

      {needsPayment && (
        <button
          type="button"
          onClick={() => document.getElementById("payment-instructions")?.scrollIntoView({ behavior: "smooth" })}
          className={`w-full py-2 bg-gold-base/15 border border-gold-base/40 rounded-lg text-[10px] text-gold-dark font-bold ${isAr ? "font-arabic" : "font-mono uppercase"}`}
        >
          {isAr ? "↓ تعليمات الدفع (بنك · زين كاش · سوبر كي · USDT)" : "↓ Payment — bank · Zain Cash · SuperQi · USDT"}
        </button>
      )}
    </div>
  );
}

export default function ClientDashboard({
  currentLang,
  user,
  onLogout,
  onNavigate,
  onRequestQuote,
}: ClientDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofUploadingId, setProofUploadingId] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string>("Not submitted");
  const [paymentSettings, setPaymentSettings] = useState<PublicPaymentSettings | null>(null);

  const isAr = currentLang === "ar";
  const customerRef = formatCustomerRef(user.id);
  const displayKycStatus = normalizeKycStatus(kycStatus as any);
  const waLink = buildWhatsAppLink(
    isAr ? "مرحباً، أحتاج مساعدة بخصوص حسابي في PGR UAE." : "Hello, I need help with my PGR UAE account."
  );

  const loadData = async () => {
    try {
      const [qList, oList, kyc, paySettings] = await Promise.all([
        dbService.quoteRequests.listForCustomer(user.id, user.email),
        dbService.orders.list(),
        dbService.kyc.get(user.id),
        dbService.paymentSettings.getPublic(),
      ]);
      setKycStatus(kyc?.status || "Not submitted");
      setQuotes(qList || []);
      setOrders((oList || []).filter((o: any) => o.customer_id === user.id || o.email === user.email));
      setPaymentSettings(paySettings);
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id, user.email]);

  const activeQuotes = useMemo(
    () => quotes.filter((q) => !TERMINAL_QUOTE_STATUSES.has(q.status)),
    [quotes]
  );
  const pendingDeskQuotes = useMemo(
    () =>
      quotes.filter(
        (q) =>
          q.status === "New Request" ||
          q.status === "Pending" ||
          q.status === "Desk Review"
      ),
    [quotes]
  );
  const quotesAwaitingAction = useMemo(
    () => quotes.filter((q) => q.status === "Quote Sent" || q.status === "KYC Required"),
    [quotes]
  );
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled" && o.status !== "Delivered"),
    [orders]
  );

  const filteredQuotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter(
      (item) =>
        String(item.id || "").toLowerCase().includes(q) ||
        String(item.productCategory || item.product_category || "").toLowerCase().includes(q) ||
        String(item.metalInterest || item.metal_interest || "").toLowerCase().includes(q)
    );
  }, [quotes, searchQuery]);

  const handleClientAcceptQuote = async (quoteId: string) => {
    const q = quotes.find((x: any) => x.id === quoteId);
    if (!q) return;
    try {
      await dbService.quoteRequests.acceptSecure(q.id, q.security_signature || "");
      alert(isAr ? "تم قبول تسعيرتك الثابتة بنجاح!" : "Firm quote accepted successfully.");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert((isAr ? "تعذر تأكيد السعر: " : "Could not confirm quote: ") + msg);
    }
  };

  const handleClientUploadKYC = () => onNavigate("/kyc?next=/dashboard");

  const handleUploadPaymentProof = async (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert(isAr ? "الحد الأقصى ١٠ ميجابايت" : "Maximum file size is 10 MB");
      return;
    }
    setProofUploadingId(orderId);
    try {
      const uploaded = await dbService.storage.uploadPaymentProof(user.id, orderId, file);
      await dbService.orders.update(orderId, {
        payment_proof_name: uploaded.name,
        payment_proof_size: `${(uploaded.size / (1024 * 1024)).toFixed(2)} MB`,
        payment_proof_storage_path: uploaded.storage_path,
        payment_proof_uploaded_at: new Date().toISOString(),
        status: "Payment Pending",
        payment_status: "Pending",
      });
      void notifyDesk("payment_proof", {
        orderId,
        customerName: user.name,
        email: user.email,
        fileName: uploaded.name,
      });
      await loadData();
    } catch (err) {
      console.error("Failed to upload payment proof:", err);
      alert(isAr ? "تعذر رفع الملف. حاول مرة أخرى أو تواصل عبر واتساب." : "Upload failed. Try again or contact us on WhatsApp.");
    } finally {
      setProofUploadingId(null);
      event.target.value = "";
    }
  };

  const handleDownloadPDF = (order: any) => {
    generateQuotePDF(
      {
        id: order.id,
        created_at: order.created_at,
        expires_at: order.created_at
          ? new Date(new Date(order.created_at).getTime() + 5 * 60 * 1000).toISOString()
          : new Date().toISOString(),
        metal: order.items?.[0]?.product_name?.toLowerCase().includes("silver") ? "Silver" : "Gold",
        productCategory: order.items?.[0]?.product_name || "Bullion",
        weight: order.items?.[0]?.weight || "",
        purity: order.items?.[0]?.purity || "",
        quoted_price: order.total_amount,
        product_firm_price: order.product_firm_price ?? order.total_amount,
        shipping_fee: order.shipping_fee ?? 0,
        shipping_company: order.shipping_company,
        currency: order.currency || "AED",
      },
      user.email
    );
  };

  const latestOrder = orders.length > 0 ? orders[orders.length - 1] : null;

  const paymentOrder = useMemo(() => {
    const pending = orders.find(
      (o) =>
        o.status === "Customer Accepted" ||
        o.status === "Payment Pending" ||
        (o.payment_status === "Pending" &&
          !["Completed", "Cancelled", "Delivered"].includes(o.status))
    );
    if (pending) return pending;
    return latestOrder &&
      (latestOrder.status === "Customer Accepted" || latestOrder.status === "Payment Pending")
      ? latestOrder
      : null;
  }, [orders, latestOrder]);

  const paymentFromQuote = useMemo(() => {
    if (paymentOrder) return null;
    const q = quotes.find((x) => x.status === "Customer Accepted" || x.status === "Payment Pending");
    if (!q) return null;
    return {
      id: q.id,
      total_amount: q.quoted_price,
      currency: q.currency || "AED",
      payment_link: null,
      payment_proof_name: null,
      payment_proof_uploaded_at: null,
      status: q.status,
      payment_status: "Pending",
      _quoteOnly: true,
    };
  }, [quotes, paymentOrder]);

  const paymentTarget = paymentOrder || paymentFromQuote;

  return (
    <div
      className="min-h-screen bg-brand-bg text-text-charcoal py-16 px-4 md:px-8 relative"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gold-base/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-charcoal text-[10px] font-mono uppercase tracking-wider"
          >
            {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {isAr ? "العودة للموقع" : "Back to site"}
          </button>
          <BrandLogo variant="header" currentLang={currentLang} onClick={() => onNavigate("/")} />
        </div>

        <div className="bg-brand-card border border-soft-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-text-charcoal">
              {isAr ? `مرحباً، ${user.name}` : `Welcome, ${user.name}`}
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {isAr ? "حسابك في PGR UAE — متابعة KYC وعروض الأسعار والطلبات." : "Your PGR UAE account — KYC, quotes & orders."}
            </p>
            <p className="text-[11px] text-text-secondary mt-2 font-mono">
              {isAr ? "حالة KYC:" : "KYC:"}{" "}
              <strong className="text-olive-accent">{kycStatusLabel(displayKycStatus, currentLang)}</strong>
              {!canRequestQuote(kycStatus as any) && (
                <button type="button" onClick={() => onNavigate("/kyc?next=/dashboard")} className="ml-2 text-gold-dark underline">
                  {isAr ? "إكمال الملف" : "Complete profile"}
                </button>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-text-charcoal font-serif font-bold block text-sm">{user.name}</span>
              <span className="text-[10px] text-text-secondary font-mono uppercase">{customerRef}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 border border-soft-border hover:border-red-300 text-red-700 bg-red-50 rounded-lg text-[10px] font-mono font-bold uppercase"
            >
              {isAr ? "خروج" : "Sign out"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-brand-card border border-soft-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-2">
              <FileText size={14} className="text-gold-base" />
              {isAr ? "عروض الأسعار" : "Quote requests"}
            </div>
            <p className="text-3xl font-serif font-bold text-text-charcoal">{activeQuotes.length}</p>
            <p className="text-[11px] text-text-secondary mt-1 font-mono">
              {pendingDeskQuotes.length} {isAr ? "بانتظار المكتب" : "awaiting desk"} · {quotesAwaitingAction.length}{" "}
              {isAr ? "تحتاج إجراء" : "need action"}
            </p>
          </div>

          <div className="bg-brand-card border border-soft-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-2">
              <Package size={14} className="text-gold-base" />
              {isAr ? "الطلبات" : "Orders"}
            </div>
            <p className="text-3xl font-serif font-bold text-text-charcoal">{orders.length}</p>
            <p className="text-[11px] text-text-secondary mt-1 font-mono">
              {activeOrders.length} {isAr ? "قيد المعالجة" : "in progress"}
            </p>
          </div>

          <div className="bg-brand-card border border-soft-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-2">
              <ShieldCheck size={14} className="text-gold-base" />
              {isAr ? "الامتثال KYC" : "KYC compliance"}
            </div>
            <p className="text-lg font-serif font-bold text-text-charcoal">{kycStatusLabel(displayKycStatus, currentLang)}</p>
            <button
              type="button"
              onClick={() => onNavigate("/kyc?next=/dashboard")}
              className="text-[11px] text-gold-dark font-mono font-bold mt-2 hover:underline block"
            >
              {isAr ? "عرض / تحديث الملف" : "View / update profile"}
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/my-documents")}
              className="text-[11px] text-gold-dark font-mono font-bold mt-1 hover:underline flex items-center gap-1"
            >
              <FolderOpen size={12} />
              {isAr ? "مستنداتي" : "My documents"}
            </button>
          </div>
        </div>

        {!canRequestQuote(kycStatus as any) && (
          <div className="rounded-xl border border-gold-base/30 bg-gold-base/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-text-charcoal">
              {isAr
                ? "أكمل ملف KYC قبل طلب عرض سعر جديد."
                : "Complete your KYC profile before requesting a new quote."}
            </p>
            <button
              type="button"
              onClick={() => onNavigate("/kyc?next=/request-quote")}
              className="px-4 py-2 bg-gold-base hover:bg-gold-dark text-text-charcoal rounded-lg text-[10px] font-mono font-bold uppercase"
            >
              {isAr ? "إكمال KYC" : "Complete KYC"}
            </button>
          </div>
        )}

        {paymentTarget && (
          <PaymentInstructionsPanel
            currentLang={currentLang}
            order={paymentTarget}
            paymentSettings={paymentSettings}
            proofUploading={proofUploadingId === paymentTarget.id}
            onUploadProof={(e) => {
              if ((paymentTarget as { _quoteOnly?: boolean })._quoteOnly) {
                alert(
                  isAr
                    ? "سيُفعّل رفع الإثبات بعد إنشاء الطلب من المكتب. يمكنك التحويل الآن باستخدام مرجع العرض."
                    : "Proof upload opens once the desk creates your order. You can transfer now using the quote reference."
                );
                return;
              }
              handleUploadPaymentProof(paymentTarget.id, e);
            }}
          />
        )}

        <div className="bg-brand-card border border-soft-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-soft-border pb-3">
              <h2 className="font-serif font-bold text-text-charcoal">
                {isAr ? "طلبات عروض الأسعار" : "Your quote requests"}
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? "بحث بالمرجع أو المنتج…" : "Search ref or product…"}
                    className="bg-brand-bg border border-soft-border focus:border-gold-base rounded-lg px-3 py-1.5 text-[11px] pl-8 outline-none w-full sm:w-48"
                  />
                  <Search size={12} className="text-text-secondary absolute left-2.5 top-2.5" />
                </div>
                <button onClick={loadData} className="p-2 text-gold-dark hover:text-gold-base" title="Refresh">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-text-secondary py-10 text-sm">{isAr ? "جاري التحميل…" : "Loading…"}</p>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <FileText size={32} className="mx-auto text-text-secondary/40" />
                <p className="text-text-secondary text-sm">
                  {isAr ? "لا توجد طلبات عروض أسعار بعد." : "No quote requests yet."}
                </p>
                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="px-5 py-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal rounded-lg text-[10px] font-mono font-bold uppercase"
                >
                  {isAr ? "اطلب عرض سعر" : "Request a quote"}
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredQuotes.map((q) => (
                  <QuoteItem
                    key={q.id}
                    q={q}
                    handleClientUploadKYC={handleClientUploadKYC}
                    handleClientAcceptQuote={handleClientAcceptQuote}
                    loadData={loadData}
                    currentLang={currentLang}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onRequestQuote}
              className="w-full py-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider"
            >
            {isAr ? "طلب عرض سعر جديد" : "New quote request"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-card border border-soft-border rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-text-charcoal border-b border-soft-border pb-2">
              {isAr ? "حالة الطلب" : "Order status"}
            </h2>
            {!latestOrder ? (
              <div className="space-y-3">
                <p className="text-text-secondary text-sm">
                  {isAr ? "لا توجد طلبات نشطة بعد." : "No active orders yet."}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {isAr
                    ? "بعد قبول عرض السعر المؤكد، تظهر تعليمات الدفع في أعلى الصفحة."
                    : "After you accept a desk-confirmed quote, payment instructions appear at the top of this page."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-serif font-bold text-text-charcoal">
                    {latestOrder.items?.[0]?.product_name || (isAr ? "سبائك" : "Bullion")}
                  </p>
                  <p className="text-[10px] font-mono text-text-secondary">Ref: {latestOrder.id}</p>
                  <p className="text-[11px] text-gold-dark font-mono font-bold mt-1">
                    {latestOrder.status}
                    {latestOrder.total_amount != null &&
                      ` · ${latestOrder.currency || "AED"} ${Number(latestOrder.total_amount).toLocaleString()}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(latestOrder)}
                  className="w-full py-2 border border-soft-border hover:border-gold-base rounded-lg text-[10px] font-mono font-bold uppercase"
                >
                  {isAr ? "تحميل PDF العرض" : "Download quote PDF"}
                </button>
              </div>
            )}
          </div>

          <div className="bg-brand-card border border-soft-border rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="font-serif font-bold text-text-charcoal">{isAr ? "دعم المكتب" : "Desk support"}</h2>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {isAr
                ? "للاستفسار عن عروض الأسعار أو حالة الطلب أو طرق الدفع، تواصل مع مكتب PGR UAE عبر واتساب."
                : "For quotes, orders, or payment help, contact the PGR UAE desk on WhatsApp."}
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("client_dashboard_whatsapp")}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-olive-accent hover:opacity-90 text-white rounded-lg text-[10px] font-mono font-bold uppercase"
            >
              <Phone size={12} />
              WhatsApp
            </a>
            <p className="text-[10px] text-text-secondary font-mono">desk@pgruae.com</p>
          </div>
        </div>

        <div className="bg-brand-card border border-soft-border rounded-xl p-4 flex flex-wrap items-center gap-4 text-[10px] font-mono text-text-secondary uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-gold-base" />
            {isAr ? "جلسة مشفرة" : "Encrypted session"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            {isAr ? "بيانات حقيقية من حسابك" : "Live data from your account"}
          </span>
        </div>
      </div>
    </div>
  );
}

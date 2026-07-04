import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { 
  Search, Bell, Mail, Eye, EyeOff, CheckCircle, ShieldAlert, 
  HelpCircle, Phone, ArrowLeft, Clock, Upload, ShieldCheck, ExternalLink, RefreshCw 
} from "lucide-react";
import { dbService } from "../lib/supabase";
import { generateQuotePDF } from "../lib/pdfGenerator";

interface ClientDashboardProps {
  currentLang: "en" | "ar";
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

function QuoteItem({ q, kycUploadingForQuoteId, handleClientUploadKYC, handleClientAcceptQuote, loadData, currentLang }: {
  q: any;
  kycUploadingForQuoteId: string | null;
  handleClientUploadKYC: (quoteId: string) => void;
  handleClientAcceptQuote: (quoteId: string) => void;
  loadData: () => void;
  currentLang: "en" | "ar";
}) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const isAr = currentLang === "ar";

  useEffect(() => {
    if (q.status !== "Quote Sent" || !q.expires_at) return;

    const updateTimer = () => {
      const expTime = new Date(q.expires_at).getTime();
      const now = Date.now();
      const diff = expTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsExpired(true);
        if (q.status === "Quote Sent") {
          dbService.quoteRequests.updateStatus(q.id, "Expired Quote").then(() => {
            loadData();
          });
        }
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const formatSec = seconds < 10 ? `0${seconds}` : seconds;
        const formatMin = minutes < 10 ? `0${minutes}` : minutes;
        setTimeLeft(`${formatMin}:${formatSec}`);
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [q.status, q.expires_at, q.id]);

  const isNew = q.status === "New Request" || q.status === "Pending";
  const isKycReq = q.status === "KYC Required";
  const isKycReview = q.status === "KYC Under Review";
  const isQuoteSent = q.status === "Quote Sent" && !isExpired;
  const isAccepted = q.status === "Customer Accepted";
  const isPayPending = q.status === "Payment Pending";
  const isReady = q.status === "Ready for Collection";
  const isCompleted = q.status === "Completed";
  const isCancelled = q.status === "Cancelled" || q.status === "Rejected" || q.status === "Expired Quote" || isExpired;

  return (
    <div className={`p-4 bg-brand-card border border-soft-border rounded shadow-sm space-y-2 relative transition-all ${isCancelled ? "opacity-60" : ""}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="text-text-charcoal font-serif font-bold text-[12px] leading-tight">
          {q.productCategory || q.product_category || `${(q.metalInterest || q.metal_interest || "Gold").toUpperCase()} Bullion`}
        </div>
        <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shrink-0 ${
          isNew ? "bg-brand-bg text-text-charcoal border border-soft-border" :
          isKycReq ? "bg-soft-danger text-[#A47C36] border border-soft-border animate-pulse font-bold" :
          isKycReview ? "bg-brand-section text-text-secondary border border-soft-border" :
          isQuoteSent ? "bg-[#C6A15B]/10 text-[#A47C36] border border-soft-border animate-pulse font-bold" :
          isAccepted ? "bg-soft-success text-text-charcoal border border-soft-border font-bold" :
          isPayPending ? "bg-brand-section text-text-secondary border border-soft-border" :
          isReady ? "bg-soft-success text-text-charcoal border border-soft-border font-bold" :
          isCompleted ? "bg-soft-success text-text-charcoal border border-soft-border font-bold" :
          "bg-brand-bg text-text-secondary border border-soft-border"
        }`}>
          {isCancelled ? (isAr ? "منتهي/ملغي" : "Expired/Cancelled") : (q.status || "New")}
        </span>
      </div>

      <div className="text-text-secondary text-[9px] uppercase font-mono flex justify-between font-bold">
        <span>Ref: {q.id}</span>
        <span>{q.weight || q.weight_preference || ""}</span>
      </div>

      <div className="text-text-secondary text-[8px] font-sans">
        Submitted: {new Date(q.created_at || "").toLocaleString()}
      </div>

      {q.quoted_price && (
        <div className="p-2.5 bg-brand-section border border-soft-border rounded mt-1 space-y-1">
          {(q.product_firm_price != null && q.product_firm_price > 0) ? (
            <>
              <div className="flex justify-between text-[8px] uppercase font-mono text-text-secondary">
                <span>Product Firm Price:</span>
                <span className="text-text-charcoal font-bold">${Number(q.product_firm_price).toLocaleString(undefined, { minimumFractionDigits: 2 })} {q.currency || "USD"}</span>
              </div>
              {(q.shipping_fee != null && Number(q.shipping_fee) > 0) && (
                <div className="flex justify-between text-[8px] uppercase font-mono text-text-secondary">
                  <span>Shipping Fee{q.shipping_company ? ` (${q.shipping_company})` : ""}:</span>
                  <span className="text-text-charcoal font-bold">${Number(q.shipping_fee).toLocaleString(undefined, { minimumFractionDigits: 2 })} {q.currency || "USD"}</span>
                </div>
              )}
              <div className="flex justify-between text-[9px] uppercase font-mono font-bold border-t border-soft-border pt-1">
                <span className="text-text-secondary">Total Firm Quote:</span>
                <span className="text-[#A47C36]">${q.quoted_price.toLocaleString(undefined, { minimumFractionDigits: 2 })} {q.currency || "USD"}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-text-secondary text-[8px] uppercase font-mono font-bold">Firm Quote Price:</div>
              <div className="text-text-charcoal text-sm font-bold text-gold-base font-mono flex justify-between items-center mt-0.5">
                <span className="text-[#A47C36] font-bold">${q.quoted_price.toLocaleString(undefined, { minimumFractionDigits: 2 })} {q.currency || "USD"}</span>
              </div>
            </>
          )}
          {isQuoteSent && timeLeft && (
            <div className="flex justify-end">
              <span className="text-[9px] bg-soft-danger text-[#A47C36] border border-soft-border px-1.5 py-0.5 rounded font-bold tracking-widest flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-[#A47C36] rounded-full animate-ping"></span>
                ⏱ {timeLeft}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Interactive Client Call to Actions */}
      {isKycReq && (
        <div className="pt-1.5 border-t border-soft-border">
          <button
            disabled={kycUploadingForQuoteId === q.id}
            onClick={() => handleClientUploadKYC(q.id)}
            className="w-full py-1.5 bg-soft-danger hover:bg-rose-100 text-[#A47C36] border border-soft-border rounded font-sans font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Upload size={10} className={kycUploadingForQuoteId === q.id ? "animate-bounce" : ""} />
            <span>{kycUploadingForQuoteId === q.id ? "Uploading Dossier..." : "Upload KYC Passport/ID"}</span>
          </button>
        </div>
      )}

      {isQuoteSent && (
        <div className="pt-1.5 border-t border-soft-border space-y-1.5">
          <p className="text-[10px] text-[#A47C36] font-serif font-bold italic">
            ✓ Final quote confirmed by PGR UAE desk.
          </p>
          <p className="text-[9px] text-text-secondary font-sans font-medium">
            Quote expiry: {new Date(q.expires_at).toLocaleTimeString()} (5-minute lock countdown)
          </p>
          <button
            onClick={() => handleClientAcceptQuote(q.id)}
            className="w-full py-1.5 bg-[#556B5D] hover:bg-[#3d4f44] text-white rounded font-sans font-extrabold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
          >
            <CheckCircle size={10} />
            <span>Accept Firm Quote</span>
          </button>
        </div>
      )}

      {isCancelled && (q.status === "Expired Quote" || isExpired) && (
        <div className="pt-1.5 border-t border-soft-border text-center">
          <p className="text-[9px] text-text-secondary font-mono italic">Quote expired due to rapid precious metal market fluctuations.</p>
        </div>
      )}
    </div>
  );
}

export default function ClientDashboard({ currentLang, user, onLogout, onNavigate }: ClientDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideValue, setHideValue] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "quotes" | "orders" | "kyc" | "storage">("all");
  const [copiedText, setCopiedText] = useState("");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycUploadingForQuoteId, setKycUploadingForQuoteId] = useState<string | null>(null);
  const [proofUploadingId, setProofUploadingId] = useState<string | null>(null);

  const handleUploadPaymentProof = async (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProofUploadingId(orderId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await dbService.orders.update(orderId, {
        payment_proof_name: file.name,
        payment_proof_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        payment_proof_uploaded_at: new Date().toISOString(),
        status: "Payment Pending"
      });
      
      await dbService.auditLogs.append(
        "payment_proof_uploaded",
        user?.email || "customer@pgruae.com",
        `Customer uploaded payment proof file "${file.name}" for Order ${orderId}.`
      );

      await loadData();
    } catch (err) {
      console.error("Failed to upload payment receipt proof:", err);
    } finally {
      setProofUploadingId(null);
    }
  };

  const handleDownloadPDF = (order: any) => {
    const mockQuoteSpec = {
      id: order.id,
      created_at: order.created_at,
      expires_at: order.created_at ? new Date(new Date(order.created_at).getTime() + 5 * 60 * 1000).toISOString() : new Date().toISOString(),
      metal: order.items?.[0]?.product_name?.toLowerCase().includes("silver") ? "Silver" : "Gold",
      productCategory: order.items?.[0]?.product_name || "Bullion Allocation Contract",
      weight: order.items?.[0]?.weight || "100 Grams",
      purity: order.items?.[0]?.purity || "Au 99.99% (24 Karats)",
      quoted_price: order.total_amount || 7500.00,
      currency: order.currency || "USD"
    };
    generateQuotePDF(mockQuoteSpec, user?.email || "PGR Accredited Investor");
  };

  const loadData = async () => {
    try {
      const qList = await dbService.quoteRequests.list();
      const oList = await dbService.orders.list();
      setQuotes(qList || []);
      setOrders(oList || []);
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClientAcceptQuote = async (quoteId: string) => {
    const q = quotes.find((x: any) => x.id === quoteId);
    if (!q) return;
    try {
      await dbService.quoteRequests.acceptSecure(
        q.id,
        q.quoted_price || 0,
        q.expires_at || "",
        q.security_signature || ""
      );
      alert(isAr ? "تم قبول تسعيرتك الثابتة بنجاح وتأمين السعر!" : "Firm quote successfully accepted and locked!");
      loadData();
    } catch (err: any) {
      console.error("Failed to accept quote securely:", err);
      alert((isAr ? "حدث خطأ في تأكيد السعر: " : "Price confirmation failed: ") + (err.message || err));
    }
  };

  const handleClientUploadKYC = async (quoteId: string) => {
    setKycUploadingForQuoteId(quoteId);
    setTimeout(async () => {
      try {
        await dbService.quoteRequests.updateStatus(quoteId, "KYC Under Review");
        setKycUploadingForQuoteId(null);
        loadData();
      } catch (err) {
        console.error("Failed to update KYC status:", err);
        setKycUploadingForQuoteId(null);
      }
    }, 1500);
  };

  // Live metal price calculations
  const [priceTick, setPriceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceTick(t => t + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Simulating live gold price shifts (spot ~ 2326.45)
  const getLiveGoldPrice = () => 2326.45 + Math.sin(priceTick * 0.1) * 2.10;
  const getLiveSilverPrice = () => 29.67 + Math.cos(priceTick * 0.1) * 0.08;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const isAr = currentLang === "ar";

  return (
    <div className="min-h-screen bg-brand-bg text-text-charcoal font-mono text-xs py-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background elegant accents */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#C6A15B]/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#556B5D]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10 animate-fadeIn">
        
        {/* ========================================================================= */}
        {/* 1. TOP DASHBOARD NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div className="bg-brand-card border border-soft-border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Logo className="w-9 h-9" showText={true} currentLang={currentLang} />
          </div>

          {/* Interactive Search Field */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث في عروض الأسعار، الطلبات، الوثائق..." : "Search quotes, orders, documents..."}
              className="w-full bg-brand-bg border border-soft-border focus:border-[#C6A15B] rounded px-3 py-2 text-text-charcoal placeholder-text-secondary focus:outline-none transition-colors pl-8"
            />
            <Search size={13} className="text-text-secondary absolute left-2.5 top-2.5" />
          </div>

          {/* Top Status Indicators & Profile info */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            {/* Custom Mail & Notification alerts with badge */}
            <div className="flex items-center gap-3">
              <button className="p-2 bg-brand-bg hover:bg-brand-section border border-soft-border rounded relative text-text-secondary hover:text-text-charcoal transition-colors cursor-pointer shadow-sm">
                <Mail size={14} />
              </button>
              <button className="p-2 bg-brand-bg hover:bg-brand-section border border-soft-border rounded relative text-text-secondary hover:text-text-charcoal transition-colors cursor-pointer shadow-sm">
                <Bell size={14} />
                <span className="absolute -top-1 -right-1 bg-[#C6A15B] text-text-charcoal font-sans font-extrabold text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* Profile badge details */}
            <div className="border-l border-soft-border pl-4 flex items-center gap-3">
              <div className="text-right">
                <span className="text-text-charcoal font-serif font-bold block">{user?.name || "John Doe"}</span>
                <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">ID: PGR-112358</span>
              </div>
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 border border-soft-border hover:border-red-300 text-red-600 bg-soft-danger hover:bg-rose-100 rounded uppercase text-[10px] tracking-wider font-bold transition-all cursor-pointer"
              >
                {isAr ? "خروج" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Greeting Header with Live Session indicators */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-brand-section p-5 border border-soft-border rounded-lg shadow-sm">
          <div>
            <h2 className="text-text-charcoal font-serif text-lg font-bold">
              {isAr ? `طاب يومك، ${user?.name || "جون"}` : `Good evening, ${user?.name || "John"} 👋`}
            </h2>
            <p className="text-text-secondary text-[10px] uppercase tracking-wider mt-0.5 font-bold">
              {isAr ? "أهلاً بك في ديوان عملاء PGR UAE المخصص للسبائك." : "Welcome to your PGR UAE Client Dashboard."}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-text-secondary font-bold">
            <span className="flex items-center gap-1.5 font-sans">
              <Clock size={12} className="text-[#C6A15B]" />
              {isAr ? "آخر دخول: اليوم، 4:35 مساءً بتوقيت دبي" : "Last login: Today, 4:35 PM GST"}
            </span>
            <span className="flex items-center gap-1.5 text-text-charcoal">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {isAr ? "جلسة مشفرة آمنة" : "Secure Session"}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SUMMARY CARDS ROW */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quotes Card */}
          <div className="bg-brand-card border border-soft-border hover:border-[#C6A15B] p-5 rounded-lg transition-all space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-text-secondary uppercase tracking-widest text-[9px] font-bold">Active Quotes</span>
              <span className="px-2 py-0.5 bg-[#C6A15B]/10 text-[#A47C36] border border-soft-border rounded font-bold text-[8px] uppercase">Pending</span>
            </div>
            <div>
              <span className="text-3xl font-serif font-extrabold text-text-charcoal">3</span>
              <div className="text-text-secondary text-[9px] uppercase tracking-wider space-y-0.5 mt-1 font-bold">
                <div>• Pending response: 2</div>
                <div>• Expires soon: 1</div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate("/request-quote")}
              className="text-[#A47C36] hover:text-[#C6A15B] transition-colors uppercase tracking-widest text-[9px] font-bold flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>View all quotes →</span>
            </button>
          </div>

          {/* Orders Card */}
          <div className="bg-brand-card border border-soft-border hover:border-[#C6A15B] p-5 rounded-lg transition-all space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-text-secondary uppercase tracking-widest text-[9px] font-bold">Total Orders</span>
              <span className="px-2 py-0.5 bg-soft-success text-text-charcoal border border-soft-border rounded font-bold text-[8px] uppercase">Active</span>
            </div>
            <div>
              <span className="text-3xl font-serif font-extrabold text-text-charcoal">5</span>
              <div className="text-text-secondary text-[9px] uppercase tracking-wider space-y-0.5 mt-1 font-bold">
                <div>• In Progress: 1</div>
                <div>• Completed allocations: 12</div>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab("orders")}
              className="text-[#A47C36] hover:text-[#C6A15B] transition-colors uppercase tracking-widest text-[9px] font-bold flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>View all orders →</span>
            </button>
          </div>

          {/* KYC Status Card */}
          <div className="bg-brand-card border border-soft-border hover:border-[#C6A15B] p-5 rounded-lg transition-all space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-text-secondary uppercase tracking-widest text-[9px] font-bold">KYC/AML Status</span>
              <span className="px-2 py-0.5 bg-soft-success text-text-charcoal border border-soft-border rounded font-bold text-[8px] uppercase">Verified</span>
            </div>
            <div>
              <span className="text-lg font-serif font-extrabold text-text-charcoal uppercase tracking-wider block">Level 2 Approved</span>
              <div className="text-text-secondary text-[9px] uppercase tracking-wider space-y-0.5 mt-2.5 font-bold">
                <div>• Next review: May 24, 2026</div>
                <div>• Source of funds: Certified</div>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab("kyc")}
              className="text-[#A47C36] hover:text-[#C6A15B] transition-colors uppercase tracking-widest text-[9px] font-bold flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>View details →</span>
            </button>
          </div>

          {/* Custody Storage Card */}
          <div className="bg-brand-card border border-soft-border hover:border-[#C6A15B] p-5 rounded-lg transition-all space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-text-secondary uppercase tracking-widest text-[9px] font-bold">Allocated Storage</span>
              <span className="px-2 py-0.5 bg-soft-success text-text-charcoal border border-soft-border rounded font-bold text-[8px] uppercase">Active</span>
            </div>
            <div>
              <span className="text-3xl font-serif font-extrabold text-text-charcoal">2 <span className="text-xs text-text-secondary font-sans font-normal">Sectors</span></span>
              <div className="text-text-secondary text-[9px] uppercase tracking-wider space-y-0.5 mt-1 font-bold">
                <div>• Pending approval: 0</div>
                <div>• Segregated bins: Vault C</div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate("/allocated-storage")}
              className="text-[#A47C36] hover:text-[#C6A15B] transition-colors uppercase tracking-widest text-[9px] font-bold flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>View storage →</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CORE BULLION CUSTODY INVENTORY TABLE */}
        {/* ========================================================================= */}
        <div className="bg-brand-card border border-soft-border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-soft-border pb-4">
            <div>
              <h3 className="text-text-charcoal font-serif text-sm uppercase tracking-widest font-bold">
                Your Physical Bullion Purchase Records
              </h3>
              <p className="text-text-secondary text-[10px] uppercase tracking-wider mt-0.5 font-bold">
                ⚠️ Indicative values only. Not a trading wallet or financial ledger.
              </p>
            </div>
            
            {/* Total Custodial Value Counter */}
            <div className="bg-brand-bg border border-soft-border rounded px-4 py-2 flex items-center gap-3">
              <div>
                <span className="text-text-secondary text-[9px] uppercase tracking-wider block font-bold">Total Indicative Value</span>
                <span className="text-[#A47C36] text-sm font-bold tracking-widest font-mono">
                  {hideValue ? "••••••••••" : "AED 1,248,730.45"}
                </span>
              </div>
              <button 
                onClick={() => setHideValue(!hideValue)}
                className="p-1.5 text-text-secondary hover:text-text-charcoal transition-colors bg-brand-card border border-soft-border rounded cursor-pointer"
              >
                {hideValue ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>
          </div>
 
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] text-text-secondary">
              <thead>
                <tr className="border-b border-soft-border text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3 px-2">Metal</th>
                  <th className="py-3 px-2">Weight</th>
                  <th className="py-3 px-2">Purity</th>
                  <th className="py-3 px-2">Purchase Date</th>
                  <th className="py-3 px-2">Purchase Price</th>
                  <th className="py-3 px-2">Indicative Market Value</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-border">
                {/* Gold Row */}
                <tr className="hover:bg-brand-section/50 transition-colors">
                  <td className="py-4 px-2 text-text-charcoal font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#C6A15B]"></span>
                    <span>GOLD (999.9 Fine)</span>
                  </td>
                  <td className="py-4 px-2 text-text-charcoal font-bold">1000.00 g (1 KILO)</td>
                  <td className="py-4 px-2">999.9</td>
                  <td className="py-4 px-2">May 10, 2024</td>
                  <td className="py-4 px-2">AED 233,400.00 <span className="text-text-secondary block text-[9px] font-bold">(AED 233.40 / g)</span></td>
                  <td className="text-[#A47C36] font-bold py-4 px-2">
                    {hideValue ? "••••••" : `AED ${(1000 * (getLiveGoldPrice() / 31.1035) * 3.67).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    <span className="text-text-secondary block text-[9px] font-normal">({(getLiveGoldPrice() / 31.1035 * 3.67).toFixed(2)} / g)</span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => onNavigate("/request-quote")}
                      className="px-2.5 py-1 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white border border-soft-border rounded font-bold uppercase transition-all cursor-pointer shadow-sm"
                    >
                      Request Quote
                    </button>
                  </td>
                </tr>
 
                {/* Silver Row */}
                <tr className="hover:bg-brand-section/50 transition-colors">
                  <td className="py-4 px-2 text-text-charcoal font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    <span>SILVER (999 Fine)</span>
                  </td>
                  <td className="py-4 px-2 text-text-charcoal font-bold">5000.00 g (5 KILO)</td>
                  <td className="py-4 px-2">999</td>
                  <td className="py-4 px-2">Apr 15, 2024</td>
                  <td className="py-4 px-2">AED 9,450.00 <span className="text-text-secondary block text-[9px] font-bold">(AED 1.89 / g)</span></td>
                  <td className="text-[#A47C36] font-bold py-4 px-2">
                    {hideValue ? "••••••" : `AED ${(5000 * (getLiveSilverPrice() / 31.1035) * 3.67).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    <span className="text-text-secondary block text-[9px] font-normal">({(getLiveSilverPrice() / 31.1035 * 3.67).toFixed(2)} / g)</span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => onNavigate("/request-quote")}
                      className="px-2.5 py-1 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white border border-soft-border rounded font-bold uppercase transition-all cursor-pointer shadow-sm"
                    >
                      Request Quote
                    </button>
                  </td>
                </tr>
 
                {/* Platinum Row */}
                <tr className="hover:bg-brand-section/50 transition-colors">
                  <td className="py-4 px-2 text-text-charcoal font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                    <span>PLATINUM (999.5 Fine)</span>
                  </td>
                  <td className="py-4 px-2 text-text-charcoal font-bold">250.00 g</td>
                  <td className="py-4 px-2">999.5</td>
                  <td className="py-4 px-2">Mar 20, 2024</td>
                  <td className="py-4 px-2">AED 36,250.00 <span className="text-text-secondary block text-[9px] font-bold">(AED 145.00 / g)</span></td>
                  <td className="text-[#A47C36] font-bold py-4 px-2">
                    {hideValue ? "••••••" : "AED 42,812.50"}
                    <span className="text-text-secondary block text-[9px] font-normal">(AED 171.25 / g)</span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => onNavigate("/request-quote")}
                      className="px-2.5 py-1 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white border border-soft-border rounded font-bold uppercase transition-all cursor-pointer shadow-sm"
                    >
                      Request Quote
                    </button>
                  </td>
                </tr>
 
                {/* Palladium Row */}
                <tr className="hover:bg-brand-section/50 transition-colors">
                  <td className="py-4 px-2 text-text-charcoal font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                    <span>PALLADIUM (999.5 Fine)</span>
                  </td>
                  <td className="py-4 px-2 text-text-charcoal font-bold">100.00 g</td>
                  <td className="py-4 px-2">999.5</td>
                  <td className="py-4 px-2">Feb 28, 2024</td>
                  <td className="py-4 px-2">AED 11,800.00 <span className="text-text-secondary block text-[9px] font-bold">(AED 118.00 / g)</span></td>
                  <td className="text-[#A47C36] font-bold py-4 px-2">
                    {hideValue ? "••••••" : "AED 13,632.95"}
                    <span className="text-text-secondary block text-[9px] font-normal">(AED 136.33 / g)</span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => onNavigate("/request-quote")}
                      className="px-2.5 py-1 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white border border-soft-border rounded font-bold uppercase transition-all cursor-pointer shadow-sm"
                    >
                      Request Quote
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
 
          <div className="pt-2 text-center">
            <button className="text-text-secondary hover:text-[#A47C36] uppercase text-[9px] tracking-widest font-bold font-sans cursor-pointer">
              View all purchase records →
            </button>
          </div>
        </div>
 
        {/* ========================================================================= */}
        {/* 4. LOWER PANELS: QUOTES, TRACKER timelines, KYC DOCS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PANEL A: Recent Quote Requests */}
          <div className="bg-brand-card border border-soft-border rounded-lg p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="text-text-charcoal font-serif uppercase tracking-widest text-[10px] font-bold border-b border-soft-border pb-1.5 flex justify-between items-center">
                <span>Recent Quote Requests</span>
                <button onClick={loadData} className="text-[#A47C36] hover:text-[#C6A15B]" title="Refresh">
                  <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                </button>
              </h4>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {quotes.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No quote requests registered.
                  </div>
                ) : (
                  quotes.map((q) => (
                    <QuoteItem
                      key={q.id}
                      q={q}
                      kycUploadingForQuoteId={kycUploadingForQuoteId}
                      handleClientUploadKYC={handleClientUploadKYC}
                      handleClientAcceptQuote={handleClientAcceptQuote}
                      loadData={loadData}
                      currentLang={currentLang}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => onNavigate("/request-quote")}
                className="w-full py-2 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white border border-soft-border rounded font-sans font-extrabold text-[9px] uppercase tracking-widest cursor-pointer shadow-sm transition-colors"
              >
                Create new quote request →
              </button>
            </div>
          </div>

          {/* PANEL B: Advanced Stepper Timeline Delivery Status */}
          <div className="bg-brand-card border border-soft-border rounded-lg p-5 shadow-sm flex flex-col justify-between space-y-4">
            {!orders || orders.length === 0 ? (
              <div className="space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <h4 className="text-text-charcoal font-serif uppercase tracking-widest text-[10px] font-bold border-b border-soft-border pb-1.5">
                    Order Status Tracker
                  </h4>
                  <p className="text-text-secondary text-[10px] leading-relaxed font-sans font-bold">
                    You currently have no active order tickets under settlement.
                  </p>
                  <p className="text-text-secondary text-[9px] font-sans">
                    Once our bullion desk prepares your physical quote and you accept it, an active order contract with safe custody status trackers will be rendered here.
                  </p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => onNavigate("/request-quote")}
                    className="w-full py-2.5 bg-brand-bg hover:bg-brand-section border border-soft-border text-text-charcoal font-sans font-bold text-[9px] uppercase tracking-widest rounded cursor-pointer transition-colors"
                  >
                    Inquire Custom Gold/Silver Lot
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const latestOrder = orders[orders.length - 1];
                const orderStatus = latestOrder.status || "Payment Pending";
                const isCancelled = orderStatus === "Cancelled";
                const isCompleted = orderStatus === "Completed" || orderStatus === "Delivered";
                const isReady = orderStatus === "Ready for Collection" || orderStatus === "Ready";
                const isVerified = orderStatus === "Payment Verified" || orderStatus === "Paid / In Vault";
 
                // Map statuses to checklist steps
                const step1Completed = true; // Always true if order exists
                const step2Completed = isVerified || isReady || isCompleted;
                const step3Completed = isReady || isCompleted;
                const step4Completed = isCompleted;
 
                return (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start border-b border-soft-border pb-1.5">
                        <h4 className="text-text-charcoal font-serif uppercase tracking-widest text-[10px] font-bold">
                          Order Status
                        </h4>
                        <span className={`text-[9px] uppercase tracking-wider font-bold ${
                          isCancelled ? "text-red-600 font-bold" :
                          isCompleted ? "text-[#556B5D] font-bold" :
                          isReady ? "text-[#556B5D] font-bold" :
                          "text-[#A47C36] font-bold animate-pulse"
                        }`}>{orderStatus}</span>
                      </div>
 
                      <div className="space-y-2">
                        <div className="text-text-charcoal font-serif font-bold text-sm">
                          {latestOrder.items?.[0]?.product_name || "Precious Metals Lot"}
                        </div>
                        <div className="text-text-secondary text-[9px] uppercase font-mono font-bold font-bold">Ref ID: {latestOrder.id}</div>
                        <div className="text-text-secondary text-[8px] font-sans font-bold">
                          Value: {latestOrder.currency || "USD"} {latestOrder.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
 
                      {/* Secure Delivery Tracker Stepper */}
                      <div className="relative pl-6 space-y-4 pt-2">
                        {/* Stepper Vertical line */}
                        <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-soft-border" />
 
                        {/* Step 1 */}
                        <div className="relative">
                          <div className={`absolute -left-5 top-0.5 w-2 h-2 rounded-full ${step1Completed ? "bg-[#556B5D] ring-4 ring-[#556B5D]/15" : "bg-[#E8DEC9]/55"}`} />
                          <div className={step1Completed ? "text-text-charcoal font-bold" : "text-text-secondary"}>Order Placed / Registered</div>
                          <div className="text-text-secondary text-[8px] font-sans">✓ Verified by Bullion Desk</div>
                        </div>
 
                        {/* Step 2 */}
                        <div className="relative">
                          <div className={`absolute -left-5 top-0.5 w-2 h-2 rounded-full ${step2Completed ? "bg-[#556B5D] ring-4 ring-[#556B5D]/15" : "bg-[#E8DEC9]/55"}`} />
                          <div className={step2Completed ? "text-text-charcoal font-bold" : "text-text-secondary"}>Payment Verified</div>
                          <div className="text-text-secondary text-[8px] font-sans">{step2Completed ? "✓ Verified on Bank Registry" : "Awaiting Bank Settlement"}</div>
                        </div>
 
                        {/* Step 3 */}
                        <div className="relative">
                          <div className={`absolute -left-5 top-0.5 w-2 h-2 rounded-full ${step3Completed ? "bg-[#556B5D] ring-4 ring-[#556B5D]/15" : "bg-[#E8DEC9]/55"}`} />
                          <div className={step3Completed ? "text-text-charcoal font-bold" : "text-text-secondary"}>Ready for Collection</div>
                          <div className="text-text-secondary text-[8px] font-sans">{step3Completed ? "✓ Authorized at Dubai HQ" : "Pending Custody Transfer"}</div>
                        </div>
 
                        {/* Step 4 */}
                        <div className="relative">
                          <div className={`absolute -left-5 top-0.5 w-2 h-2 rounded-full ${step4Completed ? "bg-[#556B5D] ring-4 ring-[#556B5D]/15" : "bg-[#E8DEC9]/55"}`} />
                          <div className={step4Completed ? "text-text-charcoal font-bold" : "text-text-secondary"}>Completed</div>
                          <div className="text-text-secondary text-[8px] font-sans">{step4Completed ? "✓ Handed over to Client" : isReady ? "Awaiting client collection at Dubai HQ" : "Pending final clearance"}</div>
                        </div>
                      </div>
 
                      {/* PDF Download and Payment Proof Upload */}
                      <div className="mt-4 pt-4 border-t border-soft-border space-y-3">
                        <button
                          onClick={() => handleDownloadPDF(latestOrder)}
                          className="w-full py-2 bg-[#C6A15B] hover:bg-[#A47C36] text-text-charcoal hover:text-white border border-soft-border font-sans font-bold text-[9px] uppercase tracking-wider rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Download Quote PDF (عقد السعر)</span>
                        </button>
 
                        {latestOrder.payment_proof_name ? (
                          <div className="bg-[#DCE8DF] border border-[#556B5D]/20 rounded p-2.5 text-center">
                            <p className="text-[#556B5D] text-[10px] font-bold">
                              ✓ Payment Proof Uploaded
                            </p>
                            <p className="text-text-charcoal text-[9px] mt-0.5 truncate font-bold">
                              File: {latestOrder.payment_proof_name} ({latestOrder.payment_proof_size})
                            </p>
                            <p className="text-text-secondary text-[8px] font-mono mt-0.5">
                              Uploaded at: {new Date(latestOrder.payment_proof_uploaded_at).toLocaleTimeString()}
                            </p>
                            <div className="mt-2">
                              <label className="text-[9px] text-[#A47C36] hover:underline cursor-pointer font-bold">
                                Re-upload alternative proof
                                <input
                                  type="file"
                                  accept=".pdf,image/*"
                                  onChange={(e) => handleUploadPaymentProof(latestOrder.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-dashed border-[#C6A15B]/30 rounded p-3 text-center space-y-2">
                            <p className="text-text-secondary text-[10px] font-bold">
                              Awaiting Wire Transfer Proof
                            </p>
                            <label className="block w-full py-2 bg-[#C6A15B]/10 hover:bg-[#C6A15B]/20 border border-[#C6A15B]/20 hover:border-[#C6A15B]/40 text-[#A47C36] font-sans font-bold text-[9px] uppercase tracking-wider rounded cursor-pointer transition-all text-center">
                              {proofUploadingId === latestOrder.id ? (
                                <span className="animate-pulse">Uploading Proof...</span>
                              ) : (
                                <span>Upload Payment Proof</span>
                              )}
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                disabled={proofUploadingId !== null}
                                onChange={(e) => handleUploadPaymentProof(latestOrder.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
 
                    <div className="pt-2">
                      <a
                        href="https://wa.me/971559688837"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center py-2.5 bg-[#556B5D] hover:bg-[#3d4f44] text-white font-sans font-bold text-[9px] uppercase tracking-widest rounded shadow hover:opacity-95 transition-all cursor-pointer"
                      >
                        Inquire Delivery / Collection desk
                      </a>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* PANEL C: KYC Compliance & Customer Support */}
          <div className="bg-brand-card border border-soft-border rounded-lg p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h4 className="text-text-charcoal font-serif uppercase tracking-widest text-[10px] font-bold border-b border-soft-border pb-1.5">
                KYC & Customer Support
              </h4>

              {/* Onboarding Files Checklist */}
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between items-center py-1 border-b border-soft-border">
                  <span className="text-text-secondary font-bold">Identity Verification</span>
                  <span className="text-[#556B5D] font-bold bg-[#DCE8DF] px-1.5 py-0.5 rounded text-[8px] uppercase">Verified ✓</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-soft-border">
                  <span className="text-text-secondary font-bold">Address Proof</span>
                  <span className="text-[#556B5D] font-bold bg-[#DCE8DF] px-1.5 py-0.5 rounded text-[8px] uppercase">Verified ✓</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-soft-border">
                  <span className="text-text-secondary font-bold">Source of Funds Declaration</span>
                  <span className="text-[#556B5D] font-bold bg-[#DCE8DF] px-1.5 py-0.5 rounded text-[8px] uppercase">Verified ✓</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-secondary font-bold">KYC Review</span>
                  <span className="text-[#A47C36] font-bold bg-[#C6A15B]/10 px-1.5 py-0.5 rounded text-[8px] uppercase font-mono">Next Review 2026 ⓘ</span>
                </div>
              </div>

              {/* Support Contact details */}
              <div className="p-3 bg-brand-section border border-soft-border rounded space-y-2">
                <p className="text-text-secondary text-[10px] leading-relaxed font-sans font-bold">
                  Need assistance? Our bullion desk is available for secure WhatsApp consultations, physical assays, and logistical transfers.
                </p>
                <div className="space-y-1 text-[9px] text-[#A47C36] font-bold">
                  <div className="flex items-center gap-1.5">
                    <Phone size={11} className="text-[#556B5D]" />
                    <span>WhatsApp Desk: +971 55 968 8837</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} />
                    <span>Email: desk@pgruae.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a 
                href="https://wa.me/971559688837"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#556B5D] hover:bg-[#3d4f44] text-white font-sans font-bold text-[9px] uppercase tracking-widest rounded shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone size={11} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 5. SECURE COMPLIANT BOTTOM FOOTER BAR */}
        {/* ========================================================================= */}
        <div className="bg-brand-card border border-soft-border p-5 rounded-lg space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-soft-border pb-3">
            <h5 className="text-[#C6A15B] text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Secure. Compliant. Custodial Trust.
            </h5>
            <p className="text-text-secondary text-[9px] uppercase tracking-wider font-bold">
              PGR UAE follows strict custody, data privacy, and UAE compliance mandates.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[9px] text-text-secondary uppercase tracking-widest font-bold">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-[#C6A15B] rounded-full" />
              <span>Segregated Storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-[#C6A15B] rounded-full" />
              <span>LBMA Approved Refiners</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-[#C6A15B] rounded-full" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-[#C6A15B] rounded-full" />
              <span>UAE AML Compliant</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Package,
  ShieldCheck,
  Warehouse,
  MessageCircle,
  LogOut,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import PremiumButton from "../components/premium/PremiumButton";
import SectionHeading from "../components/premium/SectionHeading";
import { dbService, mockDb } from "../lib/supabase";

type Tab = "overview" | "quotes" | "orders" | "kyc" | "storage" | "support";

export default function DashboardPage() {
  const { currentLang, user, setUser, rates } = useApp();
  const isAr = currentLang === "ar";
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [buybacks, setBuybacks] = useState<any[]>([]);
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [allQuotes, allOrders, kycProfile, sellBacks] = await Promise.all([
          dbService.quoteRequests.list(),
          dbService.orders.list(),
          dbService.kyc.get(user.id),
          dbService.buyback.list(user.id),
        ]);
        const email = user.email?.toLowerCase();
        setQuotes(
          allQuotes.filter(
            (q: any) =>
              q.email?.toLowerCase() === email ||
              q.customer_id === user.id ||
              q.user_id === user.id
          )
        );
        setOrders(allOrders.filter((o: any) => o.customer_id === user.id));
        setBuybacks(sellBacks || []);
        setKyc(kycProfile);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate]);

  const handleLogout = () => {
    mockDb.auth.logout();
    setUser(null);
    navigate("/login");
  };

  const kycStatus = kyc?.status || (isAr ? "لم يُقدَّم" : "Not submitted");
  const indicativeGold =
    rates?.gold?.currencies?.AED?.gram != null
      ? `AED ${rates.gold.currencies.AED.gram.toFixed(2)}/g`
      : isAr
        ? "اطلب عرض سعر"
        : "Request quote";

  const tabs: { id: Tab; en: string; ar: string; icon: typeof FileText }[] = [
    { id: "overview", en: "Overview", ar: "نظرة عامة", icon: FileText },
    { id: "quotes", en: "Quote Requests", ar: "عروض الأسعار", icon: Clock },
    { id: "orders", en: "Purchase Records", ar: "سجلات الشراء", icon: Package },
    { id: "kyc", en: "KYC & Documents", ar: "KYC والمستندات", icon: ShieldCheck },
    { id: "storage", en: "Storage Requests", ar: "طلبات التخزين", icon: Warehouse },
    { id: "support", en: "Support", ar: "الدعم", icon: MessageCircle },
  ];

  if (!user) return null;

  return (
    <PremiumLayout>
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-gold-base">
              {isAr ? "لوحة العميل" : "Client Dashboard"}
            </span>
            <h1 className="text-2xl md:text-3xl font-serif text-white mt-1">
              {isAr ? `مرحباً، ${user.name}` : `Welcome, ${user.name}`}
            </h1>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PremiumButton to="/request-quote">{isAr ? "طلب عرض سعر" : "Request Quote"}</PremiumButton>
            <PremiumButton to="/sell-back" variant="outline">
              {isAr ? "عرض إعادة بيع" : "Sell-Back Quote"}
            </PremiumButton>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest text-gray-400 border border-white/10 rounded-sm hover:text-white cursor-pointer"
            >
              <LogOut size={14} />
              {isAr ? "خروج" : "Sign Out"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs rounded-sm transition-colors cursor-pointer ${
                  tab === t.id
                    ? "bg-gold-dark/15 border border-gold-base/30 text-gold-base"
                    : "text-gray-400 hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <t.icon size={16} />
                {isAr ? t.ar : t.en}
              </button>
            ))}
          </aside>

          <div className="lg:col-span-9 space-y-6">
            {loading ? (
              <div className="premium-card p-8 text-center text-gray-500 text-sm">
                {isAr ? "جاري التحميل..." : "Loading..."}
              </div>
            ) : (
              <>
                {tab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: isAr ? "حالة KYC" : "KYC Status", value: kycStatus },
                        { label: isAr ? "عروض الأسعار" : "Active Quotes", value: quotes.length },
                        { label: isAr ? "سجلات الشراء" : "Purchase Records", value: orders.length },
                        { label: isAr ? "طلبات إعادة البيع" : "Sell-Back Requests", value: buybacks.length },
                      ].map((s) => (
                        <div key={s.label} className="premium-card p-5">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">{s.label}</span>
                          <span className="text-lg font-semibold text-white">{s.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="premium-card p-6 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-gold-base uppercase tracking-widest font-mono">
                          {isAr ? "قيمة إرشادية فقط" : "Indicative Market Price"}
                        </span>
                        <p className="text-2xl font-serif text-white mt-1">{indicativeGold}</p>
                        <p className="text-[10px] text-gray-600 mt-2 max-w-md">
                          {isAr
                            ? "الأسعار إرشادية فقط. عرض السعر المؤكد يصدر من المكتب بعد مراجعة KYC/AML."
                            : "Prices are indicative only. Firm quotes are issued by desk after KYC/AML review."}
                        </p>
                      </div>
                      <PremiumButton to="/request-quote" className="self-start">
                        {isAr ? "طلب عرض سعر مؤكد" : "Request Firm Quote"}
                      </PremiumButton>
                    </div>

                    <div className="premium-card p-6">
                      <h3 className="text-sm font-serif text-white mb-4">
                        {isAr ? "آخر طلبات عروض الأسعار" : "Recent Quote Requests"}
                      </h3>
                      {quotes.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          {isAr ? "لا توجد طلبات بعد." : "No quote requests yet."}{" "}
                          <Link to="/request-quote" className="text-gold-base hover:underline">
                            {isAr ? "اطلب عرض سعر" : "Request a quote"}
                          </Link>
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {quotes.slice(0, 5).map((q: any) => (
                            <li
                              key={q.id}
                              className="flex justify-between items-center text-xs border-b border-white/[0.04] pb-2"
                            >
                              <span className="text-gray-300">
                                {q.productCategory || q.product_name || q.productInterest || "Bullion"}
                              </span>
                              <span className="text-gold-base font-mono">{q.status || "Pending"}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {tab === "quotes" && (
                  <div className="premium-card p-6 space-y-4">
                    <SectionHeading
                      align="left"
                      eyebrow={isAr ? "عروض الأسعار" : "Quote Requests"}
                      title={isAr ? "طلبات عروض الأسعار النشطة" : "Active Quote Requests"}
                    />
                    {quotes.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <p className="text-sm text-gray-400">
                          {isAr ? "لا توجد عروض أسعار حالياً." : "No quote requests on file."}
                        </p>
                        <PremiumButton to="/request-quote">{isAr ? "طلب عرض سعر" : "Request Quote"}</PremiumButton>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 font-mono uppercase text-[10px] border-b border-white/10">
                              <th className="text-left py-2">{isAr ? "المنتج" : "Product"}</th>
                              <th className="text-left py-2">{isAr ? "المعدن" : "Metal"}</th>
                              <th className="text-left py-2">{isAr ? "الحالة" : "Status"}</th>
                              <th className="text-left py-2">{isAr ? "التاريخ" : "Date"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quotes.map((q: any) => (
                              <tr key={q.id} className="border-b border-white/[0.03] text-gray-300">
                                <td className="py-3">{q.productCategory || q.productInterest || "—"}</td>
                                <td className="py-3">{q.metalInterest || q.metal_interest || "—"}</td>
                                <td className="py-3 text-gold-base">{q.status || "Pending"}</td>
                                <td className="py-3 text-gray-500">
                                  {q.created_at ? new Date(q.created_at).toLocaleDateString() : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {tab === "orders" && (
                  <div className="premium-card p-6 space-y-4">
                    <SectionHeading
                      align="left"
                      eyebrow={isAr ? "الطلبات" : "Orders"}
                      title={isAr ? "سجلات شراء السبائك" : "Physical Bullion Purchase Records"}
                    />
                    {orders.length === 0 ? (
                      <p className="text-xs text-gray-500 py-6 text-center">
                        {isAr ? "لا توجد سجلات شراء بعد." : "No purchase records yet."}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((o: any) => (
                          <div
                            key={o.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border border-white/[0.04] rounded-sm bg-black/20"
                          >
                            <div>
                              <p className="text-sm text-white">{o.product_name || o.description || o.id}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{o.id}</p>
                            </div>
                            <span className="text-xs text-gold-base uppercase tracking-wider">{o.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "kyc" && (
                  <div className="premium-card p-6 space-y-4">
                    <SectionHeading
                      align="left"
                      eyebrow="KYC / AML"
                      title={isAr ? "مراجعة KYC والمستندات" : "KYC & AML Review"}
                      subtitle={
                        isAr
                          ? "رفع المستندات قريباً. تواصل مع المكتب لإكمال التحقق."
                          : "Document upload coming soon. Contact desk to complete verification."
                      }
                    />
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 border border-white/[0.04] rounded-sm">
                        <span className="text-gray-500 block mb-1">{isAr ? "الحالة" : "Status"}</span>
                        <span className="text-white font-medium">{kycStatus}</span>
                      </div>
                      <div className="p-4 border border-white/[0.04] rounded-sm">
                        <span className="text-gray-500 block mb-1">{isAr ? "الاسم" : "Full Name"}</span>
                        <span className="text-white">{kyc?.full_name || user.name}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 font-mono">
                      {isAr
                        ? "مستندات KYC تُراجع يدوياً من فريق الامتثال. لا يتم تخزين المستندات في محفظة رقمية."
                        : "KYC documents are reviewed manually by compliance. This is not a digital wallet."}
                    </p>
                  </div>
                )}

                {tab === "storage" && (
                  <div className="premium-card p-6 space-y-4">
                    <SectionHeading
                      align="left"
                      eyebrow={isAr ? "التخزين" : "Storage"}
                      title={isAr ? "طلبات التخزين المخصص" : "Allocated Bullion Storage Requests"}
                    />
                    <p className="text-xs text-gray-400">
                      {isAr
                        ? "التخزين المخصص للسبائك الفعلية — ليس رصيداً نقدياً أو محفظة."
                        : "Allocated storage for physical bullion — not a cash balance or wallet."}
                    </p>
                    <PremiumButton to="/allocated-storage">
                      {isAr ? "طلب تخزين مخصص" : "Request Allocated Storage"}
                      <ArrowRight size={14} />
                    </PremiumButton>
                  </div>
                )}

                {tab === "support" && (
                  <div className="premium-card p-6 space-y-4">
                    <SectionHeading
                      align="left"
                      eyebrow={isAr ? "الدعم" : "Support"}
                      title={isAr ? "مكتب الدعم" : "Desk Support Panel"}
                    />
                    <p className="text-xs text-gray-400">
                      {isAr
                        ? "تواصل مع مكتب PGR UAE عبر واتساب أو البريد الإلكتروني."
                        : "Contact PGR UAE desk via WhatsApp or email."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <PremiumButton href="https://wa.me/971559688837" variant="whatsapp">
                        WhatsApp Desk
                      </PremiumButton>
                      <PremiumButton href="mailto:desk@pgruae.com" variant="outline">
                        desk@pgruae.com
                      </PremiumButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PremiumLayout>
  );
}

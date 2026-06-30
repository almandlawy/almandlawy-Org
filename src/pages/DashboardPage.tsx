import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Package,
  FolderOpen,
  Warehouse,
  RefreshCw,
  User,
  Headphones,
  Search,
  Bell,
  Shield,
  LogOut,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import PremiumButton from "../components/premium/PremiumButton";
import Logo from "../components/premium/Logo";
import { dbService, mockDb } from "../lib/supabase";

type Tab = "dashboard" | "quotes" | "orders" | "documents" | "storage" | "sellback" | "profile" | "support";

export default function DashboardPage() {
  const { currentLang, user, setUser, rates } = useApp();
  const isAr = currentLang === "ar";
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
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
              q.email?.toLowerCase() === email || q.customer_id === user.id || q.user_id === user.id
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

  const handleLogout = async () => {
    await dbService.auth.logout();
    mockDb.auth.logout();
    setUser(null);
    navigate("/login");
  };

  const kycStatus = kyc?.status || (isAr ? "لم يُقدَّم" : "Not submitted");
  const goldSpot = rates?.gold?.spot_usd_oz;

  const sidebar: { id: Tab; en: string; ar: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", en: "Dashboard", ar: "لوحة التحكم", icon: LayoutDashboard },
    { id: "quotes", en: "Quotes", ar: "عروض الأسعار", icon: FileText },
    { id: "orders", en: "Orders", ar: "الطلبات", icon: Package },
    { id: "documents", en: "Documents", ar: "المستندات", icon: FolderOpen },
    { id: "storage", en: "Storage", ar: "التخزين", icon: Warehouse },
    { id: "sellback", en: "Sell-Back Requests", ar: "طلبات إعادة البيع", icon: RefreshCw },
    { id: "profile", en: "Profile", ar: "الملف الشخصي", icon: User },
    { id: "support", en: "Support", ar: "الدعم", icon: Headphones },
  ];

  const purchaseRecords = orders.map((o: any) => ({
    id: o.id,
    metal: o.metal || o.product_name?.includes("Silver") ? "Silver" : "Gold",
    weight: o.weight || "—",
    purity: o.purity || "999.9",
    date: o.created_at ? new Date(o.created_at).toLocaleDateString() : "—",
    price: o.total_amount ? `$${Number(o.total_amount).toLocaleString()}` : "—",
    indicative: goldSpot && o.metal !== "silver" ? `$${(goldSpot * (o.weight_oz || 1)).toFixed(0)}` : "—",
    status: o.status,
  }));

  if (!user) return null;

  return (
    <PremiumLayout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8" style={{ direction: isAr ? "rtl" : "ltr" }}>
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gold-base/10">
          <Logo compact showDescriptor={false} />
          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 glass-gold text-xs text-gray-500">
              <Search size={14} />
              <span>{isAr ? "بحث..." : "Search..."}</span>
            </div>
            <button className="p-2 glass-gold text-gray-400 hover:text-gold-base cursor-pointer" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 glass-gold">
              <div className="h-7 w-7 rounded-full bg-gold-base/20 border border-gold-base/30 flex items-center justify-center text-[10px] text-gold-base font-semibold">
                {user.name?.[0]?.toUpperCase() || "C"}
              </div>
              <span className="text-xs text-gray-300 hidden sm:block">{user.name}</span>
            </div>
            <span className="hidden md:flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <Shield size={12} />
              {isAr ? "جلسة آمنة" : "Secure session"}
            </span>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-white cursor-pointer" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3 xl:col-span-2">
            <nav className="glass-gold p-2 space-y-0.5">
              {sidebar.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTab(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    tab === s.id
                      ? "bg-gold-base/15 text-gold-base border border-gold-base/25"
                      : "text-gray-400 hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <s.icon size={15} />
                  {isAr ? s.ar : s.en}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="lg:col-span-9 xl:col-span-10 space-y-6">
            {loading ? (
              <div className="glass-gold p-12 text-center text-gray-500 text-sm">{isAr ? "جاري التحميل..." : "Loading..."}</div>
            ) : (
              <>
                {(tab === "dashboard" || tab === "orders") && (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      {[
                        { label: isAr ? "عروض نشطة" : "Active Quotes", value: quotes.length },
                        { label: isAr ? "الطلبات" : "Orders", value: orders.length },
                        { label: isAr ? "حالة KYC" : "KYC Status", value: kycStatus },
                        { label: isAr ? "طلبات التخزين" : "Storage Requests", value: 0 },
                      ].map((c) => (
                        <div key={c.label} className="glass-gold p-4 md:p-5">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">{c.label}</span>
                          <span className="text-xl md:text-2xl font-serif text-[#F5F0E8]">{c.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="glass-gold p-5 md:p-6 space-y-4">
                      <div>
                        <h2 className="text-lg font-serif text-[#F5F0E8]">
                          {isAr ? "سجلات شراء السبائك الفعلية" : "Your Physical Bullion Purchase Records"}
                        </h2>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {isAr ? "قيم إرشادية فقط. ليست محفظة تداول." : "Indicative values only. Not a trading wallet."}
                        </p>
                      </div>

                      {purchaseRecords.length === 0 ? (
                        <div className="text-center py-10 space-y-3">
                          <p className="text-sm text-gray-500">{isAr ? "لا توجد سجلات شراء بعد." : "No purchase records yet."}</p>
                          <PremiumButton to="/request-quote" className="!rounded-lg">
                            {isAr ? "طلب عرض سعر" : "Request Quote"}
                          </PremiumButton>
                        </div>
                      ) : (
                        <div className="overflow-x-auto -mx-2">
                          <table className="w-full text-xs min-w-[640px]">
                            <thead>
                              <tr className="text-gray-500 font-mono uppercase text-[9px] border-b border-gold-base/10">
                                <th className="text-left py-2 px-2">{isAr ? "المعدن" : "Metal"}</th>
                                <th className="text-left py-2 px-2">{isAr ? "الوزن" : "Weight"}</th>
                                <th className="text-left py-2 px-2">{isAr ? "النقاء" : "Purity"}</th>
                                <th className="text-left py-2 px-2">{isAr ? "تاريخ الشراء" : "Purchase Date"}</th>
                                <th className="text-left py-2 px-2">{isAr ? "سعر الشراء" : "Purchase Price"}</th>
                                <th className="text-left py-2 px-2">{isAr ? "قيمة إرشادية" : "Indicative Value"}</th>
                                <th className="text-left py-2 px-2">{isAr ? "إجراء" : "Action"}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchaseRecords.map((r) => (
                                <tr key={r.id} className="border-b border-white/[0.04] text-gray-300">
                                  <td className="py-3 px-2">{r.metal}</td>
                                  <td className="py-3 px-2">{r.weight}</td>
                                  <td className="py-3 px-2">{r.purity}</td>
                                  <td className="py-3 px-2 text-gray-500">{r.date}</td>
                                  <td className="py-3 px-2">{r.price}</td>
                                  <td className="py-3 px-2 text-gold-base/80">{r.indicative}</td>
                                  <td className="py-3 px-2">
                                    <Link to="/sell-back" className="text-gold-base hover:underline text-[10px] uppercase tracking-wider">
                                      {isAr ? "عرض إعادة بيع" : "Sell-Back Quote"}
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="glass-gold p-5 space-y-3">
                        <h3 className="text-sm font-serif text-[#F5F0E8]">{isAr ? "آخر طلبات عروض الأسعار" : "Recent Quote Requests"}</h3>
                        {quotes.length === 0 ? (
                          <p className="text-xs text-gray-500">{isAr ? "لا توجد طلبات." : "No requests."}</p>
                        ) : (
                          quotes.slice(0, 4).map((q: any) => (
                            <div key={q.id} className="flex justify-between text-xs border-b border-white/[0.04] pb-2">
                              <span className="text-gray-400">{q.productCategory || q.productInterest || "Bullion"}</span>
                              <span className="text-gold-base font-mono">{q.status || "Pending"}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="glass-gold p-5 space-y-3">
                        <h3 className="text-sm font-serif text-[#F5F0E8]">{isAr ? "حالة الطلبات" : "Order Status"}</h3>
                        {orders.length === 0 ? (
                          <p className="text-xs text-gray-500">{isAr ? "لا توجد طلبات." : "No orders."}</p>
                        ) : (
                          orders.slice(0, 4).map((o: any) => (
                            <div key={o.id} className="flex justify-between text-xs border-b border-white/[0.04] pb-2">
                              <span className="text-gray-400 font-mono">{o.id}</span>
                              <span className="text-gray-300">{o.status}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="glass-gold p-5 space-y-3">
                        <h3 className="text-sm font-serif text-[#F5F0E8]">KYC & {isAr ? "المستندات" : "Documents"}</h3>
                        <p className="text-xs text-gray-400">{kycStatus}</p>
                        <p className="text-[10px] text-gray-600">
                          {isAr ? "رفع المستندات قريباً. قد يطلب المكتب مستندات عبر قناة رسمية آمنة." : "Document upload coming soon. Desk may request documents via official secure channel."}
                        </p>
                      </div>
                      <div className="glass-gold p-5 space-y-3">
                        <h3 className="text-sm font-serif text-[#F5F0E8]">{isAr ? "الدعم / واتساب" : "Support / WhatsApp"}</h3>
                        <PremiumButton href="https://wa.me/971559688837" variant="whatsapp" fullWidth className="!rounded-lg">
                          WhatsApp Desk
                        </PremiumButton>
                      </div>
                    </div>
                  </>
                )}

                {tab === "quotes" && (
                  <div className="glass-gold p-6">
                    <h2 className="text-lg font-serif text-[#F5F0E8] mb-4">{isAr ? "عروض الأسعار" : "Quote Requests"}</h2>
                    {quotes.length === 0 ? (
                      <PremiumButton to="/request-quote" className="!rounded-lg">{isAr ? "طلب عرض سعر" : "Request Quote"}</PremiumButton>
                    ) : (
                      quotes.map((q: any) => (
                        <div key={q.id} className="flex justify-between py-3 border-b border-white/[0.04] text-xs">
                          <span>{q.productInterest || "Bullion"}</span>
                          <span className="text-gold-base">{q.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "documents" && (
                  <div className="glass-gold p-6 space-y-3">
                    <h2 className="text-lg font-serif text-[#F5F0E8]">KYC / AML</h2>
                    <p className="text-xs text-gray-400">{kycStatus}</p>
                    <p className="text-[10px] text-gray-600">{isAr ? "ليس محفظة رقمية." : "This is not a digital wallet."}</p>
                  </div>
                )}

                {tab === "storage" && (
                  <div className="glass-gold p-6 space-y-4">
                    <h2 className="text-lg font-serif text-[#F5F0E8]">{isAr ? "طلبات التخزين المخصص" : "Allocated Storage Requests"}</h2>
                    <p className="text-xs text-gray-500">{isAr ? "ليس رصيداً نقدياً أو محفظة." : "Not a cash balance or wallet."}</p>
                    <PremiumButton to="/allocated-storage" className="!rounded-lg">{isAr ? "طلب تخزين" : "Request Storage"}</PremiumButton>
                  </div>
                )}

                {tab === "sellback" && (
                  <div className="glass-gold p-6 space-y-4">
                    <h2 className="text-lg font-serif text-[#F5F0E8]">{isAr ? "طلبات إعادة البيع" : "Sell-Back Requests"}</h2>
                    <p className="text-xs text-gray-500">{buybacks.length} {isAr ? "طلبات" : "requests"}</p>
                    <PremiumButton to="/sell-back" className="!rounded-lg">{isAr ? "طلب عرض إعادة بيع" : "Request Sell-Back Quote"}</PremiumButton>
                  </div>
                )}

                {tab === "profile" && (
                  <div className="glass-gold p-6 space-y-2 text-sm">
                    <h2 className="text-lg font-serif text-[#F5F0E8] mb-3">{isAr ? "الملف الشخصي" : "Profile"}</h2>
                    <p className="text-gray-400">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                )}

                {tab === "support" && (
                  <div className="glass-gold p-6 space-y-4">
                    <h2 className="text-lg font-serif text-[#F5F0E8]">{isAr ? "الدعم" : "Support"}</h2>
                    <PremiumButton href="mailto:desk@pgruae.com" variant="outline" fullWidth className="!rounded-lg">desk@pgruae.com</PremiumButton>
                    <PremiumButton href="https://wa.me/971559688837" variant="whatsapp" fullWidth className="!rounded-lg">WhatsApp Desk</PremiumButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}

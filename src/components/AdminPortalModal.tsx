/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, LayoutDashboard, Coins, Users, ClipboardList, Database, Check, 
  Sliders, RefreshCw, Layers, ShieldCheck, Truck, MapPin, DollarSign, 
  TrendingUp, Undo, Box, Landmark, Award, FileText, BookOpen, Settings, 
  Eye, Trash2, Plus, Edit, ShieldAlert, Mail, Phone, Clock, FileCheck, CheckCircle
} from "lucide-react";
import { dbService, mockDb } from "../lib/supabase";
import { Product } from "../types";

interface AdminPortalModalProps {
  currentLang: "en" | "ar";
  onClose: () => void;
}

type AdminSection = 
  | "dashboard"
  | "products"
  | "quotes"
  | "orders"
  | "customers"
  | "kyc"
  | "iraq_delivery"
  | "pickup_points"
  | "market_prices"
  | "buyback"
  | "holding"
  | "certificates"
  | "invoices"
  | "blog"
  | "settings";

export default function AdminPortalModal({ currentLang, onClose }: AdminPortalModalProps) {
  const isAr = currentLang === "ar";
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [loading, setLoading] = useState(false);

  // States mirroring DB
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [kycProfiles, setKycProfiles] = useState<any[]>([]);
  const [iraqDeliveries, setIraqDeliveries] = useState<any[]>([]);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [exchangeRates, setExchangeRates] = useState<any>({ USD: 1.0, AED: 3.6725, IQD: 1310.0 });
  const [buybacks, setBuybacks] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    gold_markup_pct: 0.8,
    silver_markup_pct: 1.5,
    spread_usd: 12.0,
    premium_markup_pct: 2.0,
    whatsapp_hotline: "+971509998888",
    desk_email: "desk@pgruae.com",
    trade_phone: "+971 4 445 8888",
    office_address_en: "Almas Tower, DMCC Precinct, Dubai Marina, Dubai, United Arab Emirates",
    office_address_ar: "برج الماس، منطقة مركز دبي للسلع المتعددة (DMCC)، دبي مارينا، دبي، الإمارات العربية المتحدة",
    dmcc_reg_no: "890317"
  });

  // Form states for creating new items
  const [newProduct, setNewProduct] = useState({
    id: "",
    name_en: "",
    name_ar: "",
    metal: "gold" as "gold" | "silver",
    weight_g: 100,
    purity: "999.9",
    premium_pct: 2.5,
    is_featured: false,
    image_url: ""
  });

  const [newPickupPoint, setNewPickupPoint] = useState({
    name_en: "",
    name_ar: "",
    city_en: "",
    city_ar: "",
    address_en: "",
    address_ar: "",
    phone: "",
    whatsapp: "",
    working_hours_en: "",
    working_hours_ar: "",
    status: "Active"
  });

  const [newCertificate, setNewCertificate] = useState({
    serial_number: "",
    product_name: "",
    weight: "",
    purity: "",
    manufacturer: "",
    issue_date: "",
    status: "Active / Verified"
  });

  const [newBlogPost, setNewBlogPost] = useState({
    slug: "",
    category: "Market Report",
    title_en: "",
    title_ar: "",
    content_en: "",
    content_ar: "",
    author: "PGR Trading Desk",
    featured: false,
    seo_title: "",
    seo_description: ""
  });

  // Success notifications inside tabs
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load all admin datasets
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        pList, qList, oList, kList, dList, ptList, exRates, bbList, hList, sObj, certs, blogList
      ] = await Promise.all([
        dbService.products.list(),
        dbService.quoteRequests.list(),
        dbService.orders.list(),
        dbService.kyc.listAll(),
        dbService.iraqDelivery.list(),
        dbService.pickupPoints.list(),
        dbService.exchangeRates.get(),
        dbService.buyback.list(),
        dbService.investment.listAll(),
        dbService.settings.get(),
        mockDb.get("pgr_certificates"), // from direct storage
        dbService.blog.list()
      ]);

      setProducts(pList || []);
      setQuotes(qList || []);
      setOrders(oList || []);
      setKycProfiles(kList || []);
      setIraqDeliveries(dList || []);
      setPickupPoints(ptList || []);
      if (exRates) setExchangeRates(exRates);
      setBuybacks(bbList || []);
      setHoldings(hList || []);
      if (sObj) setSettings(sObj);
      setCertificates(certs || []);
      setBlogPosts(blogList || []);

      // Create a simulated list of customers from orders and KYC
      const seenCustIds = new Set<string>();
      const tempCustomers: any[] = [];
      
      // Seed default Sheikh Mansoor
      tempCustomers.push({
        id: "cust-vip-1",
        name: "Sheikh Mansoor Al-Maktoum",
        email: "vip.investor@dubaimarina.ae",
        phone: "+971 50 999 8888",
        nationality: "Emirati",
        company: "Sovereign Asset Holdings Ltd",
        created_at: "2026-01-01"
      });
      seenCustIds.add("cust-vip-1");

      kList.forEach((p: any) => {
        if (!seenCustIds.has(p.id)) {
          seenCustIds.add(p.id);
          tempCustomers.push({
            id: p.id,
            name: p.full_name || "Unknown Customer",
            email: p.email || "",
            phone: p.phone || "",
            nationality: p.nationality || "",
            company: p.source_of_funds_declaration || "",
            created_at: new Date().toISOString().split('T')[0]
          });
        }
      });

      setCustomers(tempCustomers);

      // Generate invoice templates from orders
      const invoiceData = oList.map((o: any) => ({
        id: `INV-${o.id.replace("PGR-ORD-", "")}`,
        order_id: o.id,
        customer_name: o.customer_id === "cust-vip-1" ? "Sheikh Mansoor Al-Maktoum" : "Iraqi Portfolio Client",
        date: o.created_at?.split("T")[0] || "2026-06-25",
        total: o.total_amount,
        currency: o.currency,
        status: o.status === "Delivered" ? "Paid" : "Sent"
      }));
      setInvoices(invoiceData);

    } catch (err) {
      console.error("Failed to compile admin metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const triggerSuccessMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // 1. PRODUCT CRUD
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.id || !newProduct.name_en) return;
    try {
      const mappedProduct: Product = {
        id: newProduct.id,
        name_en: newProduct.name_en,
        name_ar: newProduct.name_ar || newProduct.name_en,
        category: newProduct.metal === "gold" ? "gold_bars" : "silver_bars",
        weight_label: `${newProduct.weight_g} Grams`,
        purity: newProduct.purity,
        manufacturer: "PAMP Suisse",
        country_en: "Switzerland",
        country_ar: "سويسرا",
        availability: "In Stock",
        certificate_en: "Assay Certificate Certified",
        certificate_ar: "شهادة معتمدة",
        description_en: "Investment Grade Bullion Bar",
        description_ar: "سبائك درجة استثمارية عالية الجودة",
        technical_specs: {
          weight_grams: Number(newProduct.weight_g),
          purity: newProduct.purity,
          metal: newProduct.metal
        },
        image_placeholder: newProduct.metal === "gold" ? "gold_bar" : "silver_bar",
        premium_multiplier: 1 + (Number(newProduct.premium_pct) / 100)
      };

      await dbService.products.save(mappedProduct);
      
      // Auto add initial stock to inventory for safety
      const currentInv = mockDb.get("pgr_inventory") || [];
      if (!currentInv.some((i: any) => i.product_id === mappedProduct.id)) {
        currentInv.push({
          product_id: mappedProduct.id,
          sku: mappedProduct.id.toUpperCase() + "-MINT",
          barcode: "729000" + Math.floor(100000 + Math.random() * 900000),
          stock: 25,
          reserved: 0
        });
        mockDb.set("pgr_inventory", currentInv);
      }

      setNewProduct({
        id: "",
        name_en: "",
        name_ar: "",
        metal: "gold",
        weight_g: 100,
        purity: "999.9",
        premium_pct: 2.5,
        is_featured: false,
        image_url: ""
      });
      triggerSuccessMessage("Product added successfully!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await dbService.products.delete(id);
      triggerSuccessMessage("Product deleted.");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 2. QUOTE ACTIONS
  const handleUpdateQuoteStatus = async (quoteId: string, status: "Approved" | "Rejected") => {
    try {
      await dbService.quoteRequests.updateStatus(quoteId, status);
      
      if (status === "Approved") {
        const match = quotes.find(q => q.id === quoteId);
        if (match) {
          // Convert quote to live order
          await dbService.orders.create({
            customer_id: match.customer_id || "cust-vip-1",
            total_amount: parseFloat(match.weight || "100") * (match.metalInterest === "silver" ? 1.1 : 78.5), // approximate conversion
            currency: "USD",
            shipping_method: "Office Pickup",
            payment_method: "Bank Transfer",
            shipping_address: "Dubai Vault Gate",
            status: "Quoted",
            items: [
              { 
                product_id: match.productCategory || "gb-100g", 
                quantity: 1, 
                unit_price: parseFloat(match.weight || "100") * (match.metalInterest === "silver" ? 1.1 : 78.5), 
                product_name: `${match.metalInterest?.toUpperCase()} Bullion: ${match.weight || "Custom Lot"}` 
              }
            ]
          });
          triggerSuccessMessage("Quote APPROVED and Order Ticket generated!");
        }
      } else {
        triggerSuccessMessage("Quote marked as rejected.");
      }

      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await dbService.orders.updateStatus(orderId, status);
      triggerSuccessMessage(`Order ${orderId} updated to: ${status}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. KYC PROFILE ACTIONS
  const handleUpdateKycStatus = async (customerId: string, status: string) => {
    try {
      const profile = await dbService.kyc.get(customerId);
      profile.status = status;
      if (status === "Verified") {
        profile.verified_at = new Date().toISOString();
        if (profile.documents && profile.documents.length > 0) {
          profile.documents[0].status = "Verified";
        }
      } else {
        profile.verified_at = "";
        if (profile.documents && profile.documents.length > 0) {
          profile.documents[0].status = status;
        }
      }
      await dbService.kyc.save(customerId, profile);
      triggerSuccessMessage(`KYC verification set to: ${status}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 5. IRAQ DELIVERY ACTIONS
  const handleUpdateIraqDeliveryStatus = async (id: string, status: string, customsDocsStatus?: string) => {
    try {
      const list = mockDb.get("pgr_iraq_delivery_requests") || [];
      const index = list.findIndex((r: any) => r.id === id);
      if (index > -1) {
        list[index].status = status;
        if (customsDocsStatus) {
          list[index].customs_docs_status = customsDocsStatus;
        }
        mockDb.set("pgr_iraq_delivery_requests", list);
        triggerSuccessMessage(`Iraq delivery request updated.`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. PICKUP POINT CRUD
  const handleAddPickupPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPickupPoint.name_en || !newPickupPoint.city_en) return;
    try {
      const mappedPoint = {
        id: `pickup-${Date.now()}`,
        name_en: newPickupPoint.name_en,
        name_ar: newPickupPoint.name_ar || newPickupPoint.name_en,
        city_en: newPickupPoint.city_en,
        city_ar: newPickupPoint.city_ar || newPickupPoint.city_en,
        address_en: newPickupPoint.address_en,
        address_ar: newPickupPoint.address_ar || newPickupPoint.address_en,
        phone: newPickupPoint.phone,
        whatsapp: newPickupPoint.whatsapp,
        working_hours_en: newPickupPoint.working_hours_en,
        working_hours_ar: newPickupPoint.working_hours_ar || newPickupPoint.working_hours_en,
        status: newPickupPoint.status
      };

      await dbService.pickupPoints.save(mappedPoint);
      setNewPickupPoint({
        name_en: "",
        name_ar: "",
        city_en: "",
        city_ar: "",
        address_en: "",
        address_ar: "",
        phone: "",
        whatsapp: "",
        working_hours_en: "",
        working_hours_ar: "",
        status: "Active"
      });
      triggerSuccessMessage("Service / Pickup Point registered!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePickupPoint = async (id: string) => {
    if (!window.confirm("Delete this service point?")) return;
    try {
      await dbService.pickupPoints.delete(id);
      triggerSuccessMessage("Service point removed.");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 7. EXCHANGE RATES & SYSTEM MARKUPS
  const handleSavePricingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.settings.update({
        gold_markup_pct: Number(settings.gold_markup_pct),
        silver_markup_pct: Number(settings.silver_markup_pct),
        spread_usd: Number(settings.spread_usd),
        premium_markup_pct: Number(settings.premium_markup_pct),
        whatsapp_hotline: settings.whatsapp_hotline,
        desk_email: settings.desk_email,
        trade_phone: settings.trade_phone,
        office_address_en: settings.office_address_en,
        office_address_ar: settings.office_address_ar,
        dmcc_reg_no: settings.dmcc_reg_no
      });

      await dbService.exchangeRates.update(exchangeRates);

      triggerSuccessMessage("Pricing model & exchange metrics synced!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 8. BUYBACK ACTIONS
  const handleUpdateBuybackStatus = async (id: string, status: string, estimatedPayout?: number) => {
    try {
      await dbService.buyback.updateStatus(id, status, estimatedPayout);
      triggerSuccessMessage(`Buyback request ${id} set to: ${status}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 9. HOLDING REQUESTS
  const handleApproveHolding = async (holdingId: string) => {
    try {
      const list = mockDb.get("pgr_investment_accounts") || [];
      const matchIndex = list.findIndex((h: any) => h.id === holdingId);
      if (matchIndex > -1) {
        list[matchIndex].status = "Approved / Vault Storage Active";
        // Also update estimated market metrics for realism
        list[matchIndex].current_market_value_usd = list[matchIndex].weight_grams * (list[matchIndex].metal === "gold" ? 76.5 : 0.95);
        mockDb.set("pgr_investment_accounts", list);
        triggerSuccessMessage("Vault storage / holding request approved!");
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 10. CERTIFICATES CRUD
  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertificate.serial_number || !newCertificate.product_name) return;
    try {
      const list = mockDb.get("pgr_certificates") || [];
      const newCert = {
        serial_number: newCertificate.serial_number.trim(),
        qr_code: `https://pgruae.com/verify/${newCertificate.serial_number.trim()}`,
        product_name: newCertificate.product_name,
        weight: newCertificate.weight,
        purity: newCertificate.purity,
        manufacturer: newCertificate.manufacturer,
        issue_date: newCertificate.issue_date || new Date().toISOString().split('T')[0],
        status: newCertificate.status
      };
      list.push(newCert);
      mockDb.set("pgr_certificates", list);
      setNewCertificate({
        serial_number: "",
        product_name: "",
        weight: "",
        purity: "",
        manufacturer: "",
        issue_date: "",
        status: "Active / Verified"
      });
      triggerSuccessMessage("Assay Certificate minted and registered!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 11. BLOG CMS
  const handleAddBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogPost.slug || !newBlogPost.title_en) return;
    try {
      const mappedPost = {
        id: `blog-${Date.now()}`,
        slug: newBlogPost.slug.trim().toLowerCase(),
        category: newBlogPost.category,
        title_en: newBlogPost.title_en,
        title_ar: newBlogPost.title_ar || newBlogPost.title_en,
        content_en: newBlogPost.content_en,
        content_ar: newBlogPost.content_ar || newBlogPost.content_en,
        author: newBlogPost.author,
        published_at: new Date().toISOString().split('T')[0],
        featured: newBlogPost.featured,
        seo_title: newBlogPost.seo_title || newBlogPost.title_en,
        seo_description: newBlogPost.seo_description
      };
      await dbService.blog.save(mappedPost);
      setNewBlogPost({
        slug: "",
        category: "Market Report",
        title_en: "",
        title_ar: "",
        content_en: "",
        content_ar: "",
        author: "PGR Trading Desk",
        featured: false,
        seo_title: "",
        seo_description: ""
      });
      triggerSuccessMessage("Market report published to global feed!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculation
  const stats = {
    grossVolume: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    totalOrders: orders.length,
    pendingQuotes: quotes.filter(q => q.status === "Pending").length,
    pendingKyc: kycProfiles.filter(k => k.status === "Pending review").length,
    activeDeliveries: iraqDeliveries.filter(d => d.status !== "Delivered" && d.status !== "Cancelled").length,
    buybackInquiries: buybacks.filter(b => b.status === "Pending").length
  };

  const renderSectionIcon = (section: AdminSection) => {
    switch (section) {
      case "dashboard": return <LayoutDashboard size={14} />;
      case "products": return <Box size={14} />;
      case "quotes": return <ClipboardList size={14} />;
      case "orders": return <CheckCircle size={14} />;
      case "customers": return <Users size={14} />;
      case "kyc": return <ShieldCheck size={14} />;
      case "iraq_delivery": return <Truck size={14} />;
      case "pickup_points": return <MapPin size={14} />;
      case "market_prices": return <TrendingUp size={14} />;
      case "buyback": return <Undo size={14} />;
      case "holding": return <Layers size={14} />;
      case "certificates": return <Award size={14} />;
      case "invoices": return <FileText size={14} />;
      case "blog": return <BookOpen size={14} />;
      case "settings": return <Settings size={14} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="fixed inset-0 bg-[#070707]/92 backdrop-blur-md" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4 md:p-8 relative">
        <div className="relative w-full max-w-7xl bg-[#0d0d0e] border border-white/[0.05] rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.95)] z-10 overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[1000px]">
          
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black/95 border border-white/[0.05] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* SIDEBAR NAVIGATION - SCROLLABLE */}
          <div className="w-full md:w-64 bg-[#111112] border-b md:border-b-0 md:border-r border-white/[0.03] flex flex-col shrink-0">
            <div className="p-5 border-b border-white/[0.03]">
              <span className="text-[10px] font-mono text-gold-base uppercase tracking-[0.2em] font-bold block mb-1">
                {isAr ? "ديوان المراقبة والتداول" : "Sovereign Command Deck"}
              </span>
              <h3 className="text-sm font-serif font-semibold text-white tracking-wide">
                {isAr ? "بوابة الإدارة لـ PGR UAE" : "PGR UAE & Iraq Admin"}
              </h3>
            </div>

            {/* Mobile selection dropdown */}
            <div className="p-3 md:hidden">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value as AdminSection)}
                className="w-full bg-[#161618] border border-white/[0.08] text-xs text-white p-2.5 rounded outline-none font-mono"
              >
                {[
                  { id: "dashboard", label: "Overview Dashboard" },
                  { id: "products", label: "Catalog Products" },
                  { id: "quotes", label: `Bespoke Quotes (${stats.pendingQuotes})` },
                  { id: "orders", label: `Orders Ledger (${stats.totalOrders})` },
                  { id: "customers", label: "HNW Clients Portfolio" },
                  { id: "kyc", label: `Identity KYC Verification (${stats.pendingKyc})` },
                  { id: "iraq_delivery", label: `Iraq Delivery Logistics (${stats.activeDeliveries})` },
                  { id: "pickup_points", label: "Managed Pickup Points" },
                  { id: "market_prices", label: "Market Prices & Multipliers" },
                  { id: "buyback", label: `Liquidate & Buybacks (${stats.buybackInquiries})` },
                  { id: "holding", label: "Bullion Holding Requests" },
                  { id: "certificates", label: "Assay Certificates" },
                  { id: "invoices", label: "Financial Invoices" },
                  { id: "blog", label: "CMS Intelligence Blog" },
                  { id: "settings", label: "Global Settings" }
                ].map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.label}</option>
                ))}
              </select>
            </div>

            {/* Desktop list of tabs */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 hidden md:block select-none custom-scrollbar">
              {[
                { id: "dashboard", label: "Sovereign Board" },
                { id: "products", label: "Products Catalog" },
                { id: "quotes", label: "Quote Requests", count: stats.pendingQuotes },
                { id: "orders", label: "Orders Ledger", count: stats.totalOrders },
                { id: "customers", label: "Investors & Holdings" },
                { id: "kyc", label: "Digital Identity (KYC)", count: stats.pendingKyc },
                { id: "iraq_delivery", label: "Iraq Safe Deliveries", count: stats.activeDeliveries },
                { id: "pickup_points", label: "Pickup Points" },
                { id: "market_prices", label: "Prices & Exchange Rates" },
                { id: "buyback", label: "Buyback Requests", count: stats.buybackInquiries },
                { id: "holding", label: "Holding & Storage Requests" },
                { id: "certificates", label: "Bullion Certificates" },
                { id: "invoices", label: "Client Invoices" },
                { id: "blog", label: "Market Intelligence (CMS)" },
                { id: "settings", label: "System Configuration" }
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as AdminSection)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded transition-all font-mono text-[11px] uppercase tracking-wider cursor-pointer ${
                    activeSection === sec.id
                      ? "bg-[#c5a85c]/10 text-[#c5a85c] border-l-2 border-[#c5a85c] font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {renderSectionIcon(sec.id as AdminSection)}
                    <span>{sec.label}</span>
                  </div>
                  {sec.count !== undefined && sec.count > 0 && (
                    <span className="bg-amber-500 text-black font-sans font-bold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">
                      {sec.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/[0.03] text-center hidden md:block">
              <span className="text-[9px] font-mono text-gray-500 block">SYSTEM STATUS: OPERATIONAL</span>
              <span className="text-[8px] font-mono text-emerald-500 uppercase">Secure AES-256 Active</span>
            </div>
          </div>

          {/* CONTENT PANE - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 bg-[#0a0a0b] custom-scrollbar">
            
            {/* Action successes block */}
            {actionSuccess && (
              <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-400 font-mono text-xs px-4 py-3 rounded shadow-2xl flex items-center gap-2 animate-fadeIn">
                <CheckCircle size={16} />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* LOADING STATE OVERLAY */}
            {loading && (
              <div className="flex items-center justify-center py-12 gap-2 text-gold-base font-mono text-xs">
                <RefreshCw size={14} className="animate-spin" />
                <span>SYNCING PGR MATRICES...</span>
              </div>
            )}

            {/* 1. SECTION: DASHBOARD */}
            {!loading && activeSection === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-serif text-white">{isAr ? "لوحة المراقبة السيادية" : "Sovereign Command Hub"}</h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
                    {isAr ? "تحليل المعاملات، حجم المبيعات، ومراقبة احتياطي الذهب والفضة" : "Gross transaction metrics, vault reserves allocation & secure logs"}
                  </p>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#111112] p-4 rounded border border-white/[0.03] space-y-1">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase">Gross Settled Volume</span>
                    <span className="text-lg font-serif text-white font-bold">{stats.grossVolume.toLocaleString()} AED</span>
                    <span className="text-[8px] text-emerald-500 font-mono block">100% SECURE CLEARING</span>
                  </div>
                  <div className="bg-[#111112] p-4 rounded border border-white/[0.03] space-y-1">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase">Total Client Tickets</span>
                    <span className="text-lg font-serif text-white font-bold">{stats.totalOrders} Trades</span>
                    <span className="text-[8px] text-gold-base font-mono block">DMCC REGISTERED FLOW</span>
                  </div>
                  <div className="bg-[#111112] p-4 rounded border border-white/[0.03] space-y-1">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase">Identity KYC Pending</span>
                    <span className="text-lg font-serif text-white font-bold">{stats.pendingKyc} Profiles</span>
                    <span className="text-[8px] text-amber-500 font-mono block">AWAITING COMPLIANCE SIGN</span>
                  </div>
                  <div className="bg-[#111112] p-4 rounded border border-white/[0.03] space-y-1">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase">Active Iraq Shipments</span>
                    <span className="text-lg font-serif text-white font-bold">{stats.activeDeliveries} Safe Routes</span>
                    <span className="text-[8px] text-emerald-400 font-mono block">BAGHDAD/ERBIL TRANSIT</span>
                  </div>
                </div>

                {/* Analytical charts & Recent tickets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left chart */}
                  <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4 lg:col-span-2">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Bullion Reserves Allocation</span>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                          <span>Physical Gold Bullion (DMCC Storage Block A)</span>
                          <span className="text-white font-semibold">82% (102.3 kg)</span>
                        </div>
                        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.02]">
                          <div className="h-full bg-gradient-to-r from-amber-600 to-yellow-500" style={{ width: "82%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                          <span>Physical Silver Bullion (DMCC Storage Block B)</span>
                          <span className="text-white font-semibold">68% (22.5 kg)</span>
                        </div>
                        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.02]">
                          <div className="h-full bg-gradient-to-r from-gray-500 to-gray-300" style={{ width: "68%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right quick stats */}
                  <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Logistics Signals</span>
                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                        <span className="text-gray-500">BUYBACK REQUESTS</span>
                        <span className="text-amber-500 font-semibold">{stats.buybackInquiries} pending</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                        <span className="text-gray-500">EXCHANGE SPREAD</span>
                        <span className="text-gold-base">${settings.spread_usd} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">HOTLINE LINK</span>
                        <span className="text-emerald-400">{settings.whatsapp_hotline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Inquiries List */}
                <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Live Activity Stream</span>
                  <div className="divide-y divide-white/[0.02] text-xs font-mono">
                    {quotes.slice(0, 4).map((q: any) => (
                      <div key={q.id} className="py-3 flex justify-between items-center">
                        <span className="text-gray-400">{q.name} ({q.company || "Retail"})</span>
                        <span className="text-gold-light">{q.metalInterest?.toUpperCase()} - {q.weight}</span>
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] uppercase">{q.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. SECTION: PRODUCTS */}
            {!loading && activeSection === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-serif text-white">Precious Metal Catalog Entries</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Modify, delete or insert gold & silver physical bullion products</p>
                  </div>
                </div>

                {/* Add product form */}
                <form onSubmit={handleAddProduct} className="p-5 bg-[#111112] rounded border border-white/[0.03] space-y-4 text-xs font-mono">
                  <h5 className="text-sm font-serif text-gold-base">Add New Bullion Entry</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Product Slug ID</label>
                      <input
                        type="text"
                        placeholder="e.g. gold-pamp-50g"
                        value={newProduct.id}
                        onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">English Title</label>
                      <input
                        type="text"
                        placeholder="e.g. PAMP Suisse 50g Gold Bar"
                        value={newProduct.name_en}
                        onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Arabic Title</label>
                      <input
                        type="text"
                        placeholder="سبيكة ذهب بامب ٥٠ جرام"
                        value={newProduct.name_ar}
                        onChange={(e) => setNewProduct({ ...newProduct, name_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Metal Category</label>
                      <select
                        value={newProduct.metal}
                        onChange={(e) => setNewProduct({ ...newProduct, metal: e.target.value as "gold" | "silver" })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      >
                        <option value="gold">Gold (ذهب)</option>
                        <option value="silver">Silver (فضة)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Weight in Grams</label>
                      <input
                        type="number"
                        value={newProduct.weight_g}
                        onChange={(e) => setNewProduct({ ...newProduct, weight_g: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Fineness / Purity</label>
                      <input
                        type="text"
                        placeholder="999.9"
                        value={newProduct.purity}
                        onChange={(e) => setNewProduct({ ...newProduct, purity: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Retail Premium %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.premium_pct}
                        onChange={(e) => setNewProduct({ ...newProduct, premium_pct: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Image URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={newProduct.is_featured}
                        onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                        className="rounded bg-black border-white/10"
                      />
                      <label className="text-gray-400 text-[10px]">Show in Featured Highlights List</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    Add Product Entry
                  </button>
                </form>

                {/* List products and quick stock edit */}
                <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Live Catalog Products ({products.length})</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    {products.map((p) => (
                      <div key={p.id} className="p-4 rounded border border-white/[0.02] bg-[#0d0d0e] flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h6 className="text-white font-serif text-sm">{p.name_en}</h6>
                          <p className="text-gray-500 text-[10px] uppercase">ID: {p.id} / PURITY: {p.purity} / PREMIUM: {p.premium_pct}%</p>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 bg-red-950/20 text-red-400 border border-red-900/30 rounded hover:bg-red-900 hover:text-white cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. SECTION: QUOTES */}
            {!loading && activeSection === "quotes" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Secured Quote Clearing Desk</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Approve bespoke gold/silver requests, configure pricing triggers & alert clients</p>
                </div>

                {quotes.length === 0 ? (
                  <p className="text-gray-500 font-mono text-xs">No pending bespoke client quote requests found.</p>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((q) => (
                      <div key={q.id} className="p-5 rounded bg-[#111112] border border-white/[0.03] space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-gold-base font-bold uppercase">{q.id}</span>
                            <h5 className="text-sm font-serif text-white mt-1">{q.name}</h5>
                            <p className="text-gray-400 text-[10px]">Email: {q.email} / Phone: {q.phone} / Company: {q.company || "HNWI"}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            q.status === "Pending" ? "bg-amber-500/10 text-amber-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {q.status}
                          </span>
                        </div>

                        <div className="p-3 bg-black/40 rounded border border-white/[0.01] space-y-1">
                          <span className="text-[10px] text-gray-500 block uppercase font-semibold">Client Inquiry Details</span>
                          <p className="text-gray-300">Requested Metal: <strong className="text-gold-light uppercase">{q.metalInterest}</strong></p>
                          <p className="text-gray-300">Category / Product: <strong>{q.productCategory}</strong></p>
                          <p className="text-gray-300">Target Weight: <strong>{q.weight}</strong></p>
                          <p className="text-gray-400 italic mt-2">"{q.message}"</p>
                        </div>

                        {q.status === "Pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateQuoteStatus(q.id, "Approved")}
                              className="px-3.5 py-1.5 bg-[#c5a85c] text-black font-semibold uppercase text-[10px] rounded hover:bg-amber-600 cursor-pointer"
                            >
                              Approve & Set Pricing Order
                            </button>
                            <button
                              onClick={() => handleUpdateQuoteStatus(q.id, "Rejected")}
                              className="px-3.5 py-1.5 bg-red-950/30 text-red-400 border border-red-900/30 font-semibold uppercase text-[10px] rounded hover:bg-red-900 hover:text-white cursor-pointer"
                            >
                              Reject Inquiry
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SECTION: ORDERS */}
            {!loading && activeSection === "orders" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Sovereign Orders Ledger</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Inspect settlements, modify trade states, and clear logistics tickets</p>
                </div>

                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="p-5 rounded bg-[#111112] border border-white/[0.03] space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
                        <div>
                          <span className="text-white font-bold">{o.id}</span>
                          <span className="text-gray-500 block text-[9px]">{o.created_at}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-gray-500 uppercase">Change Status:</label>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-black border border-white/10 rounded px-2.5 py-1 text-[#c5a85c] outline-none"
                          >
                            <option value="Quoted">Quoted</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5 text-gray-400">
                          <p>Customer ID: <strong className="text-white">{o.customer_id}</strong></p>
                          <p>Delivery Method: <strong>{o.shipping_method}</strong></p>
                          <p>Payment Mode: <strong>{o.payment_method}</strong></p>
                          <p>Dest Address: <strong>{o.shipping_address}</strong></p>
                        </div>
                        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.03] pt-2 sm:pt-0 sm:pl-4">
                          <span className="text-[10px] text-gray-500 uppercase block">Items List</span>
                          {o.items?.map((item: any, i: number) => (
                            <p key={i} className="text-white">
                              {item.product_name} x {item.quantity} - <strong className="text-gold-light">{item.unit_price?.toLocaleString()} {o.currency}</strong>
                            </p>
                          ))}
                          <div className="pt-2 text-sm font-bold text-white uppercase flex justify-between">
                            <span>Settled Total:</span>
                            <span className="text-gold-base">{o.total_amount?.toLocaleString()} {o.currency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SECTION: CUSTOMERS & HOLDINGS */}
            {!loading && activeSection === "customers" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">HNW Client Portfolio Ledger</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Review registered accounts, calculate precious metals balances, and mint files</p>
                </div>

                <div className="space-y-4">
                  {customers.map((c) => {
                    const clientHoldings = holdings.filter(h => h.customer_id === c.id);
                    return (
                      <div key={c.id} className="p-5 rounded bg-[#111112] border border-white/[0.03] space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-start border-b border-white/[0.02] pb-2">
                          <div>
                            <span className="text-gray-500 text-[10px] block">CLIENT REFERENCE: {c.id}</span>
                            <h5 className="text-base font-serif text-white mt-1">{c.name}</h5>
                            <p className="text-gray-400 text-[10px]">{c.email} | {c.phone} | Nationality: {c.nationality}</p>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">JOINED: {c.created_at}</span>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">Allocated Holdings in Custody</span>
                          {clientHoldings.length === 0 ? (
                            <p className="text-gray-500 italic">No storage/allocated holdings stored in DB currently.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {clientHoldings.map((h: any) => (
                                <div key={h.id} className="p-3 bg-black/40 rounded border border-white/[0.01] flex justify-between items-center">
                                  <div>
                                    <span className="text-white uppercase font-bold text-sm block">{h.metal}</span>
                                    <span className="text-gray-500 text-[9px] block">WEIGHT: {h.weight_grams} grams</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[#c5a85c] font-bold block">${h.current_market_value_usd?.toLocaleString()} USD</span>
                                    <span className="text-emerald-500 text-[9px] block">AVG PAYOUT: ${h.average_purchase_price_usd} / g</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons to mint assets */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              setNewCertificate({
                                serial_number: `PAMP-${Math.floor(100000 + Math.random() * 900000)}`,
                                product_name: clientHoldings[0]?.metal === "silver" ? "PGR Certified 1kg Silver Bar" : "PAMP Suisse 100g Cast Gold Bar",
                                weight: clientHoldings[0]?.weight_grams ? `${clientHoldings[0].weight_grams} Grams` : "100 Grams",
                                purity: clientHoldings[0]?.metal === "silver" ? "999.0 Fine Silver" : "999.9 Fine Gold",
                                manufacturer: "PAMP Suisse",
                                issue_date: new Date().toISOString().split('T')[0],
                                status: "Active / Verified"
                              });
                              setActiveSection("certificates");
                              triggerSuccessMessage("Prefilled assay certificate template, ready to mint!");
                            }}
                            className="px-3.5 py-1.5 bg-gold-base/10 text-gold-base border border-gold-base/20 font-semibold uppercase text-[10px] rounded hover:bg-gold-base hover:text-black cursor-pointer flex items-center gap-1"
                          >
                            <Award size={12} />
                            Issue Assay Certificate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. SECTION: KYC VERIFICATION */}
            {!loading && activeSection === "kyc" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Digital Identity KYC Auditing</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Verify uploaded documentation under international anti-money laundering controls</p>
                </div>

                {kycProfiles.length === 0 ? (
                  <p className="text-gray-500 font-mono text-xs">No customer digital identity profiles submitted yet.</p>
                ) : (
                  <div className="space-y-4">
                    {kycProfiles.map((k) => (
                      <div key={k.id} className="p-5 rounded bg-[#111112] border border-white/[0.03] space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
                          <div>
                            <span className="text-gray-500 text-[10px] block">KYC PROFILE REFERENCE: {k.id}</span>
                            <h5 className="text-base font-serif text-white mt-1">{k.full_name}</h5>
                            <p className="text-gray-400 text-[10px]">Email: {k.email} | Phone: {k.phone} | WhatsApp: {k.whatsapp || "None"}</p>
                          </div>

                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                            k.status === "Verified" 
                              ? "bg-emerald-500/10 text-emerald-400"
                              : k.status === "Pending review"
                              ? "bg-amber-500/10 text-amber-400 animate-pulse"
                              : k.status === "More information required"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-red-500/10 text-red-400"
                          }`}>
                            {k.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                          <div className="space-y-1">
                            <p>Nationality: <strong className="text-white">{k.nationality}</strong></p>
                            <p>Country / City: <strong className="text-white">{k.country} ({k.city})</strong></p>
                            <p>Date of Birth: <strong className="text-white">{k.dob || "N/A"}</strong></p>
                          </div>
                          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.03] pt-2 sm:pt-0 sm:pl-4">
                            <p>Funds Declaration: <strong className="text-white italic">"{k.source_of_funds_declaration || "N/A"}"</strong></p>
                            <p>ID Type: <strong className="text-white">{k.documents?.[0]?.type || "N/A"}</strong></p>
                            <p>ID Number: <strong className="text-white font-bold">{k.documents?.[0]?.number || "N/A"}</strong></p>
                          </div>
                        </div>

                        {/* Document mock attachments */}
                        <div className="p-3 bg-black/40 rounded border border-white/[0.01] space-y-2">
                          <span className="text-[9px] text-gray-500 uppercase block font-semibold">Mock Secure Cryptographic Document Files</span>
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded flex items-center gap-1 select-none">
                              <FileCheck size={12} /> ID_FRONT_SECURE_ENCRYPTED.PNG (Verified Hash)
                            </span>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded flex items-center gap-1 select-none">
                              <FileCheck size={12} /> ID_BACK_SECURE_ENCRYPTED.PNG (Verified Hash)
                            </span>
                          </div>
                        </div>

                        {/* Actions to approve/reject */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => handleUpdateKycStatus(k.id, "Verified")}
                            className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase text-[10px] rounded hover:bg-emerald-500 hover:text-white cursor-pointer"
                          >
                            Approve & Verify Identity
                          </button>
                          <button
                            onClick={() => handleUpdateKycStatus(k.id, "More information required")}
                            className="px-3.5 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold uppercase text-[10px] rounded hover:bg-blue-500 hover:text-white cursor-pointer"
                          >
                            Request More Info
                          </button>
                          <button
                            onClick={() => handleUpdateKycStatus(k.id, "Rejected")}
                            className="px-3.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 font-semibold uppercase text-[10px] rounded hover:bg-red-500 hover:text-white cursor-pointer"
                          >
                            Reject & Hold Account
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. SECTION: IRAQ DELIVERY REQUESTS */}
            {!loading && activeSection === "iraq_delivery" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Iraq Safe Deliveries Logistics</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Authorize secure courier shipments, check customs documentation and track routes</p>
                </div>

                {iraqDeliveries.length === 0 ? (
                  <p className="text-gray-500 font-mono text-xs">No Iraq precious metals delivery requests found in ledger.</p>
                ) : (
                  <div className="space-y-4">
                    {iraqDeliveries.map((d) => (
                      <div key={d.id} className="p-5 rounded bg-[#111112] border border-white/[0.03] space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
                          <div>
                            <span className="text-gray-500 text-[9px] block">DELIVERY ID: {d.id}</span>
                            <span className="text-white font-bold block mt-0.5">Order ID Reference: {d.order_id}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            d.status?.includes("received") || d.status?.includes("Pending") ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            Status: {d.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                          <div>
                            <p>Target Governorate: <strong className="text-white">{d.governorate}</strong></p>
                            <p>Secure Destination Address: <strong className="text-white">{d.address_details}</strong></p>
                            <p>Recipient Contact: <strong className="text-white font-mono">{d.phone}</strong></p>
                          </div>
                          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.03] pt-2 sm:pt-0 sm:pl-4">
                            <span className="text-[10px] text-gray-500 block uppercase">Border Customs File Status</span>
                            <span className={`inline-block px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
                              d.customs_docs_status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                            }`}>
                              {d.customs_docs_status || "Pending review"}
                            </span>
                            <p className="text-[10px] text-gray-500 italic mt-1">Shipping metals to Iraq requires custom invoices, ID verification and destination approvals.</p>
                          </div>
                        </div>

                        {/* Delivery action buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleUpdateIraqDeliveryStatus(d.id, "Dispatched via Air Courier", "Approved")}
                            className="px-3 py-1.5 bg-[#c5a85c] text-black font-semibold uppercase text-[10px] rounded hover:bg-amber-600 cursor-pointer"
                          >
                            Approve Customs & Dispatch
                          </button>
                          <button
                            onClick={() => handleUpdateIraqDeliveryStatus(d.id, "Customs Hold / Documentation Requested", "Pending")}
                            className="px-3 py-1.5 bg-red-950/20 text-red-400 border border-red-900/30 font-semibold uppercase text-[10px] rounded hover:bg-red-900 hover:text-white cursor-pointer"
                          >
                            Flag Customs Hold
                          </button>
                          <button
                            onClick={() => handleUpdateIraqDeliveryStatus(d.id, "Delivered", "Approved")}
                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase text-[10px] rounded hover:bg-emerald-500 hover:text-white cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 8. SECTION: PICKUP POINTS */}
            {!loading && activeSection === "pickup_points" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Managed Pickup & Service Points</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Manage physical delivery centers in Baghdad, Basra, Erbil, and coming soon offices</p>
                </div>

                {/* Add pickup point form */}
                <form onSubmit={handleAddPickupPoint} className="p-5 bg-[#111112] rounded border border-white/[0.03] space-y-4 text-xs font-mono">
                  <h5 className="text-sm font-serif text-gold-base">Add New Regional Office / Partner Point</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">English Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Baghdad Al-Mansour Partner Desk"
                        value={newPickupPoint.name_en}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, name_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Arabic Name</label>
                      <input
                        type="text"
                        placeholder="مكتب شركاء المنصور في بغداد"
                        value={newPickupPoint.name_ar}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, name_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">City Name (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Baghdad"
                        value={newPickupPoint.city_en}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, city_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">City Name (Arabic)</label>
                      <input
                        type="text"
                        placeholder="بغداد"
                        value={newPickupPoint.city_ar}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, city_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Address (English)</label>
                      <input
                        type="text"
                        placeholder="Street 15, Near Baghdad Mall"
                        value={newPickupPoint.address_en}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, address_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Address (Arabic)</label>
                      <input
                        type="text"
                        placeholder="شارع ١٥، بالقرب من بغداد مول"
                        value={newPickupPoint.address_ar}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, address_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="+964..."
                        value={newPickupPoint.phone}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, phone: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">WhatsApp Hotline</label>
                      <input
                        type="text"
                        placeholder="964..."
                        value={newPickupPoint.whatsapp}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, whatsapp: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Center Status Badge</label>
                      <select
                        value={newPickupPoint.status}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, status: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      >
                        <option value="Partner Pickup Point">Partner Pickup Point</option>
                        <option value="Verified Service Point">Verified Service Point</option>
                        <option value="Coming Soon">Coming Soon</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Working Hours (English)</label>
                      <input
                        type="text"
                        placeholder="Sun - Thu: 10 AM - 4 PM"
                        value={newPickupPoint.working_hours_en}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, working_hours_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Working Hours (Arabic)</label>
                      <input
                        type="text"
                        placeholder="الأحد - الخميس: ١٠ صباحا - ٤ مساء"
                        value={newPickupPoint.working_hours_ar}
                        onChange={(e) => setNewPickupPoint({ ...newPickupPoint, working_hours_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    Add Service Point
                  </button>
                </form>

                {/* List point registries */}
                <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Currently Active Service points</span>
                  
                  {pickupPoints.length === 0 ? (
                    <p className="text-gray-500 italic text-xs font-mono">No active service points found in database. Showing defaults inside Baghdad/Basra warnings.</p>
                  ) : (
                    <div className="divide-y divide-white/[0.02]">
                      {pickupPoints.map((pt) => (
                        <div key={pt.id} className="py-3 flex justify-between items-center text-xs font-mono">
                          <div>
                            <span className="text-white font-serif text-sm block">{pt.name_en} ({pt.city_en})</span>
                            <span className="text-gray-500 text-[10px] block">{pt.address_en} | Phone: {pt.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gold-base/10 text-gold-base rounded text-[9px] uppercase tracking-wider">{pt.status}</span>
                            <button
                              onClick={() => handleDeletePickupPoint(pt.id)}
                              className="p-1.5 bg-red-950/20 text-red-400 border border-red-900/20 rounded hover:bg-red-900 hover:text-white cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 9. SECTION: MARKET PRICES & EXCHANGE RATES */}
            {!loading && activeSection === "market_prices" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">System Markups & Exchange Multipliers</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Adjust physical trading spreads, admin markups and regional currencies: AED / USD / IQD</p>
                </div>

                <form onSubmit={handleSavePricingConfig} className="p-5 bg-[#111112] rounded border border-white/[0.03] space-y-5 font-mono text-xs">
                  <h5 className="text-sm font-serif text-gold-base">Pricing Policy Matrix</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Gold markup input */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gold Markup (%)</span>
                        <span className="text-gold-light font-bold">{settings.gold_markup_pct}%</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.gold_markup_pct}
                        onChange={(e) => setSettings({ ...settings, gold_markup_pct: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>

                    {/* Silver markup input */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Silver Markup (%)</span>
                        <span className="text-gold-light font-bold">{settings.silver_markup_pct}%</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.silver_markup_pct}
                        onChange={(e) => setSettings({ ...settings, silver_markup_pct: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Spread input */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bid-Ask Spread Margin (USD)</span>
                        <span className="text-gold-light font-bold">${settings.spread_usd}</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.spread_usd}
                        onChange={(e) => setSettings({ ...settings, spread_usd: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>

                    {/* Premium commission input */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wholesale Premium Commission (%)</span>
                        <span className="text-gold-light font-bold">{settings.premium_markup_pct}%</span>
                      </div>
                      <input
                        type="number"
                        step="0.05"
                        value={settings.premium_markup_pct}
                        onChange={(e) => setSettings({ ...settings, premium_markup_pct: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <h5 className="text-sm font-serif text-gold-base pt-3 border-t border-white/[0.02]">Currency Multipliers against USD</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">USD (Base)</label>
                      <input
                        type="number"
                        value={exchangeRates.USD}
                        disabled
                        className="w-full bg-[#111] border border-white/5 rounded px-3 py-2 text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">UAE Dirham (AED)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={exchangeRates.AED}
                        onChange={(e) => setExchangeRates({ ...exchangeRates, AED: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Iraqi Dinar (IQD)</label>
                      <input
                        type="number"
                        step="1.0"
                        value={exchangeRates.IQD}
                        onChange={(e) => setExchangeRates({ ...exchangeRates, IQD: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    Sync Exchange Rates & Markup Models
                  </button>
                </form>
              </div>
            )}

            {/* 10. SECTION: BUYBACK */}
            {!loading && activeSection === "buyback" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Client Liquidation & Buyback Requests</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Calculate payouts based on dynamic gold/silver spot rates and authorize cash/bank transfers</p>
                </div>

                {buybacks.length === 0 ? (
                  <p className="text-gray-500 font-mono text-xs">No bullion liquidation requests registered.</p>
                ) : (
                  <div className="space-y-4">
                    {buybacks.map((b) => (
                      <div key={b.id} className="p-5 rounded bg-[#111112] border border-white/[0.03] space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-start border-b border-white/[0.02] pb-2">
                          <div>
                            <span className="text-gold-base font-bold">{b.id}</span>
                            <span className="text-gray-500 block text-[9px]">RECEIVED: {b.created_at}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            b.status === "Pending" ? "bg-amber-500/10 text-amber-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                          <div>
                            <p>Investor Client: <strong className="text-white">{b.customer_id}</strong></p>
                            <p>Metal Asset Type: <strong className="text-white uppercase">{b.metal}</strong></p>
                            <p>Weight Liquidated: <strong className="text-white">{b.weight_grams} Grams</strong></p>
                            <p>Purity Grade: <strong className="text-white">{b.purity || "999.9"}</strong></p>
                          </div>
                          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.03] pt-2 sm:pt-0 sm:pl-4">
                            <span className="text-[10px] text-gray-500 block uppercase">Estimated Payout</span>
                            <span className="text-lg text-white font-serif font-bold">
                              ${b.estimated_payout_usd?.toLocaleString()} USD
                            </span>
                            <p className="text-[10px] text-gray-500 block">Converted equivalent: {(b.estimated_payout_usd * (b.exchange_rate_iqd || 1310.0)).toLocaleString()} IQD</p>
                          </div>
                        </div>

                        {b.status === "Pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateBuybackStatus(b.id, "Approved", b.estimated_payout_usd)}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase text-[10px] rounded hover:bg-emerald-500 hover:text-white cursor-pointer"
                            >
                              Approve & Payout
                            </button>
                            <button
                              onClick={() => handleUpdateBuybackStatus(b.id, "Rejected")}
                              className="px-3 py-1.5 bg-red-950/20 text-red-400 border border-red-900/30 font-semibold uppercase text-[10px] rounded hover:bg-red-900 hover:text-white cursor-pointer"
                            >
                              Reject Liquidation
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 11. SECTION: HOLDING REQUESTS */}
            {!loading && activeSection === "holding" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Precious Metals Holding Requests</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Authorize secure vaults allocation and generate compliant holding receipts</p>
                </div>

                <div className="space-y-4">
                  {holdings.map((h) => (
                    <div key={h.id} className="p-5 rounded bg-[#111112] border border-white/[0.03] space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-start border-b border-white/[0.02] pb-2">
                        <div>
                          <span className="text-gold-base font-bold">{h.id}</span>
                          <span className="text-gray-500 block text-[9px]">Owner Reference: {h.customer_id}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                          h.status?.includes("Approved") ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                        }`}>
                          {h.status || "Storage Requested"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                        <div>
                          <p>Allocated Metal: <strong className="text-white uppercase">{h.metal}</strong></p>
                          <p>Storage Weight: <strong className="text-white">{h.weight_grams} Grams</strong></p>
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l border-white/[0.03] pt-2 sm:pt-0 sm:pl-4">
                          <p>Purchase Cost: <strong className="text-white">${h.total_purchase_amount_usd?.toLocaleString()} USD</strong></p>
                          <p>Current Market Valuation: <strong className="text-gold-light">${h.current_market_value_usd?.toLocaleString()} USD</strong></p>
                        </div>
                      </div>

                      {!h.status?.includes("Approved") && (
                        <button
                          onClick={() => handleApproveHolding(h.id)}
                          className="px-3 py-1.5 bg-[#c5a85c] text-black font-semibold uppercase text-[10px] rounded hover:bg-amber-600 cursor-pointer"
                        >
                          Approve Storage Allocation
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12. SECTION: CERTIFICATES */}
            {!loading && activeSection === "certificates" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Bullion Mint Assay Certificates</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Mint unique security serial keys and verify metal grades in our vaults</p>
                </div>

                <form onSubmit={handleAddCertificate} className="p-5 bg-[#111112] rounded border border-white/[0.03] space-y-4 text-xs font-mono">
                  <h5 className="text-sm font-serif text-gold-base">Mint New Assay Security Certificate</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Assay Serial Number</label>
                      <input
                        type="text"
                        placeholder="e.g. PAMP-99201"
                        value={newCertificate.serial_number}
                        onChange={(e) => setNewCertificate({ ...newCertificate, serial_number: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Product Name</label>
                      <input
                        type="text"
                        placeholder="PAMP Suisse 100g Cast Gold Bar"
                        value={newCertificate.product_name}
                        onChange={(e) => setNewCertificate({ ...newCertificate, product_name: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Total Weight</label>
                      <input
                        type="text"
                        placeholder="100 Grams"
                        value={newCertificate.weight}
                        onChange={(e) => setNewCertificate({ ...newCertificate, weight: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Purity Grade</label>
                      <input
                        type="text"
                        placeholder="999.9 Fine Gold"
                        value={newCertificate.purity}
                        onChange={(e) => setNewCertificate({ ...newCertificate, purity: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Refiner / Manufacturer</label>
                      <input
                        type="text"
                        placeholder="PAMP Suisse"
                        value={newCertificate.manufacturer}
                        onChange={(e) => setNewCertificate({ ...newCertificate, manufacturer: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Mint Date</label>
                      <input
                        type="date"
                        value={newCertificate.issue_date}
                        onChange={(e) => setNewCertificate({ ...newCertificate, issue_date: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Assay Verification Status</label>
                      <select
                        value={newCertificate.status}
                        onChange={(e) => setNewCertificate({ ...newCertificate, status: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      >
                        <option value="Active / Verified">Active / Verified</option>
                        <option value="Awaiting Physical Inspect">Awaiting Physical Inspect</option>
                        <option value="Liquidated">Liquidated / Removed</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    Mint New Assay Certificate
                  </button>
                </form>

                {/* List certificates */}
                <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Currently Registered Certificates ({certificates.length})</span>
                  <div className="divide-y divide-white/[0.02]">
                    {certificates.map((cert) => (
                      <div key={cert.serial_number} className="py-3 flex justify-between items-center text-xs font-mono">
                        <div>
                          <span className="text-white font-bold block">{cert.serial_number} - {cert.product_name}</span>
                          <span className="text-gray-500 text-[10px] block">Manufacturer: {cert.manufacturer} / Grade: {cert.purity} / Issue Date: {cert.issue_date}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] uppercase tracking-wider font-bold">{cert.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 13. SECTION: INVOICES */}
            {!loading && activeSection === "invoices" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Client Financial Invoices</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">View and generate legal billing files for tax and customs declaration</p>
                </div>

                <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Generated Billing List</span>
                  
                  {invoices.length === 0 ? (
                    <p className="text-gray-500 italic text-xs">No active invoice billing entries found.</p>
                  ) : (
                    <div className="divide-y divide-white/[0.02] text-xs font-mono">
                      {invoices.map((inv) => (
                        <div key={inv.id} className="py-3 flex justify-between items-center">
                          <div>
                            <span className="text-white font-bold block">{inv.id}</span>
                            <span className="text-gray-500 text-[10px] block">Client: {inv.customer_name} / Date: {inv.date} / Order: {inv.order_id}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[#c5a85c] font-bold">{inv.total?.toLocaleString()} {inv.currency}</span>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] uppercase tracking-wider font-bold">{inv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 14. SECTION: BLOG */}
            {!loading && activeSection === "blog" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">Intelligence Blog & Market Reports (CMS)</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Write global precious metals insights and post in English & Arabic feeds</p>
                </div>

                <form onSubmit={handleAddBlogPost} className="p-5 bg-[#111112] rounded border border-white/[0.03] space-y-4 text-xs font-mono">
                  <h5 className="text-sm font-serif text-gold-base">Publish Custom Market Analysis</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Report Slug URL</label>
                      <input
                        type="text"
                        placeholder="dubai-silver-skyrockets"
                        value={newBlogPost.slug}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, slug: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Category Topic</label>
                      <input
                        type="text"
                        value={newBlogPost.category}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, category: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Author Signature</label>
                      <input
                        type="text"
                        value={newBlogPost.author}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, author: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">English Heading</label>
                      <input
                        type="text"
                        placeholder="Gold Price Surge in UAE and Iraq Markets"
                        value={newBlogPost.title_en}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, title_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Arabic Heading</label>
                      <input
                        type="text"
                        placeholder="ارتفاع أسعار الذهب في أسواق الإمارات والعراق"
                        value={newBlogPost.title_ar}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, title_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">English Content Analysis</label>
                      <textarea
                        rows={4}
                        placeholder="Provide deep research gold/silver analysis..."
                        value={newBlogPost.content_en}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, content_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Arabic Content Analysis</label>
                      <textarea
                        rows={4}
                        placeholder="أدخل محتوى التحليل والبحث هنا..."
                        value={newBlogPost.content_ar}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, content_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    Publish Report
                  </button>
                </form>

                {/* List reports */}
                <div className="bg-[#111112] p-5 rounded border border-white/[0.03] space-y-4">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Published Intelligence Feeds ({blogPosts.length})</span>
                  <div className="divide-y divide-white/[0.02] text-xs font-mono">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="text-white font-bold">{post.title_en}</span>
                          <span className="text-gray-500 text-[10px] block">Slug: {post.slug} | Date: {post.published_at}</span>
                        </div>
                        <span className="text-gold-base bg-gold-base/10 px-2 py-0.5 rounded text-[9px] font-bold">{post.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 15. SECTION: SETTINGS */}
            {!loading && activeSection === "settings" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-serif text-white">System Global Configuration</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase">Configure desk hotlines, DMCC registrations, emails and corporate office directories</p>
                </div>

                <form onSubmit={handleSavePricingConfig} className="p-5 bg-[#111112] rounded border border-white/[0.03] space-y-4 text-xs font-mono">
                  <h5 className="text-sm font-serif text-gold-base">Corporate Support Directories</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">WhatsApp Hotline (No Spacing)</label>
                      <input
                        type="text"
                        value={settings.whatsapp_hotline}
                        onChange={(e) => setSettings({ ...settings, whatsapp_hotline: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Official Trading Desk Email</label>
                      <input
                        type="text"
                        value={settings.desk_email}
                        onChange={(e) => setSettings({ ...settings, desk_email: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Desk Direct Telephone Line</label>
                      <input
                        type="text"
                        value={settings.trade_phone}
                        onChange={(e) => setSettings({ ...settings, trade_phone: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Office Address English</label>
                      <textarea
                        rows={2}
                        value={settings.office_address_en}
                        onChange={(e) => setSettings({ ...settings, office_address_en: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">Office Address Arabic</label>
                      <textarea
                        rows={2}
                        value={settings.office_address_ar}
                        onChange={(e) => setSettings({ ...settings, office_address_ar: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.02]">
                    <div className="space-y-1">
                      <label className="text-gray-500 block uppercase text-[9px]">DMCC Registered License No.</label>
                      <input
                        type="text"
                        value={settings.dmcc_reg_no}
                        onChange={(e) => setSettings({ ...settings, dmcc_reg_no: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    Sync Global Setup parameters
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

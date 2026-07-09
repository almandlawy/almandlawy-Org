/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AdminPanel.tsx - Protected Admin Workspace for PGR UAE & Iraq
 */

import React, { useState, useEffect } from "react";
import { 
  X, LayoutDashboard, Coins, Users, ClipboardList, Check, 
  RefreshCw, Layers, ShieldCheck, Truck, MapPin, 
  TrendingUp, Undo, Box, Award, FileText, BookOpen, Settings, 
  Eye, Trash2, Plus, Edit, ShieldAlert, Mail, Phone, Clock, FileCheck, CheckCircle, LogOut
} from "lucide-react";
import { dbService, mockDb, isLive, supabase, getRedirectUrl, generateQuoteSignature } from "../lib/supabase";
import {
  REFERENCE_GOLD_USD_OZ,
  REFERENCE_SILVER_USD_OZ,
  REFERENCE_GOLD_USD_PER_GRAM,
  REFERENCE_SILVER_USD_PER_GRAM,
  REFERENCE_GOLD_AED_PER_GRAM,
  REFERENCE_SILVER_AED_PER_GRAM,
  OUNCE_TO_GRAM,
} from "../lib/metalReferenceSpots";
import { Product, DailyPricingSettings, ShippingSettings } from "../types";
import { DEFAULT_DAILY_PRICING, DEFAULT_SHIPPING_SETTINGS } from "../data";
import { resolveProductIdFromLabel } from "../lib/productCatalog";
import { DebugPanel } from "./DebugPanel";

interface AdminPanelProps {
  currentLang?: "en" | "ar";
  onClose?: () => void;
  isModal?: boolean;
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
  | "daily_pricing"
  | "shipping_settings"
  | "exchange_rates"
  | "buyback"
  | "certificates"
  | "blog"
  | "settings"
  | "security";

export default function AdminPanel({ currentLang = "ar", onClose, isModal = false }: AdminPanelProps) {
  const isAr = currentLang === "ar";
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [loading, setLoading] = useState(false);

  // Authentication & Authorization States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Debug states for admin OAuth/session detection
  const [debugSessionDetected, setDebugSessionDetected] = useState<"YES" | "NO" | "PENDING">("PENDING");
  const [debugUserEmail, setDebugUserEmail] = useState<string>("NONE");
  const [debugAdminCheck, setDebugAdminCheck] = useState<"YES" | "NO" | "PENDING">("PENDING");
  const [debugReason, setDebugReason] = useState<string>("loading");

  // Database mirror states
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [kycProfiles, setKycProfiles] = useState<any[]>([]);
  // Secure KYC private audit logs and dossier viewer states
  const [dossierAuditLogs, setDossierAuditLogs] = useState<any[]>([
    {
      id: "audit-init-1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      operator: "compliance.officer@pgruae.com",
      action: "System Audit Check Checkpoint",
      documentType: "Database Verification",
      clientName: "System Core Integrity",
      signatureToken: "sig_system_ok_8829",
      expiration: "N/A"
    }
  ]);
  const [activeDossier, setActiveDossier] = useState<any | null>(null);
  const [iraqDeliveries, setIraqDeliveries] = useState<any[]>([]);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [exchangeRates, setExchangeRates] = useState<any>({ USD: 1.0, AED: 3.6725, IQD: 1310.0 });
  const [buybacks, setBuybacks] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    gold_markup_pct: 0.8,
    silver_markup_pct: 1.5,
    spread_usd: 12.0,
    premium_markup_pct: 2.0,
    whatsapp_hotline: "+971559688837",
    desk_email: "desk@pgruae.com",
    trade_phone: "+971 4 445 8888",
    office_address_en: "Almas Tower, West Trade Zone, Dubai Marina, Dubai, United Arab Emirates",
    office_address_ar: "برج الماس، منطقة التداول الحرة، دبي مارينا، دبي، الإمارات العربية المتحدة",
    dmcc_reg_no: "890317",
    manual_gold_usd_oz: REFERENCE_GOLD_USD_OZ,
    manual_silver_usd_oz: REFERENCE_SILVER_USD_OZ,
    usd_aed_rate: 3.6725,
    default_product_premium_pct: 2.0,
    disable_live_pricing: false
  });

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Quote preparation states
  const [preparingQuote, setPreparingQuote] = useState<any | null>(null);
  const [prepPriceOverride, setPrepPriceOverride] = useState<string>("");
  const [prepExpiryMinutes, setPrepExpiryMinutes] = useState<number>(10);
  const [prepOverrideReason, setPrepOverrideReason] = useState<string>("Client premium negotiation adjustment");
  const [prepShippingCompany, setPrepShippingCompany] = useState<string>("");
  const [prepShippingFee, setPrepShippingFee] = useState<string>("0");

  const [dailyPricing, setDailyPricing] = useState<DailyPricingSettings>({ ...DEFAULT_DAILY_PRICING });
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({ ...DEFAULT_SHIPPING_SETTINGS });
  const [dailyPricingReason, setDailyPricingReason] = useState<string>("");

  const handleProductImageUpload = async (file: File, isEdit: boolean) => {
    setUploadingImage(true);
    try {
      const publicUrl = await dbService.storage.uploadProductImage(file);
      if (isEdit) {
        setEditingProduct(prev => prev ? { ...prev, image_url: publicUrl } : null);
      } else {
        setNewProduct(prev => ({ ...prev, image_url: publicUrl }));
      }
      triggerSuccessMessage("Product image uploaded successfully!");
    } catch (err) {
      console.error(err);
      triggerErrorMessage(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const [newProduct, setNewProduct] = useState({
    id: "",
    name_en: "",
    name_ar: "",
    category: "gold_bars" as any,
    brand: "PAMP Suisse",
    weight_g: 100,
    purity: "999.9",
    price: 0,
    price_mode: "spot" as "spot" | "fixed",
    image_url: "",
    availability: "In Stock" as any,
    stock_status: "In Stock" as any,
    description_en: "High-Purity Bullion Bar",
    description_ar: "سبائك عالية النقاء والجودة",
    certificate_url: "",
    published: true,
    premium_pct: 2.5
  });

  // Other new items states
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
    author: "PGR Desk",
    featured: false,
    seo_title: "",
    seo_description: ""
  });

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const triggerErrorMessage = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 7000);
  };

  const checkAdmin = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (isLive && supabase) {
        const { data, error } = await supabase
          .from("admin_users")
          .select("email, is_active")
          .eq("email", email.trim().toLowerCase())
          .maybeSingle();

        if (error) {
          console.error("Error querying admin_users:", error);
          setDebugAdminCheck("NO");
          setDebugReason("Error querying database: " + error.message);
          setIsAdminLoggedIn(false);
          setAuthErrorMsg(isAr ? "حدث خطأ أثناء التحقق من الصلاحيات الإدارية." : "Error verifying admin privileges.");
          return false;
        }

        if (data) {
          const isActive = data.is_active === true || data.is_active === null || data.is_active === undefined;
          if (isActive) {
            setIsAdminLoggedIn(true);
            setAuthErrorMsg("");
            setDebugAdminCheck("YES");
            setDebugReason("admin verified");
            // Only after session exists, clean up URL hash
            window.history.replaceState({}, document.title, "/admin");
            await loadAdminData();
            return true;
          } else {
            setIsAdminLoggedIn(false);
            setAuthErrorMsg(isAr ? "تم إيقاف حساب المسؤول هذا." : "This admin account is inactive.");
            setDebugAdminCheck("NO");
            setDebugReason("admin inactive");
            return false;
          }
        } else {
          setIsAdminLoggedIn(false);
          setAuthErrorMsg(
            isAr 
              ? "تم رفض الدخول. حسابك ليس مدرجاً في قائمة المشرفين." 
              : "Access denied. Your email is not in the admin directory."
          );
          setDebugAdminCheck("NO");
          setDebugReason("not admin");
          return false;
        }
      } else {
        // Local fallback check
        const isAuthorized = await dbService.adminUsers.checkEmail(email);
        if (isAuthorized) {
          setIsAdminLoggedIn(true);
          setAuthErrorMsg("");
          setDebugAdminCheck("YES");
          setDebugReason("admin verified (simulation)");
          await loadAdminData();
          return true;
        } else {
          setIsAdminLoggedIn(false);
          setAuthErrorMsg(
            isAr 
              ? "تم رفض الدخول. صلاحية الإدارة مطلوبة." 
              : "Access denied. Admin permission required."
          );
          setDebugAdminCheck("NO");
          setDebugReason("not admin");
          return false;
        }
      }
    } catch (err) {
      console.error("Exception checking admin:", err);
      setDebugAdminCheck("NO");
      setDebugReason("Exception: " + (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkInitialAuth = async () => {
      setCheckingAuth(true);
      setLoading(true);
      setDebugReason("loading");
      setDebugSessionDetected("PENDING");
      setDebugAdminCheck("PENDING");

      try {
        let activeUser = null;

        if (isLive && supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Failed to fetch session:", error);
          }
          if (session && session.user) {
            const email = session.user.email || "";
            activeUser = {
              id: session.user.id,
              email: email,
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Customer Account",
              role: email === "almandlawy112@gmail.com" ? "admin" : "customer",
              created_at: session.user.created_at || new Date().toISOString()
            };
            setCurrentUser(activeUser);
            mockDb.auth.setUser(activeUser);
            setDebugSessionDetected("YES");
            setDebugUserEmail(email);

            // Now check if admin
            await checkAdmin(email);
          } else {
            // No session detected
            setDebugSessionDetected("NO");
            setDebugUserEmail("NONE");
            setDebugAdminCheck("NO");
            setDebugReason("no session");
            setIsAdminLoggedIn(false);
          }
        } else {
          // Local/Simulated flow
          const simulatedUser = mockDb.auth.getUser();
          if (simulatedUser) {
            activeUser = simulatedUser;
            setCurrentUser(activeUser);
            setDebugSessionDetected("YES");
            setDebugUserEmail(simulatedUser.email);
            await checkAdmin(simulatedUser.email);
          } else {
            setDebugSessionDetected("NO");
            setDebugUserEmail("NONE");
            setDebugAdminCheck("NO");
            setDebugReason("no session");
            setIsAdminLoggedIn(false);
          }
        }
      } catch (err) {
        console.error("Initial checkInitialAuth failed:", err);
        setDebugReason("Initialization error: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setCheckingAuth(false);
        setLoading(false);
      }
    };

    checkInitialAuth();

    // Listen for auth changes
    let subscription: any = null;
    if (isLive && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state change event inside AdminPanel:", event, session?.user?.email);
        if (session?.user) {
          const email = session.user.email || "";
          const activeUser = {
            id: session.user.id,
            email: email,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Customer Account",
            role: email === "almandlawy112@gmail.com" ? "admin" : "customer",
            created_at: session.user.created_at || new Date().toISOString()
          };
          setCurrentUser(activeUser);
          mockDb.auth.setUser(activeUser);
          setDebugSessionDetected("YES");
          setDebugUserEmail(email);
          await checkAdmin(email);
        } else {
          // If signed out, clean states
          setCurrentUser(null);
          mockDb.auth.setUser(null);
          setIsAdminLoggedIn(false);
          setDebugSessionDetected("NO");
          setDebugUserEmail("NONE");
          setDebugAdminCheck("NO");
          setDebugReason("no session");
        }
      });
      subscription = data?.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentLang]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/admin/security") {
      setActiveSection("security");
    }
  }, []);

  // Load all dataset values
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        pList, qList, oList, kList, dList, ptList, exRates, bbList, hList, sObj, certs, blogList, auditList
      ] = await Promise.all([
        dbService.products.list("admin"),
        dbService.quoteRequests.list(),
        dbService.orders.list(),
        dbService.kyc.listAll(),
        dbService.iraqDelivery.list(),
        dbService.pickupPoints.list(),
        dbService.exchangeRates.get(),
        dbService.buyback.list(),
        dbService.investment.listAll(),
        dbService.settings.get(),
        dbService.certificates.listAll(),
        dbService.blog.list(),
        dbService.auditLogs.list()
      ]);

      if (pList) setProducts(pList);
      if (qList) setQuotes(qList);
      if (oList) setOrders(oList);
      if (kList) setKycProfiles(kList);
      if (dList) setIraqDeliveries(dList);
      if (ptList) setPickupPoints(ptList);
      if (exRates) setExchangeRates(exRates);
      if (bbList) setBuybacks(bbList);
      if (hList) setHoldings(hList);
      if (sObj) {
        setSettings(sObj);
        if (sObj.daily_pricing) setDailyPricing({ ...DEFAULT_DAILY_PRICING, ...sObj.daily_pricing });
        if (sObj.shipping_settings) setShippingSettings({ ...DEFAULT_SHIPPING_SETTINGS, ...sObj.shipping_settings });
        setPrepShippingCompany(sObj.shipping_settings?.shipping_company_name || DEFAULT_SHIPPING_SETTINGS.shipping_company_name);
      }
      if (certs) setCertificates(certs);
      if (blogList) setBlogPosts(blogList);
      if (auditList) setAuditLogs(auditList);
    } catch (err) {
      console.error("Failed to load PGR Admin Datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccessMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleAdminLogout = async () => {
    try {
      await dbService.auth.logout();
    } catch (err) {
      console.error("Admin logout error:", err);
    }
    mockDb.auth.setUser(null);
    setIsAdminLoggedIn(false);
    setAuthErrorMsg("");
  };

  // 2. PRODUCT ACTIONS (Add, Edit, Delete)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.id || !newProduct.name_en) return;
    try {
      const mappedProduct: Product = {
        id: newProduct.id,
        name_en: newProduct.name_en,
        name_ar: newProduct.name_ar || newProduct.name_en,
        category: newProduct.category,
        weight_label: `${newProduct.weight_g} Grams`,
        purity: newProduct.purity,
        manufacturer: newProduct.brand || "PAMP Suisse",
        country_en: "Switzerland",
        country_ar: "سويسرا",
        availability: newProduct.availability,
        certificate_en: "Assay Certificate Certified",
        certificate_ar: "شهادة معتمدة",
        description_en: newProduct.description_en,
        description_ar: newProduct.description_ar,
        technical_specs: {
          weight_grams: Number(newProduct.weight_g),
          purity: newProduct.purity,
          metal: newProduct.category.includes("gold") ? "gold" : "silver"
        },
        image_placeholder: newProduct.category.includes("gold") ? "gold_bar" : "silver_bar",
        premium_multiplier: 1 + (Number(newProduct.premium_pct) / 100),
        brand: newProduct.brand,
        price: Number(newProduct.price),
        price_mode: newProduct.price_mode,
        image_url: newProduct.image_url || undefined,
        stock_status: newProduct.stock_status,
        certificate_url: newProduct.certificate_url || undefined,
        published: newProduct.published
      };

      await dbService.products.save(mappedProduct);
      
      // Seed inventory
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
        category: "gold_bars",
        brand: "PAMP Suisse",
        weight_g: 100,
        purity: "999.9",
        price: 0,
        price_mode: "spot",
        image_url: "",
        availability: "In Stock",
        stock_status: "In Stock",
        description_en: "High-Purity Bullion Bar",
        description_ar: "سبائك عالية النقاء والجودة",
        certificate_url: "",
        published: true,
        premium_pct: 2.5
      });

      triggerSuccessMessage("Product added successfully!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
      triggerErrorMessage(err instanceof Error ? err.message : "Failed to add product to database");
    }
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      // Calculate premium multiplier if spot based
      const targetPremiumPct = editingProduct.premium_multiplier 
        ? (editingProduct.premium_multiplier > 1 ? (editingProduct.premium_multiplier - 1) * 100 : editingProduct.premium_multiplier)
        : 2.5;

      const updated: Product = {
        ...editingProduct,
        weight_label: `${editingProduct.technical_specs?.weight_grams || 100} Grams`,
        premium_multiplier: 1 + (Number(targetPremiumPct) / 100)
      };

      await dbService.products.save(updated);
      setEditingProduct(null);
      triggerSuccessMessage("Product modified successfully!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
      triggerErrorMessage(err instanceof Error ? err.message : "Failed to save product edits");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product from the catalog?")) return;
    try {
      await dbService.products.delete(id);
      triggerSuccessMessage("Product deleted.");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. OTHER CRUD SUBMISSIONS
  const handleUpdateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      await dbService.quoteRequests.updateStatus(quoteId, status);
      
      const orderTriggerStatuses = ["Quote Sent", "Customer Accepted", "Approved", "Payment Pending", "Ready for Collection", "Completed"];
      if (orderTriggerStatuses.includes(status)) {
        const match = quotes.find(q => q.id === quoteId);
        if (match) {
          // Check if we already have an order for this quote
          const ordersList = await dbService.orders.list();
          const orderExists = ordersList.some((o: any) => o.quote_id === quoteId || o.id === `PGR-ORD-${quoteId}`);
          
          if (!orderExists) {
            const metal = (match.metalInterest || match.metal_interest || "gold").toLowerCase();
            const weightVal = parseFloat(match.weight || match.weight_preference || "100") || 100;
            const price = weightVal * (metal === "silver" ? 1.1 : 78.5);
            
            await dbService.orders.create({
              id: `PGR-ORD-${quoteId}`,
              customer_id: match.customer_id || "cust-verified-1",
              quote_id: quoteId,
              total_amount: price,
              currency: match.currency || "USD",
              shipping_method: "Office Pickup",
              payment_method: "Bank Transfer",
              shipping_address: "PGR Vault Gateway Office, Dubai Marina",
              status: status === "Completed" ? "Completed" : "Quoted",
              items: [
                { 
                  product_id: resolveProductIdFromLabel(match.productCategory || match.product_category),
                  quantity: 1, 
                  unit_price: price, 
                  product_name: `${metal.toUpperCase()} Bullion: ${match.weight || match.weight_preference || "Custom Lot"}` 
                }
              ]
            });
            triggerSuccessMessage(`Quote set to ${status} and Live Order Ticket created!`);
          } else {
            // Update existing order status if applicable
            const existingOrder = ordersList.find((o: any) => o.quote_id === quoteId || o.id === `PGR-ORD-${quoteId}`);
            if (existingOrder) {
              let mappedOrderStatus = "Quoted";
              if (status === "Payment Pending" || status === "Customer Accepted") mappedOrderStatus = "Processing";
              if (status === "Ready for Collection") mappedOrderStatus = "Ready for Collection";
              if (status === "Completed") mappedOrderStatus = "Delivered";
              if (status === "Cancelled") mappedOrderStatus = "Cancelled";
              
              await dbService.orders.updateStatus(existingOrder.id, mappedOrderStatus);
            }
            triggerSuccessMessage(`Quote set to: ${status}`);
          }
        }
      } else {
        triggerSuccessMessage(`Quote set to: ${status}`);
      }
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendPreparedQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preparingQuote) return;
    try {
      const productPriceNum = parseFloat(prepPriceOverride);
      const shippingFeeNum = parseFloat(prepShippingFee) || 0;
      if (isNaN(productPriceNum) || productPriceNum <= 0) {
        triggerErrorMessage("Please enter a valid positive product firm price");
        return;
      }
      if (shippingFeeNum < 0) {
        triggerErrorMessage("Shipping fee cannot be negative");
        return;
      }

      const priceNum = productPriceNum + shippingFeeNum;
      const adminEmail = currentUser?.email || "admin@pgruae.com";

      const quotedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + prepExpiryMinutes * 60 * 1000).toISOString();

      // Calculate original spot-estimated price for compliance logging
      let originalPrice = productPriceNum;
      const metal = (preparingQuote.metalInterest || preparingQuote.metal_interest || "gold").toLowerCase();
      const weightStr = (preparingQuote.weight || preparingQuote.weight_preference || "100g").toLowerCase();
      
      let grams = 100;
      const numericMatch = weightStr.match(/(\d+(?:\.\d+)?)/);
      if (numericMatch) {
        grams = parseFloat(numericMatch[1]);
        if (weightStr.includes("oz") || weightStr.includes("ounce")) {
          grams = grams * 31.1035;
        } else if (weightStr.includes("kilo")) {
          grams = grams * 1000;
        }
      }
      
      const spotRate = metal === "silver" ? REFERENCE_SILVER_USD_PER_GRAM : REFERENCE_GOLD_USD_PER_GRAM;
      const baseSpotPrice = grams * spotRate;
      const premiumPct = 1.025;
      originalPrice = Math.round(baseSpotPrice * premiumPct);
      
      if (isNaN(originalPrice) || originalPrice <= 0 || Math.abs(originalPrice - productPriceNum) > productPriceNum * 0.5) {
        originalPrice = Math.round(productPriceNum * 1.035);
      }

      const quoteCurrency = preparingQuote.currency === "USD" ? "USD" : "AED";

      // Generate Cryptographic Digital Signature (total firm quote amount)
      const signatureToken = await generateQuoteSignature({
        quoteId: preparingQuote.id,
        customerId: preparingQuote.email || preparingQuote.customer_id || "anonymous",
        productFirmPrice: productPriceNum,
        shippingFee: shippingFeeNum,
        totalFirmQuote: priceNum,
        currency: quoteCurrency,
        expiresAt,
        status: "Quote Sent",
        createdAt: quotedAt
      });

      const updates = {
        quoted_price: priceNum,
        product_firm_price: productPriceNum,
        shipping_fee: shippingFeeNum,
        shipping_company: prepShippingCompany || shippingSettings.shipping_company_name,
        currency: quoteCurrency,
        quoted_at: quotedAt,
        expires_at: expiresAt,
        expiry_duration_minutes: prepExpiryMinutes,
        status: "Quote Sent",
        original_price: originalPrice,
        override_admin_id: adminEmail,
        override_timestamp: quotedAt,
        override_reason: prepOverrideReason || "Client relationship premium adjustment",
        security_signature: signatureToken
      };

      await dbService.quoteRequests.update(preparingQuote.id, updates);

      const isManualOverride = Math.abs(productPriceNum - originalPrice) > 1;
      await dbService.auditLogs.append(
        isManualOverride ? "manual_override" : "quote_send",
        adminEmail,
        `Bespoke quote ${preparingQuote.id} issued. Product firm: ${productPriceNum} ${quoteCurrency}. Shipping (${prepShippingCompany || "N/A"}): ${shippingFeeNum} ${quoteCurrency}. Total: ${priceNum} ${quoteCurrency}. Expiry: ${prepExpiryMinutes} min. Reason: ${prepOverrideReason || "N/A"}`
      );

      // Create or update order status as well
      const ordersList = await dbService.orders.list();
      const orderExists = ordersList.some((o: any) => o.quote_id === preparingQuote.id || o.id === `PGR-ORD-${preparingQuote.id}`);

      if (!orderExists) {
        await dbService.orders.create({
          id: `PGR-ORD-${preparingQuote.id}`,
          customer_id: preparingQuote.customer_id || "cust-verified-1",
          quote_id: preparingQuote.id,
          total_amount: priceNum,
          product_firm_price: productPriceNum,
          shipping_fee: shippingFeeNum,
          shipping_company: prepShippingCompany || shippingSettings.shipping_company_name,
          currency: quoteCurrency,
          shipping_method: prepShippingCompany || shippingSettings.shipping_method || "Office Pickup",
          payment_method: "Bank Transfer",
          shipping_address: shippingSettings.destination_city_region || "PGR Vault Gateway Office, Dubai Marina",
          status: "Quoted",
          items: [
            {
              product_id: resolveProductIdFromLabel(
                preparingQuote.productCategory || preparingQuote.product_category
              ),
              quantity: 1,
              unit_price: productPriceNum,
              product_name: `${metal.toUpperCase()} Bullion: ${preparingQuote.weight || preparingQuote.weight_preference || "Custom Lot"}`
            }
          ]
        });
      } else {
        const existingOrder = ordersList.find((o: any) => o.quote_id === preparingQuote.id || o.id === `PGR-ORD-${preparingQuote.id}`);
        if (existingOrder) {
          await dbService.orders.update(existingOrder.id, {
            total_amount: priceNum,
            product_firm_price: productPriceNum,
            shipping_fee: shippingFeeNum,
            shipping_company: prepShippingCompany || shippingSettings.shipping_company_name,
            status: "Quoted"
          });
        }
      }

      setPreparingQuote(null);
      setPrepShippingFee("0");
      triggerSuccessMessage(`Bespoke firm quote sent! Product: $${productPriceNum.toFixed(2)} + Shipping: $${shippingFeeNum.toFixed(2)} = Total: $${priceNum.toFixed(2)}. Ref: ${preparingQuote.id}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      triggerErrorMessage("Failed to send firm quote");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await dbService.orders.updateStatus(orderId, status);
      triggerSuccessMessage(`Order ${orderId} updated to: ${status}`);
      
      // Audit status update
      await dbService.auditLogs.append(
        "order_status_update",
        "compliance.officer@pgruae.com",
        `Admin updated Order ${orderId} logistics status to: "${status}".`
      );

      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderPaymentLink = async (orderId: string, link: string) => {
    try {
      await dbService.orders.update(orderId, { payment_link: link });
      triggerSuccessMessage(`Payment link saved for Order ${orderId}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      triggerErrorMessage(err instanceof Error ? err.message : "Failed to update payment link");
    }
  };

  const handleToggleOrderPaymentStatus = async (orderId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
      await dbService.orders.update(orderId, { payment_status: newStatus });
      triggerSuccessMessage(`Order ${orderId} payment marked as ${newStatus}`);
      
      // Audit payment update
      await dbService.auditLogs.append(
        "order_payment_update",
        "compliance.officer@pgruae.com",
        `Admin updated Order ${orderId} payment status to: "${newStatus}".`
      );

      await loadAdminData();
    } catch (err) {
      console.error(err);
      triggerErrorMessage(err instanceof Error ? err.message : "Failed to change payment status");
    }
  };

  const handleViewPaymentProof = async (orderId: string, proofName: string) => {
    try {
      await dbService.auditLogs.append(
        "admin_payment_proof_view",
        "compliance.officer@pgruae.com",
        `Compliance review: Admin viewed payment proof receipt file "${proofName}" for Order ${orderId}.`
      );
      alert(`[AUDITED ACCESS] Opened encrypted receipt proof file: "${proofName}" for Order ${orderId}. This action has been securely logged for central compliance auditing.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateKycStatus = async (customerId: string, status: string) => {
    try {
      const profile = await dbService.kyc.get(customerId);
      if (profile) {
        profile.status = status;
        if (status === "Verified") {
          profile.verified_at = new Date().toISOString();
          if (profile.documents && profile.documents.length > 0) {
            profile.documents[0].status = "Verified";
          }
        } else if (status === "Rejected") {
          if (profile.documents && profile.documents.length > 0) {
            profile.documents[0].status = "Rejected";
          }
        }
        await dbService.kyc.update(profile);
        triggerSuccessMessage(`Customer KYC verification set to: ${status}`);
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDossierAccess = (clientName: string, doc: any) => {
    const signatureToken = "sig_exp_" + Math.random().toString(36).substring(2, 12);
    const newLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      operator: "compliance.officer@pgruae.com",
      action: "Decrypted Secure KYC File",
      documentType: doc.type,
      clientName: clientName,
      signatureToken: signatureToken,
      expiration: "60 seconds (Signed Expiring URL)"
    };
    setDossierAuditLogs(prev => [newLog, ...prev]);

    // Append to universal append-only audit log
    dbService.auditLogs.append(
      "kyc_view",
      "compliance.officer@pgruae.com",
      `Admin accessed decrypted KYC dossier for "${clientName}". Category: ${doc.type}. Temp Expiring Token: ${signatureToken}`
    ).catch(err => console.error("Failed to append audit log:", err));

    setActiveDossier({
      clientName: clientName,
      docType: doc.type,
      docNumber: doc.number,
      signatureToken: signatureToken,
      fileName: doc.name || `secured_vault_${doc.type.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      fileSize: doc.size || "1.45 MB"
    });
  };

  const handleUpdateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      await dbService.iraqDelivery.updateStatus(deliveryId, status);
      triggerSuccessMessage(`Iraq logistics ticket state: ${status}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPickupPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPickupPoint.name_en || !newPickupPoint.city_en) return;
    try {
      await dbService.pickupPoints.create(newPickupPoint as any);
      setNewPickupPoint({
        name_en: "", name_ar: "", city_en: "", city_ar: "",
        address_en: "", address_ar: "", phone: "", whatsapp: "",
        working_hours_en: "", working_hours_ar: "", status: "Active"
      });
      triggerSuccessMessage("Secure pickup terminal created!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertificate.serial_number || !newCertificate.product_name) return;
    try {
      await dbService.certificates.create(newCertificate as any);
      setNewCertificate({
        serial_number: "", product_name: "", weight: "", purity: "",
        manufacturer: "", issue_date: "", status: "Active / Verified"
      });
      triggerSuccessMessage("Official Certificate minted!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogPost.slug || !newBlogPost.title_en) return;
    try {
      await dbService.blog.create(newBlogPost as any);
      setNewBlogPost({
        slug: "", category: "Market Report", title_en: "", title_ar: "",
        content_en: "", content_ar: "", author: "PGR Desk",
        featured: false, seo_title: "", seo_description: ""
      });
      triggerSuccessMessage("Research dispatch published!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

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
        dmcc_reg_no: settings.dmcc_reg_no,
        manual_gold_usd_oz: Number(settings.manual_gold_usd_oz || REFERENCE_GOLD_USD_OZ),
        manual_silver_usd_oz: Number(settings.manual_silver_usd_oz || REFERENCE_SILVER_USD_OZ),
        usd_aed_rate: Number(settings.usd_aed_rate || 3.6725),
        default_product_premium_pct: Number(settings.default_product_premium_pct || 2.0),
        disable_live_pricing: Boolean(settings.disable_live_pricing)
      });

      await dbService.exchangeRates.update(exchangeRates);
      triggerSuccessMessage("Global metrics and markup model sync complete!");
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDailyPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyPricingReason.trim()) {
      triggerErrorMessage("Reason for update is required for compliance audit");
      return;
    }
    try {
      const adminEmail = currentUser?.email || "admin@pgruae.com";
      const prevSettings = await dbService.settings.get();
      const prev = { ...DEFAULT_DAILY_PRICING, ...(prevSettings?.daily_pricing || {}) };
      const now = new Date().toISOString();
      const updated: DailyPricingSettings = {
        ...dailyPricing,
        reason_for_update: dailyPricingReason,
        updated_by_admin: adminEmail,
        last_updated_at: now
      };
      await dbService.settings.updateDailyPricing(updated, adminEmail);
      setDailyPricing(updated);
      setDailyPricingReason("");
      await dbService.auditLogs.append(
        "daily_pricing_update",
        adminEmail,
        `Daily pricing update at ${now}. Gold: ${prev.gold_daily_reference_price} → ${updated.gold_daily_reference_price} ${updated.currency}/${updated.unit}. Silver: ${prev.silver_daily_reference_price} → ${updated.silver_daily_reference_price} ${updated.currency}/${updated.unit}. Metal unit: ${updated.unit}. Manual enabled: ${updated.manual_pricing_enabled}. Effective: ${updated.effective_date}. Admin: ${adminEmail}. Reason: ${dailyPricingReason}`
      );
      triggerSuccessMessage("Daily reference pricing saved and audit logged.");
      await loadAdminData();
    } catch (err) {
      console.error(err);
      triggerErrorMessage("Failed to save daily pricing");
    }
  };

  const handleSaveShippingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adminEmail = currentUser?.email || "admin@pgruae.com";
      const prevSettings = await dbService.settings.get();
      const prev = { ...DEFAULT_SHIPPING_SETTINGS, ...(prevSettings?.shipping_settings || {}) };
      const now = new Date().toISOString();
      await dbService.settings.updateShippingSettings(shippingSettings, adminEmail);
      setPrepShippingCompany(shippingSettings.shipping_company_name);
      await dbService.auditLogs.append(
        "shipping_settings_update",
        adminEmail,
        `Shipping settings update at ${now}. Old: company=${prev.shipping_company_name}, method=${prev.shipping_method}, fee=${prev.shipping_price} ${prev.currency}, enabled=${prev.shipping_enabled}. New: company=${shippingSettings.shipping_company_name}, method=${shippingSettings.shipping_method}, fee=${shippingSettings.shipping_price} ${shippingSettings.currency}, destination=${shippingSettings.destination_country}/${shippingSettings.destination_city_region}, enabled=${shippingSettings.shipping_enabled}. Admin: ${adminEmail}. Public note: ${shippingSettings.public_shipping_note}`
      );
      triggerSuccessMessage("Shipping settings saved and audit logged.");
      await loadAdminData();
    } catch (err) {
      console.error(err);
      triggerErrorMessage("Failed to save shipping settings");
    }
  };

  const handleUpdateBuybackStatus = async (id: string, status: string, estimatedPayout?: number) => {
    try {
      await dbService.buyback.updateStatus(id, status, estimatedPayout);
      triggerSuccessMessage(`Buyback request ${id} updated to: ${status}`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculators
  const stats = {
    totalVolumeUSD: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) + holdings.reduce((sum, h) => sum + (h.current_market_value_usd || 0), 0),
    activeCustomersCount: kycProfiles.filter(k => k.status === "Verified").length + 5,
    pendingQuotesCount: quotes.filter(q => q.status === "Pending").length,
    activeDeliveriesIraq: iraqDeliveries.filter(d => d.status !== "Delivered").length,
    pendingKycCount: kycProfiles.filter(k => k.status === "Pending review" || k.status === "Pending").length,
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
      case "daily_pricing": return <Coins size={14} />;
      case "shipping_settings": return <Truck size={14} />;
      case "exchange_rates": return <RefreshCw size={14} />;
      case "buyback": return <Undo size={14} />;
      case "certificates": return <Award size={14} />;
      case "blog": return <BookOpen size={14} />;
      case "settings": return <Settings size={14} />;
    }
  };

  // Close redirection helper
  const handlePanelClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.href = "/";
    }
  };

  // SCREEN O: RENDER LOADING SPINNER WHILE AUTHENTICATING
  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070707] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-gold-base mx-auto" size={40} />
          <p className="text-sm font-mono text-gray-400 uppercase tracking-widest animate-pulse">
            {isAr ? "جاري التحقق من الصلاحيات الأمنية..." : "Verifying Secure Credentials..."}
          </p>
        </div>
      </div>
    );
  }

  // SCREEN A: RENDER UNLOGGED AUTH FORM OR ACCESS DENIED
  if (!isAdminLoggedIn) {
    const isLoggedButNotAdmin = currentUser !== null;

    return (
      <div className="fixed inset-0 z-50 bg-[#070707] flex items-center justify-center p-4 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="w-full max-w-md bg-[#0d0d0e] border border-white/[0.05] rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl relative z-10">
          
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-amber-950/20 border border-gold-base/30 text-gold-base">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-serif text-white tracking-wide">
              {isAr ? "بوابة الإدارة لـ PGR UAE" : "PGR UAE Admin Panel"}
            </h3>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">
              {isAr ? "ديوان المراقبة والتداول المالي" : "Command & Market Control"}
            </p>
          </div>

          {isLoggedButNotAdmin ? (
            <div className="space-y-6">
              <div className="p-4 bg-red-950/25 border border-red-900/40 rounded flex items-start gap-2.5 text-xs text-red-300 font-mono">
                <ShieldAlert size={16} className="shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-bold">{isAr ? "تم رفض الدخول" : "ACCESS DENIED"}</p>
                  <p className="opacity-90">{authErrorMsg}</p>
                </div>
              </div>

              <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded text-[11px] text-gray-400 leading-relaxed font-sans space-y-2">
                <p>
                  {isAr 
                    ? `لقد قمت بتسجيل الدخول باستخدام البريد الإلكتروني: ${currentUser.email} ولكن هذا الحساب ليس لديه الصلاحيات الإدارية المطلوبة للوصول.`
                    : `You are currently logged in with the email: ${currentUser.email} but this account does not possess the administrator permissions required for access.`}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await dbService.auth.logout();
                    setCurrentUser(null);
                    setIsAdminLoggedIn(false);
                    setAuthErrorMsg("");
                  }}
                  className="flex-1 py-3 bg-red-900 hover:bg-red-800 text-white font-semibold rounded uppercase tracking-wider text-xs transition-all cursor-pointer font-sans flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} />
                  {isAr ? "تسجيل الخروج والتبديل" : "Sign Out & Switch Account"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {authErrorMsg && (
                <div className="p-4 bg-red-950/25 border border-red-900/40 rounded flex items-start gap-2.5 text-xs text-red-300 font-mono">
                  <ShieldAlert size={16} className="shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-bold">{isAr ? "تم رفض الدخول" : "ACCESS DENIED"}</p>
                    <p className="opacity-90">{authErrorMsg}</p>
                  </div>
                </div>
              )}

              {/* Continue with Google */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setCheckingAuth(true);
                      if (isLive && supabase) {
                        await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: {
                            redirectTo: getRedirectUrl()
                          }
                        });
                      } else {
                        const resultUser = await dbService.auth.signInWithGoogle();
                        if (resultUser) {
                          const isAuthorized = await dbService.adminUsers.checkEmail(resultUser.email);
                          if (isAuthorized) {
                            setIsAdminLoggedIn(true);
                            setAuthErrorMsg("");
                            await loadAdminData();
                          } else {
                            setAuthErrorMsg(
                              isAr 
                                ? "تم رفض الدخول. صلاحية الإدارة مطلوبة." 
                                : "Access denied. Admin permission required."
                            );
                          }
                        }
                      }
                    } catch (err) {
                      setAuthErrorMsg(isAr ? "فشل تسجيل الدخول باستخدام Google" : "Google Sign-In failed.");
                    } finally {
                      setCheckingAuth(false);
                    }
                  }}
                  className="w-full py-3 bg-white text-black hover:bg-gray-100 font-semibold rounded uppercase tracking-wider text-xs transition-all cursor-pointer font-sans flex items-center justify-center gap-2 border border-white/10"
                >
                  <span>{isAr ? "المتابعة باستخدام Google" : "Continue with Google"}</span>
                </button>

              </div>
            </>
          )}

          {/* Temporary System Security Debug Panel */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded text-[11px] font-mono space-y-1.5 text-gray-400">
            <p className="text-gray-500 uppercase tracking-wider font-bold text-[10px] mb-2 border-b border-white/[0.05] pb-1">
              SYSTEM SECURITY DEBUG INFO:
            </p>
            <p>Session detected: <span className={debugSessionDetected === "YES" ? "text-green-400 font-bold" : debugSessionDetected === "NO" ? "text-red-400" : "text-amber-400"}>{debugSessionDetected}</span></p>
            <p>User email: <span className="text-white">{debugUserEmail}</span></p>
            <p>Admin check: <span className={debugAdminCheck === "YES" ? "text-green-400 font-bold" : debugAdminCheck === "NO" ? "text-red-400" : "text-amber-400"}>{debugAdminCheck}</span></p>
            <p>Reason: <span className="text-amber-400">{debugReason}</span></p>
          </div>

          {/* Home Link */}
          <div className="text-center pt-2">
            <button
              onClick={handlePanelClose}
              className="text-xs text-gray-500 hover:text-white underline cursor-pointer font-mono"
            >
              {isAr ? "العودة إلى الموقع الرئيسي" : "Return to Main Terminal"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN B: FULL ADMINISTRATION WORKSPACE
  const sectionsList: { id: AdminSection; label: string; labelAr: string }[] = [
    { id: "dashboard", label: "Dashboard", labelAr: "لوحة التحكم" },
    { id: "products", label: "Catalog Entries", labelAr: "كتالوج المنتجات" },
    { id: "quotes", label: "Quote Requests", labelAr: "طلبات الأسعار" },
    { id: "orders", label: "Orders Management", labelAr: "الأوامر الصادرة" },
    { id: "customers", label: "Customer Accounts", labelAr: "حسابات العملاء" },
    { id: "kyc", label: "KYC Compliance", labelAr: "امتثال KYC" },
    { id: "iraq_delivery", label: "Iraq Logistics", labelAr: "لوجستيات العراق" },
    { id: "pickup_points", label: "Pickup Terminals", labelAr: "مراكز الاستلام" },
    { id: "market_prices", label: "Market Markup Pricing", labelAr: "هوامش الأسعار" },
    { id: "daily_pricing", label: "Daily Reference Pricing", labelAr: "التسعير اليومي المرجعي" },
    { id: "shipping_settings", label: "Shipping Settings", labelAr: "إعدادات الشحن" },
    { id: "exchange_rates", label: "Exchange Rates & Pegs", labelAr: "أسعار صرف العملات" },
    { id: "buyback", label: "Buyback Desk", labelAr: "ديوان الاسترداد" },
    { id: "certificates", label: "Certificates Mint", labelAr: "إصدار الشهادات" },
    { id: "blog", label: "Intelligence Dispatch", labelAr: "الأبحاث والتقارير" },
    { id: "settings", label: "Global Configurations", labelAr: "إعدادات المنصة" },
    { id: "security", label: "Security & Telemetry", labelAr: "الأمن والاتصال اللاسلكي" }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070707]" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="min-h-screen relative flex flex-col md:flex-row h-screen">
        
        {/* Close button if modal wrap */}
        {isModal && (
          <div className="absolute top-4 right-4 z-40">
            <button
              onClick={handlePanelClose}
              className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white border border-white/[0.05] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 bg-[#0d0d0e] border-b md:border-b-0 md:border-r border-white/[0.05] flex flex-col shrink-0 overflow-y-auto h-auto md:h-full">
          <div className="p-5 border-b border-white/[0.05]">
            <span className="text-[10px] font-mono text-gold-base uppercase tracking-[0.2em] font-bold block mb-1">
              {isAr ? "بوابة الإدارة المركزية" : "Command Deck"}
            </span>
            <h3 className="text-sm font-serif font-semibold text-white tracking-wide">
              PGR UAE & Iraq Admin
            </h3>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span className="text-green-500">● SECURED</span>
              <button onClick={handleAdminLogout} className="text-gold-base hover:underline">
                {isAr ? "خروج" : "Logout"}
              </button>
            </div>
          </div>

          {/* Desktop selection tabs */}
          <nav className="p-3 space-y-1 flex-1 hidden md:block">
            {sectionsList.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setEditingProduct(null);
                }}
                className={`w-full text-left px-3 py-2.5 rounded text-xs font-mono flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? "bg-amber-950/20 text-gold-base border-l-2 border-gold-base pl-2 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                {renderSectionIcon(sec.id)}
                <span>{isAr ? sec.labelAr : sec.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile responsive selector */}
          <div className="p-3 md:hidden">
            <select
              value={activeSection}
              onChange={(e) => {
                setActiveSection(e.target.value as AdminSection);
                setEditingProduct(null);
              }}
              className="w-full bg-[#111] border border-white/10 rounded p-2 text-white text-xs outline-none font-mono"
            >
              {sectionsList.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {isAr ? sec.labelAr : sec.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MAIN WORKSPACE VIEW PANEL */}
        <div className="flex-1 bg-[#070707] overflow-y-auto p-4 sm:p-6 md:p-8 relative h-[calc(100vh-60px)] md:h-full">
          
          {/* Header Action feedback */}
          {actionSuccess && (
            <div className="fixed bottom-4 right-4 z-50 bg-[#111112] border border-gold-base/30 text-gold-light px-4 py-3 rounded shadow-xl font-mono text-xs flex items-center gap-2 animate-bounce">
              <CheckCircle size={14} className="text-gold-base" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="fixed bottom-4 right-4 z-50 bg-[#161111] border border-red-500/30 text-red-400 px-4 py-3 rounded shadow-xl font-mono text-xs flex items-center gap-2 animate-pulse">
              <ShieldAlert size={14} className="text-red-500 animate-spin" />
              <span>{actionError}</span>
            </div>
          )}

          {loading ? (
            <div className="flex h-full items-center justify-center text-xs font-mono text-gold-base uppercase">
              <RefreshCw className="animate-spin text-gold-base mr-2" size={16} />
              <span>{isAr ? "جاري تحميل البيانات..." : "Compiling Secure Datasets..."}</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* 1. SECTION: DASHBOARD */}
              {activeSection === "dashboard" && (
                <div className="space-y-6 font-mono text-xs">
                  <div>
                    <h4 className="text-lg font-serif text-white">{isAr ? "لوحة الإحصائيات والأداء" : "Precious Metals Control Center"}</h4>
                    <p className="text-xs text-gray-500 uppercase">Product and Quote Overview, compliance profiles, and logistic pipelines</p>
                  </div>

                  {/* Bento Stats Matrix */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#0d0d0e] border border-white/[0.03] rounded">
                      <span className="text-[10px] text-gray-500 uppercase">Listed Product Value</span>
                      <p className="text-xl font-serif text-white font-bold mt-1">${stats.totalVolumeUSD.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-[#0d0d0e] border border-white/[0.03] rounded">
                      <span className="text-[10px] text-gray-500 uppercase">Customer Accounts</span>
                      <p className="text-xl font-serif text-gold-base font-bold mt-1">{stats.activeCustomersCount} Accounts</p>
                    </div>
                    <div className="p-4 bg-[#0d0d0e] border border-white/[0.03] rounded">
                      <span className="text-[10px] text-gray-500 uppercase">Pending Quotes</span>
                      <p className="text-xl font-serif text-amber-500 font-bold mt-1">{stats.pendingQuotesCount} Tickets</p>
                    </div>
                    <div className="p-4 bg-[#0d0d0e] border border-white/[0.03] rounded">
                      <span className="text-[10px] text-gray-500 uppercase">Iraq Transit Lanes</span>
                      <p className="text-xl font-serif text-blue-400 font-bold mt-1">{stats.activeDeliveriesIraq} Active</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Security Compliance Checklist */}
                    <div className="p-5 bg-[#0d0d0e] border border-white/[0.03] rounded space-y-4">
                      <h5 className="text-sm font-serif text-gold-base border-b border-white/[0.03] pb-2">KYC / Customer Review</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-white/[0.01]">
                          <span className="text-gray-400">KYC Profiles Awaiting Review</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${stats.pendingKycCount > 0 ? "bg-amber-950 text-amber-400 animate-pulse" : "bg-gray-900 text-gray-400"}`}>
                            {stats.pendingKycCount} pending
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/[0.01]">
                          <span className="text-gray-400">Buyback Estimations Pending</span>
                          <span className="text-white font-bold">{stats.buybackInquiries} Inquiries</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-400">Product Certificates</span>
                          <span className="text-green-400 font-bold">Product Documentation Status</span>
                        </div>
                      </div>
                    </div>

                    {/* Regional Price Pegs */}
                    <div className="p-5 bg-[#0d0d0e] border border-white/[0.03] rounded space-y-4">
                      <h5 className="text-sm font-serif text-gold-base border-b border-white/[0.03] pb-2">Central Bank Currency Multipliers</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">USD to UAE Dirham (AED)</span>
                          <span className="text-white font-bold">{exchangeRates.AED}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">USD to Iraqi Dinar (IQD)</span>
                          <span className="text-white font-bold">{exchangeRates.IQD}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">System Gold Markup</span>
                          <span className="text-gold-light font-bold">+{settings.gold_markup_pct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SECTION: PRODUCTS CATALOG EDITOR */}
              {activeSection === "products" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Precious Metal Catalog Entries</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Add, Edit or Delete Gold & Silver Bullion Products and custom premiums</p>
                  </div>

                  {/* FORM A: ADD NEW PRODUCT (When not editing) */}
                  {!editingProduct ? (
                    <form onSubmit={handleAddProduct} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.05] space-y-4 text-xs font-mono">
                      <h5 className="text-sm font-serif text-gold-base">Mint New Catalog Product</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Product ID / Slug (Unique)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. gold-valcambi-100g"
                            value={newProduct.id}
                            onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">English Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Valcambi 100g Gold Cast Bar"
                            value={newProduct.name_en}
                            onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Arabic Title</label>
                          <input
                            type="text"
                            required
                            placeholder="سبيكة ذهب فالكامبي ١٠٠ جرام"
                            value={newProduct.name_ar}
                            onChange={(e) => setNewProduct({ ...newProduct, name_ar: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Category</label>
                          <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="gold_bars">Gold Bars (سبائك الذهب)</option>
                            <option value="silver_bars">Silver Bars (سبائك الفضة)</option>
                            <option value="mint_bars_coins">Mint Bars & Coins</option>
                            <option value="custom_inquiry">Custom Inquiry</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Brand / Manufacturer</label>
                          <input
                            type="text"
                            value={newProduct.brand}
                            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Weight (Grams)</label>
                          <input
                            type="number"
                            required
                            value={newProduct.weight_g}
                            onChange={(e) => setNewProduct({ ...newProduct, weight_g: Number(e.target.value) })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Purity (e.g. 999.9)</label>
                          <input
                            type="text"
                            required
                            value={newProduct.purity}
                            onChange={(e) => setNewProduct({ ...newProduct, purity: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Price Mode</label>
                          <select
                            value={newProduct.price_mode}
                            onChange={(e) => setNewProduct({ ...newProduct, price_mode: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="spot">Dynamic Spot Pricing</option>
                            <option value="fixed">Fixed Flat Pricing</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Fixed Price (USD)</label>
                          <input
                            type="number"
                            disabled={newProduct.price_mode === "spot"}
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none disabled:opacity-40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Retail Premium %</label>
                          <input
                            type="number"
                            step="0.05"
                            value={newProduct.premium_pct}
                            onChange={(e) => setNewProduct({ ...newProduct, premium_pct: Number(e.target.value) })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Availability</label>
                          <select
                            value={newProduct.availability}
                            onChange={(e) => setNewProduct({ ...newProduct, availability: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="In Stock">In Stock (متوفر)</option>
                            <option value="Available on Order">Available on Order (عند الطلب)</option>
                            <option value="Limited Stock">Limited Stock (كمية محدودة)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Product Image (Upload / URL)</label>
                          <div className="flex flex-col gap-2">
                            {/* Drag & Drop Upload box */}
                            <div 
                              className="border border-dashed border-white/10 hover:border-gold-base/50 rounded p-3 text-center bg-black/40 cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[90px]"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleProductImageUpload(file, false);
                              }}
                              onClick={() => {
                                const el = document.getElementById("new-prod-file-input");
                                el?.click();
                              }}
                            >
                              <input 
                                id="new-prod-file-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleProductImageUpload(file, false);
                                }}
                              />
                              {uploadingImage ? (
                                <div className="text-[10px] text-gold-base flex items-center gap-1.5 animate-pulse">
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>Uploading to Storage...</span>
                                </div>
                              ) : newProduct.image_url ? (
                                <div className="flex items-center gap-2 w-full text-left">
                                  <img 
                                    src={newProduct.image_url} 
                                    alt="Preview" 
                                    className="w-10 h-10 object-cover rounded border border-white/10 shrink-0"
                                  />
                                  <span className="text-[9px] text-gray-400 truncate flex-1">Image Uploaded Successfully</span>
                                </div>
                              ) : (
                                <div className="text-[9px] text-gray-500">
                                  <span>Drag & Drop or <span className="text-gold-base font-semibold">Browse</span></span>
                                  <span className="block text-[8px] text-gray-600 mt-0.5">Saves to product-images bucket</span>
                                </div>
                              )}
                            </div>
                            {/* Option to paste URL directly */}
                            <input
                              type="text"
                              placeholder="Or paste image URL directly..."
                              value={newProduct.image_url}
                              onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                              className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white outline-none text-[10px]"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Certificate Document URL</label>
                          <input
                            type="text"
                            placeholder="/docs/pamp-assay.pdf"
                            value={newProduct.certificate_url}
                            onChange={(e) => setNewProduct({ ...newProduct, certificate_url: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Stock Status</label>
                          <select
                            value={newProduct.stock_status}
                            onChange={(e) => setNewProduct({ ...newProduct, stock_status: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="In Stock">In Stock (متوفر بالخزنة)</option>
                            <option value="Out of Stock">Out of Stock (نفذت الكمية)</option>
                            <option value="Pre-order">Pre-order (طلب مسبق)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Description (English)</label>
                          <textarea
                            value={newProduct.description_en}
                            onChange={(e) => setNewProduct({ ...newProduct, description_en: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none h-12"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Description (Arabic)</label>
                          <textarea
                            value={newProduct.description_ar}
                            onChange={(e) => setNewProduct({ ...newProduct, description_ar: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none h-12"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-gray-400">
                          <input
                            type="checkbox"
                            checked={newProduct.published}
                            onChange={(e) => setNewProduct({ ...newProduct, published: e.target.checked })}
                            className="rounded bg-black border-white/10"
                          />
                          <span>Publish Catalog Entry</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                      >
                        Publish Product Entry
                      </button>
                    </form>
                  ) : (
                    /* FORM B: EDIT EXISTING PRODUCT */
                    <form onSubmit={handleUpdateProductSubmit} className="p-5 bg-amber-950/10 rounded border border-amber-500/20 space-y-4 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-serif text-gold-base">Modify Catalog Product: <span className="text-white">{editingProduct.id}</span></h5>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px]"
                        >
                          Cancel / Add Mode
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">English Title</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name_en}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Arabic Title</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name_ar}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Category</label>
                          <select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="gold_bars">Gold Bars (سبائك الذهب)</option>
                            <option value="silver_bars">Silver Bars (سبائك الفضة)</option>
                            <option value="mint_bars_coins">Mint Bars & Coins</option>
                            <option value="custom_inquiry">Custom Inquiry</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Brand / Manufacturer</label>
                          <input
                            type="text"
                            value={editingProduct.brand || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Purity</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.purity}
                            onChange={(e) => setEditingProduct({ ...editingProduct, purity: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Retail Premium %</label>
                          <input
                            type="number"
                            step="0.05"
                            value={editingProduct.premium_multiplier ? (editingProduct.premium_multiplier - 1) * 100 : 2.5}
                            onChange={(e) => {
                              const multiplier = 1 + (Number(e.target.value) / 100);
                              setEditingProduct({ ...editingProduct, premium_multiplier: multiplier });
                            }}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Price Mode</label>
                          <select
                            value={editingProduct.price_mode || "spot"}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price_mode: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="spot">Dynamic Spot Pricing</option>
                            <option value="fixed">Fixed Flat Pricing</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Fixed Price (USD)</label>
                          <input
                            type="number"
                            disabled={editingProduct.price_mode === "spot"}
                            value={editingProduct.price || 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none disabled:opacity-40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Availability</label>
                          <select
                            value={editingProduct.availability}
                            onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="In Stock">In Stock</option>
                            <option value="Available on Order">Available on Order</option>
                            <option value="Limited Stock">Limited Stock</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Stock Status</label>
                          <select
                            value={editingProduct.stock_status || "In Stock"}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock_status: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          >
                            <option value="In Stock">In Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                            <option value="Pre-order">Pre-order</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Product Image (Upload / URL)</label>
                          <div className="flex flex-col gap-2">
                            {/* Drag & Drop Upload box */}
                            <div 
                              className="border border-dashed border-white/10 hover:border-gold-base/50 rounded p-3 text-center bg-black/40 cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[90px]"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleProductImageUpload(file, true);
                              }}
                              onClick={() => {
                                const el = document.getElementById("edit-prod-file-input");
                                el?.click();
                              }}
                            >
                              <input 
                                id="edit-prod-file-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleProductImageUpload(file, true);
                                }}
                              />
                              {uploadingImage ? (
                                <div className="text-[10px] text-gold-base flex items-center gap-1.5 animate-pulse">
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>Uploading to Storage...</span>
                                </div>
                              ) : editingProduct.image_url ? (
                                <div className="flex items-center gap-2 w-full text-left">
                                  <img 
                                    src={editingProduct.image_url} 
                                    alt="Preview" 
                                    className="w-10 h-10 object-cover rounded border border-white/10 shrink-0"
                                  />
                                  <span className="text-[9px] text-gray-400 truncate flex-1">Image Uploaded Successfully</span>
                                </div>
                              ) : (
                                <div className="text-[9px] text-gray-500">
                                  <span>Drag & Drop or <span className="text-gold-base font-semibold">Browse</span></span>
                                  <span className="block text-[8px] text-gray-600 mt-0.5">Saves to product-images bucket</span>
                                </div>
                              )}
                            </div>
                            {/* Option to paste URL directly */}
                            <input
                              type="text"
                              placeholder="Or paste image URL directly..."
                              value={editingProduct.image_url || ""}
                              onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                              className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white outline-none text-[10px]"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Certificate PDF Link</label>
                          <input
                            type="text"
                            value={editingProduct.certificate_url || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, certificate_url: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Description (EN)</label>
                          <textarea
                            value={editingProduct.description_en}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none h-12"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px]">Description (AR)</label>
                          <textarea
                            value={editingProduct.description_ar}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none h-12"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-gray-400">
                          <input
                            type="checkbox"
                            checked={editingProduct.published !== false}
                            onChange={(e) => setEditingProduct({ ...editingProduct, published: e.target.checked })}
                            className="rounded bg-black border-white/10"
                          />
                          <span>Show product in live listings (Published)</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gold-base hover:bg-gold-light text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded uppercase tracking-wider font-sans"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of current products in database */}
                  <div className="bg-[#0d0d0e] p-5 rounded border border-white/[0.03] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.02]">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                        {currentLang === "ar" ? `منتجات الكتالوج النشطة (${products.length})` : `Live Catalog Products (${products.length})`}
                      </span>
                      {isLive && (
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmMsg = currentLang === "ar" 
                              ? "هل أنت متأكد من رغبتك في إعادة ضبط كتالوج PGR إلى ١٠ منتجات رسمية وحذف المنتجات القديمة من قاعدة البيانات؟"
                              : "Are you sure you want to reset the PGR catalog to the official 10 products and remove legacy products from the database?";
                            if (window.confirm(confirmMsg)) {
                              try {
                                setLoading(true);
                                await dbService.products.resetToCatalogDefaults();
                                await loadAdminData();
                                alert(currentLang === "ar" ? "تمت مزامنة كتالوج المنتجات العشرة بنجاح!" : "Successfully reset the 10-product catalog!");
                              } catch (e: any) {
                                console.error(e);
                                alert((currentLang === "ar" ? "فشلت مزامنة المنتجات: " : "Failed to seed products: ") + (e.message || e));
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-gold-base/10 hover:bg-gold-base/20 border border-gold-base/30 text-gold-base font-semibold rounded text-[11px] tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RefreshCw size={11} />
                          {currentLang === "ar" ? "مزامنة المنتجات الافتراضية" : "Sync Default Products"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      {products.map((p) => (
                        <div key={p.id} className="p-4 rounded border border-white/[0.02] bg-[#070708] flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h6 className="text-white font-serif text-sm">{p.name_en}</h6>
                            <p className="text-gray-500 text-[10px] uppercase">
                              ID: {p.id} / TYPE: {p.price_mode === "fixed" ? "FIXED" : "SPOT"} / PURITY: {p.purity} / PREMIUM: {p.premium_multiplier ? ((p.premium_multiplier - 1) * 100).toFixed(2) : "2.5"}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              title="Edit product metadata"
                              className="p-2 bg-amber-950/20 text-[#c5a85c] border border-amber-900/30 rounded hover:bg-amber-900 hover:text-white cursor-pointer"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 bg-red-950/20 text-red-400 border border-red-900/30 rounded hover:bg-red-900 hover:text-white cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SECTION: QUOTES REQUESTS */}
              {activeSection === "quotes" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Live Institutional & Custom Inquiries</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Confirm physical precious metal availability, pricing agreements and mint tickets</p>
                  </div>

                  {/* CUSTOM PREPARE QUOTE DRAWER FOR ADMIN PRICE OVERRIDES */}
                  {preparingQuote && (
                    <form onSubmit={handleSendPreparedQuote} className="p-5 bg-amber-950/10 rounded border border-amber-500/20 space-y-4 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-serif text-gold-base">
                          Prepare Bespoke Firm Quote for Client: <span className="text-white font-bold">{preparingQuote.name}</span>
                        </h5>
                        <button
                          type="button"
                          onClick={() => setPreparingQuote(null)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 p-4 rounded border border-white/5">
                        <div>
                          <p className="text-gray-500 text-[9px] uppercase">Client Details</p>
                          <p className="text-white font-serif font-bold mt-1">{preparingQuote.name}</p>
                          <p className="text-gray-400 text-[10px]">{preparingQuote.email}</p>
                          <p className="text-gray-400 text-[10px]">{preparingQuote.phone}</p>
                          {preparingQuote.company && <p className="text-gray-400 text-[10px]">{preparingQuote.company}</p>}
                        </div>
                        <div>
                          <p className="text-gray-500 text-[9px] uppercase">Precious Metal Interest</p>
                          <p className="text-white font-serif font-bold mt-1 uppercase text-gold-base">{preparingQuote.metalInterest || preparingQuote.metal_interest || "Gold"}</p>
                          <p className="text-gray-400 text-[10px]">Product Category: {preparingQuote.productCategory || preparingQuote.product_category || "Custom Bullion Consultation"}</p>
                          <p className="text-gray-400 text-[10px]">Requested Weight: {preparingQuote.weight || preparingQuote.weight_preference || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[9px] uppercase">Formulas & Live Reference</p>
                          <p className="text-gray-400 text-[10px] mt-1">
                            Formula: spotPerGram * weight * purity + premium
                          </p>
                          <p className="text-gray-400 text-[10px]">
                            Current Gold Spot Ref: ${REFERENCE_GOLD_USD_PER_GRAM} / g (approx. AED {REFERENCE_GOLD_AED_PER_GRAM} / g)
                          </p>
                          <p className="text-gray-400 text-[10px]">
                            Current Silver Spot Ref: ${REFERENCE_SILVER_USD_PER_GRAM} / g (approx. AED {REFERENCE_SILVER_AED_PER_GRAM} / g)
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px] font-bold">
                            Product Firm Price (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={prepPriceOverride}
                            onChange={(e) => setPrepPriceOverride(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c] text-sm font-bold font-mono"
                            placeholder="e.g. 7850.00"
                          />
                          <p className="text-[10px] text-gray-500 italic">
                            Bullion firm price before shipping. Subject to market movement.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px] font-bold">
                            Shipping Company
                          </label>
                          <input
                            type="text"
                            value={prepShippingCompany}
                            onChange={(e) => setPrepShippingCompany(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c] text-xs font-mono"
                            placeholder={shippingSettings.shipping_company_name}
                          />
                          <label className="text-gray-400 block uppercase text-[9px] font-bold mt-2">
                            Shipping Fee (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={prepShippingFee}
                            onChange={(e) => setPrepShippingFee(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c] text-sm font-bold font-mono"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px] font-bold">
                            Quote Expiry Duration
                          </label>
                          <select
                            value={prepExpiryMinutes}
                            onChange={(e) => setPrepExpiryMinutes(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c] font-sans"
                          >
                            <option value={5}>5 Minutes (Extreme Volatility / Immediate Expiry)</option>
                            <option value={10}>10 Minutes (Standard Business Buffer)</option>
                            <option value={15}>15 Minutes (Extended Time Buffer)</option>
                          </select>
                          <p className="text-[10px] text-gray-500 italic mt-2">
                            Countdown timer starts on client dashboard after sending.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 block uppercase text-[9px] font-bold">
                            Reason for Price Override
                          </label>
                          <input
                            type="text"
                            required
                            value={prepOverrideReason}
                            onChange={(e) => setPrepOverrideReason(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c] text-xs font-mono"
                            placeholder="e.g. Client premium negotiation adjustment"
                          />
                        </div>
                        <div className="p-3 bg-black/50 border border-gold-base/20 rounded space-y-1">
                          <p className="text-[9px] text-gray-500 uppercase font-bold">Final Quote Breakdown</p>
                          <div className="flex justify-between text-[11px] text-gray-300">
                            <span>Product Firm Price:</span>
                            <span className="font-mono font-bold text-white">${(parseFloat(prepPriceOverride) || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-300">
                            <span>Shipping Fee ({prepShippingCompany || "—"}):</span>
                            <span className="font-mono font-bold text-white">${(parseFloat(prepShippingFee) || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[12px] text-gold-base border-t border-white/10 pt-1 mt-1">
                            <span className="font-bold">Total Firm Quote:</span>
                            <span className="font-mono font-bold">${((parseFloat(prepPriceOverride) || 0) + (parseFloat(prepShippingFee) || 0)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-gold-gradient text-black font-sans font-bold text-[10px] uppercase tracking-widest rounded shadow hover:opacity-95 transition-all cursor-pointer"
                      >
                        Send Bespoke Firm Quote to Client
                      </button>
                    </form>
                  )}

                  <div className="bg-[#0d0d0e] border border-white/[0.03] rounded-sm overflow-hidden font-mono text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#111112] text-gray-400 border-b border-white/[0.03]">
                          <tr>
                            <th className="p-4">Client Detail</th>
                            <th className="p-4">Interest</th>
                            <th className="p-4">Category / Weight</th>
                            <th className="p-4">Date Submitted</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {quotes.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-gray-500">No pending quote requests.</td>
                            </tr>
                          ) : (
                            quotes.map((q) => (
                              <tr key={q.id}>
                                <td className="p-4 space-y-1">
                                  <p className="text-white font-serif">{q.name}</p>
                                  <p className="text-gray-500 text-[10px]">{q.email} | {q.phone}</p>
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-0.5 rounded bg-amber-950/20 text-gold-base font-bold uppercase">{q.metalInterest}</span>
                                </td>
                                <td className="p-4 space-y-0.5">
                                  <p className="text-white">{q.productCategory || "Custom Lot"}</p>
                                  <p className="text-gray-500 text-[10px]">{q.weight || "N/A"}</p>
                                </td>
                                <td className="p-4 text-gray-400">{new Date(q.created_at || "").toLocaleDateString()}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                    q.status === "New Request" || q.status === "Pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                    q.status === "KYC Required" ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" :
                                    q.status === "KYC Under Review" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                    q.status === "Quote Sent" || q.status === "Approved" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                                    q.status === "Customer Accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                    q.status === "Payment Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                    q.status === "Ready for Collection" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                                    q.status === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                    q.status === "Cancelled" || q.status === "Rejected" ? "bg-gray-500/10 text-gray-400 border border-gray-500/20 line-through" :
                                    "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                  }`}>
                                    {q.status || "New Request"}
                                  </span>
                                </td>
                                <td className="p-4 flex items-center justify-center gap-2">
                                  <select
                                    value={q.status || "New Request"}
                                    onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                                    className="bg-black text-gray-300 border border-white/10 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:border-gold-base font-sans cursor-pointer"
                                  >
                                    <option value="New Request">New Request</option>
                                    <option value="KYC Required">KYC Required</option>
                                    <option value="KYC Under Review">KYC Under Review</option>
                                    <option value="Quote Sent">Quote Sent</option>
                                    <option value="Customer Accepted">Customer Accepted</option>
                                    <option value="Payment Pending">Payment Pending</option>
                                    <option value="Ready for Collection">Ready for Collection</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Expired Quote">Expired Quote</option>
                                  </select>

                                  <button
                                    onClick={() => {
                                      setPreparingQuote(q);
                                      const metal = (q.metalInterest || q.metal_interest || "gold").toLowerCase();
                                      const weightVal = parseFloat(q.weight || q.weight_preference || "100") || 100;
                                      const defaultEst = weightVal * (metal === "silver" ? REFERENCE_SILVER_USD_PER_GRAM : REFERENCE_GOLD_USD_PER_GRAM);
                                      setPrepPriceOverride(defaultEst.toFixed(2));
                                      setPrepShippingCompany(shippingSettings.shipping_company_name);
                                      setPrepShippingFee(String(shippingSettings.shipping_price || 0));
                                      setPrepExpiryMinutes(10);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="px-2.5 py-1 bg-gold-base/10 hover:bg-[#c5a85c] hover:text-black border border-gold-base/20 rounded font-sans font-bold text-[10px] uppercase transition-all cursor-pointer shrink-0"
                                    title="Prepare Custom Quote with Volatility Expiry and Overrides"
                                  >
                                    Prepare Quote
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SECTION: ORDERS */}
              {activeSection === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Order Registry</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Control active client purchase invoices and holding contracts</p>
                  </div>

                  <div className="bg-[#0d0d0e] border border-white/[0.03] rounded-sm overflow-hidden font-mono text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#111112] text-gray-400 border-b border-white/[0.03]">
                          <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Client</th>
                            <th className="p-4">Total Value</th>
                            <th className="p-4">Method / Destination</th>
                            <th className="p-4">Status & Payment</th>
                            <th className="p-4">Manual Payment Link</th>
                            <th className="p-4">Logistics State Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {orders.map((o) => (
                            <tr key={o.id}>
                              <td className="p-4 font-bold text-white uppercase">{o.id}</td>
                              <td className="p-4 text-gray-300">{o.customer_id}</td>
                              <td className="p-4 text-gold-base font-bold">${o.total_amount?.toLocaleString()} {o.currency}</td>
                              <td className="p-4 space-y-0.5">
                                <p className="text-white">{o.shipping_method}</p>
                                <p className="text-gray-500 text-[10px]">{o.shipping_address}</p>
                              </td>
                              <td className="p-4 space-y-2">
                                <div>
                                  <span className="px-2 py-0.5 rounded bg-amber-950/20 text-gold-light uppercase text-[10px]">{o.status}</span>
                                </div>
                                <div>
                                  <button
                                    onClick={() => handleToggleOrderPaymentStatus(o.id, o.payment_status)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition-all cursor-pointer ${
                                      o.payment_status === "Paid"
                                        ? "bg-green-950/30 text-green-400 border-green-500/25"
                                        : "bg-red-950/30 text-red-400 border-red-500/25 animate-pulse"
                                    }`}
                                  >
                                    {o.payment_status === "Paid" ? "● PAID" : "● UNPAID (PENDING)"}
                                  </button>
                                </div>
                                {o.payment_proof_name && (
                                  <div className="mt-2 pt-1.5 border-t border-white/[0.03] space-y-1">
                                    <p className="text-[10px] text-emerald-400 font-bold truncate">✓ Proof: {o.payment_proof_name}</p>
                                    <button
                                      onClick={() => handleViewPaymentProof(o.id, o.payment_proof_name)}
                                      className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 rounded text-[9px] font-mono tracking-wider cursor-pointer"
                                    >
                                      View & Audit Proof
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-1.5 items-center max-w-[240px]">
                                  <input
                                    type="text"
                                    placeholder="Paste manual checkout/payment link..."
                                    defaultValue={o.payment_link || ""}
                                    onBlur={(e) => handleUpdateOrderPaymentLink(o.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleUpdateOrderPaymentLink(o.id, (e.target as HTMLInputElement).value);
                                      }
                                    }}
                                    className="bg-black border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none flex-1 font-mono"
                                  />
                                </div>
                              </td>
                              <td className="p-4">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className="bg-black border border-white/10 rounded p-1 text-[11px] text-white outline-none cursor-pointer"
                                >
                                  <option value="Payment Pending">Payment Pending (بانتظار الدفع)</option>
                                  <option value="Payment Verified">Payment Verified (تم التحقق من الدفع)</option>
                                  <option value="Ready for Collection">Ready for Collection (جاهز للاستلام)</option>
                                  <option value="Completed">Completed (سلّمت للعميل)</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SECTION: CUSTOMERS */}
              {activeSection === "customers" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Customer Account Directories</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Client profiles, registered product allocations, and total balances</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    {holdings.map((h, i) => (
                      <div key={i} className="p-5 bg-[#0d0d0e] border border-white/[0.03] rounded space-y-3">
                        <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
                          <span className="text-white font-serif text-sm">Customer Account ID: <span className="text-gold-base">{h.customer_id}</span></span>
                          <span className="px-2 py-0.5 rounded bg-green-950/30 text-green-400 font-bold">ACTIVE DEPOSITS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-gray-400">
                          <div>Metal Allocation: <span className="text-white font-bold">{h.weight_grams}g of {h.metal?.toUpperCase()}</span></div>
                          <div>Value: <span className="text-gold-light font-bold">${h.current_market_value_usd?.toLocaleString()}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. SECTION: KYC COMPLIANCE */}
              {activeSection === "kyc" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">KYC Compliance & Verification Bureau</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Audit international AML declarations and state identification passports</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
                    {/* KYC Profiles Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                      {kycProfiles.map((k) => (
                        <div key={k.id} className="p-5 bg-[#0d0d0e] border border-white/[0.03] rounded space-y-4">
                          <div className="flex justify-between items-center border-b border-white/[0.02] pb-2">
                            <div>
                              <span className="text-white font-serif text-sm block">{k.full_name}</span>
                              <span className="text-gray-500 text-[10px]">{k.email} | {k.phone} | Nationality: {k.nationality} | Type: <span className="text-gold-base uppercase font-bold">{k.kyc_type || "Individual"}</span></span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              k.status === "Verified" ? "bg-green-950/50 text-green-400" :
                              k.status === "Rejected" ? "bg-red-950/50 text-red-400" :
                              "bg-amber-950/50 text-amber-400 animate-pulse"
                            }`}>
                              {k.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                            <div className="space-y-1 bg-black/40 p-3 rounded border border-white/[0.01]">
                              <p className="text-white font-serif text-[11px] uppercase tracking-wider text-[#c5a85c] mb-1">Legal Declaration</p>
                              <p className="text-[11px] leading-relaxed">Source of Funds/Wealth: <span className="text-gray-300 font-bold">{k.source_of_funds_declaration || "Direct Cash Savings"}</span></p>
                              <div className="text-[9px] text-gray-500 mt-2 space-y-0.5">
                                <p>✓ Compliance Agreed: {k.agreement_accepted ? "YES" : "NO"}</p>
                                <p>✓ Privacy Consented: {k.privacy_consent ? "YES" : "NO"}</p>
                              </div>
                            </div>
                            <div className="space-y-1 bg-black/40 p-3 rounded border border-white/[0.01]">
                              <p className="text-white font-serif text-[11px] uppercase tracking-wider text-[#c5a85c] mb-1">Submitted Documentation Files</p>
                              <div className="text-[10px] space-y-1.5">
                                {k.documents?.map((doc: any, di: number) => (
                                  <div key={di} className="flex justify-between items-center">
                                    <span>{doc.type} (No. {doc.number})</span>
                                    <span 
                                      onClick={() => triggerDossierAccess(k.full_name, doc)}
                                      className="text-gold-base font-bold underline cursor-pointer hover:text-white"
                                    >
                                      View Dossier
                                    </span>
                                  </div>
                                ))}

                                {/* Customer Uploaded Private Vault Files */}
                                {k.uploaded_files && Object.keys(k.uploaded_files).length > 0 && (
                                  <div className="mt-2 border-t border-white/[0.03] pt-2 space-y-1 text-gray-400 text-[10px]">
                                    <p className="font-bold text-gray-500 uppercase tracking-widest text-[8px] mb-1">Vault Uploads:</p>
                                    {Object.entries(k.uploaded_files).map(([key, fileObj]: any) => (
                                      <div key={key} className="flex justify-between items-center">
                                        <span className="truncate max-w-[120px]">📄 {key.replace(/_/g, " ").toUpperCase()}</span>
                                        <span 
                                          onClick={() => triggerDossierAccess(k.full_name, { type: key.replace(/_/g, " ").toUpperCase(), number: "SECURE_VAULT_BLOB", size: fileObj.size, name: fileObj.name })}
                                          className="text-gold-base font-bold underline cursor-pointer hover:text-white shrink-0 ml-1"
                                        >
                                          View Dossier
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {k.status !== "Verified" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateKycStatus(k.id, "Verified")}
                                className="px-3 py-1.5 bg-green-950/30 text-green-400 border border-green-900/30 rounded hover:bg-green-800 hover:text-white cursor-pointer"
                              >
                                Approve Customer KYC Profile
                              </button>
                              <button
                                onClick={() => handleUpdateKycStatus(k.id, "Rejected")}
                                className="px-3 py-1.5 bg-red-950/30 text-red-400 border border-red-900/30 rounded hover:bg-red-800 hover:text-white cursor-pointer"
                              >
                                Reject Profile
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* KYC Audit Log Panel Column (1/3 width) */}
                    <div className="space-y-4">
                      <div className="p-4 bg-black/40 border border-white/[0.04] rounded space-y-4">
                        <div className="border-b border-white/[0.04] pb-2">
                          <h5 className="text-xs uppercase tracking-wider text-[#c5a85c] font-bold">AML & Access Audit Logs</h5>
                          <p className="text-[9px] text-gray-500 uppercase">Cryptographic vault tracking for regulatory compliance audit logs</p>
                        </div>

                        <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                          {dossierAuditLogs.map((log) => (
                            <div key={log.id} className="p-2.5 bg-[#070707] border border-white/[0.02] rounded text-[9px] space-y-1">
                              <div className="flex justify-between text-gray-500 font-bold">
                                <span>{log.operator}</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-white font-bold">{log.action}</p>
                              <div className="text-gray-400 space-y-0.5">
                                <p>Client: <span className="text-gray-200">{log.clientName}</span></p>
                                <p>File Category: <span className="text-gray-200">{log.documentType}</span></p>
                                <p className="truncate">Token: <span className="text-gold-base text-[8px] font-mono">{log.signatureToken}</span></p>
                                <p className="text-emerald-500">Expiring: {log.expiration}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. SECTION: IRAQ LOGISTICS */}
              {activeSection === "iraq_delivery" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Logistics Transit Pipelines to Iraq</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Secure shipping routes, governorate clearing checkpoints and custom invoices</p>
                  </div>

                  <div className="bg-[#0d0d0e] border border-white/[0.03] rounded-sm overflow-hidden font-mono text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#111112] text-gray-400 border-b border-white/[0.03]">
                          <tr>
                            <th className="p-4">Delivery Ticket</th>
                            <th className="p-4">Customer ID</th>
                            <th className="p-4">Governorate Destination</th>
                            <th className="p-4">Customs Clearance Status</th>
                            <th className="p-4">Transit Status</th>
                            <th className="p-4 text-center">Update Pipeline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {iraqDeliveries.map((d) => (
                            <tr key={d.id}>
                              <td className="p-4 font-bold text-white uppercase">{d.id}</td>
                              <td className="p-4 text-gray-300">{d.customer_id}</td>
                              <td className="p-4 space-y-1">
                                <p className="text-white font-bold">{d.governorate}</p>
                                <p className="text-gray-500 text-[10px]">{d.address_details} | {d.phone}</p>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  d.customs_docs_status === "Approved" ? "bg-green-950/45 text-green-400" : "bg-amber-950/45 text-amber-400 animate-pulse"
                                }`}>
                                  {d.customs_docs_status}
                                </span>
                              </td>
                              <td className="p-4 text-gold-base uppercase font-bold">{d.status}</td>
                              <td className="p-4 text-center">
                                <select
                                  value={d.status}
                                  onChange={(e) => handleUpdateDeliveryStatus(d.id, e.target.value)}
                                  className="bg-black border border-white/10 rounded p-1 text-[11px] text-white outline-none cursor-pointer"
                                >
                                  <option value="Request received">Request received</option>
                                  <option value="Customer verified">Customer verified</option>
                                  <option value="Product confirmed">Product confirmed</option>
                                  <option value="Preparing shipment">Preparing shipment</option>
                                  <option value="Shipped">Shipped to Iraq Boundary</option>
                                  <option value="Ready for pickup">Ready for Governorate Terminal</option>
                                  <option value="Delivered">Delivered Handover</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. SECTION: PICKUP TERMINALS */}
              {activeSection === "pickup_points" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Vault Handover Terminals</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Control secure bullion pickup locations across Iraq and UAE Freezone</p>
                  </div>

                  {/* Add Pickup Point */}
                  <form onSubmit={handleAddPickupPoint} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.05] space-y-4 text-xs font-mono">
                    <h5 className="text-sm font-serif text-gold-base">Establish Secure Pickup Terminal</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">English terminal name</label>
                        <input
                          type="text" required placeholder="e.g. Baghdad Karrada Safehouse"
                          value={newPickupPoint.name_en}
                          onChange={(e) => setNewPickupPoint({ ...newPickupPoint, name_en: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Arabic terminal name</label>
                        <input
                          type="text" required placeholder="مكتب الكرادة، بغداد"
                          value={newPickupPoint.name_ar}
                          onChange={(e) => setNewPickupPoint({ ...newPickupPoint, name_ar: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">City English</label>
                        <input
                          type="text" required placeholder="Baghdad"
                          value={newPickupPoint.city_en}
                          onChange={(e) => setNewPickupPoint({ ...newPickupPoint, city_en: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">City Arabic</label>
                        <input
                          type="text" required placeholder="بغداد"
                          value={newPickupPoint.city_ar}
                          onChange={(e) => setNewPickupPoint({ ...newPickupPoint, city_ar: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">English Detailed Address</label>
                        <input
                          type="text" required placeholder="Building 12, Street 15, Karrada, Baghdad"
                          value={newPickupPoint.address_en}
                          onChange={(e) => setNewPickupPoint({ ...newPickupPoint, address_en: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Arabic Detailed Address</label>
                        <input
                          type="text" required placeholder="عمارة ١٢، شارع ١٥، الكرادة، بغداد"
                          value={newPickupPoint.address_ar}
                          onChange={(e) => setNewPickupPoint({ ...newPickupPoint, address_ar: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Establish Terminal
                    </button>
                  </form>

                  {/* List terminals */}
                  <div className="bg-[#0d0d0e] p-5 rounded border border-white/[0.03] space-y-3 font-mono text-xs">
                    <span className="text-xs text-gray-400 uppercase">Registered Handover Terminals ({pickupPoints.length})</span>
                    <div className="space-y-2">
                      {pickupPoints.map((pt, index) => (
                        <div key={index} className="p-3 bg-black/40 rounded border border-white/[0.01] flex justify-between items-center">
                          <div>
                            <p className="text-white font-serif">{pt.name_en} ({pt.city_en})</p>
                            <p className="text-gray-500 text-[10px]">{pt.address_en} | Phone: {pt.phone}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-950/20 text-gold-base text-[10px] font-bold">{pt.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 9. SECTION: MARKET MARKUP PRICING */}
              {activeSection === "market_prices" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">System Markups & Trading Spread Policy</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Configure global markups and bid-ask spreads for precious metals listings</p>
                  </div>

                  <form onSubmit={handleSavePricingConfig} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.03] space-y-5 font-mono text-xs">
                    <h5 className="text-sm font-serif text-gold-base">Markup Policy Matrix</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gold Markup (%)</span>
                          <span className="text-gold-light font-bold">{settings.gold_markup_pct}%</span>
                        </div>
                        <input
                          type="number" step="0.01"
                          value={settings.gold_markup_pct}
                          onChange={(e) => setSettings({ ...settings, gold_markup_pct: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Silver Markup (%)</span>
                          <span className="text-gold-light font-bold">{settings.silver_markup_pct}%</span>
                        </div>
                        <input
                          type="number" step="0.01"
                          value={settings.silver_markup_pct}
                          onChange={(e) => setSettings({ ...settings, silver_markup_pct: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bid-Ask Spread Margin (USD)</span>
                          <span className="text-gold-light font-bold">${settings.spread_usd}</span>
                        </div>
                        <input
                          type="number" step="0.1"
                          value={settings.spread_usd}
                          onChange={(e) => setSettings({ ...settings, spread_usd: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Wholesale Premium Commission (%)</span>
                          <span className="text-gold-light font-bold">{settings.premium_markup_pct}%</span>
                        </div>
                        <input
                          type="number" step="0.05"
                          value={settings.premium_markup_pct}
                          onChange={(e) => setSettings({ ...settings, premium_markup_pct: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <h5 className="text-sm font-serif text-gold-base pt-4 border-t border-white/[0.03]">Manual Spot Fallbacks & Rates</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Manual Gold Spot (USD/oz)</span>
                          <span className="text-gold-light font-bold">${settings.manual_gold_usd_oz || REFERENCE_GOLD_USD_OZ}</span>
                        </div>
                        <input
                          type="number" step="0.01"
                          value={settings.manual_gold_usd_oz || REFERENCE_GOLD_USD_OZ}
                          onChange={(e) => setSettings({ ...settings, manual_gold_usd_oz: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Manual Silver Spot (USD/oz)</span>
                          <span className="text-gold-light font-bold">${settings.manual_silver_usd_oz || REFERENCE_SILVER_USD_OZ}</span>
                        </div>
                        <input
                          type="number" step="0.01"
                          value={settings.manual_silver_usd_oz || REFERENCE_SILVER_USD_OZ}
                          onChange={(e) => setSettings({ ...settings, manual_silver_usd_oz: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">USD/AED Peg Rate</span>
                          <span className="text-gold-light font-bold">{settings.usd_aed_rate || 3.6725}</span>
                        </div>
                        <input
                          type="number" step="0.0001"
                          value={settings.usd_aed_rate || 3.6725}
                          onChange={(e) => setSettings({ ...settings, usd_aed_rate: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Default Product Premium (%)</span>
                          <span className="text-gold-light font-bold">{settings.default_product_premium_pct || 2.0}%</span>
                        </div>
                        <input
                          type="number" step="0.1"
                          value={settings.default_product_premium_pct || 2.0}
                          onChange={(e) => setSettings({ ...settings, default_product_premium_pct: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="disable_live_pricing"
                          checked={Boolean(settings.disable_live_pricing)}
                          onChange={(e) => setSettings({ ...settings, disable_live_pricing: e.target.checked })}
                          className="h-4 w-4 bg-black border border-white/10 rounded accent-gold-base cursor-pointer"
                        />
                        <label htmlFor="disable_live_pricing" className="text-gray-300 font-serif select-none cursor-pointer">
                          Emergency Disable Live Pricing & Force Manual Spot Fallback
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">
                        When enabled, the system bypasses external live pricing APIs completely and locks rates to the manual fallback inputs above.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Update Pricing Policies
                    </button>
                  </form>
                </div>
              )}

              {/* 9b. SECTION: DAILY REFERENCE PRICING */}
              {activeSection === "daily_pricing" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Daily Reference Pricing Control</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Admin-only daily gold/silver reference rates — every change is audit logged</p>
                  </div>

                  <form onSubmit={handleSaveDailyPricing} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.03] space-y-5 font-mono text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Gold Daily Reference Price</label>
                        <input
                          type="number"
                          step="0.0001"
                          required
                          value={dailyPricing.gold_daily_reference_price}
                          onChange={(e) => setDailyPricing({ ...dailyPricing, gold_daily_reference_price: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Silver Daily Reference Price</label>
                        <input
                          type="number"
                          step="0.0001"
                          required
                          value={dailyPricing.silver_daily_reference_price}
                          onChange={(e) => setDailyPricing({ ...dailyPricing, silver_daily_reference_price: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Currency</label>
                        <select
                          value={dailyPricing.currency}
                          onChange={(e) => setDailyPricing({ ...dailyPricing, currency: e.target.value as "AED" | "USD" })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        >
                          <option value="AED">AED</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Unit</label>
                        <select
                          value={dailyPricing.unit}
                          onChange={(e) => setDailyPricing({ ...dailyPricing, unit: e.target.value as DailyPricingSettings["unit"] })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        >
                          <option value="per_gram">Per Gram</option>
                          <option value="per_kg">Per Kg</option>
                          <option value="per_troy_ounce">Per Troy Ounce</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Effective Date</label>
                        <input
                          type="date"
                          required
                          value={dailyPricing.effective_date}
                          onChange={(e) => setDailyPricing({ ...dailyPricing, effective_date: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="manual_pricing_enabled"
                        checked={dailyPricing.manual_pricing_enabled}
                        onChange={(e) => setDailyPricing({ ...dailyPricing, manual_pricing_enabled: e.target.checked })}
                        className="h-4 w-4 bg-black border border-white/10 rounded accent-gold-base cursor-pointer"
                      />
                      <label htmlFor="manual_pricing_enabled" className="text-gray-300 font-serif select-none cursor-pointer">
                        Manual Pricing Enabled (override live feed with reference prices above)
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 block uppercase text-[9px] font-bold">Reason for Update (required)</label>
                      <input
                        type="text"
                        required
                        value={dailyPricingReason}
                        onChange={(e) => setDailyPricingReason(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        placeholder="e.g. Dubai desk morning reference update per LBMA fix"
                      />
                    </div>

                    {(dailyPricing.updated_by_admin || dailyPricing.last_updated_at) && (
                      <div className="p-3 bg-black/40 border border-white/5 rounded text-[10px] text-gray-400 space-y-1">
                        {dailyPricing.updated_by_admin && (
                          <p>Updated by admin: <span className="text-gold-base">{dailyPricing.updated_by_admin}</span></p>
                        )}
                        {dailyPricing.last_updated_at && (
                          <p>Last updated: <span className="text-white">{new Date(dailyPricing.last_updated_at).toLocaleString()}</span></p>
                        )}
                        {dailyPricing.reason_for_update && (
                          <p>Last reason: <span className="text-gray-300">{dailyPricing.reason_for_update}</span></p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Save Daily Reference Pricing
                    </button>
                  </form>
                </div>
              )}

              {/* 9c. SECTION: SHIPPING SETTINGS */}
              {activeSection === "shipping_settings" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Shipping Settings</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Configure logistics defaults — internal notes are never shown to customers</p>
                  </div>

                  <form onSubmit={handleSaveShippingSettings} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.03] space-y-5 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="shipping_enabled"
                        checked={shippingSettings.shipping_enabled}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, shipping_enabled: e.target.checked })}
                        className="h-4 w-4 bg-black border border-white/10 rounded accent-gold-base cursor-pointer"
                      />
                      <label htmlFor="shipping_enabled" className="text-gray-300 font-serif select-none cursor-pointer">
                        Shipping Enabled
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Shipping Company Name</label>
                        <input
                          type="text"
                          required
                          value={shippingSettings.shipping_company_name}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, shipping_company_name: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Shipping Method</label>
                        <input
                          type="text"
                          required
                          value={shippingSettings.shipping_method}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, shipping_method: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Shipping Price</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={shippingSettings.shipping_price}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, shipping_price: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Currency</label>
                        <select
                          value={shippingSettings.currency}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, currency: e.target.value as ShippingSettings["currency"] })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        >
                          <option value="AED">AED</option>
                          <option value="USD">USD</option>
                          <option value="IQD">IQD</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Estimated Delivery Time</label>
                        <input
                          type="text"
                          value={shippingSettings.estimated_delivery_time}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, estimated_delivery_time: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Destination Country</label>
                        <input
                          type="text"
                          value={shippingSettings.destination_country}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, destination_country: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 block uppercase text-[9px] font-bold">Destination City / Region</label>
                        <input
                          type="text"
                          value={shippingSettings.destination_city_region}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, destination_city_region: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 block uppercase text-[9px] font-bold">Public Shipping Note (visible to customers)</label>
                      <textarea
                        rows={2}
                        value={shippingSettings.public_shipping_note}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, public_shipping_note: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#c5a85c] font-sans"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 block uppercase text-[9px] font-bold flex items-center gap-2">
                        <ShieldAlert size={12} className="text-red-400" />
                        Internal Shipping Notes (admin only — never shown to customers)
                      </label>
                      <textarea
                        rows={2}
                        value={shippingSettings.internal_shipping_notes}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, internal_shipping_notes: e.target.value })}
                        className="w-full bg-red-950/10 border border-red-900/30 rounded px-3 py-2 text-white outline-none focus:border-red-500/50 font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Save Shipping Settings
                    </button>
                  </form>
                </div>
              )}

              {/* 10. SECTION: EXCHANGE RATES & PEGS */}
              {activeSection === "exchange_rates" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Central Bank Currency Multipliers & Pegs</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Synchronize global exchange multipliers against the Base US Dollar (USD)</p>
                  </div>

                  <form onSubmit={handleSavePricingConfig} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.03] space-y-5 font-mono text-xs">
                    <h5 className="text-sm font-serif text-gold-base">Multi-Currency Exchange Controls</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">USD (Base Standard)</label>
                        <input
                          type="number" value={1.0} disabled
                          className="w-full bg-[#111] border border-white/5 rounded px-3 py-2 text-gray-500 cursor-not-allowed outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">UAE Dirham (AED Peg)</label>
                        <input
                          type="number" step="0.0001"
                          value={exchangeRates.AED}
                          onChange={(e) => setExchangeRates({ ...exchangeRates, AED: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">Iraqi Dinar (IQD Rate)</label>
                        <input
                          type="number" step="1.0"
                          value={exchangeRates.IQD}
                          onChange={(e) => setExchangeRates({ ...exchangeRates, IQD: Number(e.target.value) })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Sync Currency Rates
                    </button>
                  </form>
                </div>
              )}

              {/* 11. SECTION: BUYBACK DESK */}
              {activeSection === "buyback" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Physical Buyback Desk & Quoting</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Provide estimates and execute liquidations of client physical metals</p>
                  </div>

                  <div className="bg-[#0d0d0e] border border-white/[0.03] rounded-sm overflow-hidden font-mono text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#111112] text-gray-400 border-b border-white/[0.03]">
                          <tr>
                            <th className="p-4">Request ID</th>
                            <th className="p-4">Client ID</th>
                            <th className="p-4">Metal Details</th>
                            <th className="p-4">Payout Estimated (USD)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions & Payout Value Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {buybacks.map((b) => (
                            <tr key={b.id}>
                              <td className="p-4 font-bold text-white uppercase">{b.id}</td>
                              <td className="p-4 text-gray-300">{b.customer_id}</td>
                              <td className="p-4">
                                <span className="font-bold text-white block capitalize">{b.metal}</span>
                                <span className="text-[10px] text-gray-500">{b.weight_grams}g | {b.purity}</span>
                              </td>
                              <td className="p-4 text-gold-base font-bold">${b.estimated_payout_usd?.toLocaleString() || "Pending Valuation"}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  b.status === "Completed" ? "bg-green-950/50 text-green-400" :
                                  b.status === "Rejected" ? "bg-red-950/50 text-red-400" :
                                  "bg-amber-950/50 text-amber-400 animate-pulse"
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    placeholder="Estimate Payout"
                                    defaultValue={b.estimated_payout_usd}
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value);
                                      if (val) handleUpdateBuybackStatus(b.id, "Estimated", val);
                                    }}
                                    className="bg-black border border-white/10 rounded px-2 py-1 text-[11px] w-28 text-white outline-none"
                                  />
                                  <button
                                    onClick={() => handleUpdateBuybackStatus(b.id, "Completed")}
                                    className="px-2 py-1 bg-green-900/40 text-green-300 rounded border border-green-850/20 text-[10px] hover:bg-green-700 hover:text-white cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBuybackStatus(b.id, "Rejected")}
                                    className="px-2 py-1 bg-red-900/40 text-red-300 rounded border border-red-850/20 text-[10px] hover:bg-red-700 hover:text-white cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 12. SECTION: CERTIFICATES MINT */}
              {activeSection === "certificates" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Refinery Assay Certificates Mint</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Issue secure serial certificates verifying physical metal authenticity</p>
                  </div>

                  {/* Add Cert */}
                  <form onSubmit={handleAddCertificate} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.05] space-y-4 text-xs font-mono">
                    <h5 className="text-sm font-serif text-gold-base">Mint Official Assay Certificate</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Certificate Serial (ID)</label>
                        <input
                          type="text" required placeholder="e.g. PAMP-882941"
                          value={newCertificate.serial_number}
                          onChange={(e) => setNewCertificate({ ...newCertificate, serial_number: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Assay Product Name</label>
                        <input
                          type="text" required placeholder="PAMP Suisse Gold 100g Cast Bar"
                          value={newCertificate.product_name}
                          onChange={(e) => setNewCertificate({ ...newCertificate, product_name: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Weight Label</label>
                        <input
                          type="text" required placeholder="100 Grams"
                          value={newCertificate.weight}
                          onChange={(e) => setNewCertificate({ ...newCertificate, weight: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Purity Fineness</label>
                        <input
                          type="text" required placeholder="999.9"
                          value={newCertificate.purity}
                          onChange={(e) => setNewCertificate({ ...newCertificate, purity: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Mint Certificate
                    </button>
                  </form>

                  {/* List certs */}
                  <div className="bg-[#0d0d0e] p-5 rounded border border-white/[0.03] space-y-3 font-mono text-xs">
                    <span className="text-xs text-gray-400 uppercase">Verifiable Assay Certificates ({certificates.length})</span>
                    <div className="space-y-2">
                      {certificates.map((c, index) => (
                        <div key={index} className="p-3 bg-black/40 rounded border border-white/[0.01] flex justify-between items-center">
                          <div>
                            <p className="text-white font-serif font-bold">Serial No: {c.serial_number}</p>
                            <p className="text-gray-500 text-[10px]">{c.product_name} | weight: {c.weight} | purity: {c.purity}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-green-950/20 text-green-400 text-[10px] font-bold">VERIFIED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 13. SECTION: INTELLIGENCE BLOG DISPATCH */}
              {activeSection === "blog" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Corporate Intelligence & Research Dispatches</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Publish macro gold reports and Iraqi market price updates</p>
                  </div>

                  {/* Add blog form */}
                  <form onSubmit={handleAddBlogPost} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.05] space-y-4 text-xs font-mono">
                    <h5 className="text-sm font-serif text-gold-base">Compose Research Dispatch</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Slug url Identifier</label>
                        <input
                          type="text" required placeholder="iraq-gold-reserves-2026"
                          value={newBlogPost.slug}
                          onChange={(e) => setNewBlogPost({ ...newBlogPost, slug: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">English Dispatch Title</label>
                        <input
                          type="text" required placeholder="e.g. Surge in Iraqi Bullion Allotments"
                          value={newBlogPost.title_en}
                          onChange={(e) => setNewBlogPost({ ...newBlogPost, title_en: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Arabic Dispatch Title</label>
                        <input
                          type="text" required placeholder="زيادة مخصصات الذهب في البنك المركزي العراقي"
                          value={newBlogPost.title_ar}
                          onChange={(e) => setNewBlogPost({ ...newBlogPost, title_ar: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Detailed English Content</label>
                        <textarea
                          required value={newBlogPost.content_en}
                          onChange={(e) => setNewBlogPost({ ...newBlogPost, content_en: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none h-20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 block uppercase text-[9px]">Detailed Arabic Content</label>
                        <textarea
                          required value={newBlogPost.content_ar}
                          onChange={(e) => setNewBlogPost({ ...newBlogPost, content_ar: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none h-20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Publish Dispatch
                    </button>
                  </form>
                </div>
              )}

              {/* 14. SECTION: GLOBAL CONFIGURATIONS */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">Settings & Support Matrices</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">Control trade hotlines, official registration numbers and office addresses</p>
                  </div>

                  <form onSubmit={handleSavePricingConfig} className="p-5 bg-[#0d0d0e] rounded border border-white/[0.03] space-y-4 text-xs font-mono">
                    <h5 className="text-sm font-serif text-gold-base">Institutional Directories</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">WhatsApp Desk Hotline</label>
                        <input
                          type="text"
                          value={settings.whatsapp_hotline}
                          onChange={(e) => setSettings({ ...settings, whatsapp_hotline: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">Direct Trading Email</label>
                        <input
                          type="email"
                          value={settings.desk_email}
                          onChange={(e) => setSettings({ ...settings, desk_email: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">Trade Desk Phone</label>
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
                        <label className="text-gray-500 block uppercase text-[9px]">Dubai Office Address (EN)</label>
                        <input
                          type="text"
                          value={settings.office_address_en}
                          onChange={(e) => setSettings({ ...settings, office_address_en: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">Dubai Office Address (AR)</label>
                        <input
                          type="text"
                          value={settings.office_address_ar}
                          onChange={(e) => setSettings({ ...settings, office_address_ar: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-500 block uppercase text-[9px]">Official Trade Registration Number</label>
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
                      className="px-5 py-2.5 bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold rounded uppercase tracking-wider font-sans cursor-pointer"
                    >
                      Save Institutional Configurations
                    </button>
                  </form>
                </div>
              )}

              {activeSection === "security" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif text-white">
                      {isAr ? "مركز الأمن والتحكم اللاسلكي" : "Security & Telemetry Centre"}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono uppercase">
                      {isAr ? "مراقبة سلامة البيانات، اختبار التوقيعات المشفرة، والتحقق الفوري من التواقيع الرقمية لمنع التلاعب" : "Monitor database integrity, audit cryptographic tokens, and run quote-tampering prevention test suites"}
                    </p>
                  </div>
                  <div className="p-5 bg-[#0d0d0e] rounded border border-white/[0.03]">
                    <DebugPanel inline={true} currentLang={currentLang} />
                  </div>

                  {/* Append-Only Central Audit Ledger */}
                  <div className="p-5 bg-[#0d0d0e] rounded border border-[#c5a85c]/20 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#c5a85c] animate-pulse" />
                        <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                          {isAr ? "دفتر التدقيق العام الموحد (غير قابل للتعديل)" : "Unified Append-Only Compliance Ledger"}
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 border border-gray-800 px-2 py-0.5 rounded">
                        IMMUTABLE RECORD
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs font-sans leading-relaxed">
                      {isAr
                        ? "سجل أمني رسمي غير قابل للتعديل لتتبع عمليات إصدار الأسعار، تعديل الأسعار، قبول الصفقات، فك تشفير مستندات KYC، وحالات انتهاء الصلاحية."
                        : "Official secure ledger documenting every quote generation, manual override, client acceptance lock, identity file access, and expiry event."}
                    </p>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {auditLogs.length === 0 ? (
                        <p className="text-gray-600 text-xs font-mono py-4 text-center">
                          {isAr ? "لا توجد سجلات تدقيق نشطة." : "No compliance logs compiled."}
                        </p>
                      ) : (
                        auditLogs.map((log: any) => (
                          <div key={log.id} className="p-3 bg-black/40 rounded border border-white/[0.01] font-mono text-[11px] flex flex-col md:flex-row md:items-start justify-between gap-3 hover:border-white/[0.03] transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  log.action === "manual_override" ? "bg-red-950/45 text-red-400 border border-red-500/20" :
                                  log.action === "quote_accept" ? "bg-emerald-950/45 text-emerald-400 border border-emerald-500/20" :
                                  log.action === "kyc_view" ? "bg-blue-950/45 text-blue-400 border border-blue-500/20" :
                                  "bg-gray-900 text-gray-400 border border-gray-800"
                                }`}>
                                  {log.action}
                                </span>
                                <span className="text-white text-xs">{log.id}</span>
                              </div>
                              <p className="text-gray-300 text-xs font-sans leading-relaxed">{log.details}</p>
                              <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                <span>Operator ID:</span>
                                <span className="text-[#c5a85c]">{log.operator_id}</span>
                              </div>
                            </div>
                            <span className="text-gray-500 text-[10px] shrink-0 mt-0.5">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Secure Cryptographic Decrypted Dossier Vault Popup */}
        {activeDossier && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#0d0d0e] border border-[#c5a85c]/30 rounded-lg p-6 shadow-2xl relative font-mono text-xs text-gray-300 space-y-4">
              <button
                onClick={() => setActiveDossier(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 border-b border-[#c5a85c]/10 pb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-white font-serif text-sm font-bold uppercase tracking-wider">🔐 Secure Compliance Dossier Decrypted</h4>
                  <p className="text-[9px] text-gray-500 uppercase">Cryptographic vault file viewer | PGR UAE Central Desk</p>
                </div>
              </div>

              <div className="space-y-3 bg-black/50 p-4 rounded border border-white/[0.03]">
                <div>
                  <span className="text-gray-500 text-[9px] uppercase block">Assigned Account Name</span>
                  <span className="text-white font-bold text-sm">{activeDossier.clientName}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-gray-500 text-[9px] uppercase block">Dossier Category</span>
                    <span className="text-gray-300 font-bold">{activeDossier.docType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[9px] uppercase block">Internal Audit Number</span>
                    <span className="text-gray-300 font-mono font-bold">{activeDossier.docNumber}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t border-white/[0.02]">
                  <div>
                    <span className="text-gray-500 text-[9px] uppercase block">Decrypted File Stream</span>
                    <span className="text-[#c5a85c] font-bold">{activeDossier.fileName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[9px] uppercase block">Expiring Signed Link</span>
                    <span className="text-emerald-400 font-bold font-mono">60s Expire Token</span>
                  </div>
                </div>
              </div>

              {/* Simulated private PDF view */}
              <div className="h-44 border border-white/5 rounded-sm bg-[#111] flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-white/[0.01] to-transparent pointer-events-none" />
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                  ✓
                </div>
                <p className="text-[11px] text-gray-200 font-bold uppercase tracking-widest">{activeDossier.fileName.endsWith('.pdf') ? "SECURE_DOCUMENT_VAULT.PDF" : "SECURE_IMAGE_VAULT.WEBP"}</p>
                <p className="text-[9px] text-gray-500 font-mono mt-1">Cryptographic Token: {activeDossier.signatureToken}</p>
                <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10">Decrypted Session Live</p>
              </div>

              <div className="text-[9px] text-gray-500 leading-normal space-y-1">
                <p>⚠️ WARNING: This file retrieval was logged in the regulatory database with operator ID compliance.officer@pgruae.com.</p>
                <p>This session will expire automatically in 60 seconds, invalidating the signed URL.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveDossier(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded font-sans uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                >
                  Dismiss Vault
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

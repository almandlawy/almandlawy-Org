/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { Product } from "../types";
import { PRODUCTS, BRANDS } from "../data";

// 1. Fetch environment variables safely (client-side only using import.meta.env)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

// Check configuration completeness with strict URL and key verification
const isUrlConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== "YOUR_SUPABASE_URL" && 
  supabaseUrl !== "VITE_SUPABASE_URL" &&
  !supabaseUrl.includes("placeholder") &&
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
);

const isKeyConfigured = Boolean(
  supabaseAnonKey && 
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY" && 
  supabaseAnonKey !== "VITE_SUPABASE_ANON_KEY" &&
  !supabaseAnonKey.includes("placeholder") &&
  supabaseAnonKey.length > 10
);

// We will initialize these safely
let supabaseClient = null;
let initializedSuccessfully = false;

if (isUrlConfigured && isKeyConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    initializedSuccessfully = true;
  } catch (err) {
    console.error("Supabase createClient failed synchronously:", err);
    initializedSuccessfully = false;
  }
}

export const isProduction = typeof window !== "undefined" && window.location.hostname.includes("pgruae.com");

export const isLive = isProduction ? true : (isUrlConfigured && isKeyConfigured && initializedSuccessfully);

// 2. Initialize Supabase client
export const supabase = isLive ? (supabaseClient || (isUrlConfigured && isKeyConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null)) : null;

export const configStatus = {
  urlConfigured: isUrlConfigured ? "YES" : "NO",
  keyConfigured: isKeyConfigured ? "YES" : "NO",
  currentMode: isLive ? "LIVE DATABASE" : "LOCAL SIMULATION",
  supabaseUrl: isUrlConfigured ? supabaseUrl : "Not Configured",
  explainMissing: !isLive 
    ? "Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env secrets/variables to connect to your live Supabase DB."
    : "Connected to live database."
};

// =========================================================================
// LOCAL SIMULATION ENGINE (LocalStorage-backed database matching all requested tables)
// =========================================================================

// Initialize storage schema if not present
const seedLocalStorage = () => {
  if (typeof window === "undefined") return;

  const getOrSet = (key: string, defaultVal: any) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
    }
  };

  // 1. Products & Inventory
  getOrSet("pgr_products", PRODUCTS);
  
  const initialInventory = PRODUCTS.map(p => ({
    product_id: p.id,
    sku: p.id.toUpperCase() + "-MINT",
    barcode: "729000" + Math.floor(100000 + Math.random() * 900000),
    stock: p.id.includes("1kg") ? 4 : Math.floor(10 + Math.random() * 40),
    reserved: 0
  }));
  getOrSet("pgr_inventory", initialInventory);

  // 2. Categories
  getOrSet("pgr_categories", [
    { id: "gold_bars", name_en: "Gold Bars", name_ar: "سبائك الذهب" },
    { id: "silver_bars", name_en: "Silver Bars", name_ar: "سبائك الفضة" },
    { id: "gold_coins", name_en: "Gold Coins", name_ar: "مسكوكات الذهب" },
    { id: "silver_coins", name_en: "Silver Coins", name_ar: "مسكوكات الفضة" }
  ]);

  // 3. Brands
  getOrSet("pgr_brands", BRANDS);

  // 4. Certificates
  getOrSet("pgr_certificates", [
    {
      serial_number: "PAMP-882941",
      qr_code: "https://pgruae.com/verify/PAMP-882941",
      product_name: "PAMP Suisse 100g Cast Gold Bar",
      weight: "100 Grams",
      purity: "999.9 Fine Gold",
      manufacturer: "PAMP Suisse",
      issue_date: "2025-11-12",
      status: "Active / Verified"
    },
    {
      serial_number: "VALC-119302",
      qr_code: "https://pgruae.com/verify/VALC-119302",
      product_name: "Valcambi 1kg Pure Silver Cast Bar",
      weight: "1 Kilogram (1000g)",
      purity: "999.0 Fine Silver",
      manufacturer: "Valcambi",
      issue_date: "2026-01-08",
      status: "Active / Verified"
    },
    {
      serial_number: "RM-BR-55421",
      qr_code: "https://pgruae.com/verify/RM-BR-55421",
      product_name: "Royal Mint Britannia Gold Coin",
      weight: "1 Troy Ounce",
      purity: "999.9 Fine Gold",
      manufacturer: "Royal Mint",
      issue_date: "2026-03-20",
      status: "Active / Verified"
    }
  ]);

  // 5. Quote Requests
  getOrSet("pgr_quote_requests", []);

  // 6. Orders
  const initialOrders = [
    {
      id: "PGR-ORD-10924",
      customer_id: "cust-verified-1",
      created_at: "2026-06-15T14:32:00Z",
      status: "Delivered",
      total_amount: 118400.0,
      currency: "AED",
      shipping_method: "Dubai Delivery",
      payment_method: "Bank Transfer",
      shipping_address: "Penthouse 45, Marina Heights, Dubai Marina",
      billing_address: "Penthouse 45, Marina Heights, Dubai Marina",
      items: [
        { product_id: "gb-100g", quantity: 4, unit_price: 29600.0, product_name: "PAMP Suisse 100g Cast Gold Bar" }
      ]
    },
    {
      id: "PGR-ORD-11530",
      customer_id: "cust-verified-1",
      created_at: "2026-06-25T11:05:00Z",
      status: "Quoted",
      total_amount: 326500.0,
      currency: "AED",
      shipping_method: "Office Pickup",
      payment_method: "Cash Office",
      shipping_address: "PGR Vault Gateway Office, Dubai Marina",
      billing_address: "PGR Vault Gateway Office, Dubai Marina",
      items: [
        { product_id: "gb-1kg", quantity: 1, unit_price: 326500.0, product_name: "PAMP Suisse 1kg Good Delivery Gold Bar" }
      ]
    }
  ];
  getOrSet("pgr_orders", initialOrders);

  // 7. Blog Posts (CMS)
  getOrSet("pgr_blog", [
    {
      id: "blog-1",
      slug: "dubai-gold-tax-guide-2026",
      category: "Gold News",
      title_en: "The Dubai Gold Advantage: Complete 2026 Tax & VAT Guide",
      title_ar: "ميزة ذهب دبي: الدليل الكامل للضرائب وضريبة القيمة مضافة لعام ٢٠٢٦",
      content_en: "Dubai remains the premier globally accredited precious metals hub. Under UAE Federal Tax Law, physical investment gold with a purity of 99.5% or above is subject to 0% Value Added Tax (VAT). This exemption, combined with zero corporate and personal income taxes in the DMCC zone, offers international portfolio holders a dramatic 5-10% cost hedge compared to European and North American channels. PGR UAE provides complete custom-cleared transport directly to our secure, covered vaults.",
      content_ar: "تظل دبي العاصمة العالمية الأبرز لتجارة المعادن الثمينة. بموجب قانون الضرائب الاتحادي لدولة الإمارات، تخضع سبائك الذهب الاستثمارية التي تبلغ نقاوتها ٩٩.٥٪ أو أكثر لضريبة القيمة المضافة بنسبة ٠٪. هذا الإعفاء، بالإضافة لعدم وجود ضرائب دخل في منطقة DMCC، يوفر ميزة مالية تبلغ ٥-١٠٪ مقارنة بالدول الغربية.",
      author: "PGR Advisory Board",
      published_at: "2026-06-01",
      featured: true,
      seo_title: "Dubai Gold Tax & VAT Free Investment Guide 2026",
      seo_description: "Learn why physical gold bullion is 0% VAT in Dubai UAE and how institutional investors structure their portfolios under DMCC zone laws."
    },
    {
      id: "blog-2",
      slug: "inflation-hedging-physical-bullion",
      category: "Investment",
      title_en: "Macroeconomic Inflation Hedging: Silver vs. Gold in 2026",
      title_ar: "التحوط من التضخم الكلي: الفضة مقابل الذهب في عام ٢٠٢٦",
      content_en: "As global currencies face continued quantitative easing, institutional desks are shifting into physical bullion allocations. While gold represents supreme stability and generational wealth, silver is showing extreme upside leverage due to skyrocketing demand in solar photovoltaic arrays and high-frequency military chips. This article explores the optimal 80/20 physical distribution model structured by PGR UAE's bullion desks.",
      content_ar: "مع استمرار التسهيل الكمي في العملات العالمية، تتجه الصناديق الاستثمارية نحو تملك المعادن الثمينة الحرة. يمثل الذهب قمة الاستقرار والأمان، بينما تظهر الفضة عوائد قوية بفضل الطلب الصناعي المتزايد في الألواح الشمسية والرقائق الذكية.",
      author: "Desk Chief Executive",
      published_at: "2026-06-12",
      featured: false,
      seo_title: "Inflation Hedging Gold vs Silver Physical Allocation Model",
      seo_description: "An in-depth analysis of high-net-worth gold and silver portfolio allocation ratios for 2026 macroeconomic safety."
    }
  ]);

  // 8. Contact Messages
  getOrSet("pgr_contact_messages", []);

  // 9. Notifications
  getOrSet("pgr_notifications", [
    { id: "notif-1", title_en: "Bespoke Quote Update", title_ar: "تحديث على مقايسة السعر", content_en: "Your quote request for 1kg PAMP Gold Bar has been approved by the Trader Desk.", content_ar: "تمت الموافقة على طلب التسعير الخاص بك لسبيكة ١ كيلو ذهب من مكتب التداول.", created_at: "2026-06-25T11:10:00Z", unread: true },
    { id: "notif-2", title_en: "Secure Logins Active", title_ar: "نظام تسجيل الدخول الآمن", content_en: "FaceID / Authenticator connection is active for your premium account.", content_ar: "تم تنشيط ميزة الحماية لربط الحساب الآمن.", created_at: "2026-06-20T08:00:00Z", unread: false }
  ]);

  // 10. Current active user profile
  if (!isProduction) {
    getOrSet("pgr_user", {
      id: "cust-verified-1",
      email: "verified.investor@dubaimarina.ae",
      name: "Sheikh Mansoor Al-Maktoum",
      phone: "+971 50 999 8888",
      company: "Elite Asset Holdings Ltd",
      addresses: [
        { id: "add-1", label: "Primary Vault Marina", address: "Penthouse 45, Marina Heights, Dubai Marina, UAE" },
        { id: "add-2", label: "DMCC Storage Center", address: "Vault Block B, Almas Tower, DMCC Precinct, Dubai" }
      ],
      wishlist: ["gb-1kg", "gc-britannia"],
      role: "verified_customer", // or "admin"
      created_at: "2026-01-01T00:00:00Z"
    });
  } else {
    localStorage.removeItem("pgr_user");
  }

  // 11. Global Admin Settings (fees, markups)
  getOrSet("pgr_settings", {
    gold_markup_pct: 0.8, // 0.8% admin markup on spot prices
    silver_markup_pct: 1.5,
    spread_usd: 12.0, // Spread between bid and ask
    premium_markup_pct: 2.0, // Wholesale processing premium fee
    whatsapp_hotline: "+971509998888",
    desk_email: "desk@pgruae.com",
    trade_phone: "+971 4 445 8888",
    office_address_en: "Almas Tower, DMCC Precinct, Dubai Marina, Dubai, United Arab Emirates",
    office_address_ar: "برج الماس، منطقة مركز دبي للسلع المتعددة (DMCC)، دبي مارينا، دبي، الإمارات العربية المتحدة",
    dmcc_reg_no: "890317"
  });

  // 12. Exchange Rates (AED / USD / IQD)
  getOrSet("pgr_exchange_rates", {
    USD: 1.0,
    AED: 3.6725,
    IQD: 1310.0
  });

  // 13. Pickup Points / Offices (Admin-managed)
  getOrSet("pgr_pickup_points", [
    {
      id: "pickup-1",
      name_en: "Baghdad Partner Distribution Point",
      name_ar: "نقطة استلام بغداد الشريكة",
      city_en: "Baghdad",
      city_ar: "بغداد",
      address_en: "Al-Mansour District, Near Baghdad Mall",
      address_ar: "حي المنصور، بالقرب من بغداد مول",
      phone: "+964 770 123 4567",
      whatsapp: "+964 770 123 4567",
      working_hours_en: "Sun - Thu: 10:00 AM - 4:00 PM AST",
      working_hours_ar: "الأحد - الخميس: ١٠:٠٠ صباحاً - ٤:٠٠ مساءً",
      maps_link: "https://maps.google.com",
      status: "Partner Pickup Point"
    }
  ]);

  // 14. KYC profiles and Documents
  getOrSet("pgr_kyc_profiles", [
    {
      id: "cust-verified-1",
      full_name: "Sheikh Mansoor Al-Maktoum",
      phone: "+971 50 999 8888",
      whatsapp: "+971 50 999 8888",
      email: "verified.investor@dubaimarina.ae",
      country: "UAE",
      city: "Dubai",
      nationality: "Emirati",
      dob: "1985-05-15",
      source_of_funds_declaration: "Trading Cashflow",
      agreement_accepted: true,
      privacy_consent: true,
      status: "Verified",
      documents: [
        {
          id: "doc-1",
          type: "Emirates ID",
          number: "784-1985-1234567-1",
          status: "Verified",
          updated_at: "2026-01-02T10:00:00Z"
        }
      ],
      verified_at: "2026-01-02T12:00:00Z"
    }
  ]);

  // 15. Iraq Delivery Requests
  getOrSet("pgr_iraq_delivery_requests", [
    {
      id: "del-1",
      customer_id: "cust-verified-1",
      order_id: "PGR-ORD-10924",
      governorate: "Baghdad",
      address_details: "Al-Mansour District, Block 12, Street 15",
      phone: "+964 770 123 4567",
      status: "Delivered",
      created_at: "2026-06-16T08:00:00Z",
      customs_docs_status: "Approved"
    }
  ]);

  // 16. Bullion Ownership / Investment Accounts
  getOrSet("pgr_investment_accounts", [
    {
      id: "inv-gold",
      customer_id: "cust-verified-1",
      metal: "gold",
      weight_grams: 250,
      average_purchase_price_usd: 75.40,
      total_purchase_amount_usd: 18850.00,
      current_market_value_usd: 19125.00,
      daily_change_percent: 0.28,
      monthly_change_percent: 1.45
    },
    {
      id: "inv-silver",
      customer_id: "cust-verified-1",
      metal: "silver",
      weight_grams: 2000,
      average_purchase_price_usd: 0.92,
      total_purchase_amount_usd: 1840.00,
      current_market_value_usd: 1880.00,
      daily_change_percent: -0.15,
      monthly_change_percent: 2.10
    }
  ]);

  // 17. Buyback Requests
  getOrSet("pgr_buyback_requests", [
    {
      id: "buy-1",
      customer_id: "cust-verified-1",
      metal: "gold",
      weight_grams: 50,
      purity: "Au 99.99%",
      status: "Completed",
      estimated_payout_usd: 3780.00,
      exchange_rate_iqd: 1310.0,
      created_at: "2026-06-21T09:15:00Z"
    }
  ]);

  // 18. Admin Users emails
  getOrSet("pgr_admin_users", ["almandlawy112@gmail.com", "admin@pgruae.com"]);
};

// Seed initial localStorage items on import
if (typeof window !== "undefined") {
  seedLocalStorage();
}

// Helper functions for mock storage CRUD
export const mockDb = {
  get: (key: string) => {
    if (typeof window === "undefined") return [];
    if (isProduction) {
      const privateKeys = [
        "pgr_user",
        "pgr_orders",
        "pgr_kyc_profiles",
        "pgr_iraq_delivery_requests",
        "pgr_investment_accounts",
        "pgr_buyback_requests",
        "pgr_quote_requests",
        "pgr_notifications"
      ];
      if (privateKeys.includes(key)) {
        if (key === "pgr_user") return null;
        return [];
      }
    }
    return JSON.parse(localStorage.getItem(key) || "[]");
  },
  set: (key: string, data: any) => {
    if (typeof window === "undefined") return;
    if (isProduction) {
      const privateKeys = [
        "pgr_user",
        "pgr_orders",
        "pgr_kyc_profiles",
        "pgr_iraq_delivery_requests",
        "pgr_investment_accounts",
        "pgr_buyback_requests",
        "pgr_quote_requests",
        "pgr_notifications"
      ];
      if (privateKeys.includes(key)) return;
    }
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Auth Operations
  auth: {
    getUser: () => {
      if (typeof window === "undefined" || isProduction) return null;
      return JSON.parse(localStorage.getItem("pgr_user") || "null");
    },
    setUser: (userData: any) => {
      if (isProduction) return;
      localStorage.setItem("pgr_user", JSON.stringify(userData));
    },
    logout: () => {
      localStorage.removeItem("pgr_user");
    }
  },

  // Table generic query methods for clean routing
  query: (tableName: string) => {
    const key = `pgr_${tableName}`;
    const data = mockDb.get(key);
    return {
      select: async () => data,
      insert: async (item: any) => {
        const id = item.id || `item-${Math.floor(100000 + Math.random() * 900000)}`;
        const newItem = { ...item, id, created_at: new Date().toISOString() };
        data.push(newItem);
        mockDb.set(key, data);
        return newItem;
      },
      update: async (id: string, updates: any) => {
        const updatedList = data.map((item: any) => 
          item.id === id ? { ...item, ...updates } : item
        );
        mockDb.set(key, updatedList);
        return updatedList.find((item: any) => item.id === id);
      },
      delete: async (id: string) => {
        const filtered = data.filter((item: any) => item.id !== id);
        mockDb.set(key, filtered);
        return true;
      }
    };
  }
};

// =========================================================================
// UNIVERSAL DATA ACCESS LAYER (dbService)
// Transparently routes queries to Live Supabase (if connected) or Local Storage
// =========================================================================
export const dbService = {
  products: {
    list: async (): Promise<Product[]> => {
      if (isLive && supabase) {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data) return data as Product[];
      }
      return mockDb.get("pgr_products");
    },
    save: async (product: any) => {
      if (isLive && supabase) {
        const { data, error } = await supabase.from("products").upsert(product).select();
        if (error) throw new Error(error.message || JSON.stringify(error));
        if (data) return data[0];
      }
      const list = mockDb.get("pgr_products");
      const index = list.findIndex((p: any) => p.id === product.id);
      if (index > -1) {
        list[index] = { ...list[index], ...product };
      } else {
        list.push(product);
      }
      mockDb.set("pgr_products", list);
      return product;
    },
    delete: async (id: string) => {
      if (isLive && supabase) {
        await supabase.from("products").delete().eq("id", id);
        return true;
      }
      const list = mockDb.get("pgr_products");
      mockDb.set("pgr_products", list.filter((p: any) => p.id !== id));
      return true;
    }
  },

  orders: {
    list: async () => {
      if (isLive && supabase) {
        const { data } = await supabase.from("orders").select("*, order_items(*)");
        if (data) return data;
      }
      return mockDb.get("pgr_orders");
    },
    create: async (order: any) => {
      if (isLive && supabase) {
        const { data, error } = await supabase.from("orders").insert(order).select();
        if (!error && data) return data[0];
      }
      const orders = mockDb.get("pgr_orders");
      const id = order.id || `PGR-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder = {
        ...order,
        id,
        created_at: new Date().toISOString(),
        status: order.status || "Pending"
      };
      orders.unshift(newOrder);
      mockDb.set("pgr_orders", orders);
      return newOrder;
    },
    updateStatus: async (orderId: string, status: string, totalAmount?: number) => {
      if (isLive && supabase) {
        const updates: any = { status };
        if (totalAmount !== undefined) updates.total_amount = totalAmount;
        const { data } = await supabase.from("orders").update(updates).eq("id", orderId).select();
        if (data) return data[0];
      }
      const orders = mockDb.get("pgr_orders");
      const index = orders.findIndex((o: any) => o.id === orderId);
      if (index > -1) {
        orders[index].status = status;
        if (totalAmount !== undefined) orders[index].total_amount = totalAmount;
        mockDb.set("pgr_orders", orders);
        return orders[index];
      }
      return null;
    },
    update: async (orderId: string, updates: any) => {
      if (isLive && supabase) {
        const { data, error } = await supabase.from("orders").update(updates).eq("id", orderId).select();
        if (error) throw new Error(error.message);
        if (data) return data[0];
      }
      const orders = mockDb.get("pgr_orders");
      const index = orders.findIndex((o: any) => o.id === orderId);
      if (index > -1) {
        orders[index] = { ...orders[index], ...updates };
        mockDb.set("pgr_orders", orders);
        return orders[index];
      }
      return null;
    }
  },

  quoteRequests: {
    list: async () => {
      if (isLive && supabase) {
        const { data } = await supabase.from("quote_requests").select("*");
        if (data) return data;
      }
      return mockDb.get("pgr_quote_requests");
    },
    create: async (request: any) => {
      if (isLive && supabase) {
        const { data, error } = await supabase.from("quote_requests").insert(request).select();
        if (!error && data) return data[0];
      }
      const quotes = mockDb.get("pgr_quote_requests");
      const id = `PGR-QT-${Math.floor(100000 + Math.random() * 900000)}`;
      const newRequest = {
        ...request,
        id,
        created_at: new Date().toISOString(),
        status: "Pending"
      };
      quotes.unshift(newRequest);
      mockDb.set("pgr_quote_requests", quotes);
      return newRequest;
    },
    updateStatus: async (id: string, status: string) => {
      const quotes = mockDb.get("pgr_quote_requests");
      const index = quotes.findIndex((q: any) => q.id === id);
      if (index > -1) {
        quotes[index].status = status;
        mockDb.set("pgr_quote_requests", quotes);
        return quotes[index];
      }
      return null;
    }
  },

  certificates: {
    verify: async (serial: string) => {
      if (isLive && supabase) {
        const { data } = await supabase.from("certificates").select("*").eq("serial_number", serial).single();
        if (data) return data;
      }
      const certs = mockDb.get("pgr_certificates");
      return certs.find((c: any) => c.serial_number.toLowerCase() === serial.trim().toLowerCase()) || null;
    },
    listAll: async () => {
      return mockDb.get("pgr_certificates") || [];
    },
    create: async (cert: any) => {
      const list = mockDb.get("pgr_certificates") || [];
      cert.id = cert.id || `cert-${Date.now()}`;
      list.unshift(cert);
      mockDb.set("pgr_certificates", list);
      return cert;
    }
  },

  blog: {
    list: async () => {
      if (isLive && supabase) {
        const { data } = await supabase.from("blog").select("*");
        if (data) return data;
      }
      return mockDb.get("pgr_blog");
    },
    save: async (post: any) => {
      const posts = mockDb.get("pgr_blog");
      const index = posts.findIndex((p: any) => p.id === post.id);
      if (index > -1) {
        posts[index] = { ...posts[index], ...post };
      } else {
        post.id = post.id || `blog-${Date.now()}`;
        posts.unshift(post);
      }
      mockDb.set("pgr_blog", posts);
      return post;
    },
    create: async (post: any) => {
      return dbService.blog.save(post);
    }
  },

  notifications: {
    list: async () => {
      return mockDb.get("pgr_notifications");
    },
    markAllRead: async () => {
      const notifs = mockDb.get("pgr_notifications").map((n: any) => ({ ...n, unread: false }));
      mockDb.set("pgr_notifications", notifs);
      return notifs;
    }
  },

  settings: {
    get: async () => {
      return mockDb.get("pgr_settings");
    },
    update: async (newSettings: any) => {
      const current = mockDb.get("pgr_settings");
      const updated = { ...current, ...newSettings };
      mockDb.set("pgr_settings", updated);
      return updated;
    }
  },

  inventory: {
    list: async () => {
      return mockDb.get("pgr_inventory");
    },
    updateStock: async (productId: string, newStock: number) => {
      const inv = mockDb.get("pgr_inventory");
      const index = inv.findIndex((i: any) => i.product_id === productId);
      if (index > -1) {
        inv[index].stock = newStock;
        mockDb.set("pgr_inventory", inv);
        return inv[index];
      }
      return null;
    }
  },

  exchangeRates: {
    get: async () => {
      return mockDb.get("pgr_exchange_rates") || { USD: 1.0, AED: 3.6725, IQD: 1310.0 };
    },
    update: async (rates: any) => {
      mockDb.set("pgr_exchange_rates", rates);
      return rates;
    }
  },

  pickupPoints: {
    list: async () => {
      return mockDb.get("pgr_pickup_points") || [];
    },
    save: async (point: any) => {
      const list = mockDb.get("pgr_pickup_points") || [];
      const index = list.findIndex((p: any) => p.id === point.id);
      if (index > -1) {
        list[index] = { ...list[index], ...point };
      } else {
        point.id = point.id || `pickup-${Date.now()}`;
        list.push(point);
      }
      mockDb.set("pgr_pickup_points", list);
      return point;
    },
    create: async (point: any) => {
      return dbService.pickupPoints.save(point);
    },
    delete: async (id: string) => {
      const list = mockDb.get("pgr_pickup_points") || [];
      mockDb.set("pgr_pickup_points", list.filter((p: any) => p.id !== id));
      return true;
    }
  },

  kyc: {
    get: async (customerId: string) => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("kyc_profiles").select("*").eq("id", customerId).maybeSingle();
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to fetch KYC profile from Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_kyc_profiles") || [];
      return list.find((p: any) => p.id === customerId) || {
        id: customerId,
        full_name: "",
        phone: "",
        whatsapp: "",
        email: "",
        country: "",
        city: "",
        nationality: "",
        dob: "",
        source_of_funds_declaration: "",
        agreement_accepted: false,
        privacy_consent: false,
        status: "Not submitted",
        documents: []
      };
    },
    save: async (customerId: string, profile: any) => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("kyc_profiles").upsert({ ...profile, id: customerId }).select();
          if (!error && data) return data[0];
        } catch (err) {
          console.error("Failed to save KYC profile to Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_kyc_profiles") || [];
      const index = list.findIndex((p: any) => p.id === customerId);
      const updatedProfile = { ...profile, id: customerId };
      if (index > -1) {
        list[index] = { ...list[index], ...updatedProfile };
      } else {
        list.push(updatedProfile);
      }
      mockDb.set("pgr_kyc_profiles", list);
      return updatedProfile;
    },
    update: async (profile: any) => {
      return dbService.kyc.save(profile.id, profile);
    },
    listAll: async () => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("kyc_profiles").select("*");
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to list KYC profiles from Supabase:", err);
        }
      }
      return mockDb.get("pgr_kyc_profiles") || [];
    }
  },

  iraqDelivery: {
    list: async (customerId?: string) => {
      if (isLive && supabase) {
        try {
          let query = supabase.from("iraq_delivery_requests").select("*");
          if (customerId) query = query.eq("customer_id", customerId);
          const { data, error } = await query;
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to fetch Iraq deliveries from Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_iraq_delivery_requests") || [];
      if (customerId) {
        return list.filter((r: any) => r.customer_id === customerId);
      }
      return list;
    },
    create: async (request: any) => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("iraq_delivery_requests").insert(request).select();
          if (!error && data) return data[0];
        } catch (err) {
          console.error("Failed to create Iraq delivery on Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_iraq_delivery_requests") || [];
      request.id = request.id || `del-${Date.now()}`;
      request.created_at = request.created_at || new Date().toISOString();
      request.status = request.status || "Request received";
      list.unshift(request);
      mockDb.set("pgr_iraq_delivery_requests", list);
      return request;
    },
    updateStatus: async (id: string, status: string) => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("iraq_delivery_requests").update({ status }).eq("id", id).select();
          if (!error && data) return data[0];
        } catch (err) {
          console.error("Failed to update Iraq delivery status on Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_iraq_delivery_requests") || [];
      const index = list.findIndex((r: any) => r.id === id);
      if (index > -1) {
        list[index].status = status;
        mockDb.set("pgr_iraq_delivery_requests", list);
        return list[index];
      }
      return null;
    }
  },

  investment: {
    getAccounts: async (customerId: string) => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("investment_accounts").select("*").eq("customer_id", customerId);
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to fetch investment accounts from Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_investment_accounts") || [];
      return list.filter((a: any) => a.customer_id === customerId);
    },
    saveAccount: async (account: any) => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("investment_accounts").upsert(account).select();
          if (!error && data) return data[0];
        } catch (err) {
          console.error("Failed to save investment account to Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_investment_accounts") || [];
      const index = list.findIndex((a: any) => a.id === account.id);
      if (index > -1) {
        list[index] = { ...list[index], ...account };
      } else {
        account.id = account.id || `inv-${Date.now()}`;
        list.push(account);
      }
      mockDb.set("pgr_investment_accounts", list);
      return account;
    },
    listAll: async () => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("investment_accounts").select("*");
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to list all investment accounts from Supabase:", err);
        }
      }
      return mockDb.get("pgr_investment_accounts") || [];
    }
  },

  buyback: {
    list: async (customerId?: string) => {
      if (isLive && supabase) {
        try {
          let query = supabase.from("buyback_requests").select("*");
          if (customerId) query = query.eq("customer_id", customerId);
          const { data, error } = await query;
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to fetch buybacks from Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_buyback_requests") || [];
      if (customerId) {
        return list.filter((r: any) => r.customer_id === customerId);
      }
      return list;
    },
    create: async (request: any) => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("buyback_requests").insert(request).select();
          if (!error && data) return data[0];
        } catch (err) {
          console.error("Failed to create buyback request on Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_buyback_requests") || [];
      request.id = request.id || `buy-${Date.now()}`;
      request.created_at = request.created_at || new Date().toISOString();
      request.status = request.status || "Pending";
      list.unshift(request);
      mockDb.set("pgr_buyback_requests", list);
      return request;
    },
    updateStatus: async (id: string, status: string, estimatedPayout?: number) => {
      if (isLive && supabase) {
        try {
          const updates: any = { status };
          if (estimatedPayout !== undefined) updates.estimated_payout_usd = estimatedPayout;
          const { data, error } = await supabase.from("buyback_requests").update(updates).eq("id", id).select();
          if (!error && data) return data[0];
        } catch (err) {
          console.error("Failed to update buyback request status on Supabase:", err);
        }
      }
      const list = mockDb.get("pgr_buyback_requests") || [];
      const index = list.findIndex((r: any) => r.id === id);
      if (index > -1) {
        list[index].status = status;
        if (estimatedPayout !== undefined) list[index].estimated_payout_usd = estimatedPayout;
        mockDb.set("pgr_buyback_requests", list);
        return list[index];
      }
      return null;
    }
  },

  adminUsers: {
    checkEmail: async (email: string): Promise<boolean> => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase
            .from("admin_users")
            .select("email")
            .eq("email", email.trim().toLowerCase());
          if (!error && data && data.length > 0) return true;
        } catch (err) {
          console.error("Failed to check admin_users in Supabase:", err);
        }
      }
      // Local fallback check
      const adminList = mockDb.get("pgr_admin_users") || ["almandlawy112@gmail.com", "admin@pgruae.com"];
      return adminList.map((e: string) => e.toLowerCase()).includes(email.trim().toLowerCase());
    }
  },

  auth: {
    signInWithGoogle: async (redirectToUrl?: string) => {
      const redirect = redirectToUrl || window.location.origin;
      if (isLive && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirect
          }
        });
        if (error) throw error;
      } else {
        // Mock Google login as an admin
        const mockGoogleUser = {
          id: "google-mock-user-1",
          email: "almandlawy112@gmail.com",
          name: "Abbas Al-Mandlawy",
          role: "admin",
          created_at: new Date().toISOString()
        };
        mockDb.auth.setUser(mockGoogleUser);
        return mockGoogleUser;
      }
    },
    logout: async () => {
      if (isLive && supabase) {
        await supabase.auth.signOut();
      }
      mockDb.auth.logout();
    }
  },

  storage: {
    uploadProductImage: async (file: File): Promise<string> => {
      if (isLive && supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        return data.publicUrl;
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }
};

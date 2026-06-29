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
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "implicit" as const
  }
};

let supabaseClient = null;
let initializedSuccessfully = false;

if (isUrlConfigured && isKeyConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
    initializedSuccessfully = true;
  } catch (err) {
    console.error("Supabase createClient failed synchronously:", err);
    initializedSuccessfully = false;
  }
}

export const isProduction = typeof window !== "undefined" && window.location.hostname.includes("pgruae.com");

export const isLive = isProduction ? true : (isUrlConfigured && isKeyConfigured && initializedSuccessfully);

// 2. Initialize Supabase client safely using the pre-initialized instance
export const supabase = isLive ? supabaseClient : null;

export const configStatus = {
  urlConfigured: isUrlConfigured ? "YES" : "NO",
  keyConfigured: isKeyConfigured ? "YES" : "NO",
  currentMode: isLive ? "LIVE DATABASE" : "LOCAL SIMULATION",
  supabaseUrl: isUrlConfigured ? supabaseUrl : "Not Configured",
  explainMissing: !isLive 
    ? "Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env secrets/variables to connect to your live Supabase DB."
    : "Connected to live database."
};

// Safe storage wrapper that falls back to in-memory dictionary if localStorage throws SecurityError or is unavailable
const memoryStorage: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Storage access blocked, using memory fallback:", e);
    }
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn("Storage access blocked, using memory fallback:", e);
    }
    memoryStorage[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn("Storage access blocked, using memory fallback:", e);
    }
    delete memoryStorage[key];
  }
};

// =========================================================================
// LOCAL SIMULATION ENGINE (LocalStorage-backed database matching all requested tables)
// =========================================================================

// Initialize storage schema if not present
const seedLocalStorage = () => {
  if (typeof window === "undefined") return;

  const getOrSet = (key: string, defaultVal: any) => {
    const existing = safeStorage.getItem(key);
    if (!existing) {
      safeStorage.setItem(key, JSON.stringify(defaultVal));
    }
  };

  // Check if we already have products and if it's the old/limited list (e.g., < 15 items)
  let existingProductsRaw = safeStorage.getItem("pgr_products");
  let shouldSeedProducts = !existingProductsRaw;
  if (existingProductsRaw) {
    try {
      const parsed = JSON.parse(existingProductsRaw);
      if (Array.isArray(parsed) && parsed.length < 15) {
        shouldSeedProducts = true;
      }
    } catch (e) {
      shouldSeedProducts = true;
    }
  }

  if (shouldSeedProducts) {
    safeStorage.setItem("pgr_products", JSON.stringify(PRODUCTS));
    
    const initialInventory = PRODUCTS.map(p => ({
      product_id: p.id,
      sku: p.id.toUpperCase() + "-MINT",
      barcode: "729000" + Math.floor(100000 + Math.random() * 900000),
      stock: p.id.includes("1kg") ? 4 : Math.floor(10 + Math.random() * 40),
      reserved: 0
    }));
    safeStorage.setItem("pgr_inventory", JSON.stringify(initialInventory));
  } else {
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
  }

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
  if (!isProduction) {
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
          { product_id: "gb-1kg", quantity: 1, unit_price: 326500.0, product_name: "PAMP Suisse 1kg Certified Gold Bar" }
        ]
      }
    ];
    getOrSet("pgr_orders", initialOrders);
  } else {
    safeStorage.removeItem("pgr_orders");
  }

  // 7. Blog Posts (CMS)
  getOrSet("pgr_blog", [
    {
      id: "blog-1",
      slug: "dubai-gold-tax-guide-2026",
      category: "Gold News",
      title_en: "The Dubai Gold Advantage: Complete 2026 Tax & VAT Guide",
      title_ar: "ميزة ذهب دبي: الدليل الكامل للضرائب وضريبة القيمة مضافة لعام ٢٠٢٦",
      content_en: "Dubai remains the premier globally accredited precious metals hub. Under UAE Federal Tax Law, physical investment gold with a purity of 99.5% or above is subject to 0% Value Added Tax (VAT). This exemption, combined with zero corporate and personal income taxes in the region, offers international portfolio holders a dramatic 5-10% cost hedge compared to European and North American channels. PGR UAE provides complete custom-cleared transport directly to our secure, covered vaults.",
      content_ar: "تظل دبي العاصمة العالمية الأبرز لتجارة المعادن الثمينة. بموجب قانون الضرائب الاتحادي لدولة الإمارات، تخضع سبائك الذهب الاستثمارية التي تبلغ نقاوتها ٩٩.٥٪ أو أكثر لضريبة القيمة المضافة بنسبة ٠٪. هذا الإعفاء، بالإضافة لعدم وجود ضرائب دخل في المنطقة، يوفر ميزة مالية تبلغ ٥-١٠٪ مقارنة بالدول الغربية.",
      author: "PGR Advisory Board",
      published_at: "2026-06-01",
      featured: true,
      seo_title: "Dubai Gold Tax & VAT Free Investment Guide 2026",
      seo_description: "Learn why physical gold bullion is 0% VAT in Dubai UAE and how institutional investors structure their portfolios under UAE laws."
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
  if (!isProduction) {
    getOrSet("pgr_notifications", [
      { id: "notif-1", title_en: "Bespoke Quote Update", title_ar: "تحديث على مقايسة السعر", content_en: "Your quote request for 1kg PAMP Gold Bar has been approved by the Trader Desk.", content_ar: "تمت الموافقة على طلب التسعير الخاص بك لسبيكة ١ كيلو ذهب من مكتب التداول.", created_at: "2026-06-25T11:10:00Z", unread: true },
      { id: "notif-2", title_en: "Secure Logins Active", title_ar: "نظام تسجيل الدخول الآمن", content_en: "FaceID / Authenticator connection is active for your premium account.", content_ar: "تم تنشيط ميزة الحماية لربط الحساب الآمن.", created_at: "2026-06-20T08:00:00Z", unread: false }
    ]);
  } else {
    safeStorage.removeItem("pgr_notifications");
  }

  // 10. Current active user profile
  if (!isProduction) {
    getOrSet("pgr_user", {
      id: "cust-verified-1",
      email: "verified.investor@dubaimarina.ae",
      name: "Sheikh Mansoor Al-Maktoum",
      phone: "+971 55 968 8837",
      company: "Elite Asset Holdings Ltd",
      addresses: [
        { id: "add-1", label: "Primary Vault Marina", address: "Penthouse 45, Marina Heights, Dubai Marina, UAE" },
        { id: "add-2", label: "Premium Storage Center", address: "Vault Block B, Almas Tower, West Trade Zone, Dubai" }
      ],
      wishlist: ["gb-1kg", "gc-britannia"],
      role: "verified_customer", // or "admin"
      created_at: "2026-01-01T00:00:00Z"
    });
  } else {
    safeStorage.removeItem("pgr_user");
  }

  // 11. Global Admin Settings (fees, markups)
  getOrSet("pgr_settings", {
    gold_markup_pct: 0.8, // 0.8% admin markup on spot prices
    silver_markup_pct: 1.5,
    spread_usd: 12.0, // Spread between bid and ask
    premium_markup_pct: 2.0, // Wholesale processing premium fee
    whatsapp_hotline: "+971559688837",
    desk_email: "desk@pgruae.com",
    trade_phone: "+971 4 445 8888",
    office_address_en: "Almas Tower, West Trade Zone, Dubai Marina, Dubai, United Arab Emirates",
    office_address_ar: "برج الماس، منطقة التداول الحرة، دبي مارينا، دبي، الإمارات العربية المتحدة",
    dmcc_reg_no: "890317",
    manual_gold_usd_oz: 2365.40,
    manual_silver_usd_oz: 29.85,
    usd_aed_rate: 3.6725,
    default_product_premium_pct: 2.0,
    disable_live_pricing: false
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
  if (!isProduction) {
    getOrSet("pgr_kyc_profiles", [
      {
        id: "cust-verified-1",
        full_name: "Sheikh Mansoor Al-Maktoum",
        phone: "+971 55 968 8837",
        whatsapp: "+971 55 968 8837",
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
  } else {
    safeStorage.removeItem("pgr_kyc_profiles");
  }

  // 15. Iraq Delivery Requests
  if (!isProduction) {
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
  } else {
    safeStorage.removeItem("pgr_iraq_delivery_requests");
  }

  // 16. Bullion Ownership / Investment Accounts
  if (!isProduction) {
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
  } else {
    safeStorage.removeItem("pgr_investment_accounts");
  }

  // 17. Buyback Requests
  if (!isProduction) {
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
  } else {
    safeStorage.removeItem("pgr_buyback_requests");
  }

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
    return JSON.parse(safeStorage.getItem(key) || "[]");
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
    safeStorage.setItem(key, JSON.stringify(data));
  },

  // Auth Operations
  auth: {
    getUser: () => {
      if (typeof window === "undefined" || isProduction) return null;
      return JSON.parse(safeStorage.getItem("pgr_user") || "null");
    },
    setUser: (userData: any) => {
      if (isProduction) return;
      safeStorage.setItem("pgr_user", JSON.stringify(userData));
    },
    logout: () => {
      safeStorage.removeItem("pgr_user");
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

export const getRedirectUrl = () => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const pathname = window.location.pathname;

    if (origin.includes("pgruae.com") && pathname.startsWith("/admin")) {
      return "https://pgruae.com/admin";
    }

    if (origin.includes("pgruae.com")) {
      return "https://pgruae.com";
    }

    return origin + pathname;
  }

  return "https://pgruae.com";
};

// Bidirectional mappers for product to resolve table field mismatches in Supabase
export const mapDbProductToFrontend = (dbProd: any): any => {
  if (!dbProd) return null;
  const isGold = dbProd.metal_type === "gold" || dbProd.category?.includes("gold") || false;
  
  let frontendCategory = "gold_bars";
  const dbCat = String(dbProd.category || "").toLowerCase();
  if (dbCat === "coin") {
    frontendCategory = isGold ? "gold_coins" : "silver_coins";
  } else if (dbCat === "silver") {
    frontendCategory = "silver_bars";
  } else if (dbCat === "gold") {
    frontendCategory = "gold_bars";
  } else {
    if (dbCat.includes("coin")) {
      frontendCategory = isGold ? "gold_coins" : "silver_coins";
    } else if (dbCat.includes("silver")) {
      frontendCategory = "silver_bars";
    } else {
      frontendCategory = "gold_bars";
    }
  }

  return {
    id: dbProd.id,
    name_en: dbProd.name || "",
    name_ar: dbProd.arabic_name || dbProd.name || "",
    category: frontendCategory,
    weight_label: `${dbProd.weight_grams || 100} Grams`,
    purity: dbProd.purity || "999.9",
    manufacturer: dbProd.brand || "PAMP Suisse",
    country_en: isGold ? "Switzerland" : "Switzerland",
    country_ar: isGold ? "سويسرا" : "سويسرا",
    availability: dbProd.availability || "In Stock",
    certificate_en: "Assay Certificate Certified",
    certificate_ar: "شهادة معتمدة",
    description_en: dbProd.description || "High-Purity Bullion Bar",
    description_ar: dbProd.arabic_description || "سبائك عالية النقاء والجودة",
    technical_specs: {
      weight_grams: Number(dbProd.weight_grams) || 100,
      purity: dbProd.purity || "999.9",
      metal: (dbProd.metal_type || (isGold ? "gold" : "silver")) as "gold" | "silver"
    },
    image_placeholder: (isGold ? "gold_bar" : "silver_bar") as any,
    premium_multiplier: 1.025,
    brand: dbProd.brand || "PAMP Suisse",
    price: Number(dbProd.price) || 0,
    price_mode: (dbProd.price_mode || "spot") as "spot" | "fixed",
    image_url: dbProd.image_url || undefined,
    stock_status: dbProd.stock_status || "In Stock",
    certificate_url: dbProd.certificate_url || undefined,
    published: dbProd.published !== undefined ? dbProd.published : true
  };
};

export const isUUID = (val: any): boolean => {
  if (typeof val !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

export const mapFrontendProductToDb = (product: any): any => {
  if (!product) return null;
  const metalType = product.technical_specs?.metal || (product.category?.includes("gold") ? "gold" : "silver");
  const weightGrams = Number(product.technical_specs?.weight_grams) || 
                      Number(product.weight_label?.replace(/[^0-9.]/g, "")) || 100;
  
  const rawSlug = product.id || product.name_en || "product";
  const slug = String(rawSlug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let weight = product.weight || product.weight_label || product.technical_specs?.weight || "";
  if (!weight) {
    if (weightGrams === 1000) {
      weight = "1kg";
    } else if (weightGrams === 100) {
      weight = "100g";
    } else {
      if (weightGrams % 1000 === 0) {
        weight = `${weightGrams / 1000}kg`;
      } else {
        weight = `${weightGrams}g`;
      }
    }
  }

  let categoryVal = "gold";
  const catLower = String(product.category || "").toLowerCase();
  if (catLower.includes("coin") || catLower.includes("عملات")) {
    categoryVal = "coin";
  } else if (catLower.includes("silver") || catLower.includes("فضة")) {
    categoryVal = "silver";
  } else if (catLower.includes("gold") || catLower.includes("ذهب")) {
    categoryVal = "gold";
  }

  // Sanitize availability to strictly comply with 'products_availability_check' (which only permits 'In Stock' or 'Out of Stock')
  let dbAvailability = "In Stock";
  const origAvail = String(product.availability || "").toLowerCase().trim();
  if (origAvail.includes("out of stock") || origAvail.includes("غير متوفر") || origAvail.includes("out")) {
    dbAvailability = "Out of Stock";
  } else {
    dbAvailability = "In Stock"; // Map all other options (Limited Stock, Available on Order, etc.) to 'In Stock'
  }

  // Sanitize stock_status as well to strictly comply with database constraints
  let dbStockStatus = "In Stock";
  const origStatus = String(product.stock_status || "").toLowerCase().trim();
  if (origStatus.includes("out of stock") || origStatus.includes("غير متوفر") || origStatus.includes("out")) {
    dbStockStatus = "Out of Stock";
  } else {
    dbStockStatus = "In Stock";
  }

  const payload: any = {
    name: product.name_en || "",
    arabic_name: product.name_ar || product.name_en || "",
    slug: slug,
    category: categoryVal,
    brand: product.brand || product.manufacturer || "PAMP Suisse",
    metal_type: metalType,
    weight: weight,
    weight_grams: weightGrams,
    purity: product.purity || "999.9",
    price: Number(product.price) || 0,
    price_mode: product.price_mode || "spot",
    currency: "AED",
    image_url: product.image_url || "",
    availability: dbAvailability,
    stock_status: dbStockStatus,
    stock_quantity: 25,
    description: product.description_en || "",
    arabic_description: product.description_ar || "",
    certificate_url: product.certificate_url || "",
    published: product.published !== undefined ? product.published : true
  };

  if (product.category_id && isUUID(product.category_id)) {
    payload.category_id = product.category_id;
  } else if (product.category && isUUID(product.category)) {
    payload.category_id = product.category;
  }

  // Ensure ONLY the strictly allowed DB fields are returned (plus id/category_id if present/valid)
  const allowedKeys = [
    "id",
    "name",
    "arabic_name",
    "slug",
    "category",
    "brand",
    "metal_type",
    "weight",
    "weight_grams",
    "purity",
    "price",
    "price_mode",
    "currency",
    "image_url",
    "availability",
    "stock_status",
    "stock_quantity",
    "description",
    "arabic_description",
    "certificate_url",
    "published"
  ];

  if (payload.category_id && isUUID(payload.category_id)) {
    allowedKeys.push("category_id");
  }

  const sanitizedPayload: any = {};
  for (const key of allowedKeys) {
    if (key === "id") {
      if (product.id) {
        sanitizedPayload.id = product.id;
      }
    } else if (payload[key] !== undefined) {
      sanitizedPayload[key] = payload[key];
    }
  }

  return sanitizedPayload;
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
        if (!error && data) {
          return data.map(row => mapDbProductToFrontend(row));
        }
      }
      return mockDb.get("pgr_products");
    },
    save: async (product: any) => {
      if (isLive && supabase) {
        const dbPayload = mapFrontendProductToDb(product);
        
        // Map category slug or text to category_id if not already present
        if (!dbPayload.category_id && dbPayload.category) {
          try {
            const { data: catData } = await supabase
              .from("categories")
              .select("id")
              .or(`slug.eq."${dbPayload.category}",name.ilike.%${dbPayload.category}%`);
            
            if (catData && catData.length > 0) {
              dbPayload.category_id = catData[0].id;
            } else {
              // Try fallback to the first category in the database
              const { data: firstCat } = await supabase
                .from("categories")
                .select("id")
                .limit(1);
              if (firstCat && firstCat.length > 0) {
                dbPayload.category_id = firstCat[0].id;
              }
            }
          } catch (e) {
            console.error("Failed to map category to category_id:", e);
          }
        }

        console.log("PRODUCT_SAVE_PAYLOAD", dbPayload);
        const { data, error } = await supabase.from("products").upsert(dbPayload).select();
        if (error) throw new Error(error.message || JSON.stringify(error));
        if (data) return mapDbProductToFrontend(data[0]);
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
      const normalize = (q: any) => ({
        ...q,
        metalInterest: q.metalInterest || q.metal_interest || "gold",
        productCategory: q.productCategory || q.product_category || q.product_name || "General Bullion Inquiry",
        weight: q.weight || q.weight_preference || "",
        clientType: q.clientType || q.client_type || "",
        preferredCurrency: q.preferredCurrency || q.preferred_currency || q.currency || "",
        deliveryInterest: q.deliveryInterest || q.delivery_interest || "",
        status: q.status === "awaiting_confirmation" ? "Pending" : q.status,
      });

      if (isLive && supabase) {
        const { data } = await supabase.from("quote_requests").select("*");
        if (data) return data.map(normalize);
      }
      return (mockDb.get("pgr_quote_requests") || []).map(normalize);
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
      if (isLive && supabase) {
        const { data, error } = await supabase
          .from("quote_requests")
          .update({ status })
          .eq("id", id)
          .select();
        if (!error && data?.[0]) return data[0];
      }
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
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const serverData = await res.json();
          const current = mockDb.get("pgr_settings") || {};
          const merged = { ...current, ...serverData };
          mockDb.set("pgr_settings", merged);
          return merged;
        }
      } catch (err) {
        console.warn("Could not fetch server settings, using local only", err);
      }
      return mockDb.get("pgr_settings") || {};
    },
    update: async (newSettings: any) => {
      const current = mockDb.get("pgr_settings") || {};
      const updated = { ...current, ...newSettings };
      mockDb.set("pgr_settings", updated);
      
      try {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });
      } catch (err) {
        console.warn("Failed to sync updated settings with server", err);
      }
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
      const redirect = redirectToUrl || getRedirectUrl();
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

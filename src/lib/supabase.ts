/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Product, QuoteSignaturePayload, PartnerLogo, PaymentSettings, PublicPaymentSettings } from "../types";
import { PRODUCTS, BRANDS, DEFAULT_DAILY_PRICING, DEFAULT_SHIPPING_SETTINGS, DEFAULT_PAYMENT_SETTINGS } from "../data";
import {
  CATALOG_SEED_VERSION,
  catalogNeedsMigration,
  getCanonicalProduct,
  isLegacyProductId,
  resolveAdminCatalog,
  resolvePublicCatalog,
} from "./productCatalog";
import {
  REFERENCE_GOLD_USD_OZ,
  REFERENCE_SILVER_USD_OZ,
  dailyReferenceAedPerGram,
} from "./metalReferenceSpots";
import { getCanonicalSiteOrigin } from "./siteOrigin";
import {
  fetchPublicPartnerLogos,
  filterPublic,
  PUBLIC_JSON_PATH,
  STORAGE_BUCKET,
} from "./partnerLogosPublic";

// 1. Fetch environment variables safely (client-side only using import.meta.env)
const buildTimeSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const buildTimeSupabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const BOOTSTRAP_ADMIN_EMAILS = [
  "almandlawy112@gmail.com",
  "admin@pgruae.com"
] as const;

function isValidSupabaseUrl(url: string): boolean {
  return Boolean(
    url &&
      url !== "YOUR_SUPABASE_URL" &&
      url !== "VITE_SUPABASE_URL" &&
      !url.includes("placeholder") &&
      (url.startsWith("http://") || url.startsWith("https://"))
  );
}

function isValidSupabaseKey(key: string): boolean {
  return Boolean(
    key &&
      key !== "YOUR_SUPABASE_ANON_KEY" &&
      key !== "VITE_SUPABASE_ANON_KEY" &&
      !key.includes("placeholder") &&
      key.length > 10
  );
}

const createSupabaseOptions = () => ({
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce" as const
  }
});

export const isProduction =
  typeof window !== "undefined" && window.location.hostname.includes("pgruae.com");

/** Live Supabase client — reassigned after runtime config load. */
export let supabase: SupabaseClient | null = null;
export let isLive = false;

function tryInitSupabaseClient(url: string, key: string): boolean {
  if (!isValidSupabaseUrl(url) || !isValidSupabaseKey(key)) return false;
  try {
    supabase = createClient(url, key, createSupabaseOptions());
    isLive = true;
    return true;
  } catch (err) {
    console.error("Supabase createClient failed:", err);
    supabase = null;
    isLive = false;
    return false;
  }
}

if (tryInitSupabaseClient(buildTimeSupabaseUrl, buildTimeSupabaseAnonKey)) {
  console.info("[PGR] Supabase initialized from build-time env.");
}

let ensureSupabasePromise: Promise<boolean> | null = null;

/** Load Supabase from build env or /api/config (Vercel runtime). */
export async function ensureSupabaseReady(): Promise<boolean> {
  if (supabase && isLive) return true;
  if (ensureSupabasePromise) return ensureSupabasePromise;

  ensureSupabasePromise = (async () => {
    if (tryInitSupabaseClient(buildTimeSupabaseUrl, buildTimeSupabaseAnonKey)) {
      return true;
    }

    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.configured && tryInitSupabaseClient(cfg.supabaseUrl, cfg.supabaseAnonKey)) {
          console.info("[PGR] Supabase initialized from /api/config.");
          return true;
        }
      }
    } catch (err) {
      console.error("[PGR] Failed to load runtime Supabase config:", err);
    }

    supabase = null;
    isLive = false;
    return false;
  })();

  const ready = await ensureSupabasePromise;
  ensureSupabasePromise = null;
  return ready;
}

export function isBootstrapAdmin(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (BOOTSTRAP_ADMIN_EMAILS as readonly string[]).includes(normalized);
}

export const configStatus = {
  get urlConfigured() {
    return isValidSupabaseUrl(buildTimeSupabaseUrl) ? "YES" : "NO";
  },
  get keyConfigured() {
    return isValidSupabaseKey(buildTimeSupabaseAnonKey) ? "YES" : "NO";
  },
  get currentMode() {
    return isLive ? "LIVE DATABASE" : "LOCAL SIMULATION";
  },
  get supabaseUrl() {
    return isValidSupabaseUrl(buildTimeSupabaseUrl) ? buildTimeSupabaseUrl : "Not Configured";
  },
  get explainMissing() {
    return !isLive
      ? "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel (build + runtime) and redeploy."
      : "Connected to live database.";
  }
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

  // Reset catalog when seed version changes or legacy/demo products are present
  let existingProductsRaw = safeStorage.getItem("pgr_products");
  const storedSeedVersion = safeStorage.getItem("pgr_catalog_seed_version");
  let shouldSeedProducts = !existingProductsRaw || storedSeedVersion !== CATALOG_SEED_VERSION;

  if (existingProductsRaw && storedSeedVersion === CATALOG_SEED_VERSION) {
    try {
      const parsed = JSON.parse(existingProductsRaw);
      if (catalogNeedsMigration(parsed)) {
        shouldSeedProducts = true;
      }
    } catch {
      shouldSeedProducts = true;
    }
  }

  const buildInventory = () =>
    PRODUCTS.map((p) => ({
      product_id: p.id,
      sku: p.id.toUpperCase() + "-MINT",
      barcode: "729000" + Math.floor(100000 + Math.random() * 900000),
      stock: p.id.includes("1kg") ? 4 : Math.floor(10 + Math.random() * 40),
      reserved: 0,
    }));

  if (shouldSeedProducts) {
    safeStorage.setItem("pgr_products", JSON.stringify(PRODUCTS));
    safeStorage.setItem("pgr_catalog_seed_version", CATALOG_SEED_VERSION);
    safeStorage.setItem("pgr_inventory", JSON.stringify(buildInventory()));
  } else {
    getOrSet("pgr_products", PRODUCTS);
    getOrSet("pgr_inventory", buildInventory());
  }

  // 2. Categories
  getOrSet("pgr_categories", [
    { id: "gold_bars", name_en: "Gold Bars", name_ar: "سبائك الذهب" },
    { id: "silver_bars", name_en: "Silver Bars", name_ar: "سبائك الفضة" },
    { id: "mint_bars_coins", name_en: "Mint Bars & Coins", name_ar: "السبائك المصكوكة وعملات السبائك" },
    { id: "custom_inquiry", name_en: "Custom Inquiry", name_ar: "طلبات مخصصة" },
  ]);

  // 3. Brands
  getOrSet("pgr_brands", BRANDS);

  // 4. Certificates
  getOrSet("pgr_certificates", [
    {
      serial_number: "PAMP-882941",
      qr_code: "https://pgruae.com/verify/PAMP-882941",
      product_name: "Gold Bar 100g",
      weight: "100 Grams",
      purity: "999.9 Fine Gold",
      manufacturer: "PAMP Suisse",
      issue_date: "2025-11-12",
      status: "Active / Verified"
    },
    {
      serial_number: "VALC-119302",
      qr_code: "https://pgruae.com/verify/VALC-119302",
      product_name: "Silver Bar 1kg",
      weight: "1 Kilogram (1000g)",
      purity: "999.0 Fine Silver",
      manufacturer: "Valcambi",
      issue_date: "2026-01-08",
      status: "Active / Verified"
    },
    {
      serial_number: "RM-BR-55421",
      qr_code: "https://pgruae.com/verify/RM-BR-55421",
      product_name: "Mint Bars & Bullion Coins",
      weight: "1 Troy Ounce",
      purity: "999.9 Fine Gold",
      manufacturer: "Royal Mint",
      issue_date: "2026-03-20",
      status: "Active / Verified"
    }
  ]);

  // 5. Quote Requests
  getOrSet("pgr_quote_requests", [
    {
      id: "PGR-QT-00123",
      customer_id: "cust-verified-1",
      name: "Sheikh Mansoor Al-Maktoum",
      email: "verified.investor@dubaimarina.ae",
      phone: "+971 55 968 8837",
      company: "Elite Asset Holdings Ltd",
      metalInterest: "gold",
      metal_interest: "gold",
      productCategory: "Gold Bar 1kg",
      product_category: "Gold Bar 1kg",
      weight: "1000g",
      weight_preference: "1000g",
      status: "KYC Required",
      created_at: "2026-06-25T11:10:00Z"
    },
    {
      id: "PGR-QT-00122",
      customer_id: "cust-verified-1",
      name: "Sheikh Mansoor Al-Maktoum",
      email: "verified.investor@dubaimarina.ae",
      phone: "+971 55 968 8837",
      company: "Elite Asset Holdings Ltd",
      metalInterest: "silver",
      metal_interest: "silver",
      productCategory: "Silver Bar 1kg",
      product_category: "Silver Bar 1kg",
      weight: "5000g",
      weight_preference: "5000g",
      status: "Quote Sent",
      created_at: "2026-06-24T14:32:00Z"
    },
    {
      id: "PGR-QT-00121",
      customer_id: "cust-verified-1",
      name: "Sheikh Mansoor Al-Maktoum",
      email: "verified.investor@dubaimarina.ae",
      phone: "+971 55 968 8837",
      company: "Elite Asset Holdings Ltd",
      metalInterest: "gold",
      metal_interest: "gold",
      productCategory: "Gold Bar 100g",
      product_category: "Gold Bar 100g",
      weight: "100g",
      weight_preference: "100g",
      status: "New Request",
      created_at: "2026-06-26T08:00:00Z"
    }
  ]);

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
          { product_id: "pgr-gold-100g", quantity: 4, unit_price: 29600.0, product_name: "Gold Bar 100g" }
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
          { product_id: "pgr-gold-1kg", quantity: 1, unit_price: 326500.0, product_name: "Gold Bar 1kg" }
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
      { id: "notif-1", title_en: "Bespoke Quote Update", title_ar: "تحديث على مقايسة السعر", content_en: "Your quote request for Gold Bar 1kg has been approved by the Trader Desk.", content_ar: "تمت الموافقة على طلب التسعير الخاص بك لسبيكة الذهب ١ كيلو من مكتب التداول.", created_at: "2026-06-25T11:10:00Z", unread: true },
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
      wishlist: ["pgr-gold-1kg", "pgr-mint-bars-coins"],
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
    manual_gold_usd_oz: REFERENCE_GOLD_USD_OZ,
    manual_silver_usd_oz: REFERENCE_SILVER_USD_OZ,
    usd_aed_rate: 3.6725,
    usd_iqd_rate: 1310.0,
    default_product_premium_pct: 2.0,
    disable_live_pricing: false,
    daily_pricing: { ...DEFAULT_DAILY_PRICING },
    shipping_settings: { ...DEFAULT_SHIPPING_SETTINGS },
    payment_settings: { ...DEFAULT_PAYMENT_SETTINGS }
  });

  // Partner / trust logos (admin-managed; empty by default — no hardcoded logos)
  getOrSet("pgr_partner_logos", [] as PartnerLogo[]);

  // 12. Exchange Rates (AED / USD / IQD)
  getOrSet("pgr_exchange_rates", {
    USD: 1.0,
    AED: 3.6725,
    IQD: 1310.0
  });

  // 13. Pickup Points / Offices (Admin-managed — no public seed data)
  getOrSet("pgr_pickup_points", [] as unknown[]);

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

  // 19. Audit Logs (Append-Only)
  getOrSet("pgr_audit_logs", [
    {
      id: "AUD-1001",
      action: "system_init",
      operator_id: "system",
      details: "PGR UAE Cryptographic and Business Compliance Engine Initialized successfully.",
      timestamp: new Date().toISOString()
    }
  ]);
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

export const getAuthCallbackUrl = () => {
  return `${getCanonicalSiteOrigin()}/auth/callback`;
};

export const getRedirectUrl = () => {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (window.location.hostname === "pgruae.com" || window.location.hostname === "www.pgruae.com") {
      return pathname.startsWith("/admin")
        ? `${getCanonicalSiteOrigin()}/admin`
        : getCanonicalSiteOrigin();
    }
    return window.location.origin + (pathname.startsWith("/admin") ? "/admin" : "");
  }
  return getCanonicalSiteOrigin();
};

// Bidirectional mappers for product to resolve table field mismatches in Supabase
export const mapDbProductToFrontend = (dbProd: any): any => {
  if (!dbProd) return null;

  if (isLegacyProductId(String(dbProd.id || ""))) {
    return null;
  }

  const canonical = PRODUCTS.find((product) => product.id === dbProd.id);
  if (canonical) {
    return {
      ...canonical,
      name_en: dbProd.name || canonical.name_en,
      name_ar: dbProd.arabic_name || canonical.name_ar,
      description_en: dbProd.description || canonical.description_en,
      description_ar: dbProd.arabic_description || canonical.description_ar,
      image_url: canonical.image_url || dbProd.image_url,
      price: Number(dbProd.price) || canonical.price || 0,
      price_mode: (dbProd.price_mode || canonical.price_mode || "spot") as "spot" | "fixed",
      stock_status: dbProd.stock_status || canonical.stock_status || "In Stock",
      certificate_url: dbProd.certificate_url || canonical.certificate_url,
      published: dbProd.published !== undefined ? dbProd.published : canonical.published !== false,
      availability: dbProd.availability || canonical.availability,
      manufacturer: dbProd.brand || canonical.manufacturer,
      brand: dbProd.brand || canonical.brand || canonical.manufacturer,
    };
  }

  const isGold = dbProd.metal_type === "gold" || dbProd.category?.includes("gold") || false;

  let frontendCategory = "gold_bars";
  const dbCat = String(dbProd.category || "").toLowerCase();
  if (dbCat.includes("mint") || dbCat === "coin") {
    frontendCategory = "mint_bars_coins";
  } else if (dbCat.includes("custom")) {
    frontendCategory = "custom_inquiry";
  } else if (dbCat.includes("silver")) {
    frontendCategory = "silver_bars";
  } else if (dbCat.includes("gold")) {
    frontendCategory = "gold_bars";
  }

  const fallbackCanonical = getCanonicalProduct(dbProd.id);

  return {
    id: dbProd.id,
    name_en: dbProd.name || "",
    name_ar: dbProd.arabic_name || dbProd.name || "",
    category: frontendCategory,
    weight_label: fallbackCanonical?.weight_label || `${dbProd.weight_grams || 100} Grams`,
    purity: dbProd.purity || "999.9",
    manufacturer: dbProd.brand || fallbackCanonical?.manufacturer || "PGR UAE",
    country_en: fallbackCanonical?.country_en || "United Arab Emirates",
    country_ar: fallbackCanonical?.country_ar || "الإمارات العربية المتحدة",
    availability: dbProd.availability || "In Stock",
    certificate_en: fallbackCanonical?.certificate_en || "Assay Certificate Certified",
    certificate_ar: fallbackCanonical?.certificate_ar || "شهادة معتمدة",
    description_en: dbProd.description || fallbackCanonical?.description_en || "High-Purity Bullion Bar",
    description_ar: dbProd.arabic_description || fallbackCanonical?.description_ar || "سبائك عالية النقاء والجودة",
    technical_specs: {
      weight_grams: Number(dbProd.weight_grams) || fallbackCanonical?.technical_specs?.weight_grams || 100,
      purity: dbProd.purity || "999.9",
      metal: (dbProd.metal_type || (isGold ? "gold" : "silver")) as "gold" | "silver",
    },
    image_placeholder: (isGold ? "gold_bar" : "silver_bar") as any,
    premium_multiplier: fallbackCanonical?.premium_multiplier ?? 1.025,
    brand: dbProd.brand || fallbackCanonical?.brand || "PGR UAE",
    price: Number(dbProd.price) || 0,
    price_mode: (dbProd.price_mode || "spot") as "spot" | "fixed",
    image_url: dbProd.image_url || fallbackCanonical?.image_url || undefined,
    stock_status: dbProd.stock_status || "In Stock",
    certificate_url: dbProd.certificate_url || undefined,
    published: dbProd.published !== undefined ? dbProd.published : true,
    iraq_popular: fallbackCanonical?.iraq_popular,
    iraq_offer_rank: fallbackCanonical?.iraq_offer_rank,
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
  if (catLower.includes("mint") || catLower.includes("coin")) {
    categoryVal = "coin";
  } else if (catLower.includes("custom")) {
    categoryVal = "custom";
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
// CRYPTOGRAPHIC SECURITY SIGNATURE GENERATOR (Tamper Detection & Anti-Replay)
// =========================================================================
function buildLocalFallbackSignature(payload: QuoteSignaturePayload): string {
  const secret = "PGR_SECURE_OVERRIDE_SALT_2026";
  const rawMessage = [
    payload.quoteId,
    payload.customerId,
    Number(payload.productFirmPrice).toFixed(2),
    Number(payload.shippingFee).toFixed(2),
    Number(payload.totalFirmQuote).toFixed(2),
    payload.currency,
    payload.expiresAt,
    secret
  ].join("|");

  let hash = 0;
  for (let i = 0; i < rawMessage.length; i++) {
    const char = rawMessage.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `pgr_secure_sig_${hex}_${payload.expiresAt.substring(11, 19).replace(/:/g, "")}`;
}

export const generateQuoteSignature = async (payload: QuoteSignaturePayload): Promise<string> => {
  try {
    const res = await fetch("/api/quote/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: payload.quoteId,
        customerId: payload.customerId || "anonymous",
        productFirmPrice: payload.productFirmPrice,
        shippingFee: payload.shippingFee,
        totalFirmQuote: payload.totalFirmQuote,
        quotedPrice: payload.totalFirmQuote,
        currency: payload.currency === "USD" ? "USD" : "AED",
        expiresAt: payload.expiresAt,
        status: payload.status || "Quote Sent",
        createdAt: payload.createdAt || new Date().toISOString()
      })
    });
    const data = await res.json();
    if (data.success && data.signature) {
      return data.signature;
    }
    throw new Error(data.error || "Failed to generate server signature");
  } catch (err) {
    console.warn("Server signature generation failed, using cryptographic fallback simulation:", err);
    return buildLocalFallbackSignature(payload);
  }
};

function getAdminRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const user = mockDb.auth.getUser();
  if (user?.email) {
    headers["X-PGR-Admin-Email"] = user.email;
  }
  return headers;
}

export async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const headers = getAdminRequestHeaders();
  if (isLive && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return headers;
}

// =========================================================================
// UNIVERSAL DATA ACCESS LAYER (dbService)
// Transparently routes queries to Live Supabase (if connected) or Local Storage
// =========================================================================
export const dbService = {
  products: {
    list: async (scope: "public" | "admin" = "public"): Promise<Product[]> => {
      let rawProducts: Product[] = [];

      if (isLive && supabase) {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data) {
          rawProducts = data
            .map((row) => mapDbProductToFrontend(row))
            .filter(Boolean) as Product[];
        }
      } else {
        rawProducts = mockDb.get("pgr_products") || [];
      }

      if (catalogNeedsMigration(rawProducts)) {
        rawProducts = await dbService.products.resetToCatalogDefaults();
      }

      return scope === "admin"
        ? resolveAdminCatalog(rawProducts)
        : resolvePublicCatalog(rawProducts);
    },
    resetToCatalogDefaults: async (): Promise<Product[]> => {
      if (isLive && supabase) {
        const { data: existing } = await supabase.from("products").select("id");
        if (existing) {
          for (const row of existing) {
            if (isLegacyProductId(row.id)) {
              await supabase.from("products").delete().eq("id", row.id);
            }
          }
        }

        for (const product of PRODUCTS) {
          const dbPayload = mapFrontendProductToDb(product);
          const { error } = await supabase.from("products").upsert(dbPayload);
          if (error) {
            console.error(`Failed to upsert catalog product ${product.id}:`, error);
          }
        }
      }

      mockDb.set("pgr_products", PRODUCTS);
      if (typeof window !== "undefined") {
        safeStorage.setItem("pgr_products", JSON.stringify(PRODUCTS));
        safeStorage.setItem("pgr_catalog_seed_version", CATALOG_SEED_VERSION);
        safeStorage.setItem(
          "pgr_inventory",
          JSON.stringify(
            PRODUCTS.map((p) => ({
              product_id: p.id,
              sku: p.id.toUpperCase() + "-MINT",
              barcode: "729000" + Math.floor(100000 + Math.random() * 900000),
              stock: p.id.includes("1kg") ? 4 : Math.floor(10 + Math.random() * 40),
              reserved: 0,
            }))
          )
        );
      }

      return PRODUCTS;
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
      if (isLive && supabase) {
        const { data } = await supabase
          .from("quote_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) return data;
      }
      return mockDb.get("pgr_quote_requests");
    },
    listForCustomer: async (customerId: string, email?: string) => {
      await ensureSupabaseReady();
      const normalizedEmail = email?.trim().toLowerCase();
      if (isLive && supabase) {
        const deskFilter = normalizedEmail
          ? `customer_id.eq.${customerId},email.ilike.${normalizedEmail}`
          : `customer_id.eq.${customerId}`;
        let deskQuotes = await supabase
          .from("quote_requests")
          .select("*")
          .or(deskFilter)
          .order("created_at", { ascending: false });

        if (deskQuotes.error?.message?.includes("customer_id")) {
          deskQuotes = normalizedEmail
            ? await supabase
                .from("quote_requests")
                .select("*")
                .ilike("email", normalizedEmail)
                .order("created_at", { ascending: false })
            : { data: [], error: null };
        }

        let webQuotes = await supabase
          .from("website_quote_requests")
          .select("*")
          .or(deskFilter)
          .order("created_at", { ascending: false });

        if (webQuotes.error?.message?.includes("customer_id")) {
          webQuotes = normalizedEmail
            ? await supabase
                .from("website_quote_requests")
                .select("*")
                .ilike("email", normalizedEmail)
                .order("created_at", { ascending: false })
            : { data: [], error: null };
        }

        if (deskQuotes.error) {
          console.warn("[quoteRequests] desk list failed:", deskQuotes.error.message);
        }
        if (webQuotes.error) {
          console.warn("[quoteRequests] website list failed:", webQuotes.error.message);
        }

        const merged = [...(deskQuotes.data || []), ...(webQuotes.data || [])];
        return merged.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      }
      const desk = (mockDb.get("pgr_quote_requests") || []).filter(
        (q: any) =>
          q.customer_id === customerId ||
          (normalizedEmail && String(q.email || "").toLowerCase() === normalizedEmail)
      );
      const web = (mockDb.get("pgr_website_quote_requests") || []).filter(
        (q: any) =>
          q.customer_id === customerId ||
          (normalizedEmail && String(q.email || "").toLowerCase() === normalizedEmail)
      );
      return [...desk, ...web].sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    },
    saveWebsiteQuoteLocal: async (row: Record<string, unknown>) => {
      if (isLive && supabase) {
        const { error } = await supabase.from("website_quote_requests").upsert(row);
        if (error) throw new Error(error.message);
        return row;
      }
      const list = mockDb.get("pgr_website_quote_requests") || [];
      list.unshift(row);
      mockDb.set("pgr_website_quote_requests", list);
      return row;
    },
    createWebsiteQuote: async (payload: Record<string, unknown>) => {
      await ensureSupabaseReady();
      const inquiryId = `PGR-${Math.floor(100000 + Math.random() * 900000)}`;
      const row = {
        id: inquiryId,
        inquiry_id: inquiryId,
        created_at: new Date().toISOString(),
        ...payload,
      };

      if (isLive && supabase) {
        const attempts: Record<string, unknown>[] = [row];
        const withoutInquiry = { ...row };
        delete withoutInquiry.inquiry_id;
        attempts.push(withoutInquiry);
        const withoutCustomer = { ...withoutInquiry };
        delete withoutCustomer.customer_id;
        attempts.push(withoutCustomer);

        let lastError: string | undefined;
        for (const attempt of attempts) {
          // Do not chain .select() — RLS allows INSERT but not SELECT for anon/guest rows.
          const { error } = await supabase.from("website_quote_requests").insert(attempt);
          if (!error) {
            return { inquiryId, row: attempt };
          }
          lastError = error.message || "Quote save failed";
          console.warn("[quoteRequests] insert attempt failed:", lastError, attempt);
        }
        console.error("[quoteRequests] website_quote_requests insert failed:", lastError);
        throw new Error(lastError || "Quote save failed");
      }

      const list = mockDb.get("pgr_website_quote_requests") || [];
      list.unshift(row);
      mockDb.set("pgr_website_quote_requests", list);
      return { inquiryId, row };
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
      if (isLive) {
        try {
          const headers = await getAdminAuthHeaders();
          const res = await fetch("/api/admin-quotes", {
            method: "PATCH",
            headers,
            body: JSON.stringify({ id, updates: { status } }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.quote) return json.quote;
          }
        } catch (err) {
          console.warn("[quoteRequests] admin patch status failed:", err);
        }
      }
      const quotes = mockDb.get("pgr_quote_requests");
      const index = quotes.findIndex((q: any) => q.id === id);
      if (index > -1) {
        quotes[index].status = status;
        mockDb.set("pgr_quote_requests", quotes);
        return quotes[index];
      }
      return null;
    },
    update: async (id: string, updates: any) => {
      if (isLive) {
        try {
          const headers = await getAdminAuthHeaders();
          const res = await fetch("/api/admin-quotes", {
            method: "PATCH",
            headers,
            body: JSON.stringify({ id, updates }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.quote) return json.quote;
          } else {
            const errText = await res.text().catch(() => "");
            throw new Error(errText || `Admin quote update failed (${res.status})`);
          }
        } catch (err) {
          console.warn("[quoteRequests] admin patch failed:", err);
          if (err instanceof Error && err.message.includes("Admin quote update failed")) throw err;
        }
      }
      const quotes = mockDb.get("pgr_quote_requests");
      const index = quotes.findIndex((q: any) => q.id === id);
      if (index > -1) {
        // Enforce lock: if a quote is accepted, prevent silent modifications of prices/expiry times
        if (quotes[index].status === "Customer Accepted" && (
          updates.quoted_price !== undefined ||
          updates.product_firm_price !== undefined ||
          updates.shipping_fee !== undefined ||
          updates.currency !== undefined ||
          updates.expires_at !== undefined
        )) {
          throw new Error("Security Violation: Silently modifying a locked/accepted quote is strictly forbidden.");
        }
        quotes[index] = { ...quotes[index], ...updates };
        mockDb.set("pgr_quote_requests", quotes);
        return quotes[index];
      }
      return null;
    },
    acceptSecure: async (quoteId: string, clientSignature: string): Promise<any> => {
      const quotes = mockDb.get("pgr_quote_requests");
      const stored = quotes.find((q: any) => q.id === quoteId);
      if (!stored) {
        throw new Error("Quote Request ticket not found in database.");
      }

      const productFirmPrice = Number(stored.product_firm_price ?? stored.quoted_price ?? 0);
      const shippingFee = Number(stored.shipping_fee ?? 0);
      const totalFirmQuote = Number(stored.quoted_price ?? (productFirmPrice + shippingFee));
      const currency = stored.currency === "USD" ? "USD" : "AED";
      const expiresAt = stored.expires_at || "";
      const customerId = stored.email || "anonymous";

      const payload: QuoteSignaturePayload = {
        quoteId: stored.id,
        customerId,
        productFirmPrice,
        shippingFee,
        totalFirmQuote,
        currency,
        expiresAt,
        status: "Quote Sent",
        createdAt: stored.quoted_at || stored.created_at || new Date().toISOString()
      };

      try {
        const res = await fetch("/api/quote/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            quotedPrice: totalFirmQuote,
            signature: clientSignature,
            targetStatus: "Customer Accepted"
          })
        });
        
        const serverData = await res.json();
        if (!res.ok) {
          throw new Error(serverData.error || "Server validation failed");
        }

        stored.status = "Customer Accepted";
        stored.accepted_at = serverData.acceptedAt || new Date().toISOString();
      } catch (err: any) {
        if (err.message && (
          err.message.includes("Security Violation") || 
          err.message.includes("expired") || 
          err.message.includes("Replay Attack") ||
          err.message.includes("tampering")
        )) {
          throw err;
        }

        console.warn("Server validation offline, falling back to local cryptographic engine:", err);
        
        if (stored.status === "Customer Accepted") {
          throw new Error("Replay Attack Blocked: This quote has already been accepted and price is locked.");
        }

        const expiresTime = new Date(stored.expires_at || expiresAt).getTime();
        if (Date.now() > expiresTime || stored.status === "Expired Quote") {
          stored.status = "Expired Quote";
          mockDb.set("pgr_quote_requests", quotes);
          throw new Error("This quote has expired due to market volatility countdown and can no longer be accepted.");
        }

        const expectedSignature = await generateQuoteSignature(payload);
        if (expectedSignature !== clientSignature || stored.security_signature !== clientSignature) {
          throw new Error("Security Violation: Cryptographic signature mismatch. Product price, shipping fee, total, currency, or expiry has been tampered with!");
        }

        if (
          Math.abs(Number(stored.product_firm_price ?? 0) - productFirmPrice) > 0.01 ||
          Math.abs(Number(stored.shipping_fee ?? 0) - shippingFee) > 0.01 ||
          Math.abs(Number(stored.quoted_price ?? 0) - totalFirmQuote) > 0.01
        ) {
          throw new Error("Security Violation: Quote amount tampering detected.");
        }

        stored.status = "Customer Accepted";
        stored.accepted_at = new Date().toISOString();
      }
      
      const index = quotes.findIndex((q: any) => q.id === quoteId);
      if (index > -1) {
        quotes[index] = stored;
        mockDb.set("pgr_quote_requests", quotes);
      }

      const ordersList = mockDb.get("pgr_orders");
      const matchIndex = ordersList.findIndex((o: any) => o.quote_id === quoteId || o.id === `PGR-ORD-${quoteId}`);
      if (matchIndex > -1) {
        ordersList[matchIndex].status = "Customer Accepted";
        ordersList[matchIndex].payment_status = "Pending";
        mockDb.set("pgr_orders", ordersList);
      }

      return stored;
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
        const res = await fetch("/api/admin/settings", {
          headers: getAdminRequestHeaders()
        });
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
          headers: getAdminRequestHeaders(),
          body: JSON.stringify(updated)
        });
      } catch (err) {
        console.warn("Failed to sync updated settings with server", err);
      }
      return updated;
    },
    updateDailyPricing: async (dailyPricing: any, adminEmail: string) => {
      try {
        const res = await fetch("/api/admin/daily-pricing", {
          method: "PATCH",
          headers: { ...getAdminRequestHeaders(), "X-PGR-Admin-Email": adminEmail },
          body: JSON.stringify(dailyPricing)
        });
        if (res.ok) {
          const data = await res.json();
          const current = mockDb.get("pgr_settings") || {};
          const updated = { ...current, daily_pricing: data.daily_pricing };
          mockDb.set("pgr_settings", updated);
          return updated;
        }
      } catch (err) {
        console.warn("Failed to PATCH daily pricing on server", err);
      }
      return dbService.settings.update({ daily_pricing: dailyPricing });
    },
    updateShippingSettings: async (shippingSettings: any, adminEmail: string) => {
      try {
        const res = await fetch("/api/admin/shipping-settings", {
          method: "PATCH",
          headers: { ...getAdminRequestHeaders(), "X-PGR-Admin-Email": adminEmail },
          body: JSON.stringify(shippingSettings)
        });
        if (res.ok) {
          const data = await res.json();
          const current = mockDb.get("pgr_settings") || {};
          const updated = {
            ...current,
            shipping_settings: { ...shippingSettings, internal_shipping_notes: shippingSettings.internal_shipping_notes }
          };
          mockDb.set("pgr_settings", updated);
          return updated;
        }
      } catch (err) {
        console.warn("Failed to PATCH shipping settings on server", err);
      }
      return dbService.settings.update({ shipping_settings: shippingSettings });
    },
    getPublicShipping: async () => {
      try {
        const res = await fetch("/api/shipping");
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn("Could not fetch public shipping settings", err);
      }
      const settings = mockDb.get("pgr_settings") || {};
      const s = settings.shipping_settings || DEFAULT_SHIPPING_SETTINGS;
      const { internal_shipping_notes, ...publicFields } = s;
      return publicFields;
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

  customers: {
    listAll: async () => {
      if (isLive) {
        try {
          const headers = await getAdminAuthHeaders();
          const res = await fetch("/api/admin-customers", { headers });
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.customers)) return json.customers;
          } else {
            console.warn("[customers] admin list failed:", res.status, await res.text().catch(() => ""));
          }
        } catch (err) {
          console.error("Failed to list customers via admin API:", err);
        }
      }
      if (isLive && supabase) {
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc("get_admin_customer_directory");
          if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
            return rpcData.map((c: Record<string, unknown>) => ({
              ...c,
              kyc_full_name: c.full_name,
            }));
          }
        } catch (err) {
          console.warn("[customers] RPC fallback failed:", err);
        }
        try {
          const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false });
          if (!error && data?.length) return data;
        } catch (err) {
          console.error("Failed to list customers from Supabase:", err);
        }
      }
      const kycList = mockDb.get("pgr_kyc_profiles") || [];
      return kycList.map((k: { id: string; full_name?: string; email?: string; phone?: string; status?: string }) => ({
        id: k.id,
        full_name: k.full_name,
        email: k.email,
        phone: k.phone,
        kyc_status: k.status || "Not submitted",
        account_type: "individual",
        created_at: new Date().toISOString(),
      }));
    },
  },

  kyc: {
    get: async (customerId: string) => {
      if (isLive && supabase) {
        const { data, error } = await supabase
          .from("kyc_profiles")
          .select("*")
          .eq("id", customerId)
          .maybeSingle();
        if (error) {
          console.error("Failed to fetch KYC profile from Supabase:", error);
          throw new Error(error.message || "KYC load failed");
        }
        if (data) return data;
        if (isProduction) {
          return {
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
            documents: [],
            uploaded_files: {},
          };
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
        const { data: existingRow, error: readError } = await supabase
          .from("kyc_profiles")
          .select("uploaded_files")
          .eq("id", customerId)
          .maybeSingle();
        if (readError) {
          throw new Error(readError.message || "KYC read failed");
        }

        let mergedUploaded = { ...((existingRow?.uploaded_files as Record<string, unknown>) || {}) };
        if (profile.uploaded_files !== undefined) {
          for (const [key, val] of Object.entries(profile.uploaded_files)) {
            if (val === null) delete mergedUploaded[key];
            else mergedUploaded[key] = val;
          }
        }

        const { uploaded_files: _uf, ...profileRest } = profile;
        const { data, error } = await supabase
          .from("kyc_profiles")
          .upsert({
            ...profileRest,
            id: customerId,
            uploaded_files: mergedUploaded,
            updated_at: new Date().toISOString(),
          })
          .select();
        if (error) {
          console.error("Failed to save KYC profile to Supabase:", error);
          throw new Error(error.message || "KYC save failed");
        }
        if (data?.[0]) return data[0];
        return { ...profileRest, id: customerId, uploaded_files: mergedUploaded };
      }
      const list = mockDb.get("pgr_kyc_profiles") || [];
      const index = list.findIndex((p: any) => p.id === customerId);
      const existingProfile = index > -1 ? list[index] : {};
      let mergedUploaded = { ...(existingProfile.uploaded_files || {}) };
      if (profile.uploaded_files !== undefined) {
        for (const [key, val] of Object.entries(profile.uploaded_files)) {
          if (val === null) delete mergedUploaded[key];
          else mergedUploaded[key] = val;
        }
      }
      const updatedProfile = { ...profile, id: customerId, uploaded_files: mergedUploaded };
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
      if (isLive) {
        try {
          const headers = await getAdminAuthHeaders();
          const res = await fetch("/api/admin-kyc", { headers });
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.profiles)) return json.profiles;
          } else {
            console.warn("[kyc] admin list failed:", res.status, await res.text().catch(() => ""));
          }
        } catch (err) {
          console.error("Failed to list KYC profiles via admin API:", err);
        }
      }
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase.from("kyc_profiles").select("*");
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to list KYC profiles from Supabase:", err);
        }
      }
      return mockDb.get("pgr_kyc_profiles") || [];
    },
    updateStatusAdmin: async (customerId: string, status: string) => {
      if (isLive) {
        const headers = await getAdminAuthHeaders();
        const res = await fetch("/api/admin-kyc", {
          method: "PATCH",
          headers,
          body: JSON.stringify({ customerId, status }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || `KYC update failed (${res.status})`);
        }
        return json.profile;
      }
      return dbService.kyc.update({ id: customerId, status });
    },
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
      const normalized = email.trim().toLowerCase();
      if (isBootstrapAdmin(normalized)) return true;

      if (isLive && supabase) {
        try {
          const { data, error } = await supabase
            .from("admin_users")
            .select("email, is_active")
            .eq("email", normalized)
            .maybeSingle();
          if (!error && data && (data.is_active === true || data.is_active == null)) {
            return true;
          }
        } catch (err) {
          console.error("Failed to check admin_users in Supabase:", err);
        }
      }
      const adminList = mockDb.get("pgr_admin_users") || [...BOOTSTRAP_ADMIN_EMAILS];
      return adminList.map((e: string) => e.toLowerCase()).includes(normalized);
    }
  },

  auditLogs: {
    list: async (): Promise<any[]> => {
      if (isLive && supabase) {
        try {
          const { data, error } = await supabase
            .from("audit_logs")
            .select("*")
            .order("timestamp", { ascending: false });
          if (!error && data) return data;
        } catch (err) {
          console.error("Failed to list audit logs from Supabase:", err);
        }
      }
      return mockDb.get("pgr_audit_logs") || [];
    },
    append: async (action: string, operatorId: string, details: string): Promise<void> => {
      const newRecord = {
        id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
        action,
        operator_id: operatorId,
        details,
        timestamp: new Date().toISOString()
      };

      if (isLive && supabase) {
        try {
          const { error } = await supabase.from("audit_logs").insert(newRecord);
          if (error) {
            console.error("Failed to append audit log in Supabase:", error);
          }
        } catch (err) {
          console.error("Supabase audit log exception:", err);
        }
      }

      // Always append to mock db local storage as well for high availability and offline audits
      const list = mockDb.get("pgr_audit_logs") || [];
      list.unshift(newRecord);
      mockDb.set("pgr_audit_logs", list);
    }
  },

  auth: {
    signInWithGoogle: async (redirectToUrl?: string) => {
      await ensureSupabaseReady();
      const redirect = redirectToUrl || getAuthCallbackUrl();
      if (isLive && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirect,
            queryParams: {
              access_type: "offline",
              prompt: "consent"
            }
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
    },

    uploadKycDocument: async (
      userId: string,
      slotKey: string,
      file: File
    ): Promise<{ storage_path: string; name: string; size: number; mime_type: string }> => {
      const fileExt = file.name.split(".").pop() || "bin";
      const storagePath = `${userId}/${slotKey}_${Date.now()}.${fileExt}`;

      if (isLive && supabase) {
        const { error: uploadError } = await supabase.storage
          .from("kyc-documents")
          .upload(storagePath, file, { upsert: true, contentType: file.type || undefined });

        if (uploadError) {
          throw new Error(uploadError.message);
        }
      }

      return {
        storage_path: storagePath,
        name: file.name,
        size: file.size,
        mime_type: file.type || "application/octet-stream",
      };
    },

    getKycDocumentSignedUrl: async (storagePath: string, expiresIn = 3600): Promise<string | null> => {
      if (isLive && supabase) {
        const { data, error } = await supabase.storage
          .from("kyc-documents")
          .createSignedUrl(storagePath, expiresIn);
        if (error || !data?.signedUrl) return null;
        return data.signedUrl;
      }
      return null;
    },

    uploadPaymentProof: async (
      userId: string,
      orderId: string,
      file: File
    ): Promise<{ storage_path: string; name: string; size: number; mime_type: string }> => {
      const fileExt = file.name.split(".").pop() || "bin";
      const storagePath = `${userId}/${orderId}_${Date.now()}.${fileExt}`;

      if (isLive && supabase) {
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(storagePath, file, { upsert: true, contentType: file.type || undefined });

        if (uploadError) {
          throw new Error(uploadError.message);
        }
      }

      return {
        storage_path: storagePath,
        name: file.name,
        size: file.size,
        mime_type: file.type || "application/octet-stream",
      };
    },

    getPaymentProofSignedUrl: async (storagePath: string, expiresIn = 3600): Promise<string | null> => {
      if (isLive && supabase) {
        const { data, error } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(storagePath, expiresIn);
        if (error || !data?.signedUrl) return null;
        return data.signedUrl;
      }
      return null;
    },
  },

  partnerLogos: {
    list: async (): Promise<PartnerLogo[]> => {
      try {
        const headers = await getAdminAuthHeaders();
        const res = await fetch("/api/admin/partners", { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.partners)) {
            mockDb.set("pgr_partner_logos", data.partners);
            return data.partners;
          }
        }
      } catch (err) {
        console.warn("Could not fetch partner logos from server", err);
      }
      return mockDb.get("pgr_partner_logos") || [];
    },
    listPublic: async (): Promise<Omit<PartnerLogo, "internal_note">[]> => {
      await ensureSupabaseReady();
      const supabaseUrl = buildTimeSupabaseUrl;

      return fetchPublicPartnerLogos({
        supabaseUrl,
        fetchApi: async () => {
          const res = await fetch("/api/partners", { cache: "no-store" });
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data.partners) ? data.partners : [];
        },
        fetchDb: async () => {
          if (!supabase) return [];
          const { data, error } = await supabase.rpc("get_public_partner_logos");
          if (error) {
            console.warn("[partners] RPC failed:", error.message);
            return [];
          }
          const rows = Array.isArray(data) ? data : [];
          return filterPublic(rows);
        },
        localFallback: () => {
          const all: PartnerLogo[] = mockDb.get("pgr_partner_logos") || [];
          return all
            .filter((p) => p.public_display_enabled && p.logo_url)
            .sort((a, b) => a.display_order - b.display_order)
            .map(({ internal_note: _n, ...rest }) => rest);
        },
      });
    },
    publishPublicJson: async (partners: PartnerLogo[]): Promise<boolean> => {
      await ensureSupabaseReady();
      const publicList = filterPublic(partners);
      const body = JSON.stringify({
        partners: publicList,
        updated_at: new Date().toISOString(),
      });

      if (isLive && supabase) {
        try {
          const file = new Blob([body], { type: "application/json" });
          const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(PUBLIC_JSON_PATH, file, {
              upsert: true,
              contentType: "application/json",
              cacheControl: "120",
            });
          if (error) {
            console.warn("[partners] storage publish failed:", error.message);
            return false;
          }
          return true;
        } catch (err) {
          console.warn("[partners] storage publish error:", err);
          return false;
        }
      }
      return false;
    },
    saveAll: async (partners: PartnerLogo[], adminEmail: string): Promise<PartnerLogo[]> => {
      mockDb.set("pgr_partner_logos", partners);
      let saved = partners;
      try {
        const headers = await getAdminAuthHeaders();
        const res = await fetch("/api/admin/partners", {
          method: "PUT",
          headers: { ...headers, "X-PGR-Admin-Email": adminEmail },
          body: JSON.stringify({ partners }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.partners)) {
            saved = data.partners;
            mockDb.set("pgr_partner_logos", data.partners);
          }
        }
      } catch (err) {
        console.warn("Failed to sync partner logos with server", err);
      }

      // Always publish to public CDN JSON — fixes mobile visitors when API/DB unavailable
      await dbService.partnerLogos.publishPublicJson(saved);
      return saved;
    },
  },

  paymentSettings: {
    get: async (): Promise<PaymentSettings> => {
      try {
        const res = await fetch("/api/admin/payment-settings", { headers: getAdminRequestHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.payment_settings) {
            const current = mockDb.get("pgr_settings") || {};
            mockDb.set("pgr_settings", { ...current, payment_settings: data.payment_settings });
            return data.payment_settings;
          }
        }
      } catch (err) {
        console.warn("Could not fetch payment settings from server", err);
      }
      const settings = mockDb.get("pgr_settings") || {};
      const ps = { ...DEFAULT_PAYMENT_SETTINGS, ...(settings.payment_settings || {}) };
      return {
        ...ps,
        bank_transfer: { ...DEFAULT_PAYMENT_SETTINGS.bank_transfer, ...(ps.bank_transfer || {}) },
        desk_payment_methods: {
          ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods,
          ...(ps.desk_payment_methods || {}),
          zain_cash: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.zain_cash,
            ...(ps.desk_payment_methods?.zain_cash || {}),
          },
          superqi: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.superqi,
            ...(ps.desk_payment_methods?.superqi || {}),
          },
          usdt: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.usdt,
            ...(ps.desk_payment_methods?.usdt || {}),
          },
        },
      };
    },
    getPublic: async (): Promise<PublicPaymentSettings> => {
      try {
        const res = await fetch("/api/payment-public");
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn("Could not fetch public payment settings", err);
      }
      const settings = mockDb.get("pgr_settings") || {};
      const ps = { ...DEFAULT_PAYMENT_SETTINGS, ...(settings.payment_settings || {}) };
      return {
        payment_gateway_enabled: ps.payment_gateway_enabled,
        provider: ps.provider,
        payment_mode: ps.payment_mode,
        public_payment_note: ps.public_payment_note,
        payment_link_instructions: ps.payment_link_instructions,
        bank_transfer: { ...DEFAULT_PAYMENT_SETTINGS.bank_transfer, ...(ps.bank_transfer || {}) },
        desk_payment_methods: {
          ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods,
          ...(ps.desk_payment_methods || {}),
          zain_cash: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.zain_cash,
            ...(ps.desk_payment_methods?.zain_cash || {}),
          },
          superqi: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.superqi,
            ...(ps.desk_payment_methods?.superqi || {}),
          },
          usdt: {
            ...DEFAULT_PAYMENT_SETTINGS.desk_payment_methods.usdt,
            ...(ps.desk_payment_methods?.usdt || {}),
          },
        },
        supported_currencies: ps.supported_currencies,
        require_kyc_before_payment: ps.require_kyc_before_payment,
      };
    },
    update: async (paymentSettings: PaymentSettings, adminEmail: string): Promise<PaymentSettings> => {
      const current = mockDb.get("pgr_settings") || {};
      const updated = { ...current, payment_settings: paymentSettings };
      mockDb.set("pgr_settings", updated);
      try {
        const res = await fetch("/api/admin/payment-settings", {
          method: "PATCH",
          headers: { ...getAdminRequestHeaders(), "X-PGR-Admin-Email": adminEmail },
          body: JSON.stringify(paymentSettings)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.payment_settings) return data.payment_settings;
        }
      } catch (err) {
        console.warn("Failed to sync payment settings with server", err);
      }
      return paymentSettings;
    }
  }
};

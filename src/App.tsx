/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import LiveMarket from "./components/LiveMarket";
import Catalog from "./components/Catalog";
import ProductDetailModal from "./components/ProductDetailModal";
import QuoteForm from "./components/QuoteForm";
import AIConcierge from "./components/AIConcierge";
import OfficeSection from "./components/OfficeSection";
import BlogSection from "./components/BlogSection";
import ClientDashboardModal from "./components/ClientDashboardModal";
import AdminPortalModal from "./components/AdminPortalModal";
import AdminPanel from "./components/AdminPanel";
import LegalOverlayModal from "./components/LegalOverlayModal";
import IraqTrustBadge from "./components/IraqTrustBadge";
import Footer from "./components/Footer";
import { LiveMarketRates, Product } from "./types";
import { WHY_US_ITEMS, BRANDS } from "./data";
import { Shield, Sparkles, Building, Truck, Landmark, Award } from "lucide-react";
import { isLive, supabase, mockDb } from "./lib/supabase";
import { DebugPanel } from "./components/DebugPanel";

// Imported new high-end compliance and desk components
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import RequestQuotePage from "./components/RequestQuotePage";
import ProductLandingPage from "./components/ProductLandingPage";
import AllocatedStoragePage from "./components/AllocatedStoragePage";
import SellBackPage from "./components/SellBackPage";
import ClientDashboard from "./components/ClientDashboard";
import MetalCalculator from "./components/MetalCalculator";
import SEOLandingPages from "./components/SEOLandingPages";

export default function App() {
  const [currentLang, setCurrentLang] = useState<"en" | "ar">("ar");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("AED"); // Default to local UAE Dirham
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Pre-calculated default reference spot rates for flawless client experience
  const getInitialRates = (): LiveMarketRates => {
    const defaultSpots = {
      gold: 2365.40,
      silver: 29.85,
      platinum: 965.20,
      palladium: 1012.10
    };
    
    const exchangeRates = {
      USD: 1.0,
      AED: 3.6725,
      EUR: 0.925,
      GBP: 0.785,
      SAR: 3.7505
    };
    
    const OUNCE_TO_GRAM = 31.1034768;
    const ratesObj: any = {
      source_status: "reference"
    };
    
    Object.entries(defaultSpots).forEach(([metal, spotUsd]) => {
      ratesObj[metal] = {
        spot_usd_oz: spotUsd,
        currencies: {}
      };
      
      Object.entries(exchangeRates).forEach(([currency, rate]) => {
        const ouncePrice = spotUsd * rate;
        const gramPrice = ouncePrice / OUNCE_TO_GRAM;
        
        ratesObj[metal].currencies[currency] = {
          ounce: parseFloat(ouncePrice.toFixed(2)),
          gram: parseFloat(gramPrice.toFixed(4))
        };
      });
    });
    
    return ratesObj as LiveMarketRates;
  };

  const [rates, setRates] = useState<LiveMarketRates | null>(getInitialRates());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal / Drawer / Overlay States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [prefilledProductName, setPrefilledProductName] = useState<string | undefined>(undefined);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  // Custom Client & Admin portals & Legal Overlays
  const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<string | null>(null);

  // Programmatic custom router
  const navigateTo = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Listen for Supabase Authentication changes
  useEffect(() => {
    if (isLive && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          handleUserLogin(session.user);
        }
      });

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          await handleUserLogin(session.user);
        } else if (event === "SIGNED_OUT") {
          mockDb.auth.logout();
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Pathname routing for compliance & legal policies and full pages
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      const pathMap: Record<string, string> = {
        "/terms": "terms",
        "/privacy-policy": "privacy",
        "/kyc-aml-policy": "aml",
        "/pricing-disclaimer": "pricing",
        "/refund-cancellation-policy": "refund",
        "/delivery-collection-policy": "delivery",
        "/allocated-storage-terms": "storage",
        "/sell-back-policy": "sellback",
        "/risk-disclosure": "risk",
        "/cookie-policy": "cookie",
        "/compliance": "compliance"
      };
      if (pathMap[path]) {
        setActiveLegalDoc(pathMap[path]);
      } else {
        setActiveLegalDoc(null);
      }
    };
    handleLocation();
    window.addEventListener("popstate", handleLocation);
    return () => window.removeEventListener("popstate", handleLocation);
  }, []);

  // Premium Dynamic SEO Metadata sync based on route and language
  useEffect(() => {
    const routeTitlesEn: Record<string, string> = {
      "/": "PGR UAE | Dubai Precious Metals & Bullion Desk",
      "/gold": "Gold Bullion Collection | PGR UAE Dubai",
      "/silver": "Silver Bullion Collection | PGR UAE Dubai",
      "/coins": "Accredited Investment Coins | PGR UAE",
      "/iraq-delivery": "Baghdad & Iraq Secure Gold Delivery | PGR UAE",
      "/request-quote": "Request Firm Quote | PGR UAE Precious Metals",
      "/calculator": "Precious Metals Investment Calculator | PGR UAE",
      "/dashboard": "Client Vault & Allocation Dashboard | PGR UAE",
      "/compliance": "Regulatory Compliance & Audit Desk | PGR UAE",
      "/terms": "Terms & Conditions | PGR UAE",
      "/privacy-policy": "Privacy Policy | PGR UAE",
      "/kyc-aml-policy": "KYC & AML Policy | PGR UAE",
      "/pricing-disclaimer": "Pricing & Settlement Disclaimer | PGR UAE"
    };

    const routeTitlesAr: Record<string, string> = {
      "/": "PGR UAE | ديوان دبي لتداول المعادن الثمينة والسبائك",
      "/gold": "مجموعة سبائك الذهب الاستثمارية | PGR UAE",
      "/silver": "مجموعة سبائك الفضة الاستثمارية | PGR UAE",
      "/coins": "المسكوكات والعملات الذهبية المعتمدة | PGR UAE",
      "/iraq-delivery": "الشحن الآمن والتسليم في بغداد والعراق | PGR UAE",
      "/request-quote": "طلب عرض سعر رسمي | PGR UAE للمعادن الثمينة",
      "/calculator": "حاسبة استثمار الذهب والفضة | PGR UAE",
      "/dashboard": "منصة الخزينة وحسابات المستثمرين | PGR UAE",
      "/compliance": "مكتب الامتثال والتدقيق التنظيمي | PGR UAE",
      "/terms": "الشروط والأحكام العامة | PGR UAE",
      "/privacy-policy": "سياسة الخصوصية وحماية البيانات | PGR UAE",
      "/kyc-aml-policy": "سياسة مكافحة غسيل الأموال واعرف عميلك | PGR UAE",
      "/pricing-disclaimer": "إخلاء مسؤولية التسعير والتسوية | PGR UAE"
    };

    const routeDescsEn: Record<string, string> = {
      "/": "Procure certified physical gold bars and silver bullion directly from world-famous accredited refiners. Secured settlement on the PGR UAE desk.",
      "/gold": "Explore accredited Gold Bars from 1g to 1kg sourced from top LBMA-certified Swiss and UAE refiners.",
      "/silver": "Explore physical investment Silver Bars including 100g, 500g, and 1kg sizes from leading international mints.",
      "/coins": "Browse historic and highly liquid gold and silver investment coins backed by national treasuries.",
      "/iraq-delivery": "Learn about our fully insured, high-security armored logistics from Dubai directly to accredited vaults in Baghdad, Iraq.",
      "/request-quote": "Initiate a firm trade order on the PGR UAE desk. Secure your pricing against real-time gold and silver spot rates.",
      "/calculator": "Calculate exact indicative pricing for gold and silver bullion bars based on real-time live global market rates.",
      "/dashboard": "Manage your allocated physical reserves, review trading tickets, and verify KYC verification status securely."
    };

    const routeDescsAr: Record<string, string> = {
      "/": "اشترِ سبائك الذهب والفضة المعتمدة دولياً مباشرة من مصافي دبي والعالم السويسرية. أسعار معتمدة قبل الدفع وتسليم آمن.",
      "/gold": "تصفح سبائك الذهب الفاخرة من وزن ١ جرام إلى ١ كيلو جرام من أرقى المصافي السويسرية والمحلية المعتمدة.",
      "/silver": "مجموعة الفضة الاستثمارية النقية بأوزان متنوعة تشمل ١٠٠ جرام، ٥٠٠ جرام، و١ كيلو جرام لأعلى مستويات التحوط المالي.",
      "/coins": "العملات والمسكوكات الذهبية التاريخية الأكثر سيولة وأماناً الصادرة والمضمونة من حكومات العالم.",
      "/iraq-delivery": "تفاصيل شحن الذهب المؤمن والمحمي من دبي مباشرة إلى الخزائن المعتمدة لعملائنا الكرام في بغداد وعموم العراق.",
      "/request-quote": "ابدأ بطلب تسعير رسمي مؤكد لعمليات الشراء الكبرى من ديوان PGR UAE للمعادن الثمينة.",
      "/calculator": "احسب القيمة الاسترشادية الدقيقة لمدخراتك من الذهب والفضة بناءً على أسعار الشاشات العالمية الفورية المباشرة.",
      "/dashboard": "أدر حساب الخزينة الخاص بك، وتابع فواتير الشراء، وتحقق من حالة مستندات اعرف عميلك بأمان كامل."
    };

    const title = currentLang === "ar" 
      ? (routeTitlesAr[currentPath] || routeTitlesAr["/"]) 
      : (routeTitlesEn[currentPath] || routeTitlesEn["/"]);
    
    const desc = currentLang === "ar"
      ? (routeDescsAr[currentPath] || routeDescsAr["/"])
      : (routeDescsEn[currentPath] || routeDescsEn["/"]);

    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", desc);
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      metaDesc.setAttribute("content", desc);
      document.head.appendChild(metaDesc);
    }

    // Update Open Graph and Twitter title/desc tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", desc);

    // Add dynamic canonical tag update
    let canonical = document.querySelector('link[rel="canonical"]');
    const absoluteUrl = `https://pgruae.com${currentPath === "/" ? "" : currentPath}`;
    if (canonical) {
      canonical.setAttribute("href", absoluteUrl);
    } else {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", absoluteUrl);
      document.head.appendChild(canonical);
    }
  }, [currentPath, currentLang]);

  const handleUserLogin = async (supabaseUser: any) => {
    const email = supabaseUser.email;
    const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "Accredited Investor";
    const avatarUrl = supabaseUser.user_metadata?.avatar_url || "";
    
    // Store user session in mockDb.auth so standard pages load it instantly
    const mappedUser = {
      id: supabaseUser.id,
      email: email,
      name: fullName,
      role: email === "almandlawy112@gmail.com" ? "admin" : "customer",
      created_at: supabaseUser.created_at || new Date().toISOString()
    };
    mockDb.auth.setUser(mappedUser);

    // Save/update user profile in supabase 'customers' table as requested!
    try {
      const { data: existingCustomer } = await supabase!
        .from("customers")
        .select("*")
        .eq("email", email)
        .single();

      const customerProfile = {
        id: supabaseUser.id,
        full_name: fullName,
        email: email,
        avatar_url: avatarUrl,
        provider: supabaseUser.app_metadata?.provider || "google",
        last_login: new Date().toISOString()
      };

      if (existingCustomer) {
        await supabase!
          .from("customers")
          .update(customerProfile)
          .eq("id", supabaseUser.id);
      } else {
        await supabase!
          .from("customers")
          .insert({
            ...customerProfile,
            created_at: new Date().toISOString()
          });
      }
    } catch (err) {
      console.error("Failed to upsert customer profile to Supabase:", err);
    }
  };

  // Active category filter for Catalog (for smooth scrolling filter options from Hero)
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>("all");

  // Fetch Metal Spot rates from backend
  const fetchRates = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/prices");
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          if (data.source_status === "request_quote") {
            setRates(null);
          } else if (data.rates) {
            setRates({
              ...data.rates,
              source_status: data.source_status,
              updated_at: data.updated_at,
              cache_timestamp: data.cache_timestamp
            });
          }
        } else {
          console.warn("Backend price compilation failed, keeping local premium reference rates.");
        }
      } else {
        console.warn("Server returned error status for prices, keeping local premium reference rates.");
      }
    } catch (err) {
      console.warn("Failed to connect with PGR prices endpoint, keeping local premium reference rates:", err);
    } finally {
      // Small simulated buffer for premium UX feel
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Sync market rates on mount and poll every 60 seconds
  useEffect(() => {
    fetchRates();
    const interval = setInterval(() => {
      fetchRates();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const handleOpenQuote = (productName?: string) => {
    setPrefilledProductName(productName);
    setIsQuoteOpen(true);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToCatalogWithFilter = (category?: string) => {
    if (category) {
      setCatalogCategoryFilter(category);
    } else {
      setCatalogCategoryFilter("all");
    }
    handleScrollToSection("catalog");
  };

  // Intercept Admin & Custom routes for clean, un-nested display
  if (currentPath === "/admin" || currentPath.startsWith("/admin/")) {
    return <AdminPanel currentLang={currentLang} />;
  }

  if (currentPath === "/login") {
    return (
      <LoginPage 
        currentLang={currentLang} 
        onNavigate={navigateTo} 
        onLoginSuccess={(u) => {
          mockDb.auth.setUser(u);
          navigateTo("/dashboard");
        }} 
      />
    );
  }

  if (currentPath === "/register") {
    return (
      <RegisterPage 
        currentLang={currentLang} 
        onNavigate={navigateTo} 
        onRegisterSuccess={(u) => {
          mockDb.auth.setUser(u);
          navigateTo("/dashboard");
        }} 
      />
    );
  }

  if (currentPath === "/request-quote") {
    return <RequestQuotePage currentLang={currentLang} onNavigate={navigateTo} />;
  }

  if (currentPath === "/calculator") {
    return (
      <div className={`min-h-screen text-stone-900 bg-[#FAF9F5] selection:bg-gold-base selection:text-black overflow-hidden relative ${
        currentLang === "ar" ? "font-arabic" : "font-sans"
      }`}>
        <Header
          currentLang={currentLang}
          toggleLanguage={toggleLanguage}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onNavigate={(sec) => {
            navigateTo("/");
            setTimeout(() => handleScrollToSection(sec), 100);
          }}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenQuote={() => navigateTo("/request-quote")}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
        <div className="max-w-7xl mx-auto py-32 px-4 md:px-8">
          <MetalCalculator
            currentLang={currentLang}
            rates={rates}
            selectedCurrency={selectedCurrency}
            onOpenQuote={(details) => {
              navigateTo("/request-quote");
            }}
          />
        </div>
        <Footer
          currentLang={currentLang}
          onNavigate={(sec) => {
            navigateTo("/");
            setTimeout(() => handleScrollToSection(sec), 100);
          }}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenQuote={() => navigateTo("/request-quote")}
          onOpenLegalDoc={(docId) => {
            const rMap: Record<string, string> = {
              "terms": "/terms",
              "privacy": "/privacy-policy",
              "aml": "/kyc-aml-policy",
              "pricing": "/pricing-disclaimer",
              "refund": "/refund-cancellation-policy",
              "delivery": "/delivery-collection-policy",
              "storage": "/allocated-storage-terms",
              "sellback": "/sell-back-policy",
              "risk": "/risk-disclosure",
              "cookie": "/cookie-policy",
              "compliance": "/compliance"
            };
            const p = rMap[docId] || "/";
            window.history.pushState(null, "", p);
            setActiveLegalDoc(docId);
          }}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
      </div>
    );
  }

  const seoPaths = [
    "/buy-gold-bars-dubai",
    "/buy-silver-bars-dubai",
    "/gold-rate-dubai-today",
    "/silver-rate-dubai-today",
    "/sell-gold-dubai",
    "/bullion-desk-dubai",
    "/allocated-storage-dubai",
    "/24k-gold-bars-uae"
  ];

  if (seoPaths.includes(currentPath)) {
    return (
      <div className={`min-h-screen text-stone-900 bg-[#FAF9F5] selection:bg-gold-base selection:text-black overflow-hidden relative ${
        currentLang === "ar" ? "font-arabic" : "font-sans"
      }`}>
        <Header
          currentLang={currentLang}
          toggleLanguage={toggleLanguage}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onNavigate={(sec) => {
            navigateTo("/");
            setTimeout(() => handleScrollToSection(sec), 100);
          }}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenQuote={() => navigateTo("/request-quote")}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
        <div className="max-w-7xl mx-auto py-24 px-4 md:px-8">
          <SEOLandingPages
            currentPath={currentPath}
            currentLang={currentLang}
            rates={rates}
            selectedCurrency={selectedCurrency}
            onNavigate={navigateTo}
            onOpenQuote={(details) => {
              navigateTo("/request-quote");
            }}
          />
        </div>
        <Footer
          currentLang={currentLang}
          onNavigate={(sec) => {
            navigateTo("/");
            setTimeout(() => handleScrollToSection(sec), 100);
          }}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenQuote={() => navigateTo("/request-quote")}
          onOpenLegalDoc={(docId) => {
            const rMap: Record<string, string> = {
              "terms": "/terms",
              "privacy": "/privacy-policy",
              "aml": "/kyc-aml-policy",
              "pricing": "/pricing-disclaimer",
              "refund": "/refund-cancellation-policy",
              "delivery": "/delivery-collection-policy",
              "storage": "/allocated-storage-terms",
              "sellback": "/sell-back-policy",
              "risk": "/risk-disclosure",
              "cookie": "/cookie-policy",
              "compliance": "/compliance"
            };
            const p = rMap[docId] || "/";
            window.history.pushState(null, "", p);
            setActiveLegalDoc(docId);
          }}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
      </div>
    );
  }

  if (currentPath === "/allocated-storage") {
    return <AllocatedStoragePage currentLang={currentLang} onNavigate={navigateTo} />;
  }

  if (currentPath === "/sell-back") {
    return <SellBackPage currentLang={currentLang} onNavigate={navigateTo} />;
  }

  if (currentPath === "/dashboard") {
    const currentUser = mockDb.auth.getUser();
    if (!currentUser) {
      return (
        <LoginPage 
          currentLang={currentLang} 
          onNavigate={navigateTo} 
          onLoginSuccess={(u) => {
            mockDb.auth.setUser(u);
            navigateTo("/dashboard");
          }} 
        />
      );
    }
    return (
      <ClientDashboard 
        currentLang={currentLang} 
        user={currentUser} 
        onLogout={() => {
          mockDb.auth.logout();
          navigateTo("/");
        }} 
        onNavigate={navigateTo} 
      />
    );
  }

  // Handle Product Category landing pages
  const productCategories = ["/gold-bars", "/silver-bars", "/bullion-coins", "/custom-inquiry"];
  if (productCategories.includes(currentPath)) {
    return (
      <div className={`min-h-screen text-[#1F1A17] bg-[#FAF9F5] selection:bg-gold-base selection:text-black overflow-hidden relative ${
        currentLang === "ar" ? "font-arabic" : "font-sans"
      }`} id="product-landing-page-wrapper">
        <Header
          currentLang={currentLang}
          toggleLanguage={toggleLanguage}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onNavigate={(sec) => {
            navigateTo("/");
            setTimeout(() => handleScrollToSection(sec), 100);
          }}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenQuote={() => navigateTo("/request-quote")}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
        <div className="max-w-7xl mx-auto py-24 px-4 md:px-8">
          <ProductLandingPage 
            categoryPath={currentPath as any} 
            currentLang={currentLang} 
            onNavigate={navigateTo} 
            onOpenProductDetail={setSelectedProduct}
            rates={rates}
            selectedCurrency={selectedCurrency}
            onOpenQuote={(pName) => {
              navigateTo("/request-quote");
            }}
          />
        </div>
        <Footer
          currentLang={currentLang}
          onNavigate={(sec) => {
            navigateTo("/");
            setTimeout(() => handleScrollToSection(sec), 100);
          }}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenQuote={() => navigateTo("/request-quote")}
          onOpenLegalDoc={(docId) => {
            const rMap: Record<string, string> = {
              "terms": "/terms",
              "privacy": "/privacy-policy",
              "aml": "/kyc-aml-policy",
              "pricing": "/pricing-disclaimer",
              "refund": "/refund-cancellation-policy",
              "delivery": "/delivery-collection-policy",
              "storage": "/allocated-storage-terms",
              "sellback": "/sell-back-policy",
              "risk": "/risk-disclosure",
              "cookie": "/cookie-policy",
              "compliance": "/compliance"
            };
            const p = rMap[docId] || "/";
            window.history.pushState(null, "", p);
            setActiveLegalDoc(docId);
          }}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
      </div>
    );
  }

  // ROOT / HOMEPAGE LAYOUT
  return (
    <div className={`min-h-screen text-stone-900 bg-[#FAF9F5] selection:bg-gold-base selection:text-black overflow-hidden relative ${
      currentLang === "ar" ? "font-arabic" : "font-sans"
    }`} id="pgr-root-container">
      
      {/* Structural Glowing Accents in Backdrop */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-dark/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gold-base/3 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-gold-base/4 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Global Navigation Header component */}
      <Header
        currentLang={currentLang}
        toggleLanguage={toggleLanguage}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onNavigate={handleScrollToSection}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenQuote={() => navigateTo("/request-quote")}
        onOpenClientDashboard={() => navigateTo("/dashboard")}
        onOpenAdminPortal={() => navigateTo("/admin")}
      />

      {/* Hero Epic Visual Landing stage */}
      <Hero
        currentLang={currentLang}
        onScrollToCatalog={handleScrollToCatalogWithFilter}
        onScrollToMarket={() => handleScrollToSection("market")}
        onOpenQuote={() => navigateTo("/request-quote")}
      />

      {/* Live Market Spot rates section */}
      <LiveMarket
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onChangeCurrency={setSelectedCurrency}
        onRefresh={fetchRates}
        isRefreshing={isRefreshing}
        onOpenQuote={() => navigateTo("/request-quote")}
      />

      {/* Interactive Precious Metals Quote Calculator Section */}
      <section className="py-24 px-4 md:px-8 border-t border-amber-500/10 bg-white/40 relative z-10" id="calculator">
        <div className="max-w-7xl mx-auto">
          <MetalCalculator
            currentLang={currentLang}
            rates={rates}
            selectedCurrency={selectedCurrency}
            onOpenQuote={(details) => {
              navigateTo("/request-quote");
            }}
          />
        </div>
      </section>

      {/* Specialized Positioning Section for Iraq & UAE */}
      <section className="py-16 px-4 md:px-8 bg-stone-100 border-t border-b border-stone-200/50" id="positioning">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold block">
            {currentLang === "ar" ? "خدمات الذهب والفضة الإقليمية" : "REGIONAL PRECIOUS METALS CONDUIT"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-stone-900 font-medium">
            {currentLang === "ar" ? "خدمات متخصصة للذهب والفضة بين الإمارات والعراق" : "Specialized Precious Metals Services for Iraq & UAE"}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed max-w-3xl mx-auto">
            {currentLang === "ar"
              ? "تساعد PGR UAE العملاء على طلب منتجات الذهب والفضة من الإمارات، مع تأكيد السعر والتوفر وترتيب التوصيل أو الاستلام حسب التحقق والمستندات والمتطلبات الجمركية."
              : "PGR UAE helps customers request gold and silver products from the UAE, confirm availability and prices, and arrange delivery or pickup options subject to verification, documentation, and customs requirements."}
          </p>

          <div className="pt-4">
            <IraqTrustBadge currentLang={currentLang} />
          </div>
        </div>
      </section>

      {/* PGR UAE Bullion Collection Showcase Section */}
      <section className="py-20 px-4 md:px-8 bg-white border-b border-stone-200/50" id="bullion-collection-showcase">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Visual Column */}
            <div className="relative rounded overflow-hidden border border-[#E8DEC9] bg-[#FAF9F5] p-6 flex items-center justify-center shadow-md group">
              <img
                src="/images/products/01-bullion-collection.webp"
                alt={currentLang === "ar" ? "مجموعة سبائك بي جي آر الإمارات" : "PGR UAE Bullion Collection"}
                className="w-full h-auto max-h-[450px] object-contain rounded transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-100/10 to-white/50 pointer-events-none" />
            </div>

            {/* Content Column */}
            <div className="space-y-6 text-center lg:text-left animate-fadeIn" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FAF9F5] border border-[#E8DEC9]">
                <span className="h-2 w-2 rounded-full bg-[#C6A15B]"></span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5E564D]">
                  {currentLang === "ar" ? "عرض المجموعة الفاخرة" : "Premium Portfolio Showcase"}
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#1F1A17] font-medium leading-tight">
                  {currentLang === "ar" ? "مجموعة سبائك PGR دبي" : "PGR UAE Bullion Collection"}
                </h2>
                <p className="text-[#A47C36] text-xs font-mono tracking-widest uppercase font-bold">
                  {currentLang === "ar" ? "سبائك الذهب • سبائك الفضة • مسكوكات وعملات مصفاة" : "Gold Bars • Silver Bars • Mint Bars & Coins"}
                </p>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {currentLang === "ar"
                  ? "اكتشف أرقى سبائك الذهب والفضة المعتمدة دولياً من جمعية سوق السبائك في لندن (LBMA). تتوفر أوزان الخزينة المتعددة من جرام واحد إلى كيلو جرام، مصحوبة بوثائق الفحص والرقم التسلسلي المسجل رسمياً."
                  : "Discover physical gold and silver certified treasury assets directly sourced from accredited London Bullion Market Association (LBMA) refiners. Ranging from 1 Gram up to 1 Kilogram bars, all options feature official serializations."}
              </p>

              {/* Compliance quote status note */}
              <div className="p-4 rounded border border-[#E8DEC9] bg-[#FAF9F5]/50 text-left space-y-1.5 max-w-md mx-auto lg:mx-0">
                <p className="text-[11px] font-mono text-stone-700 font-bold flex items-center gap-1.5 justify-center lg:justify-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive-accent"></span>
                  {currentLang === "ar" ? "تنويه تسعير إرشادي" : "Indicative Quote Status"}
                </p>
                <p className="text-[10px] text-stone-500 font-sans leading-normal">
                  {currentLang === "ar"
                    ? "الأسعار المعروضة هي أسعار استرشادية مبدئية فقط. يتم تأكيد السعر النهائي المعتمد للتسوية من قبل ديوان تداول PGR UAE."
                    : "Indicative prices available. Final quote confirmed by PGR UAE desk before physical order settlement."}
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-2 flex justify-center lg:justify-start">
                <button
                  onClick={() => navigateTo("/request-quote")}
                  className="px-8 py-4 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded transition-all duration-300 shadow-md hover:scale-[1.01]"
                >
                  {currentLang === "ar" ? "طلب تسعير مؤكد" : "Request Firm Quote"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Product Catalog list and dynamic pricing */}
      <Catalog
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onSelectProduct={setSelectedProduct}
        selectedCategoryFilter={catalogCategoryFilter}
      />

      {/* Bento Layout: WHY PGR UAE (Institutional trust pillars) */}
      <section className="py-24 px-4 md:px-8 bg-white/60 border-t border-stone-200/50" id="why-us">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
              <Shield size={12} />
              {currentLang === "ar" ? "لماذا تختار بي بي جي آر دبي؟" : "The Preferred Choice"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-stone-900 font-medium">
              {currentLang === "ar" ? "المعايير والضمانات المؤسسية" : "Why Investors Choose PGR"}
            </h2>
            <p className="text-sm text-stone-600">
              {currentLang === "ar"
                ? "معايير تداول مطابقة للبورصات العالمية، وحلول شحن مؤمنة بالكامل لحفظ الثروات."
                : "Combining global logistical reach with Dubai's unmatched precious metals tax-exempt status."}
            </p>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US_ITEMS.map((item, idx) => {
               return (
                <div
                  key={idx}
                  className="glass-premium p-6 rounded-sm space-y-4 border border-stone-200/50 hover:border-gold-base/20 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base mb-2 group-hover:scale-105 transition-transform">
                    {idx === 0 ? <Landmark size={18} /> : idx === 1 ? <Building size={18} /> : idx === 2 ? <Truck size={18} /> : <Award size={18} />}
                  </div>

                  <h3 className="text-lg font-serif text-stone-900 tracking-wide font-medium">
                    {currentLang === "ar" ? item.title_ar : item.title_en}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {currentLang === "ar" ? item.desc_ar : item.desc_en}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Official Headquarters physical details & map */}
      <OfficeSection currentLang={currentLang} />

      {/* Precious metals advisory & analysis news blog */}
      <BlogSection currentLang={currentLang} />

      {/* Brands Showcase Section (Authorized distributors grid) */}
      <section className="py-20 px-4 md:px-8 bg-stone-50 border-t border-stone-200/50" id="brands">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
              <Sparkles size={11} />
              {currentLang === "ar" ? "الاعتمادات والعلامات العالمية" : "Accredited Global Partners"}
            </span>
            <h3 className="text-xl md:text-2xl font-serif text-stone-900 tracking-wide font-medium">
              {currentLang === "ar" ? "متوفر عبر ديوان PGR للذهب" : "Available Through PGR UAE"}
            </h3>
            <p className="text-xs text-stone-500 max-w-xl mx-auto leading-relaxed">
              {currentLang === "ar"
                ? "نحن وكيل وموزع معتمد لكبرى مصافي الذهب العالمية المعتمدة."
                : "Authorized logistics and trading conduit for world-renowned certified gold refineries."}
            </p>
          </div>

          {/* List of Brands */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {BRANDS.map((brand, idx) => (
              <div
                key={idx}
                className="p-5 rounded-sm bg-white/70 border border-stone-200/50 flex flex-col justify-center items-center text-center space-y-2 group hover:border-[#c5a85c]/30 hover:bg-white transition-all duration-300"
                title={brand.description}
              >
                <span className="text-xs font-serif font-bold text-stone-700 group-hover:text-stone-900 transition-colors">
                  {brand.name}
                </span>
                <span className="text-[9px] font-mono text-gold-base/60 uppercase tracking-widest">
                  {brand.origin}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer component */}
      <Footer
        currentLang={currentLang}
        onNavigate={handleScrollToSection}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenQuote={() => navigateTo("/request-quote")}
        onOpenLegalDoc={(docId) => {
          const rMap: Record<string, string> = {
            "terms": "/terms",
            "privacy": "/privacy-policy",
            "aml": "/kyc-aml-policy",
            "pricing": "/pricing-disclaimer",
            "refund": "/refund-cancellation-policy",
            "delivery": "/delivery-collection-policy",
            "storage": "/allocated-storage-terms",
            "sellback": "/sell-back-policy",
            "risk": "/risk-disclosure",
            "cookie": "/cookie-policy",
            "compliance": "/compliance"
          };
          const p = rMap[docId] || "/";
          window.history.pushState(null, "", p);
          setActiveLegalDoc(docId);
        }}
        onOpenClientDashboard={() => navigateTo("/dashboard")}
        onOpenAdminPortal={() => navigateTo("/admin")}
      />

      {/* Floating Action Buttons for WhatsApp & AI Concierge */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Quick WhatsApp Advisor Link */}
        <a
          href={`https://wa.me/971559688837?text=${encodeURIComponent(
            currentLang === "ar"
              ? "مرحباً، أريد طلب عرض سعر من PGR UAE للذهب أو الفضة."
              : "Hello, I would like to request a quote from PGR UAE for gold or silver products."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-105 transform transition-all"
          title="Direct WhatsApp Bullion Desk"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.015 14.113.99 11.48.99c-5.437 0-9.863 4.37-9.868 9.799-.001 1.77.475 3.493 1.378 5.017l-.972 3.548 3.639-.949zM15.75 12.83c-.279-.139-1.647-.812-1.9-1.04c-.253-.115-.438-.174-.621.115-.185.289-.713.89-.873 1.077-.159.186-.319.21-.599.07-.28-.14-1.18-.43-2.246-1.38-.83-.741-1.39-1.657-1.554-1.938-.163-.28-.017-.431.122-.571.125-.127.28-.323.419-.485.14-.162.18-.279.279-.465.1-.186.05-.349-.02-.489-.07-.139-.62-1.49-.85-2.04-.224-.54-.47-.465-.62-.473-.15-.008-.323-.01-.497-.01-.174 0-.458.065-.697.325-.24.26-.915.894-.915 2.182 0 1.288.937 2.532 1.068 2.71.13.178 1.841 2.81 4.46 3.94.622.269 1.108.43 1.488.55.626.198 1.196.17 1.645.104.5-.074 1.647-.674 1.881-1.325.234-.65.234-1.207.164-1.325-.07-.11-.26-.18-.54-.319z"/>
          </svg>
        </a>

        {/* Quick AI Concierge Trigger */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="h-12 w-12 bg-gradient-to-r from-gold-dark to-gold-base text-black rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 transform transition-all cursor-pointer"
          title="Product & Quote Assistant Desk"
        >
          <Sparkles size={20} />
        </button>
      </div>

      {/* MODAL: Product Detail View Panel with Specs, Certs & downloads */}
      {selectedProduct && (
        <ProductDetailModal
          currentLang={currentLang}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onOpenQuote={handleOpenQuote}
        />
      )}

      {/* MODAL: Custom Bespoke Quote Request Form */}
      {isQuoteOpen && (
        <QuoteForm
          currentLang={currentLang}
          prefilledProduct={prefilledProductName}
          onClose={() => {
            setIsQuoteOpen(false);
            setPrefilledProductName(undefined);
          }}
        />
      )}

      {/* MODAL: Secured Client Logistics and Certificate Checking (Legacy overlay backup) */}
      {isClientDashboardOpen && (
        <ClientDashboardModal
          currentLang={currentLang}
          onClose={() => setIsClientDashboardOpen(false)}
          rates={rates}
        />
      )}

      {/* MODAL: Admin portal for pricing and stock edits */}
      {isAdminPortalOpen && (
        <AdminPortalModal
          currentLang={currentLang}
          onClose={() => setIsAdminPortalOpen(false)}
        />
      )}

      {/* MODAL: Legal policies view overlay */}
      {activeLegalDoc && (
        <LegalOverlayModal
          currentLang={currentLang}
          defaultDoc={activeLegalDoc}
          onClose={() => {
            navigateTo("/");
            setActiveLegalDoc(null);
          }}
        />
      )}

      {/* DRAWER SLIDE: Executive AI Concierge Panel */}
      {isAIChatOpen && (
        <AIConcierge
          currentLang={currentLang}
          onClose={() => setIsAIChatOpen(false)}
        />
      )}

      {/* Database Telemetry & Security Panel */}
      <DebugPanel currentLang={currentLang} />

    </div>
  );
}

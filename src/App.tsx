/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MarketReferenceStrip from "./components/MarketReferenceStrip";
import HowFirmQuotesWork from "./components/HowFirmQuotesWork";
import Catalog from "./components/Catalog";
import TrustedPartnersSection from "./components/TrustedPartnersSection";
import PaymentSettlementSection from "./components/PaymentSettlementSection";
import BullionCollectionSection from "./components/BullionCollectionSection";
import HomepageFAQ from "./components/HomepageFAQ";
import CrawlableSeoBlock from "./components/CrawlableSeoBlock";
import ComplianceKYCSection from "./components/ComplianceKYCSection";
import { getRouteSeo, canonicalUrl } from "./lib/seoRoutes";
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
import { WHY_US_ITEMS } from "./data";
import { Shield, Building, Truck, Award, Sparkles } from "lucide-react";
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

  // Dynamic SEO metadata per public route
  useEffect(() => {
    const seo = getRouteSeo(currentPath);
    const title = currentLang === "ar" ? seo.titleAr : seo.titleEn;
    const desc = currentLang === "ar" ? seo.descAr : seo.descEn;
    const url = canonicalUrl(currentPath);

    document.title = title;
    document.documentElement.lang = currentLang === "ar" ? "ar" : "en";

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", url);
    } else {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", url);
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
    <div className={`min-h-screen text-text-charcoal bg-brand-bg selection:bg-gold-base selection:text-black relative ${
      currentLang === "ar" ? "font-arabic" : "font-sans"
    }`} id="pgr-root-container">

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

      <BullionCollectionSection
        currentLang={currentLang}
        onOpenQuote={() => navigateTo("/request-quote")}
        onScrollToCatalog={() => handleScrollToSection("catalog")}
      />

      <MarketReferenceStrip
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onChangeCurrency={setSelectedCurrency}
        onRefresh={fetchRates}
        isRefreshing={isRefreshing}
        onOpenQuote={() => navigateTo("/request-quote")}
      />

      <HowFirmQuotesWork currentLang={currentLang} />

      <Catalog
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onSelectProduct={setSelectedProduct}
        selectedCategoryFilter={catalogCategoryFilter}
        onOpenQuote={() => navigateTo("/request-quote")}
      />

      <PaymentSettlementSection
        currentLang={currentLang}
        onOpenQuote={() => navigateTo("/request-quote")}
      />

      <TrustedPartnersSection currentLang={currentLang} />

      <ComplianceKYCSection
        currentLang={currentLang}
        onOpenLegal={(docId) => {
          const rMap: Record<string, string> = {
            aml: "/kyc-aml-policy",
            pricing: "/pricing-disclaimer",
            compliance: "/compliance"
          };
          const p = rMap[docId] || "/";
          window.history.pushState(null, "", p);
          setActiveLegalDoc(docId);
        }}
      />

      <HomepageFAQ currentLang={currentLang} />

      <CrawlableSeoBlock currentLang={currentLang} />

      <section className="py-16 px-4 md:px-8 bg-brand-section border-t border-soft-border" id="positioning">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-serif text-text-charcoal font-medium">
            {currentLang === "ar" ? "خدمات الإمارات والعراق" : "UAE & Iraq Desk Services"}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl mx-auto font-sans">
            {currentLang === "ar"
              ? "تساعد PGR UAE العملاء على طلب منتجات الذهب والفضة من الإمارات، مع تأكيد السعر والتوفر وترتيب التوصيل أو الاستلام حسب التحقق والمستندات والمتطلبات الجمركية."
              : "PGR UAE helps customers request gold and silver from the UAE, confirm availability and firm quotes, and arrange delivery or pickup subject to verification and compliance review."}
          </p>
          <IraqTrustBadge currentLang={currentLang} />
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 bg-brand-bg border-t border-soft-border" id="why-us">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-bold flex items-center justify-center gap-2">
              <Shield size={12} />
              {currentLang === "ar" ? "لماذا PGR UAE" : "Why PGR UAE"}
            </span>
            <h2 className="text-3xl font-serif text-text-charcoal font-medium">
              {currentLang === "ar" ? "ديوان تداول سبائك معتمد" : "Accredited Bullion Desk Standards"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded border border-soft-border bg-brand-card space-y-3 hover:border-gold-base transition-colors"
              >
                <div className="h-10 w-10 rounded border border-soft-border bg-brand-bg flex items-center justify-center text-olive-accent">
                  {idx === 0 ? <Shield size={18} /> : idx === 1 ? <Building size={18} /> : idx === 2 ? <Truck size={18} /> : <Award size={18} />}
                </div>
                <h3 className="text-base font-serif text-text-charcoal font-medium">
                  {currentLang === "ar" ? item.title_ar : item.title_en}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  {currentLang === "ar" ? item.desc_ar : item.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OfficeSection currentLang={currentLang} />

      <BlogSection currentLang={currentLang} />

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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MarketReferenceStrip from "./components/MarketReferenceStrip";
import HowFirmQuotesWork from "./components/HowFirmQuotesWork";
import TrustBar from "./components/TrustBar";
import ProductShowroom from "./components/ProductShowroom";
import IraqSilverOffers from "./components/IraqSilverOffers";
import AboutQuoteDeskSection from "./components/AboutQuoteDeskSection";
import DeskServicesSection from "./components/DeskServicesSection";
import QuoteDeskProofSection from "./components/QuoteDeskProofSection";
import HomepageFAQ from "./components/HomepageFAQ";
import CrawlableSeoBlock from "./components/CrawlableSeoBlock";
import ComplianceKYCSection from "./components/ComplianceKYCSection";
import { getRouteSeo, SEO_LANDING_PATHS } from "./lib/seoRoutes";
import { applyPageSeo } from "./lib/seoMeta";
import ProductDetailModal from "./components/ProductDetailModal";
const AIConcierge = lazy(() => import("./components/AIConcierge"));
import FloatingConversionBar from "./components/FloatingConversionBar";
import QuoteReceivedPage from "./components/QuoteReceivedPage";
import OfficeSection from "./components/OfficeSection";
import ClientDashboardModal from "./components/ClientDashboardModal";
import AdminPortalModal from "./components/AdminPortalModal";
const AdminPanel = lazy(() => import("./components/AdminPanel"));
import LegalOverlayModal from "./components/LegalOverlayModal";
import Footer from "./components/Footer";
import SeoSiteLinks from "./components/SeoSiteLinks";
import { LiveMarketRates, Product } from "./types";
import { WHY_US_ITEMS, BRANDS } from "./data";
import { Shield, Sparkles, Building, Truck, Landmark, Award } from "lucide-react";
import { isLive, supabase, mockDb, ensureSupabaseReady, dbService } from "./lib/supabase";
import { trackPageView, trackQuoteFormStart } from "./lib/gtag";
import { captureAttributionFromUrl, appendAttributionToPath } from "./lib/attribution";
import { scrollToSection, scrollToTop } from "./lib/scrollNav";
import { buildDefaultExchangeRates, setLiveFxFromPriceApi } from "./lib/fxRatesClient";
import { OUNCE_TO_GRAM } from "./lib/marketReference";
import {
  REFERENCE_GOLD_USD_OZ,
  REFERENCE_SILVER_USD_OZ,
  REFERENCE_PLATINUM_USD_OZ,
  REFERENCE_PALLADIUM_USD_OZ,
} from "./lib/metalReferenceSpots";
import { DebugPanel } from "./components/DebugPanel";

// Imported new high-end compliance and desk components
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import RequestQuotePage from "./components/RequestQuotePage";
import ProductLandingPage from "./components/ProductLandingPage";
import AllocatedStoragePage from "./components/AllocatedStoragePage";
import SellBackPage from "./components/SellBackPage";
const ClientDashboard = lazy(() => import("./components/ClientDashboard"));
import MetalCalculator from "./components/MetalCalculator";
const SEOLandingPages = lazy(() => import("./components/SEOLandingPages"));
import FacebookLandingPage from "./components/FacebookLandingPage";
import IraqBullionQuotePage from "./components/IraqBullionQuotePage";
import AuthCallbackPage from "./components/AuthCallbackPage";
import PricingDisclaimer from "./components/PricingDisclaimer";
import KYCOnboardingPage from "./components/KYCOnboardingPage";
import {
  getCurrentUser,
  mapSupabaseUser,
  persistAppUser,
  signOut,
  upsertCustomerProfile,
  ensureKycStub,
  type AppUser,
} from "./lib/clientAuth";
import { needsKycCompletion } from "./lib/kycGate";

export default function App() {
  const [currentLang, setCurrentLang] = useState<"en" | "ar">("ar");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("IQD");
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Pre-calculated default reference spot rates for flawless client experience
  const getInitialRates = (): LiveMarketRates => {
    const defaultSpots = {
      gold: REFERENCE_GOLD_USD_OZ,
      silver: REFERENCE_SILVER_USD_OZ,
      platinum: REFERENCE_PLATINUM_USD_OZ,
      palladium: REFERENCE_PALLADIUM_USD_OZ,
    };

    const exchangeRates = buildDefaultExchangeRates();
    const ratesObj: any = {
      source_status: "reference",
      usd_iqd: exchangeRates.IQD,
      usd_aed: exchangeRates.AED,
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
  const [authUser, setAuthUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Modal / Drawer / Overlay States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Custom Client & Admin portals & Legal Overlays
  const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<string | null>(null);

  // Programmatic custom router
  const navigateTo = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path.split("?")[0]);
    scrollToTop();
  };

  const navigateToQuote = (prefill?: Product | string) => {
    void (async () => {
      let quotePath = "/request-quote";
      if (prefill && typeof prefill === "object") {
        const name = currentLang === "ar" ? prefill.name_ar : prefill.name_en;
        quotePath = `/request-quote?${new URLSearchParams({ product: prefill.id, name }).toString()}`;
      } else if (typeof prefill === "string" && prefill.trim()) {
        quotePath = `/request-quote?${new URLSearchParams({ name: prefill }).toString()}`;
      }
      quotePath = appendAttributionToPath(quotePath);

      const user = await getCurrentUser();
      if (!user) {
        navigateTo(`/login?next=${encodeURIComponent(quotePath)}`);
        return;
      }
      const kyc = await dbService.kyc.get(user.id);
      if (needsKycCompletion(kyc?.status)) {
        navigateTo(`/kyc?next=${encodeURIComponent(quotePath)}`);
        return;
      }
      trackQuoteFormStart(typeof prefill === "object" ? prefill.id : String(prefill || "general"));
      navigateTo(quotePath);
    })();
  };

  const renderConversionFab = () => (
    <FloatingConversionBar
      currentLang={currentLang}
      onOpenQuote={() => navigateToQuote()}
    />
  );

  const renderAiConcierge = () =>
    isAIChatOpen ? (
      <Suspense fallback={null}>
        <AIConcierge currentLang={currentLang} onClose={() => setIsAIChatOpen(false)} />
      </Suspense>
    ) : null;

  // Capture UTM / gclid on first landing for quote attribution
  useEffect(() => {
    captureAttributionFromUrl(window.location.search, window.location.pathname);
  }, []);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setAuthUser(u);
      setAuthReady(true);
    });
  }, [currentPath]);

  // Listen for Supabase Authentication changes
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    const initAuth = async () => {
      const ready = await ensureSupabaseReady();
      if (!ready || !isLive || !supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleUserLogin(session.user);
      }

      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await handleUserLogin(session.user);
        } else if (event === "SIGNED_OUT") {
          mockDb.auth.logout();
          setAuthUser(null);
        }
      });
      subscription = data.subscription;
    };

    initAuth();
    return () => subscription?.unsubscribe();
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

    applyPageSeo({ path: currentPath, title, description: desc, lang: currentLang });
    trackPageView(currentPath);
  }, [currentPath, currentLang]);

  const handleUserLogin = async (supabaseUser: any) => {
    const user = mapSupabaseUser(supabaseUser);
    persistAppUser(user);
    setAuthUser(user);

    try {
      await upsertCustomerProfile(user);
      await ensureKycStub(user);
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
          setLiveFxFromPriceApi({ usd_iqd: data.usd_iqd, usd_aed: data.usd_aed });
          if (data.source_status === "request_quote") {
            setRates(null);
          } else if (data.rates) {
            setRates({
              ...data.rates,
              source_status: data.source_status,
              updated_at: data.updated_at,
              cache_timestamp: data.cache_timestamp,
              usd_iqd: data.usd_iqd,
              usd_aed: data.usd_aed,
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
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const handleScrollToSection = (sectionId: string) => {
    scrollToSection(sectionId);
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
  if (currentPath === "/auth/callback") {
    return <AuthCallbackPage />;
  }

  if (currentPath === "/admin" || currentPath.startsWith("/admin/")) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-brand-bg" aria-busy="true" />}>
        <AdminPanel currentLang={currentLang} />
      </Suspense>
    );
  }

  if (currentPath === "/login") {
    return (
      <LoginPage 
        currentLang={currentLang} 
        onNavigate={navigateTo} 
        onLoginSuccess={(u) => {
          setAuthUser(u);
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
          setAuthUser(u);
        }} 
      />
    );
  }

  if (currentPath === "/calculator") {
    return (
      <div className={`desk-page-shell ${
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
            onOpenQuote={(details) => navigateToQuote(details)}
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
        {renderConversionFab()}
        {renderAiConcierge()}
      </div>
    );
  }

  if ((SEO_LANDING_PATHS as readonly string[]).includes(currentPath)) {
    return (
      <div className={`desk-page-shell ${
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
          <Suspense fallback={<div className="py-24 text-center text-text-secondary font-mono text-sm" aria-busy="true">Loading…</div>}>
            <SEOLandingPages
              currentPath={currentPath}
              currentLang={currentLang}
              rates={rates}
              selectedCurrency={selectedCurrency}
              onNavigate={navigateTo}
              onOpenQuote={(details) => navigateToQuote(details)}
            />
          </Suspense>
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
        {renderConversionFab()}
        {renderAiConcierge()}
      </div>
    );
  }

  if (currentPath === "/allocated-storage") {
    return <AllocatedStoragePage currentLang={currentLang} onNavigate={navigateTo} />;
  }

  if (currentPath === "/sell-back") {
    return <SellBackPage currentLang={currentLang} onNavigate={navigateTo} />;
  }

  const standaloneDeskPaths = [
    "/iraq-bullion-quote",
    "/facebook",
    "/request-quote",
    "/quote-received",
    "/faq",
    "/contact",
  ] as const;
  if ((standaloneDeskPaths as readonly string[]).includes(currentPath)) {
    return (
      <div
        className={`min-h-screen text-text-charcoal bg-brand-bg selection:bg-gold-base selection:text-black overflow-hidden relative ${
          currentLang === "ar" ? "font-arabic" : "font-sans"
        }`}
      >
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
          {currentPath === "/iraq-bullion-quote" && (
            <IraqBullionQuotePage currentLang={currentLang} onNavigate={navigateTo} />
          )}
          {currentPath === "/facebook" && (
            <FacebookLandingPage currentLang={currentLang} onNavigate={navigateTo} />
          )}
          {currentPath === "/request-quote" && (
            <RequestQuotePage currentLang={currentLang} onNavigate={navigateTo} />
          )}
          {currentPath === "/quote-received" && (
            <QuoteReceivedPage currentLang={currentLang} onNavigate={navigateTo} />
          )}
          {currentPath === "/faq" && (
            <div className="space-y-6">
              <HomepageFAQ currentLang={currentLang} />
              <PricingDisclaimer currentLang={currentLang} />
            </div>
          )}
          {currentPath === "/contact" && <OfficeSection currentLang={currentLang} sectionId="contact" />}
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
              terms: "/terms",
              privacy: "/privacy-policy",
              aml: "/kyc-aml-policy",
              pricing: "/pricing-disclaimer",
              refund: "/refund-cancellation-policy",
              delivery: "/delivery-collection-policy",
              storage: "/allocated-storage-terms",
              sellback: "/sell-back-policy",
              risk: "/risk-disclosure",
              cookie: "/cookie-policy",
              compliance: "/compliance"
            };
            const p = rMap[docId] || "/";
            window.history.pushState(null, "", p);
            setActiveLegalDoc(docId);
          }}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
        <SeoSiteLinks currentLang={currentLang} />
        {renderConversionFab()}
        {renderAiConcierge()}
      </div>
    );
  }

  if (currentPath === "/kyc") {
    return (
      <div
        className={`min-h-screen text-text-charcoal bg-brand-bg ${
          currentLang === "ar" ? "font-arabic" : "font-sans"
        }`}
      >
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
          onOpenQuote={() => navigateToQuote()}
          onOpenClientDashboard={() => navigateTo("/dashboard")}
          onOpenAdminPortal={() => navigateTo("/admin")}
        />
        <div className="max-w-7xl mx-auto py-24 px-4 md:px-8">
          <KYCOnboardingPage currentLang={currentLang} onNavigate={navigateTo} />
        </div>
        <Footer
          currentLang={currentLang}
          onNavigate={(sec) => {
            navigateTo("/");
            setTimeout(() => handleScrollToSection(sec), 100);
          }}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenQuote={() => navigateToQuote()}
          onOpenLegalDoc={(docId) => {
            const rMap: Record<string, string> = {
              terms: "/terms",
              privacy: "/privacy-policy",
              aml: "/kyc-aml-policy",
              pricing: "/pricing-disclaimer",
              refund: "/refund-cancellation-policy",
              delivery: "/delivery-collection-policy",
              storage: "/allocated-storage-terms",
              sellback: "/sell-back-policy",
              risk: "/risk-disclosure",
              cookie: "/cookie-policy",
              compliance: "/compliance",
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

  if (currentPath === "/dashboard") {
    if (!authReady) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center text-text-secondary text-sm">
          {currentLang === "ar" ? "جاري التحميل…" : "Loading…"}
        </div>
      );
    }
    if (!authUser) {
      return (
        <LoginPage
          currentLang={currentLang}
          onNavigate={navigateTo}
          onLoginSuccess={(u) => {
            setAuthUser(u);
            navigateTo("/dashboard");
          }}
        />
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen bg-brand-bg" aria-busy="true" />}>
        <ClientDashboard
          currentLang={currentLang}
          user={authUser}
          onLogout={async () => {
            await signOut();
            setAuthUser(null);
            navigateTo("/");
          }}
          onNavigate={navigateTo}
        />
      </Suspense>
    );
  }

  // Handle Product Category landing pages
  const productCategories = ["/gold-bars", "/silver-bars", "/bullion-coins", "/custom-inquiry"];
  if (productCategories.includes(currentPath)) {
    return (
      <div className={`desk-page-shell ${
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
            onOpenQuote={(pName) => navigateToQuote(pName)}
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
        {renderConversionFab()}
        {renderAiConcierge()}
      </div>
    );
  }

  // ROOT / HOMEPAGE LAYOUT
  return (
    <div className={`min-h-screen text-text-charcoal bg-brand-bg selection:bg-gold-base selection:text-black relative pb-[4.5rem] md:pb-0 ${
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

      {/* Hero with PALM Silver video + product sections */}
      <Hero
        currentLang={currentLang}
        onScrollToCatalog={handleScrollToCatalogWithFilter}
        onScrollToMarket={() => handleScrollToSection("market")}
        onOpenQuote={() => {
          const params = new URLSearchParams({
            product: "pgr-silver-1kg",
            name:
              currentLang === "ar"
                ? "سبيكة فضة PALM ١ كيلو"
                : "Palm Silver 1kg Bar",
          });
          navigateTo(`/request-quote?${params.toString()}`);
        }}
        onScrollToIraqOffers={() => handleScrollToSection("iraq-silver-offers")}
      />

      <TrustBar currentLang={currentLang} />

      <MarketReferenceStrip
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onChangeCurrency={setSelectedCurrency}
        onRefresh={fetchRates}
        isRefreshing={isRefreshing}
      />

      <IraqSilverOffers
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onSelectProduct={setSelectedProduct}
        onOpenQuote={navigateToQuote}
      />

      <ProductShowroom
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onSelectProduct={setSelectedProduct}
        selectedCategoryFilter={catalogCategoryFilter}
        onOpenQuote={navigateToQuote}
      />

      <HowFirmQuotesWork currentLang={currentLang} />

      <QuoteDeskProofSection currentLang={currentLang} />

      <AboutQuoteDeskSection
        currentLang={currentLang}
        onNavigate={navigateTo}
      />

      <DeskServicesSection
        currentLang={currentLang}
        onNavigate={navigateTo}
      />

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

      <OfficeSection currentLang={currentLang} sectionId="contact" />

      <SeoSiteLinks currentLang={currentLang} />

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

      {/* Floating conversion actions (WhatsApp + AI) */}
      {renderConversionFab()}

      {/* MODAL: Product Detail View Panel with Specs, Certs & downloads */}
      {selectedProduct && (
        <ProductDetailModal
          currentLang={currentLang}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onOpenQuote={navigateToQuote}
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
      {renderAiConcierge()}

    </div>
  );
}

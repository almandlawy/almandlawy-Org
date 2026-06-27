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
import LegalOverlayModal from "./components/LegalOverlayModal";
import IraqTrustBadge from "./components/IraqTrustBadge";
import Footer from "./components/Footer";
import { DebugPanel } from "./components/DebugPanel";
import { LiveMarketRates, Product } from "./types";
import { WHY_US_ITEMS, BRANDS } from "./data";
import { Shield, Sparkles, Building, Truck, Landmark, Award } from "lucide-react";

export default function App() {
  const [currentLang, setCurrentLang] = useState<"en" | "ar">("ar");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("AED"); // Default to local UAE Dirham
  const [rates, setRates] = useState<LiveMarketRates | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal / Drawer / Overlay States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [prefilledProductName, setPrefilledProductName] = useState<string | undefined>(undefined);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  // Custom VIP & Admin portals & Legal Overlays
  const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<string | null>(null);

  // Active category filter for Catalog (for smooth scrolling filter options from Hero)
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>("all");

  // Fetch Metal Spot rates from backend
  const fetchRates = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/prices");
      const data = await response.json();
      if (response.ok && data.status === "success") {
        setRates(data.rates);
      } else {
        console.error("Backend price compilation failed, falling back to static feed.");
      }
    } catch (err) {
      console.error("Failed to connect with PGR prices endpoint:", err);
    } finally {
      // Small simulated buffer for premium UX feel
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Sync market rates on mount and poll every 15 seconds
  useEffect(() => {
    fetchRates();
    const interval = setInterval(() => {
      fetchRates();
    }, 15000);
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

  return (
    <div className={`min-h-screen text-white bg-[#070707] selection:bg-gold-base selection:text-black overflow-hidden relative ${
      currentLang === "ar" ? "font-arabic" : "font-sans"
    }`} id="pgr-root-container">
      
      {/* Structural Glowing Accents in Backdrop */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-dark/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-white/[0.02] blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-gold-base/3 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Global Navigation Header component */}
      <Header
        currentLang={currentLang}
        toggleLanguage={toggleLanguage}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onNavigate={handleScrollToSection}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenQuote={() => handleOpenQuote()}
        onOpenClientDashboard={() => setIsClientDashboardOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
      />

      {/* Hero Epic Visual Landing stage */}
      <Hero
        currentLang={currentLang}
        onScrollToCatalog={handleScrollToCatalogWithFilter}
        onScrollToMarket={() => handleScrollToSection("market")}
        onOpenQuote={() => handleOpenQuote()}
      />

      {/* Live Market Spot rates section */}
      <LiveMarket
        currentLang={currentLang}
        rates={rates}
        selectedCurrency={selectedCurrency}
        onChangeCurrency={setSelectedCurrency}
        onRefresh={fetchRates}
        isRefreshing={isRefreshing}
      />

      {/* Specialized Positioning Section for Iraq & UAE */}
      <section className="py-16 px-4 md:px-8 bg-[#0a0a0b] border-t border-b border-white/[0.03]" id="positioning">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold block">
            {currentLang === "ar" ? "خدمات الذهب والفضة الإقليمية" : "REGIONAL PRECIOUS METALS CONDUIT"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-white font-medium">
            {currentLang === "ar" ? "خدمات متخصصة للذهب والفضة بين الإمارات والعراق" : "Specialized Precious Metals Services for Iraq & UAE"}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {currentLang === "ar"
              ? "تساعد PGR UAE العملاء على طلب منتجات الذهب والفضة من الإمارات، مع تأكيد السعر والتوفر وترتيب التوصيل أو الاستلام حسب التحقق والمستندات والمتطلبات الجمركية."
              : "PGR UAE helps customers request gold and silver products from the UAE, confirm availability and prices, and arrange delivery or pickup options subject to verification, documentation, and customs requirements."}
          </p>

          <div className="pt-4">
            <IraqTrustBadge currentLang={currentLang} />
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
      <section className="py-24 px-4 md:px-8 bg-[#070707] border-t border-white/[0.03]" id="why-us">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
              <Shield size={12} />
              {currentLang === "ar" ? "لماذا تختار بي بي جي آر دبي؟" : "The Sovereign Choice"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-white font-medium">
              {currentLang === "ar" ? "المعايير والضمانات المؤسسية" : "Why Sovereign Investors Choose PGR"}
            </h2>
            <p className="text-sm text-gray-400">
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
                  className="glass-premium p-6 rounded-sm space-y-4 border border-white/[0.02] hover:border-gold-base/20 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base mb-2 group-hover:scale-105 transition-transform">
                    {idx === 0 ? <Landmark size={18} /> : idx === 1 ? <Building size={18} /> : idx === 2 ? <Truck size={18} /> : <Award size={18} />}
                  </div>

                  <h3 className="text-lg font-serif text-white tracking-wide font-medium">
                    {currentLang === "ar" ? item.title_ar : item.title_en}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
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
      <section className="py-20 px-4 md:px-8 bg-[#0a0a0a] border-t border-white/[0.03]" id="brands">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
              <Sparkles size={11} />
              {currentLang === "ar" ? "الاعتمادات والعلامات العالمية" : "Accredited Global Partners"}
            </span>
            <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide font-medium">
              {currentLang === "ar" ? "متوفر عبر ديوان PGR للذهب" : "Available Through PGR UAE"}
            </h3>
            <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
              {currentLang === "ar"
                ? "نحن وكيل وموزع معتمد لكبرى مصافي الذهب العالمية الحاصلة على شهادة تسليم بورصة لندن (Good Delivery)."
                : "Authorized logistics and trading conduit for world-renowned LBMA-certified gold refineries."}
            </p>
          </div>

          {/* List of Brands */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {BRANDS.map((brand, idx) => (
              <div
                key={idx}
                className="p-5 rounded-sm bg-[#111111]/60 border border-white/[0.02] flex flex-col justify-center items-center text-center space-y-2 group hover:border-white/10 transition-colors"
                title={brand.description}
              >
                <span className="text-xs font-serif font-bold text-gray-300 group-hover:text-white transition-colors">
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
        onOpenQuote={() => handleOpenQuote()}
        onOpenLegalDoc={(docId) => setActiveLegalDoc(docId)}
        onOpenClientDashboard={() => setIsClientDashboardOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
      />

      {/* Floating Action Buttons for WhatsApp & AI Concierge */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Quick WhatsApp Advisor Link */}
        <a
          href="https://wa.me/971509998888"
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-105 transform transition-all"
          title="Direct WhatsApp Trading Desk"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.015 14.113.99 11.48.99c-5.437 0-9.863 4.37-9.868 9.799-.001 1.77.475 3.493 1.378 5.017l-.972 3.548 3.639-.949zM15.75 12.83c-.279-.139-1.647-.812-1.9-1.04c-.253-.115-.438-.174-.621.115-.185.289-.713.89-.873 1.077-.159.186-.319.21-.599.07-.28-.14-1.18-.43-2.246-1.38-.83-.741-1.39-1.657-1.554-1.938-.163-.28-.017-.431.122-.571.125-.127.28-.323.419-.485.14-.162.18-.279.279-.465.1-.186.05-.349-.02-.489-.07-.139-.62-1.49-.85-2.04-.224-.54-.47-.465-.62-.473-.15-.008-.323-.01-.497-.01-.174 0-.458.065-.697.325-.24.26-.915.894-.915 2.182 0 1.288.937 2.532 1.068 2.71.13.178 1.841 2.81 4.46 3.94.622.269 1.108.43 1.488.55.626.198 1.196.17 1.645.104.5-.074 1.647-.674 1.881-1.325.234-.65.234-1.207.164-1.325-.07-.11-.26-.18-.54-.319z"/>
          </svg>
        </a>

        {/* Quick AI Concierge Trigger */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="h-12 w-12 bg-gradient-to-r from-gold-dark to-gold-base text-black rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 transform transition-all cursor-pointer"
          title="Executive AI Advisor Desk"
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

      {/* MODAL: Secured VIP Client Logistics and Certificate Checking */}
      {isClientDashboardOpen && (
        <ClientDashboardModal
          currentLang={currentLang}
          onClose={() => setIsClientDashboardOpen(false)}
          rates={rates}
        />
      )}

      {/* MODAL: Sovereign Command Admin portal for pricing and stock edits */}
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
          onClose={() => setActiveLegalDoc(null)}
        />
      )}

      {/* DRAWER SLIDE: Executive AI Concierge Panel */}
      {isAIChatOpen && (
        <AIConcierge
          currentLang={currentLang}
          onClose={() => setIsAIChatOpen(false)}
        />
      )}

      {/* Luxury Database Connection Debug Panel */}
      <DebugPanel currentLang={currentLang} />

    </div>
  );
}

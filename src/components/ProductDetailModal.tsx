/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Phone, CheckCircle, Mail, AlertTriangle, FileText, ZoomIn, Download, Check, ExternalLink, Award } from "lucide-react";
import { Product, LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import { dbService, isProduction } from "../lib/supabase";

interface ProductDetailModalProps {
  currentLang: "en" | "ar";
  product: Product | null;
  onClose: () => void;
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onOpenQuote: (productName?: string) => void;
}

export default function ProductDetailModal({
  currentLang,
  product,
  onClose,
  rates,
  selectedCurrency,
  onOpenQuote
}: ProductDetailModalProps) {
  // Local state for the product currently on display
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>(null);
  
  // Gallery view angle selection state
  const [activeView, setActiveView] = useState<"obverse" | "reverse" | "packaging">("obverse");
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeTab, setActiveTab] = useState<"specs" | "cert" | "downloads" | "related">("specs");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Fetch dynamic catalog and settings
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const [pList, sObj] = await Promise.all([
          dbService.products.list(),
          dbService.settings.get()
        ]);
        if (pList && pList.length > 0) setProducts(pList);
        if (sObj) setSettings(sObj);
      } catch (err) {
        console.error("Error loading dynamic data in ProductDetailModal:", err);
      }
    };
    fetchDynamicData();
  }, []);

  // Sync state if product prop changes
  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      setActiveTab("specs");
    }
  }, [product]);

  if (!activeProduct) return null;

  const isGold = activeProduct.technical_specs.metal === "gold";

  // Calculate live price estimation on demand
  const getLivePrice = () => {
    if (!rates) return null;
    if (rates.source_status !== "live" && rates.source_status !== "cached") {
      return null;
    }
    const cur = selectedCurrency as any;
    const isGoldMetal = activeProduct.technical_specs.metal === "gold";
    const baseSpot = isGoldMetal ? rates.gold.currencies[cur] : rates.silver.currencies[cur];

    if (!baseSpot) return null;

    let totalGrams = 0;
    if (activeProduct.technical_specs.weight_grams) {
      totalGrams = activeProduct.technical_specs.weight_grams;
    } else if (activeProduct.technical_specs.weight_oz) {
      totalGrams = activeProduct.technical_specs.weight_oz * 31.1034768;
    }

    if (totalGrams === 0) return null;

    const baseCost = totalGrams * baseSpot.gram;
    const finalCost = baseCost * activeProduct.premium_multiplier;

    return finalCost.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Pre-compile the WhatsApp message depending on selected language
  const getWhatsAppLink = () => {
    const baseMsg = currentLang === "ar"
      ? "مرحباً، أريد طلب عرض سعر من PGR UAE للذهب أو الفضة."
      : "Hello, I would like to request a quote from PGR UAE for gold or silver products.";
    
    return `https://wa.me/971559688837?text=${encodeURIComponent(baseMsg)}`;
  };

  // Interactive Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Simulated PDF Downloader trigger
  const triggerDownload = (docName: string, fileName: string) => {
    setDownloadSuccess(docName);
    
    const email = settings?.desk_email || "desk@pgruae.com";
    const phone = settings?.trade_phone || "+971 4 445 8888";

    // Create and download a simulated text file representing a secure receipt
    const content = `=====================================================
PGR UAE PRECIOUS METALS TRADING - DUBAI MARINA
OFFICIAL PRODUCT & QUOTE DESK SERVICE
=====================================================
Document: ${docName}
Reference SKU: ${activeProduct.id}
Manufacturer: ${activeProduct.manufacturer}
Assay Metal: ${activeProduct.technical_specs.metal.toUpperCase()}
Fineness: ${activeProduct.purity}
Timestamp: ${new Date().toUTCString()}

Under applicable UAE fiscal regulations, physical investment precious metals
originating from certified Refiners (International Standard)
are subject to 0% VAT in the United Arab Emirates.

This document serves as an official technical guide.
For physical delivery or storage release, contact the desk:
Email: ${email}
Phone: ${phone}
=====================================================`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4000);
  };

  // Find up to 3 related products of the same metal type
  const relatedProducts = (products.length > 0 ? products : (isProduction ? [] : PRODUCTS)).filter(
    (p) => p.technical_specs.metal === activeProduct.technical_specs.metal && p.id !== activeProduct.id
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="product-detail-portal" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      {/* Background Dimmer */}
      <div className="fixed inset-0 bg-[#070707]/90 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Console Container */}
      <div className="flex min-h-screen items-center justify-center p-4 md:p-8 relative">
        <div className="relative w-full max-w-5xl bg-[#111111] border border-white/[0.05] rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 animate-scaleUp">
          
          {/* Top Header Close bar */}
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black/95 transition-all cursor-pointer border border-white/[0.05]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* LEFT COLUMN: Large Zoom Image & Visual Gallery */}
            <div className="p-6 md:p-8 bg-[#0d0d0d] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.05]">
              <div className="space-y-6">
                
                {/* Image Showcase Frame with Luxury Zoom capability */}
                <div
                  className="relative h-72 md:h-96 w-full rounded-sm overflow-hidden bg-black/40 border border-white/[0.03] flex items-center justify-center cursor-zoom-in group"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setZoomScale(1.8)}
                  onMouseLeave={() => setZoomScale(1)}
                >
                  <img
                    src={
                      activeProduct.image_url || (isGold
                        ? "/gold_bar_luxury_1782445126673.jpg"
                        : "/silver_bar_luxury_1782445139922.jpg")
                    }
                    alt={activeProduct.name_en}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = isGold
                        ? "/gold_bar_luxury_1782445126673.jpg"
                        : "/silver_bar_luxury_1782445139922.jpg";
                    }}
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                    }}
                  />

                  {/* Shimmer sweep effect */}
                  <div className={`absolute inset-0 z-20 pointer-events-none ${isGold ? "shimmer-mask-gold" : "shimmer-mask"}`} />

                  {/* Overlay Helper Tag */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-gray-400 flex items-center gap-1.5 font-mono pointer-events-none">
                    <ZoomIn size={11} className="text-gold-base" />
                    <span>{currentLang === "ar" ? "مرر الماوس للتكبير" : "Hover image to zoom"}</span>
                  </div>
                </div>

                {/* Simulated High-End Gallery Selector Thumbnails */}
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: "obverse", label_en: "Obverse face", label_ar: "الوجه الأمامي" },
                    { id: "reverse", label_en: "Reverse face", label_ar: "الوجه الخلفي" },
                    { id: "packaging", label_en: "Assay pack", label_ar: "الغلاف الأمني" }
                  ] as const).map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      className={`py-2 px-3 text-[10px] font-mono rounded border transition-all cursor-pointer text-center uppercase tracking-wider ${
                        activeView === view.id
                          ? "bg-white/[0.03] text-white border-gold-base/50"
                          : "bg-transparent text-gray-500 border-white/[0.04] hover:text-white"
                      }`}
                    >
                      {currentLang === "ar" ? view.label_ar : view.label_en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security certification status card */}
              <div className="mt-8 p-4 rounded bg-white/[0.01] border border-white/[0.03] flex items-start gap-3">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider block">
                    {currentLang === "ar" ? "أصالة سبيكة معتمدة" : "Secured Assay Certified"}
                  </span>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-mono">
                    {currentLang === "ar"
                      ? "هذا المنتج مختوم ورقياً ومحمي بالكامل برقم تسلسلي معتمد دولياً."
                      : "Sourced with tamper-proof assay documentation. Directly verifiable by global refiner assays and physical vault clearings."}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Technical Specs & Action Center */}
            <div className="p-6 md:p-8 space-y-6 flex flex-col justify-between">
              
              {/* Product Info Block */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-gold-base uppercase tracking-widest">
                    {activeProduct.manufacturer}
                  </span>
                  
                  {/* Stock Indicator Node */}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {currentLang === "ar" ? "متاح في الخزينة" : "In Vault (Stock Available)"}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wide font-medium">
                  {currentLang === "ar" ? activeProduct.name_ar : activeProduct.name_en}
                </h1>

                {/* Main Product Description */}
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                  {currentLang === "ar" ? activeProduct.description_ar : activeProduct.description_en}
                </p>
              </div>

              {/* Dynamic Indicative Market Valuation */}
              <div className="p-4 rounded-sm bg-[#161616]/70 border border-white/[0.04] space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                  <span>{currentLang === "ar" ? "التسعير الاسترشادي المباشر" : "Estimated Retail Valuation"}</span>
                  <span className="text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded text-gray-400">SPOT + PREMIUM</span>
                </div>

                <div className="flex items-baseline justify-between">
                  {getLivePrice() ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl md:text-3xl font-serif font-medium ${isGold ? "text-gold-gradient" : "text-silver-gradient"}`}>
                          {getLivePrice()}
                        </span>
                        <span className="text-xs text-gray-400 font-mono font-medium">{selectedCurrency}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        {currentLang === "ar" ? "محدث تلقائياً" : "Live synchronized"}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl md:text-2xl font-serif font-medium text-gold-base">
                          {currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-500 font-mono font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        {currentLang === "ar" ? "سعر المباشر غير متوفر" : "Live price unavailable"}
                      </span>
                    </>
                  )}
                </div>

                <div className="text-[10px] font-mono text-gray-600 leading-relaxed pt-2 border-t border-white/[0.03]">
                  {currentLang === "ar"
                    ? "ملاحظة: تختلف الأسعار النهائية للصفقات الكبرى والمستندات الجمركية بالجملة. اطلب عرض السعر لمعرفة الأسعار اللحظية الدقيقة."
                    : "Indicative spot pricing only. Wholesale procurement, custom imports, and larger bullion allotments are structured individually via customized quotes."}
                </div>
              </div>

              {/* DYNAMIC SPECIFICATION & DOCUMENTATION TABS */}
              <div className="space-y-4">
                {/* Tab Switch buttons */}
                <div className="flex border-b border-white/[0.03] text-xs font-mono overflow-x-auto whitespace-nowrap">
                  {[
                    { id: "specs", label_en: "Attributes", label_ar: "المواصفات" },
                    { id: "cert", label_en: "Assay & Cert", label_ar: "شهادة الأصالة" },
                    { id: "downloads", label_en: "Downloads", label_ar: "التحميلات" },
                    { id: "related", label_en: "Related", label_ar: "المنتجات المماثلة" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "text-gold-base border-gold-base font-semibold"
                          : "text-gray-500 border-transparent hover:text-white"
                      }`}
                    >
                      {currentLang === "ar" ? tab.label_ar : tab.label_en}
                    </button>
                  ))}
                </div>

                {/* Tab 1: Attribute specs table */}
                {activeTab === "specs" && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono animate-fadeIn">
                    <div className="flex justify-between py-1 border-b border-white/[0.02]">
                      <span className="text-gray-500">{currentLang === "ar" ? "المعدن النقدي" : "Assay Metal"}</span>
                      <span className="text-gray-300 capitalize">{activeProduct.technical_specs.metal}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.02]">
                      <span className="text-gray-500">{currentLang === "ar" ? "المصفاة والمصنع" : "Mint Refiner"}</span>
                      <span className="text-gray-300">{activeProduct.manufacturer}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.02]">
                      <span className="text-gray-500">{currentLang === "ar" ? "بلد المنشأ" : "Origin Country"}</span>
                      <span className="text-gray-300">{currentLang === "ar" ? activeProduct.country_ar : activeProduct.country_en}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.02]">
                      <span className="text-gray-500">{currentLang === "ar" ? "النقاوة الرسمية" : "Fineness"}</span>
                      <span className="text-gray-300">{activeProduct.purity}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.02]">
                      <span className="text-gray-500">{currentLang === "ar" ? "شهادة فحص" : "Certification"}</span>
                      <span className="text-gray-300 text-right text-[10px] truncate max-w-[120px]">
                        {currentLang === "ar" ? "معتمدة بالكامل" : "Verifiable Assay"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.02]">
                      <span className="text-gray-500">{currentLang === "ar" ? "أبعاد السبيكة" : "Dimensions"}</span>
                      <span className="text-gray-300">{activeProduct.technical_specs.dimensions || "Standard"}</span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Assay standards & custom vault link */}
                {activeTab === "cert" && (
                  <div className="p-4 rounded border border-white/[0.02] bg-[#161618] text-xs font-mono space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-gold-base">
                      <Award size={14} />
                      <span className="font-semibold uppercase tracking-wider">
                        {currentLang === "ar" ? "معايير الجودة الدولية المعتمدة" : "International Quality Standards"}
                      </span>
                    </div>
                    <p className="text-gray-400 leading-relaxed text-[11px] font-sans">
                      {currentLang === "ar"
                        ? "كافة المصافي المعتمدة لدينا مدرجة في القوائم الرسمية المعتمدة للمصافي العالمية. يتم نقش الرقم التسلسلي الفريد بدقة على وجه كل سبيكة للتأكد المطلق من أصالتها."
                        : "Our represented Swiss and international mints adhere to stringent recognized international purity standards. Every single product has an individualized laser seal engraved into its face."}
                    </p>
                    <div className="pt-2 border-t border-white/[0.02] flex justify-between items-center text-[10px]">
                      <span className="text-gray-500">SECURE VAULT SERIAL:</span>
                      <span className="text-emerald-400 font-bold tracking-widest">{isGold ? "PAMP-882941" : "VALC-119302"}</span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Downloads */}
                {activeTab === "downloads" && (
                  <div className="space-y-2 animate-fadeIn text-xs font-mono">
                    {[
                      { name: "Official Assay Report (PDF)", file: "PGR_Assay_Report.pdf" },
                      { name: "PGR Storage Agreement (PDF)", file: "PGR_Vault_Storage_Guide.pdf" },
                      { name: "Dubai Bullion Advantage (PDF)", file: "Dubai_Gold_Advantage_Guide.pdf" }
                    ].map((doc, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-[#161618] border border-white/[0.02] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FileText size={13} className="text-[#c5a85c]" />
                          <span className="text-gray-300">{doc.name}</span>
                        </div>
                        <button
                          onClick={() => triggerDownload(doc.name, doc.file)}
                          className="p-1.5 bg-[#c5a85c]/10 hover:bg-[#c5a85c] text-[#c5a85c] hover:text-black rounded transition-colors cursor-pointer"
                        >
                          {downloadSuccess === doc.name ? <Check size={12} /> : <Download size={12} />}
                        </button>
                      </div>
                    ))}
                    {downloadSuccess && (
                      <div className="text-[10px] text-emerald-400 font-mono text-center pt-1.5">
                        {currentLang === "ar" ? "✓ تم بدء تحميل الملف الآمن بنجاح" : "✓ Secure document download dispatched successfully"}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Related Products switch */}
                {activeTab === "related" && (
                  <div className="space-y-2.5 animate-fadeIn">
                    {relatedProducts.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => {
                          setActiveProduct(rel);
                          setActiveTab("specs");
                        }}
                        className="p-3 rounded bg-[#161618] border border-white/[0.02] hover:border-gold-base/30 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-black/40 border border-white/[0.03] overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={
                                rel.image_url || (rel.technical_specs.metal === "gold"
                                  ? "/gold_bar_luxury_1782445126673.jpg"
                                  : "/silver_bar_luxury_1782445139922.jpg")
                              }
                              alt={rel.name_en}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = rel.technical_specs.metal === "gold"
                                  ? "/gold_bar_luxury_1782445126673.jpg"
                                  : "/silver_bar_luxury_1782445139922.jpg";
                              }}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] font-serif font-semibold text-white group-hover:text-gold-base transition-colors block">
                              {currentLang === "ar" ? rel.name_ar : rel.name_en}
                            </span>
                            <span className="text-[9px] font-mono text-gray-500 block">
                              {rel.manufacturer} • {rel.purity}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-gold-base group-hover:translate-x-1 transition-transform">
                          {currentLang === "ar" ? "عرض ←" : "View →"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* ACTION CENTER BUTTONS: Quote, WhatsApp */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/[0.03]">
                {/* Bespoke Quote Request Form launch */}
                <button
                  onClick={() => {
                    const pName = currentLang === "ar" ? activeProduct.name_ar : activeProduct.name_en;
                    onOpenQuote(pName);
                    onClose();
                  }}
                  className="flex-1 px-6 py-3.5 bg-gold-base hover:bg-gold-light text-black text-[12px] uppercase tracking-widest font-semibold transition-all duration-300 rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.1)] animate-pulse"
                >
                  <FileText size={14} />
                  <span>{currentLang === "ar" ? "طلب عرض سعر رسمي" : "Request Bespoke Quote"}</span>
                </button>

                {/* Direct WhatsApp Instant Desk Orders */}
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3.5 bg-transparent hover:bg-white/[0.03] border border-white/20 hover:border-white text-white text-[12px] uppercase tracking-widest font-semibold transition-all duration-300 rounded-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone size={14} className="text-emerald-400" />
                  <span>{currentLang === "ar" ? "طلب عبر الواتساب" : "Order via WhatsApp"}</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

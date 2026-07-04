/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, Filter, ShieldCheck, ChevronRight, Sparkles, AlertCircle, Phone, FileText } from "lucide-react";
import { Product, MetalCategory, LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import { dbService, isProduction } from "../lib/supabase";
import { getProductImage } from "../lib/productImages";

interface CatalogProps {
  currentLang: "en" | "ar";
  rates: LiveMarketRates | null;
  selectedCurrency: string;
  onSelectProduct: (product: Product) => void;
  selectedCategoryFilter?: string; // To allow scrolling directly into a pre-filtered state from Hero
}

export default function Catalog({
  currentLang,
  rates,
  selectedCurrency,
  onSelectProduct,
  selectedCategoryFilter
}: CatalogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<string>(selectedCategoryFilter || "all");
  const [sortBy, setSortBy] = React.useState<"default" | "price_asc" | "price_desc" | "weight_asc" | "weight_desc" | "name_asc">("default");
  const [isProductsFetchFailed, setIsProductsFetchFailed] = React.useState(false);
  const [isPriceTimeout, setIsPriceTimeout] = React.useState(false);
  const [settings, setSettings] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const sObj = await dbService.settings.get();
        if (sObj) setSettings(sObj);
      } catch (err) {
        console.error("Failed to load settings in Catalog:", err);
      }
    };
    fetchSettings();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsPriceTimeout(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const list = await dbService.products.list();
        if (list && list.length > 0) {
          setProducts(list);
          setIsProductsFetchFailed(false);
        } else {
          setProducts(PRODUCTS);
          setIsProductsFetchFailed(true);
        }
      } catch (err) {
        console.error("Failed to load products dynamically:", err);
        setProducts(PRODUCTS);
        setIsProductsFetchFailed(true);
      }
    };
    fetchProducts();
  }, []);

  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setSelectedFilter(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  // Translate Category filter tags
  const getFilterLabel = (id: string) => {
    if (currentLang === "ar") {
      switch (id) {
        case "all": return "الجميع";
        case "gold_bars": return "سبائك الذهب";
        case "silver_bars": return "سبائك الفضة";
        case "gold_coins": return "مسكوكات الذهب";
        case "silver_coins": return "مسكوكات الفضة";
        default: return id;
      }
    } else {
      switch (id) {
        case "all": return "All Products";
        case "gold_bars": return "Gold Bars";
        case "silver_bars": return "Silver Bars";
        case "gold_coins": return "Gold Coins";
        case "silver_coins": return "Silver Coins";
        default: return id;
      }
    }
  };

  // Estimate physical product pricing based on current live spot rate
  const calculateIndicativePrice = (product: Product) => {
    try {
      if (!rates || !product) return null;
      const cur = selectedCurrency as any;
      const isGold = product?.technical_specs?.metal === "gold" || product?.category?.includes("gold");
      const baseSpot = isGold ? rates.gold.currencies[cur] : rates.silver.currencies[cur];

      if (!baseSpot) return null;

      let totalGrams = 0;
      if (product?.technical_specs?.weight_grams) {
        totalGrams = product.technical_specs.weight_grams;
      } else if (product?.technical_specs?.weight_oz) {
        totalGrams = product.technical_specs.weight_oz * 31.1034768;
      }

      if (totalGrams === 0) return null;

      const baseCost = totalGrams * baseSpot.gram;
      
      let premiumFactor = 1.0;
      if (product?.premium_multiplier) {
        premiumFactor = product.premium_multiplier;
      } else if (settings && settings.default_product_premium_pct) {
        premiumFactor = 1 + (settings.default_product_premium_pct / 100);
      } else {
        premiumFactor = 1.02; // default 2%
      }
      
      const finalCost = baseCost * premiumFactor;

      return finalCost;
    } catch (e) {
      console.error("Error calculating indicative price:", e);
      return null;
    }
  };

  const getWhatsAppLink = (product: Product) => {
    const pName = currentLang === "ar" ? product.name_ar : product.name_en;
    const baseMsg = currentLang === "ar"
      ? `مرحباً، أريد طلب عرض سعر رسمي لمنتج: ${pName}`
      : `Hello, I would like to request a firm quote from the PGR UAE desk for: ${pName}`;
    return `https://wa.me/971559688837?text=${encodeURIComponent(baseMsg)}`;
  };

  // Filter products based on search query and category pill selection
  const filteredProducts = (products.length > 0 ? products : PRODUCTS).filter((product) => {
    try {
      if (!product) return false;
      const matchesCategory = selectedFilter === "all" || product.category === selectedFilter;
      
      const query = searchQuery.toLowerCase();
      const nameMatch = (product.name_en || "").toLowerCase().includes(query) || (product.name_ar || "").includes(query);
      const manufacturerMatch = (product.manufacturer || "").toLowerCase().includes(query);
      const countryMatch = (product.country_en || "").toLowerCase().includes(query);
      const isPublished = product.published !== false;

      return isPublished && matchesCategory && (nameMatch || manufacturerMatch || countryMatch);
    } catch (e) {
      console.error("Error filtering product:", e);
      return false;
    }
  });

  // Sort products dynamically
  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price_asc" || sortBy === "price_desc") {
        const priceA = calculateIndicativePrice(a) || a.price || 0;
        const priceB = calculateIndicativePrice(b) || b.price || 0;
        return sortBy === "price_asc" ? priceA - priceB : priceB - priceA;
      }
      if (sortBy === "weight_asc" || sortBy === "weight_desc") {
        const weightA = a.technical_specs?.weight_grams || (a.technical_specs?.weight_oz ? a.technical_specs.weight_oz * 31.1035 : 0);
        const weightB = b.technical_specs?.weight_grams || (b.technical_specs?.weight_oz ? b.technical_specs.weight_oz * 31.1035 : 0);
        return sortBy === "weight_asc" ? weightA - weightB : weightB - weightA;
      }
      if (sortBy === "name_asc") {
        const nameA = currentLang === "ar" ? a.name_ar : a.name_en;
        const nameB = currentLang === "ar" ? b.name_ar : b.name_en;
        return nameA.localeCompare(nameB, currentLang === "ar" ? "ar" : "en");
      }
      return 0; // Default order
    });
  }, [filteredProducts, sortBy, rates, selectedCurrency, currentLang]);

  return (
    <section className="py-24 px-4 md:px-8 bg-brand-section border-t border-soft-border" id="catalog" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-bold flex items-center justify-center gap-2">
            <Sparkles size={11} className="text-olive-accent" />
            {currentLang === "ar" ? "المجموعة المعتمدة دولياً" : "Accredited Investment Portfolio"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-text-charcoal font-medium">
            {currentLang === "ar" ? "كتالوج السبائك والمعادن الثمينة" : "Precious Metals Catalog"}
          </h2>
          <p className="text-sm text-text-secondary">
            {currentLang === "ar" 
              ? "استعرض مجموعتنا الشاملة من سبائك ومسكوكات الذهب والفضة عالية النقاوة. جميع المنتجات تأتي من مصافٍ معتمدة عالمياً."
              : "Explore our collection of high-purity gold and silver bars and investment coins. Sourced exclusively from certified international refineries."}
          </p>
        </div>

        {/* Dynamic fetch warning banner */}
        {isProductsFetchFailed && (
          <div className="max-w-2xl mx-auto p-4 rounded border border-soft-border bg-soft-danger text-text-charcoal flex items-center gap-3 text-xs font-sans">
            <AlertCircle size={16} className="shrink-0 text-[#A47C36]" />
            <span className="font-semibold text-center w-full">
              {currentLang === "ar"
                ? "يتم تحديث المنتجات حالياً. يرجى طلب عرض سعر."
                : "Products are being updated. Please request a quote."}
            </span>
          </div>
        )}

        {isProduction && products.length === 0 ? (
          <div className="max-w-2xl mx-auto p-12 text-center border border-soft-border bg-soft-danger text-text-charcoal rounded space-y-4">
            <AlertCircle size={32} className="mx-auto text-gold-base animate-pulse" />
            <h3 className="text-lg font-serif text-text-charcoal">
              {currentLang === "ar" ? "تحديث كتالوج المنتجات" : "Catalog Update"}
            </h3>
            <p className="text-sm">
              {currentLang === "ar"
                ? "يتم تحديث المنتجات حالياً. يرجى طلب عرض سعر."
                : "Products are being updated. Please request a quote."}
            </p>
          </div>
        ) : (
          <>
            {/* Filters and Search Action Bar */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 pb-6 border-b border-soft-border">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {["all", "gold_bars", "silver_bars", "gold_coins", "silver_coins"].map((filterId) => (
                  <button
                    key={filterId}
                    onClick={() => {
                      setSelectedFilter(filterId);
                      setSortBy("default");
                    }}
                    className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer border ${
                      selectedFilter === filterId
                        ? "bg-[#C6A15B] text-text-charcoal border-[#C6A15B] shadow-sm"
                        : "text-text-secondary border-soft-border bg-brand-card hover:text-text-charcoal hover:border-[#C6A15B]"
                    }`}
                  >
                    {getFilterLabel(filterId)}
                  </button>
                ))}
              </div>

              {/* Premium Search Box */}
              <div className="relative max-w-md w-full">
                <Search size={16} className={`absolute ${currentLang === "ar" ? "right-3.5" : "left-3.5"} top-1/2 transform -translate-y-1/2 text-text-secondary`} />
                <input
                  type="text"
                  placeholder={currentLang === "ar" ? "ابحث بالوزن، المصفاة أو اسم المنتج..." : "Search by weight, mint, manufacturer..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${currentLang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 bg-brand-card rounded border border-soft-border focus:border-gold-base focus:ring-1 focus:ring-gold-base outline-none text-xs text-text-charcoal placeholder-text-secondary transition-all font-sans`}
                  style={{ direction: currentLang === "ar" ? "rtl" : "ltr", textAlign: currentLang === "ar" ? "right" : "left" }}
                />
              </div>
            </div>

            {/* Catalog Info & Sorting Sub-Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs font-sans py-2">
              <div className="text-text-secondary flex items-center gap-2 font-mono uppercase tracking-wider text-[11px]">
                <span className="h-2 w-2 rounded-full bg-olive-accent animate-pulse"></span>
                {currentLang === "ar" ? (
                  <span>تم العثور على <strong className="text-text-charcoal font-bold font-mono">{sortedProducts.length}</strong> منتجاً فاخراً</span>
                ) : (
                  <span>Found <strong className="text-text-charcoal font-bold font-mono">{sortedProducts.length}</strong> premium bullion products</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[11px] font-mono uppercase tracking-wider">
                  {currentLang === "ar" ? "ترتيب حسب:" : "Sort By:"}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-brand-card border border-soft-border text-text-charcoal rounded px-3 py-1.5 outline-none text-xs focus:border-gold-base cursor-pointer transition-colors font-mono"
                >
                  <option value="default">{currentLang === "ar" ? "الافتراضي" : "Default"}</option>
                  <option value="price_asc">{currentLang === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
                  <option value="price_desc">{currentLang === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</option>
                  <option value="weight_asc">{currentLang === "ar" ? "الوزن: من الأقل للأعلى" : "Weight: Low to High"}</option>
                  <option value="weight_desc">{currentLang === "ar" ? "الوزن: من الأعلى للأقل" : "Weight: High to Low"}</option>
                  <option value="name_asc">{currentLang === "ar" ? "الاسم" : "Name"}</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => {
                const isGold = product?.technical_specs?.metal === "gold" || product?.category?.includes("gold");
                const isCoin = product?.category?.includes("coin") || false;
                const indicativePrice = calculateIndicativePrice(product);

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-brand-card rounded overflow-hidden flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:scale-[1.01] border border-soft-border hover:border-[#C6A15B] shadow-sm"
                  >
                    {/* Visual Imagery Canvas using actual generated high-res illustrations */}
                    <div className="relative h-64 w-full bg-brand-bg overflow-hidden flex items-center justify-center border-b border-soft-border">
                      {/* Backdrop glowing dust */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent opacity-85 z-10" />
                      
                      {/* Real generated high-resolution assets linked dynamically based on category */}
                      <img
                        src={getProductImage(product)}
                        alt={`${currentLang === "ar" ? product.name_ar : product.name_en} - ${isGold ? (currentLang === "ar" ? "سبائك ذهب" : "Gold Bar") : (currentLang === "ar" ? "سبائك فضة" : "Silver Bar")} ${product.weight_label} - ${product.purity}`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = isGold
                            ? "/images/products/02-gold-bars-1g-5g-10g.webp"
                            : "/images/products/06-silver-bars-1oz-100g.webp";
                        }}
                        className="w-full h-full object-contain opacity-90 group-hover:scale-105 transition-all duration-1000 z-0"
                      />

                      {/* Shimmer reflection sweep animation */}
                      <div className={`absolute inset-0 z-20 ${isGold ? "shimmer-mask-gold" : "shimmer-mask"}`} />

                      {/* Brand metadata tag */}
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-card border border-soft-border shadow-sm">
                        <ShieldCheck size={11} className="text-olive-accent" />
                        <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">{product.manufacturer || "Certified"}</span>
                      </div>

                      {/* Certified Gold/Silver Stamp Overlay */}
                      <div className="absolute bottom-4 right-4 z-20 px-2 py-0.5 rounded bg-brand-card text-[#A47C36] border border-[#E8DEC9] text-[9px] font-mono tracking-widest uppercase font-bold shadow-sm">
                        {(product?.purity || "").split(" ")[0] || "999.9"}
                      </div>
                    </div>

                    {/* Information content area */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-brand-card">
                      <div className="space-y-3">
                        {/* Manufacturer Name & Country */}
                        <span className="text-[10px] font-mono text-[#A47C36] uppercase tracking-[0.2em] block font-bold">
                          {product.manufacturer || "Refined"} • {currentLang === "ar" ? product.country_ar || "دبي" : product.country_en || "Dubai"}
                        </span>
                        
                        {/* Product Name */}
                        <h3 className="text-base font-serif text-text-charcoal group-hover:text-[#A47C36] transition-colors line-clamp-2 font-medium">
                          {currentLang === "ar" ? product.name_ar || "" : product.name_en || ""}
                        </h3>

                        {/* Metal Type, Weight & Purity specifications details in crawlable HTML */}
                        <div className="space-y-1.5 text-xs font-sans text-text-secondary pt-1 border-t border-soft-border/50">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-500">{currentLang === "ar" ? "نوع المعدن:" : "Metal Type:"}</span>
                            <span className="font-mono text-text-charcoal font-bold uppercase">
                              {isGold ? (currentLang === "ar" ? "ذهب" : "Gold") : (currentLang === "ar" ? "فضة" : "Silver")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-500">{currentLang === "ar" ? "الوزن المقيد:" : "Weight:"}</span>
                            <span className="font-mono text-text-charcoal font-bold">{product?.weight_label || ""}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-500">{currentLang === "ar" ? "النقاوة المعتمدة:" : "Purity:"}</span>
                            <span className="font-mono text-text-charcoal font-bold">{product?.purity || "999.9"}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-500">{currentLang === "ar" ? "حالة التسعير:" : "Pricing Status:"}</span>
                            <span className="font-mono text-olive-accent font-bold text-[10px] uppercase">
                              {currentLang === "ar" ? "سعر استرشادي متوفر" : "Indicative price available"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Display */}
                      <div className="pt-3 border-t border-soft-border flex flex-col gap-1">
                        <span className="text-[10px] text-text-secondary font-mono block uppercase font-bold">
                          {product.price_mode === "fixed"
                            ? (currentLang === "ar" ? "السعر الثابت المعتمد" : "Confirmed Fixed Price")
                            : (rates && (rates.source_status === "live" || rates.source_status === "cached"))
                              ? (currentLang === "ar" ? "السعر الاسترشادي الفوري" : "Live Indicative Price")
                              : (currentLang === "ar" ? "السعر عند الطلب" : "Price on Request")}
                        </span>
                        
                        {product.price_mode === "fixed" ? (
                          <span className="text-lg font-mono font-bold text-text-charcoal">
                            {product.price && product.price > 0 ? (
                              <>
                                {product.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                                <span className="text-[10px] text-[#A47C36] font-bold">{selectedCurrency}</span>
                              </>
                            ) : (
                              <span className="text-xs text-[#A47C36] font-bold">
                                {currentLang === "ar" ? "طلب تسعير فوري" : "Request Quote"}
                              </span>
                            )}
                          </span>
                        ) : (rates && (rates.source_status === "live" || rates.source_status === "cached")) && indicativePrice ? (
                          <span className="text-lg font-mono font-bold text-[#1F1A17]">
                            {indicativePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                            <span className="text-[11px] text-[#A47C36] font-bold">{selectedCurrency}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-[#A47C36] font-bold">
                            {currentLang === "ar" ? "طلب تسعير فوري" : "Request Quote"}
                          </span>
                        )}

                        {/* Compliance Warning Note */}
                        <div className="bg-[#FAF9F5] p-2 rounded border border-[#E8DEC9]/60 text-[10px] text-stone-500 leading-normal mt-1">
                          {currentLang === "ar" 
                            ? "ملاحظة: السعر استرشادي. يتم تأكيد السعر النهائي للتسوية من قبل ديوان تداول PGR UAE."
                            : "Note: Indicative price. Final quote confirmed by PGR UAE desk before order settlement."}
                        </div>
                      </div>

                      {/* Dual Action Buttons directly on the card */}
                      <div className="pt-3 border-t border-soft-border/50 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(product);
                          }}
                          className="w-full py-2.5 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <FileText size={12} />
                          {currentLang === "ar" ? "طلب تسعير مؤكد" : "Request Firm Quote"}
                        </button>

                        <a
                          href={getWhatsAppLink(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone size={12} />
                          {currentLang === "ar" ? "ديوان تسعير واتساب" : "WhatsApp Quote Desk"}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Fallback if Search is empty */}
            {filteredProducts.length === 0 && (
              <div className="p-16 text-center border border-soft-border rounded bg-brand-bg space-y-4 max-w-md mx-auto">
                <AlertCircle size={32} className="text-gold-base mx-auto animate-pulse" />
                <h3 className="text-lg font-serif text-text-charcoal">
                  {currentLang === "ar" ? "لم يتم العثور على منتجات" : "No products found"}
                </h3>
                <p className="text-xs text-text-secondary">
                  {currentLang === "ar"
                    ? "يرجى تعديل معايير البحث أو تصفح الأقسام الأخرى من الكتالوج."
                    : "Please adjust your search queries or explore other bullion categories."}
                </p>
              </div>
            )}

            {/* Corporate Sourcing Footer Disclaimer */}
            <div className="p-4 rounded border border-soft-border bg-[#FFFDF8] flex items-center gap-3 max-w-4xl mx-auto text-xs text-text-secondary font-mono leading-relaxed shadow-sm">
              <ShieldCheck size={18} className="text-olive-accent shrink-0" />
              <span>
                {currentLang === "ar"
                  ? "بيان توضيحي: جميع منتجات العلامات التجارية (PAMP, Valcambi, Metalor, Royal Mint) متاحة من خلال PGR بصفتنا بيت تداول معتمد وتخضع للفحص. لا تدعي بي جي آر تفرّدها بتصنيع هذه السبائك الحرة."
                  : "Institutional notice: These globally respected bullion brands are officially sourced and authenticated through PGR UAE's licensed trading conduits. PGR UAE acts as an authorized bullion house and logistics partner, and does not claim manufacturing rights."}
              </span>
            </div>
          </>
        )}

      </div>
    </section>
  );
}

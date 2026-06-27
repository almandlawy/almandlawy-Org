/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, Filter, ShieldCheck, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { Product, MetalCategory, LiveMarketRates } from "../types";
import { PRODUCTS } from "../data";
import { dbService } from "../lib/supabase";

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

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const list = await dbService.products.list();
        if (list && list.length > 0) {
          setProducts(list);
        } else {
          setProducts(PRODUCTS);
        }
      } catch (err) {
        console.error("Failed to load products dynamically:", err);
        setProducts(PRODUCTS);
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
    if (!rates) return null;
    const cur = selectedCurrency as any;
    const isGold = product.technical_specs.metal === "gold";
    const baseSpot = isGold ? rates.gold.currencies[cur] : rates.silver.currencies[cur];

    if (!baseSpot) return null;

    let totalGrams = 0;
    if (product.technical_specs.weight_grams) {
      totalGrams = product.technical_specs.weight_grams;
    } else if (product.technical_specs.weight_oz) {
      totalGrams = product.technical_specs.weight_oz * 31.1034768;
    }

    if (totalGrams === 0) return null;

    const baseCost = totalGrams * baseSpot.gram;
    const finalCost = baseCost * product.premium_multiplier;

    return finalCost;
  };

  // Filter products based on search query and category pill selection
  const filteredProducts = (products.length > 0 ? products : PRODUCTS).filter((product) => {
    const matchesCategory = selectedFilter === "all" || product.category === selectedFilter;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = product.name_en.toLowerCase().includes(query) || product.name_ar.includes(query);
    const manufacturerMatch = product.manufacturer.toLowerCase().includes(query);
    const countryMatch = product.country_en.toLowerCase().includes(query);
    const isPublished = product.published !== false;

    return isPublished && matchesCategory && (nameMatch || manufacturerMatch || countryMatch);
  });

  return (
    <section className="py-24 px-4 md:px-8 bg-[#0a0a0a] border-t border-white/[0.03]" id="catalog" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
            <Sparkles size={11} />
            {currentLang === "ar" ? "المجموعة المعتمدة دولياً" : "Accredited Investment Portfolio"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-white font-medium">
            {currentLang === "ar" ? "كتالوج السبائك والمعادن الثمينة" : "Precious Metals Catalog"}
          </h2>
          <p className="text-sm text-gray-400">
            {currentLang === "ar" 
              ? "استعرض مجموعتنا الشاملة من سبائك ومسكوكات الذهب والفضة عالية النقاوة. جميع المنتجات تأتي من مصافٍ مصنفة عالمياً (LBMA)."
              : "Explore our collection of high-purity gold and silver bars and sovereign coins. Sourced exclusively from LBMA-certified international refineries."}
          </p>
        </div>

        {/* Filters and Search Action Bar */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 pb-6 border-b border-white/[0.04]">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {["all", "gold_bars", "silver_bars", "gold_coins", "silver_coins"].map((filterId) => (
              <button
                key={filterId}
                onClick={() => setSelectedFilter(filterId)}
                className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold transition-all duration-300 cursor-pointer border ${
                  selectedFilter === filterId
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                    : "text-gray-400 border-white/[0.05] bg-white/[0.01] hover:text-white hover:border-white/20"
                }`}
              >
                {getFilterLabel(filterId)}
              </button>
            ))}
          </div>

          {/* Premium Search Box */}
          <div className="relative max-w-md w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={currentLang === "ar" ? "ابحث بالوزن، المصفاة أو اسم المنتج..." : "Search by weight, mint, manufacturer..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111111]/80 rounded-sm border border-white/[0.05] focus:border-gold-base/50 focus:ring-1 focus:ring-gold-base/50 outline-none text-xs text-white placeholder-gray-500 transition-all font-sans"
              style={{ direction: currentLang === "ar" ? "rtl" : "ltr", textAlign: currentLang === "ar" ? "right" : "left" }}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const isGold = product.technical_specs.metal === "gold";
            const isCoin = product.category.includes("coin");
            const indicativePrice = calculateIndicativePrice(product);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`glass-premium rounded-sm overflow-hidden flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:scale-[1.01] border border-white/[0.03] ${
                  isGold ? "hover:border-gold-base/30" : "hover:border-silver-base/30"
                }`}
              >
                {/* Visual Imagery Canvas using actual generated high-res illustrations */}
                <div className="relative h-64 w-full bg-[#0d0d0d] overflow-hidden flex items-center justify-center border-b border-white/[0.03]">
                  {/* Backdrop glowing dust */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-[#0c0c0c] to-transparent opacity-85 z-10`} />
                  
                  {/* Real generated high-resolution assets linked dynamically based on category */}
                  <img
                    src={
                      product.image_url || (isGold
                        ? "/src/assets/images/gold_bar_luxury_1782445126673.jpg"
                        : "/src/assets/images/silver_bar_luxury_1782445139922.jpg")
                    }
                    alt={product.name_en}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-1000 scale-100 group-hover:scale-105 z-0"
                  />

                  {/* Shimmer reflection sweep animation */}
                  <div className={`absolute inset-0 z-20 ${isGold ? "shimmer-mask-gold" : "shimmer-mask"}`} />

                  {/* Brand metadata tag */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2 py-1 rounded bg-[#070707]/80 backdrop-blur-md border border-white/[0.04]">
                    <ShieldCheck size={11} className={isGold ? "text-gold-base" : "text-silver-base"} />
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">{product.manufacturer}</span>
                  </div>

                  {/* Certified Gold/Silver Stamp Overlay */}
                  <div className="absolute bottom-4 right-4 z-20 px-2 py-0.5 rounded bg-gold-dark/10 text-gold-base border border-gold-base/10 text-[9px] font-mono tracking-widest uppercase font-semibold">
                    {product.purity.split(" ")[0]}
                  </div>
                </div>

                {/* Information content area */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#111111] to-[#0d0d0d]">
                  <div className="space-y-2">
                    {/* Manufacturer Name & Country */}
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] block">
                      {product.manufacturer} • {currentLang === "ar" ? product.country_ar : product.country_en}
                    </span>
                    
                    {/* Product Name */}
                    <h3 className="text-lg font-serif text-white group-hover:text-gold-light transition-colors line-clamp-1 font-medium">
                      {currentLang === "ar" ? product.name_ar : product.name_en}
                    </h3>

                    {/* Technical Weight & Purity specifications details */}
                    <div className="flex items-center gap-4 text-xs font-mono text-gray-400 pt-1">
                      <span>{currentLang === "ar" ? "الوزن:" : "Weight:"} <strong className="text-white">{product.weight_label}</strong></span>
                      <span className="text-white/20">|</span>
                      <span>{currentLang === "ar" ? "النقاوة:" : "Purity:"} <strong className="text-white">{product.purity.split(" ")[0]}</strong></span>
                    </div>
                  </div>

                  {/* Dynamic Pricing Estimate & CTA */}
                  <div className="pt-4 border-t border-white/[0.03] flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block uppercase">
                        {currentLang === "ar" ? "سعر استرشادي مباشر" : "Indicative Live Price"}
                      </span>
                      {indicativePrice ? (
                        <span className="text-sm font-mono font-semibold text-white">
                          {indicativePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] text-gold-base">{selectedCurrency}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gold-base font-mono font-medium">Loading live data...</span>
                      )}
                    </div>

                    <button className={`p-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] group-hover:bg-gold-base group-hover:border-gold-base transition-all duration-300 ${
                      currentLang === "ar" ? "rotate-180" : ""
                    }`}>
                      <ChevronRight size={14} className="text-white group-hover:text-black transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Fallback if Search is empty */}
        {filteredProducts.length === 0 && (
          <div className="p-16 text-center border border-white/[0.03] rounded-sm bg-[#111111]/40 space-y-4 max-w-md mx-auto">
            <AlertCircle size={32} className="text-gold-base mx-auto animate-pulse" />
            <h3 className="text-lg font-serif text-white">
              {currentLang === "ar" ? "لم يتم العثور على منتجات" : "No products found"}
            </h3>
            <p className="text-xs text-gray-400">
              {currentLang === "ar"
                ? "يرجى تعديل معايير البحث أو تصفح الأقسام الأخرى من الكتالوج."
                : "Please adjust your search queries or explore other bullion categories."}
            </p>
          </div>
        )}

        {/* Corporate Sourcing Footer Disclaimer */}
        <div className="p-4 rounded border border-white/[0.03] bg-white/[0.01] flex items-center gap-3 max-w-4xl mx-auto text-xs text-gray-500 font-mono leading-relaxed">
          <ShieldCheck size={18} className="text-gold-base shrink-0" />
          <span>
            {currentLang === "ar"
              ? "بيان توضيحي: جميع منتجات العلامات التجارية (PAMP, Valcambi, Metalor, Royal Mint) متاحة من خلال PGR بصفتنا بيت تداول معتمد وتخضع للفحص. لا تدعي بي جي آر تفرّدها بتصنيع هذه السبائك الحرة."
              : "Institutional notice: These globally respected bullion brands are officially sourced and authenticated through PGR UAE's licensed trading conduits. PGR UAE acts as an authorized bullion house and logistics partner, and does not claim manufacturing rights."}
          </span>
        </div>

      </div>
    </section>
  );
}

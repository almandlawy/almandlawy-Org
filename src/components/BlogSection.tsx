/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, Search, Clock, User, ArrowUpRight, X, ChevronRight, Calendar } from "lucide-react";
import { dbService } from "../lib/supabase";

interface BlogSectionProps {
  currentLang: "en" | "ar";
}

interface BlogPost {
  id: string;
  slug: string;
  category: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  author: string;
  published_at: string;
  featured: boolean;
  seo_title: string;
  seo_description: string;
}

export default function BlogSection({ currentLang }: BlogSectionProps) {
  const isAr = currentLang === "ar";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Load blog articles on mount
  React.useEffect(() => {
    const fetchBlog = async () => {
      try {
        const list = await dbService.blog.list();
        setPosts(list as BlogPost[]);
      } catch (err) {
        console.error("Failed to load PGR research files:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, []);

  // Filter posts based on Category and Search Query
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category.toLowerCase().replace(" ", "_") === selectedCategory.toLowerCase();
    
    const searchTarget = (
      post.title_en + 
      post.title_ar + 
      post.content_en + 
      post.content_ar + 
      post.category
    ).toLowerCase();

    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "all", label_en: "All Intelligence", label_ar: "كل التقارير" },
    { id: "gold_news", label_en: "Gold News", label_ar: "أخبار الذهب" },
    { id: "investment", label_en: "Investment", label_ar: "الاستثمار" }
  ];

  return (
    <section className="py-24 px-4 md:px-8 bg-[#0a0a0b] border-t border-white/[0.03]" id="blog">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.03] pb-8">
          <div className="space-y-3">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center gap-2">
              <BookOpen size={12} />
              {isAr ? "مركز الأبحاث والتحليل المالي" : "Sovereign Market Commentary"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-white font-medium">
              {isAr ? "ديوان أبحاث المعادن الثمينة" : "Precious Metals Advisory & Intelligence"}
            </h2>
            <p className="text-sm text-gray-400 max-w-xl">
              {isAr 
                ? "تقارير ودراسات تحليلية دورية تصدر عن خبراء مكتب التداول لدراسة الاقتصاد الكلي وسياسة التحوط في دبي." 
                : "Authoritative macroeconomic research and localized regulatory insights compiled by our Dubai executive bullion desk."}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث في التقارير..." : "Search research registry..."}
              className="w-full bg-[#111112] border border-white/[0.04] focus:border-[#c5a85c]/50 focus:ring-1 focus:ring-[#c5a85c]/50 rounded-sm py-2.5 pl-10 pr-4 text-xs text-white outline-none font-mono"
              style={{ direction: isAr ? "rtl" : "ltr", textAlign: isAr ? "right" : "left" }}
            />
            <Search 
              size={14} 
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 ${isAr ? "left-3" : "right-3"}`} 
              style={{ left: isAr ? "12px" : "auto", right: isAr ? "auto" : "12px" }}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-mono rounded-full border transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#c5a85c]/10 text-[#c5a85c] border-[#c5a85c]/30"
                  : "bg-transparent text-gray-500 border-white/[0.04] hover:text-white"
              }`}
            >
              {isAr ? cat.label_ar : cat.label_en}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-[#111112] rounded-sm animate-pulse border border-white/[0.02]" />
            <div className="h-64 bg-[#111112] rounded-sm animate-pulse border border-white/[0.02]" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-mono text-xs border border-white/[0.02] rounded bg-[#0d0d0e]">
            {isAr ? "لا توجد تقارير مطابقة لبحثك." : "No matching research items cataloged in our archive."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => {
              const pTitle = isAr ? post.title_ar : post.title_en;
              const pExcerpt = isAr 
                ? post.content_ar.slice(0, 150) + "..." 
                : post.content_en.slice(0, 160) + "...";
              
              return (
                <div
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className="glass-premium p-8 rounded-sm border border-white/[0.02] hover:border-[#c5a85c]/20 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#c5a85c]">
                      <span className="uppercase tracking-widest font-semibold">{post.category}</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar size={11} />
                        {post.published_at}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif text-white group-hover:text-[#c5a85c] transition-colors leading-snug">
                      {pTitle}
                    </h3>

                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {pExcerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.03] pt-4 mt-6">
                    <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px]">
                      <User size={12} className="text-[#c5a85c]" />
                      <span>{post.author}</span>
                      <span>•</span>
                      <Clock size={12} />
                      <span>{isAr ? "قراءة ٥ دقائق" : "5 min read"}</span>
                    </div>

                    <span className="text-xs font-mono text-[#c5a85c] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {isAr ? "قراءة التحليل" : "View Analysis"}
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* FULL READER SLIDING PANEL (Modal Overlay) */}
      {activePost && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div className="fixed inset-0 bg-[#070707]/90 backdrop-blur-md" onClick={() => setActivePost(null)} />
          
          <div className="flex min-h-screen items-center justify-center p-4 md:p-8 relative">
            <div className="relative w-full max-w-3xl bg-[#0d0d0e] border border-white/[0.05] rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)] z-10 animate-scaleUp p-6 md:p-12 space-y-8">
              
              {/* Close Button */}
              <button
                onClick={() => setActivePost(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-gray-400 hover:text-white border border-white/[0.05] cursor-pointer"
                style={{ right: isAr ? "auto" : "16px", left: isAr ? "16px" : "auto" }}
              >
                <X size={16} />
              </button>

              {/* Header Info */}
              <div className="space-y-4 border-b border-white/[0.03] pb-6">
                <span className="text-xs font-mono bg-[#c5a85c]/10 text-[#c5a85c] px-3 py-1 rounded-sm uppercase tracking-widest font-semibold">
                  {activePost.category}
                </span>

                <h1 className="text-2xl md:text-3xl font-serif text-white leading-snug">
                  {isAr ? activePost.title_ar : activePost.title_en}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-[#c5a85c]" />
                    <span>{activePost.author}</span>
                  </div>
                  <div>•</div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{activePost.published_at}</span>
                  </div>
                  <div>•</div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>{isAr ? "مدة القراءة: ٥ دقائق" : "Estimated reading: 5 minutes"}</span>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="text-gray-300 text-sm md:text-base leading-relaxed space-y-6 font-sans">
                {isAr ? (
                  <p className="whitespace-pre-line font-arabic text-right leading-loose">
                    {activePost.content_ar}
                  </p>
                ) : (
                  <p className="whitespace-pre-line font-light leading-relaxed">
                    {activePost.content_en}
                  </p>
                )}
              </div>

              {/* Related/Footer Disclaimer */}
              <div className="bg-[#121315]/80 p-4 rounded border border-white/[0.03] font-mono text-[10px] text-gray-500 leading-relaxed">
                {isAr 
                  ? "إخلاء مسؤولية: كافة التحليلات والتقارير الصادرة عن PGR UAE هي لأغراض تثقيفية واستراتيجية فقط، ولا تعد نصيحة مالية أو استثمارية رسمية لبيع أو شراء الأسهم أو العقود." 
                  : "DISCLAIMER: Sovereign reports published by PGR UAE are prepared for elite portfolio context and strategic information purposes only. They do not constitute formal investment advice or brokerage solicitation."}
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}

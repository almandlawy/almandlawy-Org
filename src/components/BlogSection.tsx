/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Compact market notes — optional homepage strip (max 2 items).
 */

import React, { useState } from "react";
import { BookOpen, Clock, Calendar, X, User } from "lucide-react";
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

const MAX_VISIBLE = 2;

export default function BlogSection({ currentLang }: BlogSectionProps) {
  const isAr = currentLang === "ar";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

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

  const visiblePosts = posts.slice(0, MAX_VISIBLE);

  if (!loading && visiblePosts.length === 0) {
    return null;
  }

  return (
    <section
      className="py-10 md:py-12 px-4 md:px-8 bg-brand-section border-t border-soft-border"
      id="blog"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-dark font-bold flex items-center gap-1.5">
              <BookOpen size={11} />
              {isAr ? "ملاحظات السوق" : "Market Notes"}
            </p>
            <h2 className="text-lg sm:text-xl font-serif text-text-charcoal font-medium">
              {isAr ? "تقارير مختصرة" : "Brief Desk Updates"}
            </h2>
          </div>
          {posts.length > MAX_VISIBLE && (
            <p className="text-[10px] font-mono text-text-secondary">
              {isAr
                ? `عرض ${MAX_VISIBLE} من ${posts.length} تقارير`
                : `Showing ${MAX_VISIBLE} of ${posts.length} reports`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-20 rounded-lg border border-soft-border bg-brand-card animate-pulse" />
            <div className="h-20 rounded-lg border border-soft-border bg-brand-card animate-pulse" />
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visiblePosts.map((post) => {
              const pTitle = isAr ? post.title_ar : post.title_en;
              return (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => setActivePost(post)}
                    className="w-full text-left rounded-lg border border-soft-border bg-brand-card hover:border-gold-base px-4 py-3.5 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2 text-[9px] font-mono text-gold-dark uppercase tracking-wider mb-1.5">
                      <span>{post.category}</span>
                      <span className="flex items-center gap-1 text-text-secondary normal-case">
                        <Calendar size={10} />
                        {post.published_at}
                      </span>
                    </div>
                    <h3 className="text-sm font-serif text-text-charcoal group-hover:text-gold-dark leading-snug line-clamp-2">
                      {pTitle}
                    </h3>
                    <p className="mt-2 text-[10px] font-mono text-gold-dark uppercase tracking-widest">
                      {isAr ? "قراءة التحليل ←" : "Read analysis →"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {activePost && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div
            className="fixed inset-0 bg-panel-charcoal/80 backdrop-blur-sm"
            onClick={() => setActivePost(null)}
            aria-hidden
          />
          <div className="flex min-h-screen items-center justify-center p-4 relative">
            <div className="relative w-full max-w-2xl bg-brand-card border border-champagne rounded-xl shadow-premium z-10 p-6 md:p-8 space-y-6">
              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="absolute top-4 end-4 p-2 rounded-full border border-soft-border text-text-secondary hover:text-text-charcoal"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X size={16} />
              </button>

              <div className="space-y-3 border-b border-soft-border pb-4 pe-8">
                <span className="text-[10px] font-mono bg-gold-base/15 text-gold-dark px-2 py-0.5 rounded uppercase tracking-widest">
                  {activePost.category}
                </span>
                <h3 className="text-xl font-serif text-text-charcoal leading-snug">
                  {isAr ? activePost.title_ar : activePost.title_en}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-text-secondary">
                  <span className="flex items-center gap-1">
                    <User size={11} className="text-gold-base" />
                    {activePost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {activePost.published_at}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {isAr ? "٥ دقائق" : "5 min"}
                  </span>
                </div>
              </div>

              <div className="text-sm text-text-secondary leading-relaxed font-sans max-h-[50vh] overflow-y-auto">
                {isAr ? (
                  <p className="whitespace-pre-line font-arabic">{activePost.content_ar}</p>
                ) : (
                  <p className="whitespace-pre-line">{activePost.content_en}</p>
                )}
              </div>

              <p className="text-[10px] font-mono text-text-secondary border-t border-soft-border pt-3 leading-relaxed">
                {isAr
                  ? "إخلاء مسؤولية: التحليلات لأغراض معلوماتية فقط — ليست نصيحة استثمارية."
                  : "Disclaimer: Analysis is for information only — not investment advice."}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import React, { Component, ErrorInfo, ReactNode } from "react";
import { isChunkLoadError } from "../lib/lazyWithRetry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught exception captured by ErrorBoundary:", error, errorInfo);
    if (isChunkLoadError(error)) {
      try {
        if (!sessionStorage.getItem("pgr_chunk_reload_attempted")) {
          sessionStorage.setItem("pgr_chunk_reload_attempted", "1");
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Check language safely
      const isAr = typeof window !== "undefined" && (
        window.navigator.language.startsWith("ar") || 
        document.documentElement.dir === "rtl" ||
        (document.getElementById("pgr-root-container")?.className || "").includes("font-arabic")
      );

      return (
        <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#0d0d0e] p-8 rounded border border-white/[0.05] space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-serif text-white tracking-wide">
                {isAr ? "حدث خطأ غير متوقع" : "An Unexpected Error Occurred"}
              </h1>
              <p className="text-xs text-gray-400 leading-relaxed">
                {isAr 
                  ? "نعتذر عن هذا الخلل الفني. جاري تحديث الصفحة تلقائياً لتجنب المشاكل." 
                  : "We apologize for the technical inconvenience. The page is recovering dynamically."}
              </p>
            </div>

            {/* Error detail */}
            <div className="p-3 bg-[#111111] rounded border border-white/[0.03] text-[10px] font-mono text-rose-400 text-left overflow-x-auto max-h-32">
              {this.state.error?.toString()}
            </div>

            <button
              onClick={() => {
                try {
                  localStorage.clear();
                  window.location.href = "/";
                } catch (e) {
                  window.location.reload();
                }
              }}
              className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-semibold text-xs tracking-wider uppercase transition-all rounded cursor-pointer"
            >
              {isAr ? "الرجوع للرئيسية وإعادة تهيئة الذاكرة" : "Reset App & Return Home"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

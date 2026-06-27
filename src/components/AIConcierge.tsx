/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Send, Sparkles, AlertCircle, HelpCircle, MessageSquare, Bot } from "lucide-react";
import { ChatMessage } from "../types";

interface AIConciergeProps {
  currentLang: "en" | "ar";
  onClose: () => void;
}

export default function AIConcierge({ currentLang, onClose }: AIConciergeProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: currentLang === "ar"
        ? "مرحباً بك في مجلس PGR الاستشاري المالي الرقمي. أنا مستشارك المالي التنفيذي المخصص للمعادن الثمينة بدبي. كيف يمكنني مساعدة جنابك اليوم في إدارة وتأمين ثروتك بالسبائك الحرة؟"
        : "Welcome to PGR UAE Precious Metals Advisory Chamber. I am your Executive Bullion Consultant, representing our Dubai desk. How may I assist your portfolio today regarding physical asset allocation, tax-free DMCC vaulting, or wholesale trading?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto Scroll to last message
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Math.random(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Compile entire message history for the Gemini backend API
      const historyContext = [...messages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyContext,
          userLanguage: currentLang
        })
      });

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: "ai-" + Math.random(),
        role: "assistant",
        content: data.text || "I was unable to synchronize with our Dubai advisory node. Please contact our desk directly via email or WhatsApp.",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: "err-" + Math.random(),
        role: "assistant",
        content: currentLang === "ar"
          ? "المعذرة، واجهنا صعوبة في الاتصال بخادم الاستشارات في دبي. يمكنك الاستفسار مباشرة عبر واتساب PGR على 971500000000+."
          : "We encountered a minor communication lag with our Dubai trading server. Please feel free to initiate a direct query via PGR WhatsApp at +971500000000.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Suggestion chips designed to educate clients on UAE gold advantage
  const suggestions = currentLang === "ar"
    ? [
        "هل يوجد ضريبة قيمة مضافة على سبائك الذهب بدبي؟",
        "ما هي الماصفي المعتمدة من PGR لتسليم الذهب؟",
        "هل يمكن شحن سبائك ذهب بوزن ١٠ كغ إلى أوروبا آمنياً؟",
        "كيف يتم تسعير سبائك الذهب بالجملة للمؤسسات؟"
      ]
    : [
        "Is there VAT on Gold investment bars in Dubai?",
        "What bullion brands are available through PGR UAE?",
        "Can PGR handle secure shipping of 5kg gold to London?",
        "How is institutional wholesale gold pricing calculated?"
      ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" id="ai-advisor-panel" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      {/* Dimmed Background */}
      <div className="fixed inset-0 bg-[#070707]/85 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Main Panel Drawer */}
      <div className="relative w-full max-w-lg bg-[#0e0e0e] border-l border-white/[0.05] h-full shadow-[0_0_60px_rgba(0,0,0,0.95)] z-10 flex flex-col justify-between animate-slideLeft">
        
        {/* Panel Header */}
        <div className="p-4 md:p-6 border-b border-white/[0.04] bg-[#111111] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gold-dark/15 border border-gold-base/35 rounded-full flex items-center justify-center text-gold-base">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-serif font-semibold text-white tracking-wider uppercase">
                {currentLang === "ar" ? "ديوان الاستشارات الذكي" : "Executive Advisor Node"}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PGR Dubai Trading Desk Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.02] rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scroll-smooth" ref={scrollRef}>
          {messages.map((msg) => {
            const isAI = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? "" : "mr-auto flex-row-reverse"}`}
                style={{ direction: currentLang === "ar" ? (isAI ? "rtl" : "ltr") : (isAI ? "ltr" : "rtl") }}
              >
                {/* Profile Bullet */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 text-xs font-mono font-bold ${
                  isAI
                    ? "bg-gold-dark/10 text-gold-base border-gold-base/30"
                    : "bg-white/[0.03] text-white border-white/10"
                }`}>
                  {isAI ? "PGR" : "VIP"}
                </div>

                {/* Message Bubble Balloon */}
                <div className={`p-4 rounded-sm text-xs leading-relaxed space-y-1 shadow-sm ${
                  isAI
                    ? "bg-[#111111] border border-white/[0.03] text-gray-300"
                    : "bg-gold-base text-black font-medium"
                }`}>
                  <div className="whitespace-pre-line break-words prose prose-invert prose-xs">
                    {msg.content}
                  </div>
                  <span className={`text-[9px] font-mono block ${isAI ? "text-gray-600" : "text-black/50 text-right"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-gold-dark/10 text-gold-base border border-gold-base/30 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                PGR
              </div>
              <div className="p-4 rounded-sm bg-[#111111] border border-white/[0.03] text-gray-500 flex items-center gap-2 text-xs font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-base animate-bounce" style={{ animationDelay: "100ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gold-base animate-bounce" style={{ animationDelay: "200ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gold-base animate-bounce" style={{ animationDelay: "300ms" }} />
                <span>Syncing DMCC desk...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Prompt Chips & Entry Box */}
        <div className="p-4 md:p-6 border-t border-white/[0.04] bg-[#0d0d0d] space-y-4 shrink-0">
          
          {/* Custom suggestion chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <HelpCircle size={10} />
              {currentLang === "ar" ? "مواضيع مقترحة للاستثمار" : "Recommended Advisory Queries"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="px-2.5 py-1.5 rounded bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-gold-base/30 text-[10px] text-gray-400 hover:text-white transition-all text-left truncate max-w-full cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Text entry field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentLang === "ar" ? "تحدث مع المستشار المالي بخصوص سبائك دبي..." : "Ask PGR Advisor about bullion specs..."}
              className="flex-1 bg-[#161616] border border-white/[0.04] focus:border-gold-base/50 focus:ring-1 focus:ring-gold-base/50 rounded-sm py-3 pl-4 pr-12 outline-none text-xs text-white"
              style={{ direction: currentLang === "ar" ? "rtl" : "ltr", textAlign: currentLang === "ar" ? "right" : "left" }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gold-base text-black rounded hover:bg-gold-light transition-colors disabled:opacity-30 cursor-pointer"
              style={{ right: currentLang === "ar" ? "auto" : "8px", left: currentLang === "ar" ? "8px" : "auto" }}
            >
              <Send size={12} />
            </button>
          </form>
          
          <div className="text-[9px] text-gray-600 font-mono text-center">
            Investment advice provided by PGR artificial intelligence node. Standard DMCC terms apply.
          </div>
        </div>

      </div>
    </div>
  );
}

import { MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

interface FloatingActionsProps {
  onOpenAI?: () => void;
}

export default function FloatingActions({ onOpenAI }: FloatingActionsProps) {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";

  const waText = encodeURIComponent(
    isAr
      ? "مرحباً، أريد طلب عرض سعر من PGR UAE للذهب أو الفضة."
      : "Hello, I would like to request a quote from PGR UAE for gold or silver products."
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href={`https://wa.me/971559688837?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-12 w-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
        title="WhatsApp Bullion Desk"
      >
        <MessageCircle size={22} />
      </a>
      {onOpenAI ? (
        <button
          onClick={onOpenAI}
          className="h-12 w-12 bg-gradient-to-r from-gold-dark to-gold-base text-black rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 transition-all cursor-pointer"
          title="Quote Assistant"
        >
          <Sparkles size={20} />
        </button>
      ) : (
        <Link
          to="/request-quote"
          className="h-12 w-12 bg-gradient-to-r from-gold-dark to-gold-base text-black rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 transition-all"
          title="Request Quote"
        >
          <Sparkles size={20} />
        </Link>
      )}
    </div>
  );
}

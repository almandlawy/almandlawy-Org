import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  currentLang?: "en" | "ar";
}

export default function Logo({ className = "w-10 h-10", showText = true, currentLang = "en" }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Hexagon Monogram Emblem */}
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Elegant Hexagon with gold gradients */}
        <polygon 
          points="50,5 90,28 90,72 50,95 10,72 10,28" 
          stroke="url(#goldGradient)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="#0c0c0e" 
        />
        
        {/* Inner Interlocking Thin Hexagon */}
        <polygon 
          points="50,15 81,33 81,67 50,85 19,67 19,33" 
          stroke="#AA7C11" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeDasharray="4 2"
        />

        {/* Dynamic Monogram P & G / Crown */}
        <path 
          d="M38,28 H58 C66,28 66,42 58,42 H38 V72 M38,42 H56" 
          stroke="url(#goldGradient)" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Diagonal Crown Crest Details */}
        <path d="M50,15 V22" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" />
        <path d="M19,33 L26,37" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M81,33 L74,37" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
        
        <defs>
          <linearGradient id="goldGradient" x1="10" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF9E6" />
            <stop offset="30%" stopColor="#F5D061" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="85%" stopColor="#AA7C11" />
            <stop offset="100%" stopColor="#8B6508" />
          </linearGradient>
        </defs>
      </svg>

      {/* Luxury Wordmark Typography */}
      {showText && (
        <div className={`flex flex-col ${currentLang === "ar" ? "text-right" : "text-left"}`}>
          <span className="text-white font-serif font-bold text-lg tracking-[0.25em] leading-none uppercase">
            PGR <span className="text-gold-gradient font-extrabold">UAE</span>
          </span>
          <span className="text-[8px] uppercase tracking-[0.45em] text-gray-500 font-mono mt-1 font-semibold leading-none">
            {currentLang === "ar" ? "ديوان المعادن الثمينة" : "Precious Metals"}
          </span>
          <span className="text-[7px] uppercase tracking-[0.35em] text-gray-600 font-mono leading-none mt-0.5">
            {currentLang === "ar" ? "مكتب دبي للسبائك" : "Dubai Bullion Desk"}
          </span>
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";

interface LogoProps {
  compact?: boolean;
  className?: string;
  showDescriptor?: boolean;
}

function GoldEmblem({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="pgrGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E6B8" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#B8942E" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      <path
        d="M24 2L44 14v20L24 46 4 34V14L24 2z"
        stroke="url(#pgrGold)"
        strokeWidth="1.5"
        fill="rgba(212,175,55,0.08)"
      />
      <path d="M24 8v32M8 18h32M12 30h24" stroke="url(#pgrGold)" strokeWidth="0.75" opacity="0.5" />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill="url(#pgrGold)"
        fontSize="11"
        fontFamily="Georgia, serif"
        fontWeight="600"
        letterSpacing="1"
      >
        PGR
      </text>
    </svg>
  );
}

export default function Logo({ compact, className = "", showDescriptor = true }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <GoldEmblem size={compact ? 32 : 40} />
      <div className="flex flex-col leading-tight">
        <span
          className={`font-serif font-semibold tracking-[0.18em] text-[#F5F0E8] leading-none ${compact ? "text-base" : "text-lg md:text-xl"}`}
        >
          PGR <span className="text-gold-base group-hover:text-gold-light transition-colors">UAE</span>
        </span>
        {showDescriptor && !compact && (
          <span className="text-[7px] md:text-[8px] uppercase tracking-[0.32em] text-gold-base/65 mt-1 font-mono leading-snug">
            Precious Metals · Bullion Desk Dubai
          </span>
        )}
      </div>
    </Link>
  );
}

export { GoldEmblem };

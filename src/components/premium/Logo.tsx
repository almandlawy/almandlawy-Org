import { Link } from "react-router-dom";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export default function Logo({ compact, className = "" }: LogoProps) {
  return (
    <Link to="/" className={`flex flex-col group ${className}`}>
      <span className={`font-serif font-semibold tracking-[0.22em] text-white leading-none ${compact ? "text-lg" : "text-xl md:text-2xl"}`}>
        PGR <span className="text-gold-base group-hover:text-gold-light transition-colors">UAE</span>
      </span>
      {!compact && (
        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.38em] text-gold-base/70 mt-1 font-mono">
          Bullion Quote Desk
        </span>
      )}
    </Link>
  );
}

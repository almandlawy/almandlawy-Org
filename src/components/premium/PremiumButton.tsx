import { Link } from "react-router-dom";
import { ReactNode } from "react";

type Variant = "gold" | "outline" | "ghost" | "whatsapp";

interface PremiumButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  gold: "bg-gold-gradient text-black shadow-[0_0_24px_rgba(212,175,55,0.25)] hover:shadow-[0_0_36px_rgba(212,175,55,0.4)] hover:scale-[1.02]",
  outline: "border border-white/20 text-white hover:border-gold-base/50 hover:bg-white/[0.04]",
  ghost: "border border-gold-base/30 text-gold-base bg-gold-dark/10 hover:border-gold-base hover:bg-gold-dark/20",
  whatsapp: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
};

export default function PremiumButton({
  children,
  to,
  href,
  onClick,
  variant = "gold",
  className = "",
  type = "button",
  disabled,
  fullWidth,
}: PremiumButtonProps) {
  const base = `inline-flex items-center justify-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.18em] font-semibold rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (to) return <Link to={to} className={base}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={base}>{children}</a>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  );
}

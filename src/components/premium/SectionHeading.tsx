import { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  icon?: ReactNode;
}

export default function SectionHeading({ eyebrow, title, subtitle, align = "center", icon }: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const flexAlign = align === "center" ? "justify-center" : "justify-start";
  return (
    <div className={`max-w-3xl space-y-3 mb-10 md:mb-12 ${alignClass}`}>
      <span className={`text-gold-base font-mono uppercase text-[10px] tracking-[0.35em] font-semibold flex items-center gap-2 ${flexAlign}`}>
        {icon}
        {eyebrow}
      </span>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white font-medium tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

import { ReactNode } from "react";
import { useApp } from "../../context/AppContext";
import PremiumHeader from "./PremiumHeader";
import PremiumFooter from "./PremiumFooter";

interface PremiumLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function PremiumLayout({ children, hideFooter }: PremiumLayoutProps) {
  const { currentLang } = useApp();
  return (
    <div
      className={`min-h-screen bg-black text-[#F5F0E8] selection:bg-gold-base selection:text-black ${currentLang === "ar" ? "font-arabic" : "font-sans"}`}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-dark/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-base/5 blur-[120px] rounded-full" />
      </div>
      <PremiumHeader />
      <main className="relative z-10 pt-16 md:pt-[4.5rem]">{children}</main>
      {!hideFooter && <PremiumFooter />}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Send, MapPin, Phone, Mail, ShieldAlert, Award, Globe, MessageSquare, ShieldCheck, Terminal } from "lucide-react";
import { dbService } from "../lib/supabase";

interface FooterProps {
  currentLang: "en" | "ar";
  onNavigate: (section: string) => void;
  onOpenAIChat: () => void;
  onOpenQuote: () => void;
  onOpenLegalDoc: (docId: string) => void;
  onOpenClientDashboard: () => void;
  onOpenAdminPortal: () => void;
}

export default function Footer({ 
  currentLang, 
  onNavigate, 
  onOpenAIChat, 
  onOpenQuote,
  onOpenLegalDoc,
  onOpenClientDashboard,
  onOpenAdminPortal
}: FooterProps) {
  const [emailInput, setEmailInput] = React.useState("");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const sObj = await dbService.settings.get();
        if (sObj) setSettings(sObj);
      } catch (err) {
        console.error("Failed to load settings in Footer:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
      setEmailInput("");
    }
  };

  return (
    <footer className="bg-[#070707] border-t border-white/[0.04] pt-20 pb-8 text-xs font-mono text-gray-400" id="office" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        
        {/* Upper Grid - Branding, Navigation, Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Corporate Profile Column */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold tracking-[0.2em] text-white">
                PGR <span className="text-gold-base">UAE</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#c5a85c] mt-1 font-mono font-bold">
                Precious Metals & Bullion Quote Desk
              </span>
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              {currentLang === "ar"
                ? "مؤسسة بي جي آر لتجارة المعادن الثمينة ومقرها دبي. نوفر عروض أسعار وحلول تخزين مخصصة للسبائك للمؤسسات وصناديق الاستثمار وكبار الشخصيات بأعلى معايير الأمان السويسري."
                : "PGR UAE is an internationally accredited physical gold and silver wholesale bullion house and purchase inquiry platform headquartered in Dubai, partnering with elite Swiss and global refineries."}
            </p>
            <div className="flex flex-col gap-2 pt-2 text-[11px]">
              <button 
                onClick={onOpenClientDashboard} 
                className="hover:text-gold-base transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-semibold"
              >
                <ShieldCheck size={12} className="text-gold-base" />
                <span>{currentLang === "ar" ? "ديوان كبار العملاء الرقمي" : "Secure Client Desk"}</span>
              </button>
              <button 
                onClick={onOpenAdminPortal} 
                className="hover:text-gold-base transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono"
              >
                <Terminal size={12} className="text-gold-base/50" />
                <span>{currentLang === "ar" ? "ديوان الإدارة والتحكم" : "Admin Portal Desk"}</span>
              </button>
              <button 
                onClick={onOpenAdminPortal} 
                className="hover:text-gold-base transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-bold text-white/90 border border-white/5 bg-white/[0.02] px-2 py-1 rounded mt-1"
                id="footer-admin-login-btn"
              >
                <Terminal size={11} className="text-[#c5a85c]" />
                <span>{currentLang === "ar" ? "دخول الإدارة" : "Admin Login"}</span>
              </button>
            </div>
          </div>

          {/* Sourcing & Products Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
              {currentLang === "ar" ? "المنتجات والخدمات" : "Bullion Solutions"}
            </h4>
            <ul className="space-y-2.5 text-[11px]">
              <li><button onClick={() => onNavigate("catalog")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سبائك الذهب المصكوكة" : "Minted Gold Bars (1g - 1kg)"}</button></li>
              <li><button onClick={() => onNavigate("catalog")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "مسكوكات ذهب وفضة" : "Bullion Coins"}</button></li>
              <li><button onClick={() => onNavigate("catalog")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سبائك الفضة الصب والصبابة" : "Cast Silver Bullion (1kg)"}</button></li>
              <li><button onClick={onOpenQuote} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "تصدير وتجارة الجملة الدولية" : "Wholesale Institutional Contracts"}</button></li>
              <li><button onClick={onOpenAIChat} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "مساعد المنتجات وطلبات التسعير" : "Product & Quote Assistant"}</button></li>
            </ul>
          </div>

          {/* Secure Logistic Terms Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
              {currentLang === "ar" ? "اللوائح والسياسات والامتثال" : "Compliance, Policies & Trust"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-2 gap-y-1.5 text-[11px]">
              <button onClick={() => onOpenLegalDoc("terms")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "شروط الخدمة والأحكام" : "Terms of Service"}</button>
              <button onClick={() => onOpenLegalDoc("privacy")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</button>
              <button onClick={() => onOpenLegalDoc("aml")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة الامتثال ومكافحة غسيل الأموال" : "KYC & AML Policy"}</button>
              <button onClick={() => onOpenLegalDoc("pricing")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "إخلاء مسؤولية الأسعار" : "Pricing Disclaimer"}</button>
              <button onClick={() => onOpenLegalDoc("refund")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة الإلغاء والاسترداد" : "Refund & Cancellation"}</button>
              <button onClick={() => onOpenLegalDoc("delivery")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة التوصيل والاستلام" : "Delivery & Collection"}</button>
              <button onClick={() => onOpenLegalDoc("storage")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "شروط التخزين المخصص" : "Allocated Storage Terms"}</button>
              <button onClick={() => onOpenLegalDoc("sellback")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة إعادة الشراء" : "Sell-Back Quote Policy"}</button>
              <button onClick={() => onOpenLegalDoc("risk")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "الإفصاح عن المخاطر" : "Risk Disclosure"}</button>
              <button onClick={() => onOpenLegalDoc("cookie")} className="hover:text-gold-base transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة ملفات الارتباط" : "Cookie Policy"}</button>
              <button onClick={() => onOpenLegalDoc("compliance")} className="hover:text-gold-base transition-colors cursor-pointer text-left font-semibold text-[#c5a85c]">{currentLang === "ar" ? "الامتثال والشفافية" : "Compliance & Trust"}</button>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
              {currentLang === "ar" ? "النشرة الإخبارية الفاخرة" : "Market Intelligence"}
            </h4>
            <p className="text-[11px] leading-relaxed text-gray-500">
              {currentLang === "ar"
                ? "اشترك لتلقي تقارير سوق الذهب الحرة الأسبوعية وتقلبات الأسعار الاسترشادية مباشرة من دبي."
                : "Subscribe to receive direct weekly gold bullion intelligence briefs and private wholesale pricing allotments."}
            </p>
            {isSubscribed ? (
              <div className="p-2.5 bg-gold-dark/15 text-gold-base border border-gold-base/20 rounded-sm text-[11px]">
                {currentLang === "ar" ? "شكراً لاشتراكك في قائمة النخبة." : "Thank you for joining our private circular."}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={currentLang === "ar" ? "بريدك الإلكتروني الراقي" : "Enter executive email..."}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-[#111111] border border-white/[0.04] focus:border-gold-base rounded-sm px-3 py-2 text-white outline-none flex-1 text-[11px]"
                />
                <button
                  type="submit"
                  className="p-2 bg-gold-base hover:bg-gold-light text-black transition-colors rounded-sm cursor-pointer"
                >
                  <Send size={12} />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Middle Section - Physical Dubai Location coordinates */}
        <div className="border-t border-b border-white/[0.04] py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] items-center">
          {/* Map address */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/[0.02] rounded-full border border-white/[0.05] flex items-center justify-center text-gold-base">
              <MapPin size={12} />
            </div>
            <div>
              <span className="text-white block font-medium">{currentLang === "ar" ? "مقر دبي الرئيسي" : "Dubai Head Office"}</span>
              <span className="text-gray-500">
                {currentLang === "ar" 
                  ? (settings?.office_address_ar || "برج الماس، منطقة التداول الحرة، دبي مارينا، دبي، الإمارات العربية المتحدة")
                  : (settings?.office_address_en || "Almas Tower, West Trade Zone, Dubai Marina, Dubai, UAE")}
              </span>
            </div>
          </div>

          {/* Trade Phone */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/[0.02] rounded-full border border-white/[0.05] flex items-center justify-center text-gold-base">
              <Phone size={12} />
            </div>
            <div>
              <span className="text-white block font-medium">{currentLang === "ar" ? "خط تواصل PGR UAE" : "PGR UAE Desk Hotline"}</span>
              <span className="text-gray-500">
                {settings?.trade_phone || "+971 4 445 8888"} • {settings?.whatsapp_hotline || "+971 55 968 8837"}
              </span>
            </div>
          </div>

          {/* Desk Email */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/[0.02] rounded-full border border-white/[0.05] flex items-center justify-center text-gold-base">
              <Mail size={12} />
            </div>
            <div>
              <span className="text-white block font-medium">{currentLang === "ar" ? "الاتصال الإلكتروني" : "Electronic Sourcing"}</span>
              <span className="text-gray-500">
                {settings?.desk_email || "desk@pgruae.com"} • trade@pgruae.com
              </span>
            </div>
          </div>
        </div>

        {/* Lower Section - Regulatory Disclaimer & Trademarks */}
        <div className="space-y-6 pt-6 border-t border-white/[0.04]">
          <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-sm text-[10px] leading-relaxed text-gray-500 space-y-3">
            <p>
              <strong className="text-white">English Compliance Wording:</strong><br />
              PGR UAE provides indicative precious metals pricing and quote request services for physical bullion inquiries. Prices shown are market references only and may change without notice. Final availability, premiums, VAT/tax treatment, payment, delivery, storage, and settlement terms are confirmed by PGR UAE before any transaction. PGR UAE does not provide financial, investment, tax, or legal advice and does not guarantee market performance.
            </p>
            <p className="text-right" style={{ direction: "rtl" }}>
              <strong className="text-white">الامتثال القانوني (العربية):</strong><br />
              توفر PGR UAE أسعاراً إرشادية وخدمة طلب عروض أسعار للاستفسارات المتعلقة بالسبائك والمعادن الثمينة الفعلية. الأسعار المعروضة مؤشرات سوقية فقط وقد تتغير دون إشعار. يتم تأكيد التوفر، الهامش، المعاملة الضريبية، الدفع، التسليم، التخزين، وشروط التسوية من قبل PGR UAE قبل أي عملية. لا تقدم PGR UAE نصائح مالية أو استثمارية أو ضريبية أو قانونية ولا تضمن أداء السوق.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-600">
            <div>
              © 2026 PGR UAE Precious Metals & Bullion Quote Desk (pgruae.com). Licensed by Jebel Ali and Dubai Commodities Regulatory Division. All rights reserved.
            </div>
            <div className="flex gap-4">
              <button onClick={() => onOpenLegalDoc("terms")} className="hover:text-gold-base transition-colors cursor-pointer">{currentLang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</button>
              <span>•</span>
              <button onClick={() => onOpenLegalDoc("privacy")} className="hover:text-gold-base transition-colors cursor-pointer">{currentLang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</button>
              <span>•</span>
              <button onClick={() => onOpenLegalDoc("compliance")} className="hover:text-gold-base transition-colors cursor-pointer">{currentLang === "ar" ? "ديوان الامتثال" : "Compliance Desk"}</button>
              <span>•</span>
              <span>UAE VAT Law No. 8</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

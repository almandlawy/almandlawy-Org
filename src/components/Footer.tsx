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
    <footer className="bg-brand-bg border-t border-champagne pt-16 pb-8 text-xs font-mono text-text-secondary" id="site-footer" style={{ direction: currentLang === "ar" ? "rtl" : "ltr" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        
        {/* Upper Grid - Branding, Navigation, Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Corporate Profile Column */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold tracking-[0.2em] text-[#1F1A17]">
                PGR <span className="text-[#C6A15B]">UAE</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#A47C36] mt-1 font-mono font-bold">
                Precious Metals & Bullion Quote Desk
              </span>
            </div>
            <p className="text-[#5E564D] text-[11px] leading-relaxed font-bold">
              {currentLang === "ar"
                ? "مؤسسة بي جي آر لتجارة المعادن الثمينة ومقرها دبي. نوفر عروض أسعار وحلول تخزين مخصصة للسبائك للمؤسسات وصناديق الاستثمار وكبار الشخصيات بأعلى معايير الأمان السويسري."
                : "PGR UAE is an internationally accredited physical gold and silver bullion desk headquartered in Dubai, sourcing through accredited international refineries."}
            </p>
            <div className="flex flex-col gap-2 pt-2 text-[11px]">
              <button 
                onClick={onOpenClientDashboard} 
                className="hover:text-[#A47C36] text-[#1F1A17] transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-bold"
              >
                <ShieldCheck size={12} className="text-[#C6A15B]" />
                <span>{currentLang === "ar" ? "ديوان كبار العملاء الرقمي" : "Secure Client Desk"}</span>
              </button>
              <button 
                onClick={onOpenAdminPortal} 
                className="hover:text-[#A47C36] text-[#5E564D] transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-bold"
              >
                <Terminal size={12} className="text-[#C6A15B]" />
                <span>{currentLang === "ar" ? "ديوان الإدارة والتحكم" : "Admin Portal Desk"}</span>
              </button>
              <button 
                onClick={onOpenAdminPortal} 
                className="hover:text-[#A47C36] transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-extrabold text-[#1F1A17] border border-[#E8DEC9] bg-white shadow-sm px-2.5 py-1.5 rounded mt-1 transition-all"
                id="footer-admin-login-btn"
              >
                <Terminal size={11} className="text-[#C6A15B]" />
                <span>{currentLang === "ar" ? "دخول الإدارة" : "Admin Login"}</span>
              </button>
            </div>
          </div>

          {/* Quick links — mockup direction */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-text-charcoal font-bold">
              {currentLang === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2.5 text-[11px] text-text-secondary font-bold">
              <li><button type="button" onClick={() => onNavigate("about")} className="hover:text-gold-dark transition-colors cursor-pointer text-left">{currentLang === "ar" ? "من نحن" : "About Us"}</button></li>
              <li><button type="button" onClick={() => onOpenLegalDoc("terms")} className="hover:text-gold-dark transition-colors cursor-pointer text-left">{currentLang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</button></li>
              <li><button type="button" onClick={() => onOpenLegalDoc("privacy")} className="hover:text-gold-dark transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</button></li>
              <li><button type="button" onClick={() => onNavigate("contact")} className="hover:text-gold-dark transition-colors cursor-pointer text-left">{currentLang === "ar" ? "اتصل بنا" : "Contact Us"}</button></li>
              <li><button type="button" onClick={() => onNavigate("catalog")} className="hover:text-gold-dark transition-colors cursor-pointer text-left">{currentLang === "ar" ? "الكتالوج" : "Catalog"}</button></li>
            </ul>
          </div>

          {/* Secure Logistic Terms Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#1F1A17] font-bold">
              {currentLang === "ar" ? "اللوائح والسياسات والامتثال" : "Compliance, Policies & Trust"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-2 gap-y-1.5 text-[11px] text-[#5E564D] font-bold">
              <button onClick={() => onOpenLegalDoc("terms")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "شروط الخدمة والأحكام" : "Terms of Service"}</button>
              <button onClick={() => onOpenLegalDoc("privacy")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</button>
              <button onClick={() => onOpenLegalDoc("aml")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة الامتثال ومكافحة غسيل الأموال" : "KYC & AML Policy"}</button>
              <button onClick={() => onOpenLegalDoc("pricing")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "إخلاء مسؤولية الأسعار" : "Pricing Disclaimer"}</button>
              <button onClick={() => onOpenLegalDoc("refund")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة الإلغاء والاسترداد" : "Refund & Cancellation"}</button>
              <button onClick={() => onOpenLegalDoc("delivery")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة التوصيل والاستلام" : "Delivery & Collection"}</button>
              <button onClick={() => onOpenLegalDoc("storage")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "شروط التخزين المخصص" : "Allocated Storage Terms"}</button>
              <button onClick={() => onOpenLegalDoc("sellback")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة إعادة الشراء" : "Sell-Back Quote Policy"}</button>
              <button onClick={() => onOpenLegalDoc("risk")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "الإفصاح عن المخاطر" : "Risk Disclosure"}</button>
              <button onClick={() => onOpenLegalDoc("cookie")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left">{currentLang === "ar" ? "سياسة ملفات الارتباط" : "Cookie Policy"}</button>
              <button onClick={() => onOpenLegalDoc("compliance")} className="hover:text-[#A47C36] transition-colors cursor-pointer text-left font-bold text-[#A47C36]">{currentLang === "ar" ? "الامتثال والشفافية" : "Compliance & Trust"}</button>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#1F1A17] font-bold">
              {currentLang === "ar" ? "النشرة الإخبارية الفاخرة" : "Market Intelligence"}
            </h4>
            <p className="text-[11px] leading-relaxed text-[#5E564D] font-bold">
              {currentLang === "ar"
                ? "اشترك لتلقي تقارير سوق الذهب الحرة الأسبوعية وتقلبات الأسعار الاسترشادية مباشرة من دبي."
                : "Subscribe to receive direct weekly gold bullion intelligence briefs and private wholesale pricing allotments."}
            </p>
            {isSubscribed ? (
              <div className="p-2.5 bg-[#DCE8DF] text-[#556B5D] border border-[#556B5D]/20 rounded-sm text-[11px] font-bold">
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
                  className="bg-white border border-[#E8DEC9] focus:border-[#C6A15B] rounded-sm px-3 py-2 text-[#1F1A17] outline-none flex-1 text-[11px] shadow-sm font-sans font-medium"
                />
                <button
                  type="submit"
                  className="p-2 bg-[#C6A15B] hover:bg-[#A47C36] text-[#1F1A17] hover:text-white transition-colors rounded-sm cursor-pointer shadow-sm"
                >
                  <Send size={12} />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Middle Section - Physical Dubai Location coordinates */}
        <div className="border-t border-b border-[#E8DEC9] py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] items-center">
          {/* Map address */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white rounded-full border border-[#E8DEC9] shadow-sm flex items-center justify-center text-[#C6A15B]">
              <MapPin size={12} />
            </div>
            <div>
              <span className="text-[#1F1A17] block font-extrabold">{currentLang === "ar" ? "مقر دبي الرئيسي" : "Dubai Head Office"}</span>
              <span className="text-[#5E564D] font-bold">
                {currentLang === "ar" 
                  ? (settings?.office_address_ar || "برج الماس، منطقة التداول الحرة، دبي مارينا، دبي، الإمارات العربية المتحدة")
                  : (settings?.office_address_en || "Almas Tower, West Trade Zone, Dubai Marina, Dubai, UAE")}
              </span>
            </div>
          </div>

          {/* Trade Phone */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white rounded-full border border-[#E8DEC9] shadow-sm flex items-center justify-center text-[#C6A15B]">
              <Phone size={12} />
            </div>
            <div>
              <span className="text-[#1F1A17] block font-extrabold">{currentLang === "ar" ? "مكتب التداول الهاتفي" : "Desk Direct Hotline"}</span>
              <span className="text-[#5E564D] font-bold">
                {settings?.trade_phone || "+971 4 445 8888"} • {settings?.whatsapp_hotline || "+971 55 968 8837"}
              </span>
            </div>
          </div>

          {/* Desk Email */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white rounded-full border border-[#E8DEC9] shadow-sm flex items-center justify-center text-[#C6A15B]">
              <Mail size={12} />
            </div>
            <div>
              <span className="text-[#1F1A17] block font-extrabold">{currentLang === "ar" ? "الاتصال الإلكتروني" : "Electronic Sourcing"}</span>
              <span className="text-[#5E564D] font-bold">
                {settings?.desk_email || "desk@pgruae.com"} • trade@pgruae.com
              </span>
            </div>
          </div>
        </div>

        {/* Lower Section - Regulatory Disclaimer & Trademarks */}
        <div className="space-y-6 pt-6 border-t border-[#E8DEC9]">
          <div className="p-4 bg-white border border-[#E8DEC9] shadow-sm rounded-sm text-[10px] leading-relaxed text-[#5E564D] space-y-3 font-bold">
            <p>
              <strong className="text-[#1F1A17] font-extrabold">English Compliance Wording:</strong><br />
              PGR UAE provides indicative precious metals pricing and quote request services for physical bullion inquiries. Prices shown are indicative market references only and may change without notice. Final availability, premiums, VAT/tax treatment, payment, delivery, storage, and settlement terms are confirmed by PGR UAE before any transaction. PGR UAE does not provide financial, investment, tax, or legal advice. Firm quote confirmed by PGR UAE desk. Subject to market movement and compliance review.
            </p>
            <p className="text-right font-bold" style={{ direction: "rtl" }}>
              <strong className="text-[#1F1A17] font-extrabold">الامتثال القانوني (العربية):</strong><br />
              توفر PGR UAE أسعاراً إرشادية وخدمة طلب عروض أسعار للاستفسارات المتعلقة بالسبائك والمعادن الثمينة الفعلية. الأسعار المعروضة مؤشرات سوقية فقط وقد تتغير دون إشعار. يتم تأكيد التوفر، الهامش، المعاملة الضريبية، الدفع، التسليم، التخزين، وشروط التسوية من قبل PGR UAE قبل أي عملية. لا تقدم PGR UAE نصائح مالية أو استثمارية أو ضريبية أو قانونية ولا تضمن أداء السوق.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#5E564D] font-bold">
            <div>
              © 2026 PGR UAE Precious Metals & Bullion Quote Desk (pgruae.com). Licensed by Jebel Ali and Dubai Commodities Regulatory Division. All rights reserved.
            </div>
            <div className="flex gap-4">
              <button onClick={() => onOpenLegalDoc("terms")} className="hover:text-[#A47C36] transition-colors cursor-pointer">{currentLang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</button>
              <span>•</span>
              <button onClick={() => onOpenLegalDoc("privacy")} className="hover:text-[#A47C36] transition-colors cursor-pointer">{currentLang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</button>
              <span>•</span>
              <button onClick={() => onOpenLegalDoc("compliance")} className="hover:text-[#A47C36] transition-colors cursor-pointer">{currentLang === "ar" ? "ديوان الامتثال" : "Compliance Desk"}</button>
              <span>•</span>
              <span>UAE VAT Law No. 8</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

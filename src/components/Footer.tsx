/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Send, MapPin, Phone, Mail, ShieldAlert, Award, Globe, MessageSquare, ShieldCheck, Terminal } from "lucide-react";
import { dbService } from "../lib/supabase";
import BrandLogo from "./BrandLogo";
import { LEGAL_POLICY_LINKS } from "../lib/legalLinks";
import { FACEBOOK_PAGE_URL } from "../lib/facebookLinks";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          {/* Corporate Profile Column */}
          <div className="space-y-4">
            <BrandLogo variant="footer" currentLang={currentLang} />
            <p className="text-text-secondary text-[11px] leading-relaxed font-bold">
              {currentLang === "ar"
                ? "مؤسسة بي جي آر لتجارة المعادن الثمينة ومقرها دبي. نوفر عروض أسعار وحلول تخزين مخصصة للسبائك للمؤسسات وصناديق الاستثمار وكبار الشخصيات بأعلى معايير الأمان السويسري."
                : "PGR UAE is an internationally accredited physical gold and silver bullion desk headquartered in Dubai, sourcing through accredited international refineries."}
            </p>
            <div className="flex flex-col gap-2 pt-2 text-[11px]">
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-dark text-text-charcoal transition-colors flex items-center gap-1.5 font-mono font-bold"
              >
                <Globe size={12} className="text-gold-base" />
                <span>{currentLang === "ar" ? "صفحة فيسبوك الرسمية" : "Official Facebook Page"}</span>
              </a>
              <button 
                onClick={onOpenClientDashboard} 
                className="hover:text-gold-dark text-text-charcoal transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-bold"
              >
                <ShieldCheck size={12} className="text-gold-base" />
                <span>{currentLang === "ar" ? "ديوان كبار العملاء الرقمي" : "Secure Client Desk"}</span>
              </button>
              <button 
                onClick={onOpenAdminPortal} 
                className="hover:text-gold-dark text-text-secondary transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-bold"
              >
                <Terminal size={12} className="text-gold-base" />
                <span>{currentLang === "ar" ? "ديوان الإدارة والتحكم" : "Admin Portal Desk"}</span>
              </button>
              <button 
                onClick={onOpenAdminPortal} 
                className="hover:text-gold-dark transition-colors flex items-center gap-1.5 cursor-pointer text-left font-mono font-extrabold text-text-charcoal border border-soft-border bg-brand-card shadow-sm px-2.5 py-1.5 rounded mt-1 transition-all"
                id="footer-admin-login-btn"
              >
                <Terminal size={11} className="text-gold-base" />
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
              <li><a href="/#about" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "من نحن" : "About Us"}</a></li>
              <li><a href="/terms" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</a></li>
              <li><a href="/privacy-policy" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</a></li>
              <li><a href="/#contact" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "اتصل بنا" : "Contact Us"}</a></li>
              <li><a href="/#catalog" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "فئات السبائك" : "Bullion Categories"}</a></li>
              <li><a href="/faq" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "الأسئلة الشائعة" : "FAQ"}</a></li>
              <li><a href="/pricing-disclaimer" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "إخلاء التسعير" : "Pricing Disclaimer"}</a></li>
              <li><a href="/kyc-aml-policy" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "اعرف عميلك" : "KYC & AML"}</a></li>
              <li><a href="/delivery-collection-policy" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "التوصيل" : "Delivery Policy"}</a></li>
              <li><a href="/refund-cancellation-policy" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "الاسترداد" : "Refund Policy"}</a></li>
              <li><a href="/request-quote" className="hover:text-gold-dark transition-colors">{currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-text-charcoal font-bold">
              {currentLang === "ar" ? "النشرة الإخبارية الفاخرة" : "Market Intelligence"}
            </h4>
            <p className="text-[11px] leading-relaxed text-text-secondary font-bold">
              {currentLang === "ar"
                ? "اشترك لتلقي تقارير سوق الذهب الحرة الأسبوعية وتقلبات الأسعار الاسترشادية مباشرة من دبي."
                : "Subscribe to receive direct weekly gold bullion intelligence briefs and private wholesale pricing allotments."}
            </p>
            {isSubscribed ? (
              <div className="p-2.5 bg-soft-success text-olive-accent border border-olive-accent/20 rounded-sm text-[11px] font-bold">
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
                  className="bg-brand-card border border-soft-border focus:border-[#C6A15B] rounded-sm px-3 py-2 text-text-charcoal outline-none flex-1 text-[11px] shadow-sm font-sans font-medium"
                />
                <button
                  type="submit"
                  className="p-2 bg-gold-base hover:bg-gold-dark text-text-charcoal hover:text-white transition-colors rounded-sm cursor-pointer shadow-sm"
                >
                  <Send size={12} />
                </button>
              </form>
            )}
          </div>

          {/* Policies section closes upper grid */}
        </div>

        <div className="space-y-4 pt-4 border-t border-soft-border/60">
          <h4 className="text-xs uppercase tracking-widest text-text-charcoal font-bold">
            {currentLang === "ar" ? "السياسات والإفصاحات" : "Policies & Disclosures"}
          </h4>
          <p className="text-[10px] text-text-secondary font-bold leading-relaxed max-w-3xl">
            {currentLang === "ar"
              ? "جميع السياسات القانونية والإفصاحات التنظيمية لمعاملات السبائك المادية."
              : "Legal policies and regulatory disclosures for physical bullion desk transactions."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2 text-[11px] font-bold">
            {LEGAL_POLICY_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-gold-dark transition-colors py-1 border-b border-soft-border/40 hover:border-gold-base/40"
              >
                {currentLang === "ar" ? link.labelAr : link.labelEn}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-1 text-[10px] font-mono uppercase tracking-wider">
            <a href="/faq" className="text-gold-dark hover:text-gold-base font-bold">
              {currentLang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
            </a>
            <span className="text-champagne">|</span>
            <a href="/request-quote" className="text-text-secondary hover:text-gold-dark">
              {currentLang === "ar" ? "طلب عرض سعر" : "Request Quote"}
            </a>
            <span className="text-champagne">|</span>
            <a href="/sitemap.xml" className="text-text-secondary hover:text-gold-dark">
              {currentLang === "ar" ? "خريطة الموقع" : "Sitemap"}
            </a>
          </div>
        </div>

        {/* Middle Section - Physical Dubai Location coordinates */}
        <div className="border-t border-b border-soft-border py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] items-center">
          {/* Map address */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand-card rounded-full border border-soft-border shadow-sm flex items-center justify-center text-gold-base">
              <MapPin size={12} />
            </div>
            <div>
              <span className="text-text-charcoal block font-extrabold">{currentLang === "ar" ? "مقر دبي الرئيسي" : "Dubai Head Office"}</span>
              <span className="text-text-secondary font-bold">
                {currentLang === "ar" 
                  ? (settings?.office_address_ar || "برج الماس، منطقة التداول الحرة، دبي مارينا، دبي، الإمارات العربية المتحدة")
                  : (settings?.office_address_en || "Almas Tower, West Trade Zone, Dubai Marina, Dubai, UAE")}
              </span>
            </div>
          </div>

          {/* Trade Phone */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand-card rounded-full border border-soft-border shadow-sm flex items-center justify-center text-gold-base">
              <Phone size={12} />
            </div>
            <div>
              <span className="text-text-charcoal block font-extrabold">{currentLang === "ar" ? "مكتب التداول الهاتفي" : "Desk Direct Hotline"}</span>
              <span className="text-text-secondary font-bold">
                {settings?.trade_phone || "+971 4 445 8888"} • {settings?.whatsapp_hotline || "+971 55 968 8837"}
              </span>
            </div>
          </div>

          {/* Desk Email */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand-card rounded-full border border-soft-border shadow-sm flex items-center justify-center text-gold-base">
              <Mail size={12} />
            </div>
            <div>
              <span className="text-text-charcoal block font-extrabold">{currentLang === "ar" ? "الاتصال الإلكتروني" : "Electronic Sourcing"}</span>
              <span className="text-text-secondary font-bold">
                {settings?.desk_email || "desk@pgruae.com"} • trade@pgruae.com
              </span>
            </div>
          </div>
        </div>

        {/* Lower Section - Regulatory Disclaimer & Trademarks */}
        <div className="space-y-6 pt-6 border-t border-soft-border">
          <div className="p-4 bg-brand-card border border-soft-border shadow-sm rounded-sm text-[10px] leading-relaxed text-text-secondary space-y-3 font-bold">
            <p>
              <strong className="text-text-charcoal font-extrabold">English Compliance Wording:</strong><br />
              PGR UAE provides indicative precious metals pricing and quote request services for physical bullion inquiries. Prices shown are indicative market references only and may change without notice. Final availability, premiums, VAT/tax treatment, payment, delivery, storage, and settlement terms are confirmed by PGR UAE before any transaction. PGR UAE does not provide financial, investment, tax, or legal advice. Firm quote confirmed by PGR UAE desk. Subject to market movement and compliance review.
            </p>
            <p className="text-right font-bold" style={{ direction: "rtl" }}>
              <strong className="text-text-charcoal font-extrabold">الامتثال القانوني (العربية):</strong><br />
              توفر PGR UAE أسعاراً إرشادية وخدمة طلب عروض أسعار للاستفسارات المتعلقة بالسبائك والمعادن الثمينة الفعلية. الأسعار المعروضة مؤشرات سوقية فقط وقد تتغير دون إشعار. يتم تأكيد التوفر، الهامش، المعاملة الضريبية، الدفع، التسليم، التخزين، وشروط التسوية من قبل PGR UAE قبل أي عملية. لا تقدم PGR UAE نصائح مالية أو استثمارية أو ضريبية أو قانونية ولا تضمن أداء السوق.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-text-secondary font-bold">
            <div>
              © 2026 PGR UAE Precious Metals & Bullion Quote Desk (pgruae.com). Licensed by Jebel Ali and Dubai Commodities Regulatory Division. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-3 gap-y-1">
              {LEGAL_POLICY_LINKS.filter((l) => l.group === "core").map((link) => (
                <a key={link.href} href={link.href} className="hover:text-gold-dark transition-colors">
                  {currentLang === "ar" ? link.labelAr : link.labelEn}
                </a>
              ))}
              <span className="hidden sm:inline text-champagne">•</span>
              <a href="/pricing-disclaimer" className="hover:text-gold-dark transition-colors">
                {currentLang === "ar" ? "إخلاء التسعير" : "Pricing"}
              </a>
              <span className="hidden sm:inline text-champagne">•</span>
              <a href="/risk-disclosure" className="hover:text-gold-dark transition-colors">
                {currentLang === "ar" ? "المخاطر" : "Risk"}
              </a>
              <span className="hidden sm:inline text-champagne">•</span>
              <a href="/sitemap.xml" className="hover:text-gold-dark transition-colors">
                {currentLang === "ar" ? "خريطة الموقع" : "Sitemap"}
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

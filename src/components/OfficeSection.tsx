/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MapPin, Clock, Phone, Mail, MessageSquare, ShieldCheck, ExternalLink } from "lucide-react";
import { dbService } from "../lib/supabase";
import { DUBAI_OFFICE_PHOTOS } from "../lib/officeImages";
import { trackWhatsAppClick } from "../lib/gtag";

interface OfficeSectionProps {
  currentLang: "en" | "ar";
  sectionId?: string;
}

export default function OfficeSection({ currentLang, sectionId = "office" }: OfficeSectionProps) {
  const isAr = currentLang === "ar";
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const sObj = await dbService.settings.get();
        if (sObj) {
          setSettings(sObj);
        }
      } catch (err) {
        console.error("Failed to load settings in OfficeSection:", err);
      }
    };
    fetchSettings();
  }, []);

  const address = isAr 
    ? (settings?.office_address_ar || "برج الماس، منطقة التداول الحرة، دبي مارينا، دبي، الإمارات العربية المتحدة")
    : (settings?.office_address_en || "Almas Tower, West Trade Zone, Dubai Marina, Dubai, United Arab Emirates");
  
  const phone = settings?.trade_phone || "+971 4 445 8888";
  const email = settings?.desk_email || "desk@pgruae.com";
  const whatsapp = settings?.whatsapp_hotline || "+971559688837";
  const whatsappCleaned = whatsapp.replace(/[^0-9]/g, "");
  const regNo = settings?.dmcc_reg_no || "890317";

  const officeDetails = {
    title: isAr ? "المقر الرئيسي للمؤسسة" : "Corporate Headquarters",
    subtitle: isAr ? "مكتب التداول والمساندة الفنية - دبي" : "Dubai Physical Trading & Settlement Desk",
    addressLabel: isAr ? "العنوان" : "Vault Address",
    addressValue: address,
    hoursLabel: isAr ? "ساعات العمل الرسمية" : "Desk Trading Hours",
    hoursValue: isAr 
      ? "الإثنين - الجمعة: ٩:٠٠ صباحاً - ٦:٠٠ مساءً (توقيت الخليج)" 
      : "Monday - Friday: 09:00 AM - 06:00 PM (GST)",
    phoneLabel: isAr ? "رقم الهاتف المباشر" : "Direct Bullion Desk",
    phoneValue: phone,
    emailLabel: isAr ? "البريد الإلكتروني المخصص" : "Secure Dispatch Email",
    emailValue: email,
    complianceTitle: isAr ? "الامتثال والتصاريح الأمنية" : "Compliance Status",
    complianceText: isAr 
      ? `ممتثل للضوابط والتدقيق القانوني بالكامل بموجب ترخيص رقم ${regNo}. جميع المعاملات تخضع لقوانين مكافحة غسيل الأموال (AML) ومطابقة معايير البنك المركزي للإمارات.` 
      : `Fully compliant under commercial license no. ${regNo}. All bullion procurement is cleared via stringent AML / KYC frameworks matching UAE Central Bank guidelines.`
  };

  return (
    <section className="py-24 px-4 md:px-8 bg-brand-bg border-t border-soft-border" id={sectionId}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2 font-bold">
            <MapPin size={12} />
            {isAr ? "مقر دبي الرسمي" : "Dubai Headquarters"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-text-charcoal font-bold">
            {officeDetails.title}
          </h2>
          <p className="text-sm text-text-secondary font-medium">
            {officeDetails.subtitle}
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Office details lists */}
          <div className="space-y-8">
            <div className="bg-brand-card p-8 rounded-sm border border-soft-border shadow-sm space-y-6">
              
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono text-text-secondary uppercase tracking-widest font-bold">{officeDetails.addressLabel}</h4>
                  <p className="text-sm text-text-charcoal font-serif leading-relaxed font-semibold">{officeDetails.addressValue}</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base shrink-0">
                  <Clock size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono text-text-secondary uppercase tracking-widest font-bold">{officeDetails.hoursLabel}</h4>
                  <p className="text-sm text-text-charcoal font-sans font-semibold">{officeDetails.hoursValue}</p>
                  <p className="text-[10px] text-gold-dark font-mono font-bold">
                    {isAr ? "● التداول الفعلي مغلق في عطلة نهاية الأسبوع" : "● Live physical settlements closed on weekends"}
                  </p>
                </div>
              </div>

              {/* Direct Phone & Chat */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base shrink-0">
                  <Phone size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono text-text-secondary uppercase tracking-widest font-bold">{officeDetails.phoneLabel}</h4>
                  <p className="text-sm text-text-charcoal font-mono font-bold">{officeDetails.phoneValue}</p>
                  <a 
                    href={`https://wa.me/${whatsappCleaned}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick("office_section_whatsapp")}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-mono mt-1 hover:underline font-bold"
                  >
                    <MessageSquare size={12} />
                    {isAr ? "الاتصال المباشر بمكتب الواتساب" : "WhatsApp Institutional Liaison"}
                  </a>
                </div>
              </div>

              {/* Direct Mail */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base shrink-0">
                  <Mail size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono text-text-secondary uppercase tracking-widest font-bold">{officeDetails.emailLabel}</h4>
                  <a href={`mailto:${officeDetails.emailValue}`} className="text-sm text-gold-dark font-mono hover:underline font-bold">{officeDetails.emailValue}</a>
                </div>
              </div>

            </div>

            {/* Compliance Badge */}
            <div className="p-5 rounded border border-gold-base/20 bg-brand-card shadow-sm flex items-start gap-3">
              <ShieldCheck size={20} className="text-gold-base shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-mono font-bold text-gold-dark uppercase tracking-wider">{officeDetails.complianceTitle}</h5>
                <p className="text-[11px] text-text-secondary leading-relaxed font-sans font-medium">{officeDetails.complianceText}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Dubai office photography */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
            {DUBAI_OFFICE_PHOTOS.map((photo) => (
              <figure
                key={photo.id}
                className="rounded-sm border border-soft-border overflow-hidden bg-brand-card shadow-sm group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-section">
                  <picture>
                    <source srcSet={photo.src} type="image/webp" />
                    <img
                      src={photo.fallback}
                      alt={isAr ? photo.altAr : photo.altEn}
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 py-5">
                    <figcaption className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/95 font-bold">
                      {isAr ? photo.captionAr : photo.captionEn}
                    </figcaption>
                  </div>
                </div>
              </figure>
            ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <a
                href="https://maps.google.com/?q=Almas+Tower+Dubai+Marina"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gold-base hover:bg-gold-dark text-black text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <MapPin size={12} />
                <span>{isAr ? "موقع المكتب على خرائط غوغل" : "Office on Google Maps"}</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <p className="text-[10px] font-mono text-text-secondary leading-relaxed font-semibold">
              {isAr
                ? "يُنصح بحجز موعد مسبق مع مسؤول الحساب لتسهيل الدخول الأمني إلى منطقة خزائن برج الماس."
                : "Security clearance recommended. Book with your account executive before physical Almas Tower visits."}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

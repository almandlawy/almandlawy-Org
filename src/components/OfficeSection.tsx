/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MapPin, Clock, Phone, Mail, MessageSquare, ShieldCheck, ExternalLink } from "lucide-react";
import { dbService } from "../lib/supabase";

interface OfficeSectionProps {
  currentLang: "en" | "ar";
}

export default function OfficeSection({ currentLang }: OfficeSectionProps) {
  const isAr = currentLang === "ar";
  const [settings, setSettings] = useState<any>(null);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettingsAndPoints = async () => {
      try {
        const [sObj, points] = await Promise.all([
          dbService.settings.get(),
          dbService.pickupPoints.list()
        ]);
        if (sObj) {
          setSettings(sObj);
        }
        if (points) {
          setPickupPoints(points);
        }
      } catch (err) {
        console.error("Failed to load settings/points in OfficeSection:", err);
      }
    };
    fetchSettingsAndPoints();
  }, []);

  const address = isAr 
    ? (settings?.office_address_ar || "برج الماس، منطقة مركز دبي للسلع المتعددة (DMCC)، دبي مارينا، دبي، الإمارات العربية المتحدة")
    : (settings?.office_address_en || "Almas Tower, DMCC Precinct, Dubai Marina, Dubai, United Arab Emirates");
  
  const phone = settings?.trade_phone || "+971 4 445 8888";
  const email = settings?.desk_email || "desk@pgruae.com";
  const whatsapp = settings?.whatsapp_hotline || "+971509998888";
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
      ? `مرخص ومسجل بالكامل تحت سلطة مركز دبي للسلع المتعددة (DMCC) برقم تسجيل ${regNo}. جميع المعاملات تخضع لقوانين مكافحة غسيل الأموال (AML) ومطابقة معايير البنك المركزي للإمارات.` 
      : `Fully registered and audit-compliant under DMCC registry license no. ${regNo}. All bullion procurement is cleared via stringent AML / KYC frameworks matching UAE Central Bank guidelines.`
  };

  return (
    <section className="py-24 px-4 md:px-8 bg-[#070707] border-t border-white/[0.03]" id="office">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
            <MapPin size={12} />
            {isAr ? "مقر دبي الرسمي" : "Dubai Headquarters"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-white font-medium">
            {officeDetails.title}
          </h2>
          <p className="text-sm text-gray-400">
            {officeDetails.subtitle}
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Office details lists */}
          <div className="space-y-8">
            <div className="glass-premium p-8 rounded-sm border border-white/[0.02] space-y-6">
              
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">{officeDetails.addressLabel}</h4>
                  <p className="text-sm text-white font-serif leading-relaxed">{officeDetails.addressValue}</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-gold-dark/10 rounded-sm border border-gold-base/10 flex items-center justify-center text-gold-base shrink-0">
                  <Clock size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">{officeDetails.hoursLabel}</h4>
                  <p className="text-sm text-white font-sans">{officeDetails.hoursValue}</p>
                  <p className="text-[10px] text-gold-base/80 font-mono">
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
                  <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">{officeDetails.phoneLabel}</h4>
                  <p className="text-sm text-white font-mono font-semibold">{officeDetails.phoneValue}</p>
                  <a 
                    href={`https://wa.me/${whatsappCleaned}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1 hover:underline"
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
                  <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">{officeDetails.emailLabel}</h4>
                  <a href={`mailto:${officeDetails.emailValue}`} className="text-sm text-gold-light font-mono hover:underline">{officeDetails.emailValue}</a>
                </div>
              </div>

            </div>

            {/* Compliance Badge */}
            <div className="p-5 rounded border border-gold-base/10 bg-gold-dark/5 flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#c5a85c] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-mono font-semibold text-[#c5a85c] uppercase tracking-wider">{officeDetails.complianceTitle}</h5>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{officeDetails.complianceText}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Custom Simulated Google Map (Gold Styled) */}
          <div className="space-y-4">
            <div className="h-80 md:h-[400px] w-full rounded-sm border border-white/[0.03] overflow-hidden bg-[#0d0d0e] relative group">
              
              {/* Custom Golden SVG Luxury Map Layout */}
              <div className="absolute inset-0 opacity-40 select-none bg-[#09090a]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
                  {/* Grid Lines */}
                  <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04">
                    <line x1="0" y1="100" x2="800" y2="100" />
                    <line x1="0" y1="200" x2="800" y2="200" />
                    <line x1="0" y1="300" x2="800" y2="300" />
                    <line x1="0" y1="400" x2="800" y2="400" />
                    <line x1="100" y1="0" x2="100" y2="500" />
                    <line x1="200" y1="0" x2="200" y2="500" />
                    <line x1="300" y1="0" x2="300" y2="500" />
                    <line x1="400" y1="0" x2="400" y2="500" />
                    <line x1="500" y1="0" x2="500" y2="500" />
                    <line x1="600" y1="0" x2="600" y2="500" />
                    <line x1="700" y1="0" x2="700" y2="500" />
                  </g>
                  {/* Styled Coastline and Island outlines of Dubai Marina area */}
                  <path d="M 0,250 C 150,220 250,290 350,240 C 450,190 550,210 650,150 C 750,90 800,100 800,100 L 800,500 L 0,500 Z" fill="#0c0c0e" stroke="#c5a85c" strokeWidth="0.75" strokeOpacity="0.15" />
                  {/* Palm Jumeirah outline */}
                  <path d="M 280,180 Q 260,110 320,110 T 360,180" fill="none" stroke="#c5a85c" strokeWidth="1" strokeOpacity="0.1" />
                  {/* Sheikh Zayed Road Highway */}
                  <path d="M 0,400 Q 400,320 800,240" fill="none" stroke="#c5a85c" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="5,5" />
                  {/* Roads network */}
                  <path d="M 300,500 L 400,340 M 500,450 L 550,280 M 200,380 L 350,200" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.05" />
                  
                  {/* Almas Tower Beacon */}
                  <circle cx="450" cy="310" r="25" fill="#c5a85c" fillOpacity="0.05" className="animate-pulse" />
                  <circle cx="450" cy="310" r="10" fill="#c5a85c" fillOpacity="0.15" />
                  <circle cx="450" cy="310" r="3" fill="#c5a85c" />
                </svg>
              </div>

              {/* Info HUD overlay */}
              <div className="absolute inset-x-4 bottom-4 bg-[#0a0a0b]/95 border border-[#c5a85c]/30 p-4 rounded-sm flex justify-between items-center z-10 backdrop-blur-sm">
                <div className="space-y-1">
                  <h5 className="text-[11px] font-mono text-gold-base uppercase tracking-widest font-semibold">
                    {isAr ? "برج الماس دبي" : "Almas Tower, Dubai"}
                  </h5>
                  <p className="text-[10px] text-gray-400 font-sans">
                    {isAr ? "مركز دبي للسلع المتعددة، دبي مارينا" : "DMCC Precinct, Dubai Marina"}
                  </p>
                </div>
                <a 
                  href="https://maps.google.com/?q=Almas+Tower+Dubai+Marina" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#c5a85c] hover:bg-[#b09247] text-black text-[9px] font-mono font-semibold uppercase rounded-sm flex items-center gap-1 transition-colors"
                >
                  <span>{isAr ? "خرائط غوغل" : "Google Maps"}</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Map watermark coordinates */}
              <div className="absolute top-4 left-4 font-mono text-[9px] text-gray-600 space-y-0.5">
                <div>COORD: 25.0792° N, 55.1415° E</div>
                <div>ALT: 360m Vault Grid</div>
              </div>

            </div>
            
            <p className="text-[10px] font-mono text-gray-500 leading-relaxed text-center">
              {isAr 
                ? "يُنصح بحجز موعد مسبق مع مسؤول الحساب الشخصي لتسهيل الدخول الأمني إلى منطقة خزائن برج الماس." 
                : "Security clearance recommended. Secure a direct booking with your account executive prior to physical Almas Vault visits."}
            </p>
          </div>

        </div>

        {/* Regional Service Points Sub-Section */}
        <div className="border-t border-white/[0.05] pt-16 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-gold-base font-mono uppercase text-xs tracking-[0.3em] font-semibold flex items-center justify-center gap-2">
              <ShieldCheck size={12} />
              {isAr ? "نقاط التسليم والخدمة الإقليمية" : "Verified Delivery & Pickup Points"}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif text-white tracking-wide font-medium">
              {isAr ? "نقاط الخدمة في العراق والإمارات" : "Service Points inside Iraq & UAE"}
            </h3>
            <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
              {isAr
                ? "قائمة بنقاط الخدمة والشركاء المعتمدين لتسليم واستلام المعادن الثمينة بعد إتمام عمليات التحقق والموافقة الجمركية والأمنية."
                : "Verified locations and authorized partner points for secure logistics, physical pickup, and document submission."}
            </p>
          </div>

          {pickupPoints.length === 0 ? (
            <div className="glass-premium p-8 rounded-sm border border-white/[0.02] text-center max-w-2xl mx-auto space-y-4">
              <p className="text-sm text-gold-light font-medium leading-relaxed">
                {isAr
                  ? "يتم تجهيز نقاط خدمة بغداد والبصرة. يرجى التواصل عبر واتساب لمعرفة خيارات التوصيل الحالية."
                  : "Baghdad and Basra service points are being prepared. Contact WhatsApp for current delivery options."}
              </p>
              <a
                href={`https://wa.me/${whatsappCleaned}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold uppercase rounded transition-colors"
              >
                <MessageSquare size={14} />
                {isAr ? "تواصل عبر واتساب للتوصيل للعراق" : "Coordinate Iraq Delivery on WhatsApp"}
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickupPoints.map((point) => (
                <div
                  key={point.id}
                  className="glass-premium p-6 rounded-sm border border-white/[0.02] hover:border-[#c5a85c]/30 transition-all duration-300 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-serif font-medium text-white">
                        {isAr ? point.name_ar : point.name_en}
                      </h4>
                      <p className="text-xs text-gold-base font-mono mt-0.5">
                        {isAr ? point.city_ar : point.city_en}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-gold-base/10 text-gold-base uppercase tracking-widest">
                      {point.status || (isAr ? "نقطة شريكة" : "Partner")}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-400 font-sans">
                    <p className="flex items-start gap-2">
                      <MapPin size={13} className="text-gold-base shrink-0 mt-0.5" />
                      <span>{isAr ? point.address_ar : point.address_en}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Clock size={13} className="text-gold-base shrink-0 mt-0.5" />
                      <span>{isAr ? point.working_hours_ar : point.working_hours_en}</span>
                    </p>
                    {point.phone && (
                      <p className="flex items-center gap-2">
                        <Phone size={13} className="text-gold-base shrink-0" />
                        <span className="font-mono">{point.phone}</span>
                      </p>
                    )}
                  </div>

                  {point.whatsapp && (
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${point.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono hover:underline"
                      >
                        <MessageSquare size={12} />
                        {isAr ? "الاتصال بالمسؤول المحلي" : "Contact Local Representative"}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Shield, FileText, ScrollText, Landmark, ShieldCheck } from "lucide-react";

interface LegalOverlayModalProps {
  currentLang: "en" | "ar";
  onClose: () => void;
  defaultDoc?: string;
}

export default function LegalOverlayModal({ currentLang, onClose, defaultDoc = "aml" }: LegalOverlayModalProps) {
  const isAr = currentLang === "ar";
  const [activeDoc, setActiveDoc] = useState<string>(defaultDoc);

  const docs = [
    {
      id: "aml",
      icon: <Landmark size={14} />,
      label_en: "AML / KYC Policy",
      label_ar: "مكافحة غسيل الأموال وKYC",
      content_en: `PGR UAE Anti-Money Laundering (AML) & Know Your Customer (KYC) Framework
      
      1. Institutional Commitment
      PGR UAE Precious Metals Trading is strictly committed to preventing financial crime, money laundering, and terrorist financing. We operate in full compliance with UAE Federal Decree-Law No. (20) of 2018 on Anti-Money Laundering and Combating the Financing of Terrorism and Financing of Illegal Organisations, as well as the executive regulations set by the UAE Ministry of Economy and UAE Central Bank.

      2. Customer Due Diligence (CDD) & KYC Rules
      - Under no circumstances can high-value physical settlements or wholesale allotments be cleared without complete identity authentication.
      - Individual Clients: Must supply a valid Passport, UAE Resident Emirates ID, and verifiable proof of residential address.
      - Corporate/Institutional Entities: Must provide a valid trade license, certificate of incorporation, articles of association, register of ultimate beneficial owners (UBO), and passports of corporate directors.

      3. Transaction Monitoring & Thresholds
      - All cash transactions above AED 55,000 are subject to heightened scrutiny and direct reporting to the UAE Financial Intelligence Unit (FIU) via the goAML platform.
      - Structured payments or split payments intended to bypass reporting thresholds are strictly prohibited and flagged as suspicious.
      
      4. Auditing & Record Keeping
      All physical transaction ledgers, shipping manifestations, and client KYC files are archived securely for a minimum duration of five (5) years as mandated by federal regulators.`,
      content_ar: `سياسة مكافحة غسيل الأموال (AML) واعرف عميلك (KYC) الرسمية لشركة PGR دبي
      
      ١. الالتزام المؤسسي والتشريعي
      تلتزم شركة PGR لتجارة المعادن الثمينة التزاماً صارماً بمنع الجرائم المالية وغسيل الأموال وتمويل الإرهاب. نحن نعمل بامتثال كامل بموجب المرسوم بقانون اتحادي رقم (٢٠) لسنة ٢٠١٨ في شأن مواجهة غسل الأموال ومكافحة تمويل الإرهاب وتمويل التنظيمات غير المشروعة في دولة الإمارات العربية المتحدة.

      ٢. إجراءات العناية الواجبة وتحديد هوية العملاء (KYC)
      - لا يمكن إجراء أي تسوية مالية أو استلام سبائك حرة مرتفعة القيمة دون التحقق الكامل من الهوية والتحقق الجنائي.
      - الأفراد: يُشترط تقديم جواز سفر ساري المفعول، الهوية الإماراتية الأصلية، وإثبات السكن المعتمد.
      - الشركات والمؤسسات: يجب تزويدنا برخصة تجارية سارية، عقد التأسيس، سجل المالكين المستفيدين الحقيقيين (UBO)، وجوازات سفر المديرين المفوضين بالتوقيع.

      ٣. مراقبة المعاملات وحدود الإفصاح
      - تخضع كافة المعاملات النقدية التي تتجاوز ٥٥,٠٠٠ درهم إماراتي لرقابة مشددة وإبلاغ فوري لوحدة المعلومات المالية (FIU) لدولة الإمارات عبر نظام goAML المعتمد.
      - يُحظر تماماً محاولات تجزئة المدفوعات للالتفاف على متطلبات الإبلاغ القانونية.

      ٤. حفظ السجلات والبيانات
      يتم أرشفة كافة المعاملات والبيانات والمستندات الثبوتية لمدد لا تقل عن خمس (٥) سنوات بشكل آمن ومحمي بالكامل.`
    },
    {
      id: "terms",
      icon: <ScrollText size={14} />,
      label_en: "Terms & Conditions",
      label_ar: "الشروط والأحكام",
      content_en: `PGR UAE Standard Trading Terms & Sovereign Agreements
      
      1. Binding Nature & Market Rates
      By accessing our trading portals or requesting a bespoke quote, you acknowledge that precious metal spot rates fluctuate in real-time in accordance with global LBMA markets. Final prices are locked and legally confirmed exclusively via our official trader-executed contracts.

      2. Order Commitments & Settlement
      Once a quote is formally accepted and locked, the client enters into a binding contract. Settlements must be completed via certified bank transfer, secure credit cards, or physical office draft within 24 hours of price confirmation. PGR UAE reserves the right to cancel un-settled allocations.

      3. Vault Security & Releases
      Physical gold and silver bullion bars allocated in our vaults are registered in the customer's legal name. Physical collections or handovers require prior security scheduling at our Almas Tower office and verified biometric or digital certificate authorization.`,
      content_ar: `الشروط والأحكام العامة لتداولات PGR في دولة الإمارات
      
      ١. ارتباط الأسعار بالبورصة اللحظية
      عند تصفح الكتالوج أو طلب مقايسة سعر استرشادية، يقر العميل بأن أسعار المعادن الثمينة تتغير لحظياً طبقاً للبورصة العالمية للذهب بلندن (LBMA). السعر النهائي والملزم يتم اعتماده حصرياً عبر الفواتير الرسمية الصادرة من مكتب التداول.

      ٢. الالتزامات المالية والتسويات
      عند قبول عرض السعر واعتماده، يدخل العميل في التزام تعاقدي ملزم. يجب إتمام التسوية المالية بالكامل خلال ٢٤ ساعة عبر تحويل بنكي رسمي أو دفع نقدي معتمد في المقر الرئيسي لبرج الماس.

      ٣. شروط تسليم سبائك الخزينة
      يتم تسجيل سبائك الذهب والفضة المودعة بالاسم القانوني للعميل. يتطلب الاستلام الفعلي تنسيقاً أمنياً مسبقاً قبل ٤٨ ساعة والتحقق البيومتري من الهوية.`
    },
    {
      id: "privacy",
      icon: <Shield size={14} />,
      label_en: "Privacy & Data Policy",
      label_ar: "سياسة الخصوصية والبيانات",
      content_en: `PGR UAE Executive Data Privacy Directive
      
      1. Non-Disclosure Commitment
      At PGR UAE, we protect your absolute anonymity. We do not sell, rent, or lease customer registries or individual transaction records to third-party institutions. Personal investment metrics remain under encrypted private storage schemas.

      2. Security & Encryption Layers
      Every server interaction and database write (including Supabase RLS and local Fallback simulation) utilizes banking-grade AES-256 encryption. Telemetry data is restricted to internal portfolio optimization and live rate synchronization.`,
      content_ar: `سياسة خصوصية البيانات وحماية المستثمر
      
      ١. حماية سرية حسابات كبار الشخصيات
      نلتزم في PGR بحماية الخصوصية المطلقة والسرية التامة لعملائنا. نحن لا نبيع أو نشارك أو نفصح عن أي معلومات تتعلق بحجم المعاملات أو الأصول المحفوظة في الخزائن لأي جهات تجارية أخرى.

      ٢. مستويات التشفير والحماية
      كافة البيانات المتبادلة مشفرة وفق بروتوكولات حماية متطورة وتشفير AES-256 العسكري لضمان سلامة التعاملات.`
    },
    {
      id: "shipping",
      icon: <FileText size={14} />,
      label_en: "Shipping & Transit Policy",
      label_ar: "سياسة الشحن والتأمين",
      content_en: `Secured Custodial Shipping & Logistics Standards
      
      1. Fully Insured Consignments
      Every physical transport of gold and silver bullion dispatched by PGR UAE is 100% insured against loss, theft, and damage via global underwriters. We operate a highly trained private security courier fleet and partner exclusively with Brink's Global Services.

      2. Dubai Storage & Customs Clearing
      We manage full customs documentation, international clearance stamps, and sovereign export licenses for clients wishing to move assets out of Dubai into global financial hubs.`,
      content_ar: `سياسة الشحن والنقل المؤمن والمصفح
      
      ١. الشحن المؤمن بنسبة ١٠٠٪
      كافة الشحنات وعمليات نقل السبائك والمعادن الثمينة التي تقوم بها PGR مؤمنة بالكامل ضد كافة المخاطر والسرقة عبر كبرى شركات التأمين العالمية. نستخدم مركبات مصفحة خاصة وحراس أمن مدربين بالتعاون مع شركة برينكس العالمية.

      ٢. معالجة المستندات الجمركية والتصدير
      نقوم بإعداد كافة الأوراق الجمركية والشهادات الجمركية الرسمية للتصدير من مطارات وموانئ دبي لأي وجهة في العالم.`
    }
  ];

  const currentDoc = docs.find((d) => d.id === activeDoc) || docs[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      {/* Background Dimmer */}
      <div className="fixed inset-0 bg-[#070707]/90 backdrop-blur-md" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4 md:p-8 relative">
        <div className="relative w-full max-w-4xl bg-[#0d0d0e] border border-white/[0.05] rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.95)] z-10 flex flex-col md:flex-row h-[550px] overflow-hidden animate-scaleUp">
          
          {/* Left Sidebar: Document Menu */}
          <div className="w-full md:w-64 bg-[#111112] border-b md:border-b-0 md:border-r border-white/[0.03] p-6 flex flex-col justify-between shrink-0"
               style={{ borderRightWidth: isAr ? "0" : "1px", borderLeftWidth: isAr ? "1px" : "0" }}>
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#c5a85c] tracking-widest block">{isAr ? "الامتثال القانوني" : "LEGAL COMPLIANCE"}</span>
                <h4 className="text-sm font-serif text-white font-medium">{isAr ? "السياسات والأنظمة" : "Policies & Frameworks"}</h4>
              </div>

              {/* Selector buttons */}
              <div className="space-y-1">
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    className={`w-full flex items-center gap-3 py-2.5 px-3 rounded text-xs font-mono transition-all text-left cursor-pointer ${
                      activeDoc === doc.id
                        ? "bg-[#c5a85c]/10 text-[#c5a85c] font-semibold border-l-2 border-[#c5a85c]"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                    style={{ 
                      textAlign: isAr ? "right" : "left",
                      borderLeftWidth: isAr ? "0" : (activeDoc === doc.id ? "2px" : "0"),
                      borderRightWidth: isAr ? (activeDoc === doc.id ? "2px" : "0") : "0"
                    }}
                  >
                    <span className="text-[#c5a85c]">{doc.icon}</span>
                    <span>{isAr ? doc.label_ar : doc.label_en}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[9px] font-mono text-gray-600 border-t border-white/[0.03] pt-4 mt-6">
              <span>PGR LEGAL COMPLIANCE © 2026</span>
            </div>
          </div>

          {/* Right Main Panel: Displaying Document Content */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col justify-between relative bg-[#09090a]">
            
            {/* Close trigger overlay */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-gray-400 hover:text-white border border-white/[0.04] cursor-pointer"
              style={{ right: isAr ? "auto" : "16px", left: isAr ? "16px" : "auto" }}
            >
              <X size={16} />
            </button>

            <div className="space-y-6">
              <h3 className="text-xl font-serif text-white border-b border-white/[0.03] pb-4 pr-6">
                {isAr ? currentDoc.label_ar : currentDoc.label_en}
              </h3>

              <div className="text-xs md:text-sm text-gray-300 leading-relaxed space-y-4 font-sans whitespace-pre-line">
                {isAr ? currentDoc.content_ar : currentDoc.content_en}
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/[0.01] border border-white/[0.02] flex items-center gap-2.5 text-[10px] font-mono text-gray-500">
              <ShieldCheck size={14} className="text-[#c5a85c]" />
              <span>
                {isAr 
                  ? "تم تحديث هذه السياسات وتطبيقها قانونياً بموافقة سلطة مركز دبي للسلع المتعددة لعام ٢٠٢٦." 
                  : "These policies are legally synchronized and approved under DMCC framework protocols for 2026."}
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

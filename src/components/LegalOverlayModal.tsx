/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, Shield, FileText, ScrollText, Landmark, ShieldCheck, 
  Coins, Truck, Vault, RefreshCw, AlertTriangle, Cookie, CheckSquare
} from "lucide-react";

interface LegalOverlayModalProps {
  currentLang: "en" | "ar";
  onClose: () => void;
  defaultDoc?: string;
}

export default function LegalOverlayModal({ currentLang, onClose, defaultDoc = "terms" }: LegalOverlayModalProps) {
  const isAr = currentLang === "ar";
  const [activeDoc, setActiveDoc] = useState<string>(defaultDoc);

  const docs = [
    {
      id: "terms",
      icon: <ScrollText size={14} />,
      label_en: "Terms of Service",
      label_ar: "شروط الخدمة والأحكام",
      content_en: `PGR UAE Precious Metals & Bullion Quote Desk - Terms of Service

1. Binding Nature & Market Fluctuation
By accessing this Physical Bullion Purchase Inquiry Platform, you acknowledge that precious metal spot rates fluctuate in real-time in accordance with global physical bullion markets. Prices shown on this platform are strictly indicative market references. Final, locked prices are legally confirmed exclusively via formal desk invoice issued by PGR UAE (the "Final Desk Confirmation").

2. Purchase Inquiry Flow
No order is executed instantly. Users submit a Physical Bullion Purchase Inquiry. PGR UAE is under no obligation to process, lock, or fulfill an inquiry until all KYC and AML validation protocols are completed, and the desk issues a final firm quote.

3. Payment & Settlement
Upon client acceptance of a firm quote, settlements must be cleared via bank wire, authorized credit drafts, or official physical office payment within 24 hours. PGR UAE reserves the right to cancel un-settled allocations at its absolute discretion.`,
      content_ar: `مكتب PGR UAE لتسعير السلع والمعادن الثمينة - شروط الخدمة والأحكام

١. طبيعة الأسعار المتقلبة وارتباطها بالبورصة اللحظية
باستخدامك لمنصة تقديم طلبات عروض أسعار السبائك الفعلية، فإنك تقر بأن أسعار المعادن الثمينة تتغير لحظياً طبقاً للأسواق العالمية. الأسعار المعروضة على المنصة هي أسعار إرشادية وتأشيرية فقط. السعر النهائي والملزم يتم اعتماده وتأكيده حصرياً بموجب فاتورة رسمية صادرة من مكتب تداول المعادن التابع لـ PGR UAE ("التأكيد النهائي للمكتب").

٢. تدفق طلبات الشراء والاستفسارات
لا يتم تنفيذ أي عملية بيع أو شراء بشكل فوري أو تلقائي. يرسل المستخدم طلباً للاستفسار عن أسعار السبائك الفعلية. لا تقع على عاتق PGR UAE أي التزامات بقبول أو تثبيت السعر أو معالجة الطلب إلا بعد استيفاء كافة متطلبات التحقق من الهوية (KYC) وسياسات الامتثال، وصدور تأكيد تسعير نهائي من مكتبنا.

٣. الدفع والتسوية المالية
بعد قبول العميل لعرض السعر النهائي، يجب إتمام التسوية المالية بالكامل خلال ٢٤ ساعة عمل عبر تحويل بنكي رسمي أو دفع معتمد في المقر الرئيسي. تحتفظ PGR UAE بحق إلغاء التخصيص غير المسوى حسب تقديرها المطلق.`
    },
    {
      id: "privacy",
      icon: <Shield size={14} />,
      label_en: "Privacy Policy",
      label_ar: "سياسة الخصوصية وسرية البيانات",
      content_en: `PGR UAE Executive Data Privacy Policy

1. Data Sovereignty & Confidentiality
PGR UAE is committed to protecting the absolute anonymity and privacy of accredited investors and sovereign entities. We do not sell, rent, license, or share client information, transactional ledgers, or asset holdings with third-party commercial organizations.

2. Physical Document Security & Storage
All physical compliance documents, ultimate beneficial owner (UBO) records, trade licenses, and identity verification logs are managed under encrypted private storage schemas. Files are strictly protected against public network scanning, and document links expire on high-security timetables.

3. Access Controls
Access to submitted documentation is limited to senior compliance officers of PGR UAE for regulatory audits only.`,
      content_ar: `سياسة الخصوصية وسرية البيانات الحسابية لـ PGR UAE

١. حماية سرية بيانات النخبة وكبار الشخصيات
تلتزم PGR UAE التزاماً مطلقاً بحماية الخصوصية والسرية التامة لعملائنا ومؤسساتنا الشريكة. نحن لا نقوم ببيع أو تأجير أو مشاركة قوائم العملاء، سجلات المعاملات، أو الأصول المودعة مع أي جهات خارجية أو تجارية.

٢. تأمين الوثائق والمستندات الثبوتية
يتم إدارة وحفظ كافة مستندات التحقق المرفوعة ورخص الشركات وعقود التأسيس وبيانات الملاك الحقيقيين (UBO) تحت تشفير عالي الكفاءة ومستودعات بيانات مغلقة بالكامل. الروابط منتهية الصلاحية ومحمية من المسح الخارجي.

٣. صلاحيات الوصول والمراجعة
يقتصر حق الاطلاع على المستندات والوثائق المرفوعة على كبار مسؤولي الامتثال في PGR UAE لأغراض التدقيق القانوني فقط.`
    },
    {
      id: "aml",
      icon: <Landmark size={14} />,
      label_en: "KYC & AML Policy",
      label_ar: "سياسة الامتثال ومكافحة غسيل الأموال",
      content_en: `PGR UAE Anti-Money Laundering (AML) & Know Your Customer (KYC) Policy

1. Institutional Commitment
PGR UAE operates in absolute compliance with UAE Federal Decree-Law No. (20) of 2018 on Anti-Money Laundering and Combating the Financing of Terrorism, and guidelines of the UAE Ministry of Economy and Central Bank.

2. Mandatory Document Auditing
Individual Inquiries: Prior to high-value physical allocation, individual clients must provide a valid Passport, UAE Resident Emirates ID (front/back), proof of residential address, and source of funds declaration.
Corporate Inquiries: Corporate partners must supply a valid Trade License, Memorandum of Association (MOA/AOA), authorized signatory credentials, UBO details, and a source of wealth statement.

3. Suspicious Transaction Reporting
All cash-equivalent settlements above AED 55,000 are subject to regulatory checking and direct file creation in the UAE Financial Intelligence Unit's goAML system.`,
      content_ar: `سياسة الامتثال ومكافحة غسيل الأموال (AML/KYC) - PGR UAE

١. الالتزام القانوني والتشريعي
تطبق PGR UAE أعلى معايير الالتزام بموجب المرسوم بقانون اتحادي رقم (٢٠) لسنة ٢٠١٨ في شأن مواجهة غسل الأموال ومكافحة تمويل الإرهاب وتمويل التنظيمات غير المشروعة في دولة الإمارات، وتوجيهات وزارة الاقتصاد ومصرف الإمارات المركزي.

٢. متطلبات التحقق الثبوتي الإلزامية
الأفراد: قبل تخصيص أو تسليم السبائك، يجب تزويدنا بجواز السفر، الهوية الإماراتية (الوجهين)، إثبات السكن، وإقرار بمصدر الأموال.
الشركات: يجب تزويدنا برخصة تجارية سارية، عقد التأسيس (MOA/AOA)، أوراق المفوض بالتوقيع، وثيقة المالك المستفيد (UBO)، وإقرار بمصدر الثروة.

٣. الإبلاغ ومراقبة المعاملات
تخضع كافة المعاملات والتسويات التي تفوق ٥٥,٠٠٠ درهم للتحقق والتدقيق عبر منصة goAML الرسمية لوحدة المعلومات المالية لدولة الإمارات.`
    },
    {
      id: "pricing",
      icon: <Coins size={14} />,
      label_en: "Pricing & Market Disclaimer",
      label_ar: "إخلاء مسؤولية الأسعار وبيانات السوق",
      content_en: `PGR UAE Pricing & Market Data Disclaimer

PGR UAE provides indicative precious metals pricing and quote request services for physical bullion inquiries. Prices shown are indicative market references only and may change without notice. Final availability, premiums, VAT/tax treatment, payment, delivery, storage, and settlement terms are confirmed by PGR UAE before any transaction. PGR UAE does not provide financial, investment, tax, or legal advice. Firm quote confirmed by PGR UAE desk. Subject to market movement and compliance review.

Any historical metal chart patterns or references on this platform are for general illustration purposes and must not be used as investment counsel or speculative forecasting.`,
      content_ar: `إخلاء مسؤولية أسعار السلع ومعلومات السوق - PGR UAE

توفر PGR UAE أسعاراً إرشادية وخدمة طلب عروض أسعار للاستفسارات المتعلقة بالسبائك والمعادن الثمينة الفعلية. الأسعار المعروضة مؤشرات سوقية فقط وقد تتغير دون إشعار. يتم تأكيد التوفر، الهامش، المعاملة الضريبية، الدفع، التسليم، التخزين، وشروط التسوية من قبل PGR UAE قبل أي عملية. لا تقدم PGR UAE نصائح مالية أو استثمارية أو ضريبية أو قانونية ولا تضمن أداء السوق.

تعتبر كافة المخططات البيانية السابقة للأسعار توضيحية وتاريخية عامة، ولا يعتمد عليها كوعود مالية أو تنبؤات لاتجاهات السوق.`
    },
    {
      id: "refund",
      icon: <RefreshCw size={14} />,
      label_en: "Refund & Cancellation Policy",
      label_ar: "سياسة الإلغاء واسترداد الأموال",
      content_en: `PGR UAE Physical Bullion Refund & Cancellation Policy

1. Absolute Finality of Locked Orders
Due to high volatility and real-time spot price fluctuations in international bullion markets, once a firm quote is accepted by the customer and a Final Desk Confirmation invoice is generated, the transaction cannot be cancelled, reversed, or refunded.

2. Price Risk Indemnification
Any cancellation requested by a customer prior to complete settlement, if approved by the trading desk, will make the customer liable for the market loss spread (the difference between the locked purchase price and current market spot rates), plus an administrative desk fee.`,
      content_ar: `سياسة إلغاء طلبات التسعير واسترداد الأموال - PGR UAE

١. نهائية الأسعار والطلبات المعتمدة
نظراً للحساسية العالية والتقلب السريع لأسعار الذهب والفضة الفورية عالمياً، فبمجرد قبول العميل لعرض التسعير وصدور الفاتورة النهائية المعتمدة من مكتب التداول، تكون المعاملة نهائية وغير قابلة للإلغاء أو التراجع أو استرداد الأموال.

٢. تعويض مخاطر تغير السوق
في حالات الإلغاء المستثناة والخاصة التي يوافق عليها مكتب التداول قبل إتمام الدفع، يتحمل العميل فارق خسارة هبوط أسعار السوق (الفرق بين السعر المثبت وقت الطلب وسعر السوق الحالي)، بالإضافة إلى رسوم إدارية إضافية.`
    },
    {
      id: "delivery",
      icon: <Truck size={14} />,
      label_en: "Delivery & Collection Policy",
      label_ar: "سياسة التوصيل والاستلام الفعلي",
      content_en: `PGR UAE Physical Bullion Delivery & Collection Policy

1. Secure Handover protocols
Physical delivery or collection of allocated bullion is strictly subject to pre-scheduled appointments at our Almas Tower headquarters in Dubai, UAE. Biometric validation, original Emirates ID or Passport, and verified corporate authorization letters are mandatory for handovers.

2. Armored Security Logistics
PGR UAE coordinates desk-confirmed secure delivery for authorized institutional consignments. Delivery is subject to local and international customs approvals and compliance review.`,
      content_ar: `سياسة شحن وتسليم واستلام السبائك الفعلية - PGR UAE

١. بروتوكولات التسليم والاستلام الآمن
يخضع استلام أو تسليم السبائك الفعلية لمواعيد مسبقة ومثبتة في مقرنا الرئيسي ببرج الماس بمدينة دبي. يُشترط تقديم الهوية الإماراتية الأصلية أو جواز السفر، مع التحقق من الهوية الشخصية ومطابقة خطابات التفويض للشركات.

٢. لوجستيات النقل المصفح والمؤمن
تتعاون PGR UAE مع كبرى شركات نقل الأموال العالمية المرخصة (مثل برينكس) لتنسيق لوجستيات شحن مؤمنة بالكامل للطلبات المؤسسية الكبرى. تخضع كافة عمليات النقل للموافقات الجمركية المحلية والدولية.`
    },
    {
      id: "storage",
      icon: <Vault size={14} />,
      label_en: "Allocated Storage Terms",
      label_ar: "أحكام وشروط التخزين المخصص",
      content_en: `PGR UAE Allocated Physical Bullion Storage Terms

1. Custody and Segregation
Allocated storage means physical bullion purchased through PGR UAE may be recorded as allocated to the customer, subject to storage terms, verification, compliance checks, and operational approval. This is not a financial wallet, cash balance, or instant trading account.

2. Storage Manifests & Audits
Physical assets in custody are stored under maximum-security conditions, strictly segregated from the operational assets of PGR UAE. Customers receive periodic storage certificates and manifests. Physical withdrawal requests require 48 hours advanced operational notice and compliance clearance.`,
      content_ar: `أحكام وشروط إيداع وتخزين المعادن الثمينة المخصصة - PGR UAE

١. الحفظ الآمن والفصل الفعلي للأصول
التخزين المخصص يعني أن السبائك الفعلية التي يتم شراؤها عبر PGR UAE تُسجل مخصصة باسم العميل، وتخضع لأحكام التخزين، التحقق، الفحص الرقابي، والموافقة التشغيلية. هذا ليس محفظة مالية رقمية، رصيداً نقدياً، أو حساب تداول فوري لتبادل العملات.

٢. تقارير الجرد السنوية والتدقيق
تُحفظ الأصول الفعلية المودعة في خزائننا بأقصى معايير الأمان مفصولة تماماً عن الأصول التشغيلية للشركة. يحصل العميل على شهادات إيداع دورية وموقعة. طلبات السحب الفعلي تتطلب إشعاراً مسبقاً بـ ٤٨ ساعة عمل وموافقة قسم الامتثال.`
    },
    {
      id: "sellback",
      icon: <RefreshCw size={14} />,
      label_en: "Sell-Back Quote Policy",
      label_ar: "سياسة طلب تسعير إعادة الشراء",
      content_en: `PGR UAE Physical Bullion Sell-Back Quote Policy

1. Quote Request Only
Customers may request a sell-back quote. PGR UAE is not obligated to buy back unless a final sell-back quote is issued by the desk and accepted by the customer. Product verification, compliance checks, fees, market conditions, and final desk confirmation apply.

2. Verification and Integrity Assays
Any precious metal bars submitted for a sell-back quote must undergo physical testing, chemical assay confirmation, and original hallmark/serial database matching. PGR UAE reserves the right to reject submittals that do not meet purity standards.`,
      content_ar: `سياسة طلب عروض أسعار إعادة بيع السبائك - PGR UAE

١. طلب عرض أسعار فقط
يمكن للعملاء تقديم طلب للحصول على تسعير لإعادة بيع سبائكهم. لا تعتبر PGR UAE ملزمة بإعادة الشراء إلا بعد صدور عرض سعر نهائي ومؤكد من مكتب التداول لدينا وقبول العميل له. تطبق شروط فحص المنتجات، اختبارات النقاء، الفحص الأمني والرقابي، الرسوم الإدارية، وتأكيد المكتب النهائي.

٢. الفحص المعملي والاختبار الكيميائي للسبائك
تخضع كافة السبائك المقدمة للفحص والاختبار الكيميائي الفعلي ومطابقة الأرقام التسلسلية قبل صدور السعر النهائي. تحتفظ PGR UAE بحق رفض أي سبيكة لا تطابق المعايير الصارمة لدرجة النقاء المعتمدة.`
    },
    {
      id: "risk",
      icon: <AlertTriangle size={14} />,
      label_en: "Risk Disclosure",
      label_ar: "وثيقة الإفصاح عن مخاطر السوق",
      content_en: `PGR UAE Physical Bullion Market Risk Disclosure Statement

1. Capital and Price Volatility
Investing in physical precious metals carries significant price volatility. Bullion markets are highly sensitive to geopolitical, macroeconomic, and global interest rate cycles. Past market performance is not indicative of future price outcomes.

2. Illiquidity Risk & Premium Expenses
Physical bullion is intended as a long-term capital preservation hedge. Short-term transaction spreads, minting premiums, and vault storage custody overheads can reduce short-term liquid asset values. Indicative market reference only. Firm quote confirmed by PGR UAE desk. Subject to compliance review.`,
      content_ar: `وثيقة الإفصاح عن مخاطر أسواق السلع والمعادن الثمينة - PGR UAE

١. تذبذب قيمة رأس المال وأسعار السوق
ينطوي تملك واقتناء المعادن الثمينة الفعلية على مخاطر تذبذب أسعار عالية. تتأثر أسواق السبائك بقوة بالأحداث الجيوسياسية ومؤشرات الاقتصاد الكلي وأسعار الفائدة العالمية. الأداء التاريخي للسوق ليس دليلاً على الإنجازات المستقبلية.

٢. مخاطر السيولة السريعة ورسوم التوثيق
يُنظر إلى السبائك الفعلية كمخزن آمن للقيمة وحماية للثروة على المدى الطويل. فروقات أسعار التداول الفورية ورسوم صك المصانع وتكاليف حفظ الخزائن قد تقلل من الأرباح السريعة. PGR UAE لا تقدم استشارات مالية. الأسعار استرشادية — عرض السعر المؤكد يصدر من الديوان.`
    },
    {
      id: "cookie",
      icon: <Cookie size={14} />,
      label_en: "Cookie Policy",
      label_ar: "سياسة ملفات الارتباط والتعريف",
      content_en: `PGR UAE Digital Portal Cookie Policy

Our Physical Bullion Purchase Inquiry Platform utilizes cookies and session storage mechanisms to secure client session variables, store language preferences, and cache indicative market rates for responsive layouts.

These cookies store no personal document numbers, bank credentials, or sensitive user identities. Disabling cookies in browser settings may limit performance of custom dashboard operations.`,
      content_ar: `سياسة ملفات تعريف الارتباط والارتباط الرقمي - PGR UAE

تستخدم منصة طلب تسعير السبائك ملفات تعريف الارتباط وتخزين الجلسات لتأمين حسابات المستخدمين وحفظ تفضيلات اللغة المختارة (العربية/الانجليزية) وتسريع تحميل الأسواق الاسترشادية التفاعلية.

لا تجمع ملفات تعريف الارتباط أي أرقام مستندات ثبوتية أو حسابات بنكية أو هويات مشفرة للزوار. قد يؤدي تعطيل الملفات في المتصفح إلى تقليص كفاءة ديوان المستشار المالي الرقمي.`
    },
    {
      id: "compliance",
      icon: <ShieldCheck size={14} />,
      label_en: "Compliance & Trust",
      label_ar: "الامتثال والشفافية المؤسسية",
      content_en: `PGR UAE Compliance, Licensing & Regulatory Trust

1. Legal Structure & Licensing
PGR UAE Precious Metals is officially registered, operating under stringent commercial licensing and compliance guidelines monitored by the Dubai Commodities Regulatory Division.

2. Audits and Financial Crimes Compliance
We operate under absolute alignment with the UAE Federal Financial Intelligence Unit (FIU) protocols, utilizing goAML reporting mechanisms. We support regular independent fiscal and physical bullion auditing.

3. Professional Integrity Boundaries
We enforce maximum transparency. PGR UAE does not provide retail credit, leveraged paper trading, fractional gold trading, or investment advisory accounts. We focus solely on 100% allocated physical bullion.`,
      content_ar: `معايير الامتثال والشفافية الرقابية لشركة PGR UAE

١. الهيكل القانوني والتراخيص الرسمية
تعمل PGR UAE لتجارة المعادن الثمينة بموجب رخصة تجارية رسمية وخاضعة للأنظمة واللوائح الرقابية الصارمة المعتمدة لتجارة المعادن الثمينة والذهب الفعلي بدولة الإمارات العربية المتحدة.

٢. مكافحة الجرائم المالية والامتثال البنكي
نعمل بتنسيق كامل مع الهيئات القضائية والمالية ووحدة المعلومات المالية (FIU) بالدولة، مع جرد دوري فعلي للسبائك المودعة في الخزائن الآمنة بالتنسيق مع مدققين خارجيين مستقلين.

٣. حدود النزاهة المهنية والخدمات
نحن نلتزم بالوضوح التام؛ لا تقدم PGR UAE تسهيلات ائتمانية، تداولات ورقية رافعة مالية، ذهباً مجزءاً، أو حسابات استشارية لإدارة المحافظ الاستثمارية. ينصب تركيزنا بالكامل على السبائك المخصصة بنسبة ١٠٠٪.`
    }
  ];

  const currentDoc = docs.find((d) => d.id === activeDoc) || docs[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      {/* Background Dimmer */}
      <div className="fixed inset-0 bg-[#070707]/90 backdrop-blur-md" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4 md:p-8 relative">
        <div className="relative w-full max-w-4xl bg-[#0d0d0e] border border-white/[0.05] rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.95)] z-10 flex flex-col md:flex-row h-[600px] overflow-hidden animate-scaleUp">
          
          {/* Left Sidebar: Document Menu */}
          <div className="w-full md:w-72 bg-[#111112] border-b md:border-b-0 md:border-r border-white/[0.03] p-4 flex flex-col justify-between shrink-0 overflow-y-auto"
               style={{ 
                 borderRightWidth: isAr ? "0" : "1px", 
                 borderLeftWidth: isAr ? "1px" : "0",
                 borderColor: "rgba(255,255,255,0.03)"
               }}>
            <div className="space-y-4">
              <div className="space-y-1 px-2">
                <span className="text-[9px] font-mono uppercase text-[#c5a85c] tracking-widest block">
                  {isAr ? "الامتثال القانوني والتنظيمي" : "LEGAL COMPLIANCE & TRUST"}
                </span>
                <h4 className="text-xs font-serif text-white font-medium">
                  {isAr ? "السياسات والأنظمة الرسمية" : "Policies & Compliance Desk"}
                </h4>
              </div>

              {/* Selector buttons */}
              <div className="space-y-0.5">
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    className={`w-full flex items-center gap-2.5 py-1.5 px-2 rounded text-[11px] font-mono transition-all text-left cursor-pointer ${
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

            <div className="text-[9px] font-mono text-gray-600 border-t border-white/[0.03] pt-3 mt-4 px-2 shrink-0">
              <span>PGR UAE COMPLIANCE © 2026</span>
            </div>
          </div>

          {/* Right Main Panel: Displaying Document Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between relative bg-[#09090a]">
            
            {/* Close trigger overlay */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-gray-400 hover:text-white border border-white/[0.04] cursor-pointer"
              style={{ right: isAr ? "auto" : "16px", left: isAr ? "16px" : "auto" }}
            >
              <X size={14} />
            </button>

            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-serif text-white border-b border-white/[0.03] pb-3 pr-6 text-gold-base">
                {isAr ? currentDoc.label_ar : currentDoc.label_en}
              </h3>

              <div className="text-xs text-gray-300 leading-relaxed space-y-3 font-sans whitespace-pre-line max-h-[380px] overflow-y-auto pr-1">
                {isAr ? currentDoc.content_ar : currentDoc.content_en}
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/[0.01] border border-white/[0.02] flex items-center gap-2 text-[9px] font-mono text-gray-500 shrink-0">
              <ShieldCheck size={12} className="text-[#c5a85c] shrink-0" />
              <span>
                {isAr 
                  ? "تم تحديث هذه السياسات وتطبيقها قانونياً بموجب الأنظمة واللوائح السارية لعام ٢٠٢٦." 
                  : "These policies are legally synchronized and approved under applicable regulatory framework protocols for 2026."}
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

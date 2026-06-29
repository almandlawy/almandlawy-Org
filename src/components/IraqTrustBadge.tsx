import React from "react";
import { ShieldCheck, CheckCircle, Truck, MapPin, FileText, Smartphone } from "lucide-react";

interface IraqTrustBadgeProps {
  currentLang: "en" | "ar";
}

export default function IraqTrustBadge({ currentLang }: IraqTrustBadgeProps) {
  const isAr = currentLang === "ar";

  const trustPoints = [
    {
      icon: <ShieldCheck className="text-gold-base shrink-0" size={18} />,
      text_en: "Identity verification before high-value orders",
      text_ar: "التحقق من الهوية قبل الطلبات عالية القيمة"
    },
    {
      icon: <CheckCircle className="text-gold-base shrink-0" size={18} />,
      text_en: "Price confirmed before payment",
      text_ar: "تأكيد السعر النهائي قبل الدفع"
    },
    {
      icon: <Smartphone className="text-gold-base shrink-0" size={18} />,
      text_en: "Immediate WhatsApp order confirmation",
      text_ar: "تأكيد الطلب الفوري عبر واتساب"
    },
    {
      icon: <Truck className="text-gold-base shrink-0" size={18} />,
      text_en: "Customs-cleared delivery options to Iraq",
      text_ar: "خيارات توصيل آمنة ومخلصة جمركياً للعراق"
    },
    {
      icon: <MapPin className="text-gold-base shrink-0" size={18} />,
      text_en: "Baghdad & Basra pickup points (if active)",
      text_ar: "نقاط استلام شريكة في بغداد والبصرة عند تفعيلها"
    },
    {
      icon: <FileText className="text-gold-base shrink-0" size={18} />,
      text_en: "Official product certificate & tax invoice",
      text_ar: "شهادة المنتج المعتمدة وفاتورة ضريبية رسمية"
    }
  ];

  return (
    <div className="p-5 rounded-lg bg-[#0e0e0e] border border-gold-base/10 shadow-lg space-y-4 max-w-xl mx-auto my-6" id="iraq-trust-badge">
      <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
        <ShieldCheck className="text-gold-base" size={22} />
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide font-sans">
            {isAr ? "ضمان التحقق والتوصيل الآمن للعراق من PGR" : "PGR Iraq Secure Delivery & Verification"}
          </h3>
          <p className="text-[10px] text-gray-500 font-mono">
            {isAr ? "شريكك الموثوق لتوريد سبائك المعادن الثمينة" : "Your Accredited Bullion Sourcing Partner"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
        {trustPoints.map((point, index) => (
          <div key={index} className="flex items-start gap-2 bg-white/[0.01] p-2 rounded hover:bg-white/[0.02] transition-colors">
            {point.icon}
            <span className="leading-tight">{isAr ? point.text_ar : point.text_en}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-950/20 border border-amber-900/30 rounded p-3 text-[11px] text-amber-500/90 leading-relaxed">
        <strong>{isAr ? "ملاحظة هامة:" : "Regulatory Notice:"} </strong>
        {isAr 
          ? "قد يتطلب شحن المعادن الثمينة مستندات جمركية، فواتير رسمية، وتصاريح استيراد حسب قوانين بلد المقصد. لا تقدم PGR أي وعود بعوائد ثابتة." 
          : "Procurement and transit of precious metals are subject to customs documentation, official declarations, and destination regulations. PGR does not promise fixed returns."}
      </div>
    </div>
  );
}

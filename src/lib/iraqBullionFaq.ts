/** FAQ content for Iraq bullion quote landing page + JSON-LD. */

export const IRAQ_BULLION_FAQ_EN = [
  {
    q: "Do you sell physical gold and silver to Iraqi customers?",
    a: "Yes. PGR UAE sources physical gold bars, silver bars, and bullion coins from accredited refineries in Dubai. Iraqi customers can request desk-confirmed quotes subject to compliance review."
  },
  {
    q: "Are prices final on the website?",
    a: "No. Prices shown are indicative market references only and are not a firm offer. Final pricing is confirmed by the PGR UAE desk after review."
  },
  {
    q: "How is the final quote confirmed?",
    a: "After you request a quote, the PGR UAE desk reviews product availability, compliance requirements, and current market conditions, then issues a desk-confirmed quote before any payment arrangement."
  },
  {
    q: "Is KYC required?",
    a: "KYC and AML review may be required before payment and dispatch. Requirements depend on order value, customer profile, and applicable regulations."
  },
  {
    q: "Can I request a quote by WhatsApp?",
    a: "Yes. Iraqi customers can contact the PGR UAE WhatsApp Quote Desk to request a firm quote for physical gold or silver bullion."
  },
  {
    q: "Do you provide delivery or collection options?",
    a: "Collection and delivery options for Iraqi customers are arranged after desk review, compliance clearance, and confirmation of availability. Options are subject to documentation and applicable customs requirements."
  }
];

export const IRAQ_BULLION_FAQ_AR = [
  {
    q: "هل تبيعون ذهباً وفضة مادية للعملاء العراقيين؟",
    a: "نعم. يوفر PGR UAE سبائك ذهب وفضة وعملات سبائك مادية من مصافٍ معتمدة في دبي. يمكن للعملاء العراقيين طلب عروض أسعار مؤكدة من المكتب بعد مراجعة الامتثال."
  },
  {
    q: "هل الأسعار على الموقع نهائية؟",
    a: "لا. الأسعار المعروضة مراجع سوقية إرشادية فقط وليست عرض بيع نهائي. يتم تأكيد السعر النهائي من مكتب PGR UAE بعد المراجعة."
  },
  {
    q: "كيف يتم تأكيد عرض السعر النهائي؟",
    a: "بعد طلب عرض السعر، يراجع مكتب PGR UAE توفر المنتج ومتطلبات الامتثال وظروف السوق الحالية، ثم يصدر عرض سعر مؤكد من المكتب قبل أي ترتيب للدفع."
  },
  {
    q: "هل التحقق من الهوية (KYC) مطلوب؟",
    a: "قد تُطلب مراجعة KYC وAML قبل الدفع والتسليم. تعتمد المتطلبات على قيمة الطلب وملف العميل والأنظمة المعمول بها."
  },
  {
    q: "هل يمكنني طلب عرض سعر عبر واتساب؟",
    a: "نعم. يمكن للعملاء العراقيين التواصل مع ديوان واتساب PGR UAE لطلب عرض سعر مؤكد للسبائك الذهبية أو الفضية."
  },
  {
    q: "هل توفرون خيارات توصيل أو استلام؟",
    a: "يتم ترتيب خيارات الاستلام والتوصيل للعملاء العراقيين بعد مراجعة المكتب وإتمام الامتثال وتأكيد التوفر. الخيارات خاضعة للمستندات ومتطلبات الجمارك المعمول بها."
  }
];

export function buildIraqFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: IRAQ_BULLION_FAQ_EN.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a }
    }))
  };
}

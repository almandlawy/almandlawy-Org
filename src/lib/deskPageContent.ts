/** Rich desk page copy — compliance-safe, 500+ words per category. */

export interface DeskContentSection {
  h2En: string;
  h2Ar: string;
  paragraphsEn: string[];
  paragraphsAr: string[];
}

export interface DeskFaq {
  qEn: string;
  qAr: string;
  aEn: string;
  aAr: string;
}

export const GOLD_BARS_CONTENT = {
  introEn:
    "PGR UAE provides desk-confirmed quotes for physical gold bars in Dubai. We serve private clients, family offices, and Iraqi buyers seeking accredited bullion with transparent quote documentation — not automated checkout pricing.",
  introAr:
    "يوفر PGR UAE عروض أسعار مؤكدة لسبائك الذهب المادية في دبي. نخدم العملاء الخاصين والمكاتب العائلية والمشترين العراقيين الباحثين عن سبائك معتمدة مع توثيق شفاف — وليس تسعيراً تلقائياً عند الدفع.",
  weightsEn: "1g, 2.5g, 5g, 10g, 20g, 50g, 100g, 1kg",
  weightsAr: "١ج، ٢.٥ج، ٥ج، ١٠ج، ٢٠ج، ٥٠ج، ١٠٠ج، ١كغ",
  purityEn: "999.9 fine gold where applicable",
  purityAr: "ذهب 999.9 حيث ينطبق",
  brandsEn: "Refiners and brands subject to desk availability (LBMA-accredited sources where applicable)",
  brandsAr: "المصافي والعلامات حسب توفر المكتب (مصادر معتمدة LBMA حيث ينطبق)",
  sections: [
    {
      h2En: "Gold Bars in Dubai",
      h2Ar: "سبائك الذهب في دبي",
      paragraphsEn: [
        "Dubai is a major hub for physical gold bullion sourcing. PGR UAE operates as a quote desk — you request a firm quote, and our team confirms refiner availability, premium, VAT treatment where applicable, and settlement terms before any transaction.",
        "We do not display final binding prices online. Any market reference shown elsewhere on this site is indicative only and may change without notice.",
      ],
      paragraphsAr: [
        "دبي مركز رئيسي لتوريد سبائك الذهب المادية. يعمل PGR UAE كمكتب عروض أسعار — تطلب عرضاً مؤكداً، ويؤكد فريقنا توفر المصافي والهامش والمعاملة الضريبية وشروط التسوية قبل أي معاملة.",
        "لا نعرض أسعاراً نهائية ملزمة على الإنترنت. أي مرجع سوقي معروض في مكان آخر من هذا الموقع استرشادي فقط وقد يتغير دون إشعار.",
      ],
    },
    {
      h2En: "How pricing is determined",
      h2Ar: "كيف يُحدد السعر",
      paragraphsEn: [
        "Desk-confirmed pricing reflects the live spot reference, refiner premium, weight format, and compliance profile. Premiums vary by manufacturer, bar size, and market conditions. The desk issues your firm quote in writing after reviewing your request.",
        "Subject to availability. No investment advice is provided.",
      ],
      paragraphsAr: [
        "التسعير المؤكد يعكس مرجع السوق المباشر وهامش المصافي ووزن السبيكة وملف الامتثال. تختلف الهوامش حسب المصنع والحجم وظروف السوق. يصدر المكتب عرض السعر المؤكد كتابياً بعد مراجعة طلبك.",
        "حسب التوفر. لا نقدم نصائح استثمارية.",
      ],
    },
    {
      h2En: "How to request a quote",
      h2Ar: "كيف تطلب عرض سعر",
      paragraphsEn: [
        "Submit the quote request form with your preferred weight and contact details, or message the WhatsApp Quote Desk with your requirements. Our team responds with indicative guidance and, after compliance review when required, a desk-confirmed quote.",
        "Collection in Dubai or arranged delivery may be discussed after quote confirmation. All terms are confirmed case by case.",
      ],
      paragraphsAr: [
        "قدّم نموذج طلب عرض السعر مع الوزن المفضل وبيانات التواصل، أو راسل مكتب واتساب بمتطلباتك. يرد فريقنا بإرشاد استرشادي وبعد مراجعة الامتثال عند الحاجة بعرض سعر مؤكد.",
        "يمكن مناقشة الاستلام في دبي أو التوصيل بعد تأكيد العرض. جميع الشروط تُؤكد حسب كل حالة.",
      ],
    },
  ] as DeskContentSection[],
  faqs: [
    {
      qEn: "Are gold bar prices on the website final?",
      qAr: "هل أسعار سبائك الذهب على الموقع نهائية؟",
      aEn: "No. All online references are indicative market references only. Your firm quote is confirmed by the PGR UAE desk after product and compliance review.",
      aAr: "لا. جميع المراجع على الموقع استرشادية فقط. يؤكد مكتب PGR UAE عرض السعر النهائي بعد مراجعة المنتج والامتثال.",
    },
    {
      qEn: "What weights can I request?",
      qAr: "ما الأوزان التي يمكنني طلبها؟",
      aEn: "Common formats include 1g through 1kg treasury bars. Availability depends on refiner stock at the time of your request.",
      aAr: "تشمل الأوزان الشائعة من ١ جرام حتى سبائك ١ كيلو. التوفر يعتمد على مخزون المصافي وقت الطلب.",
    },
    {
      qEn: "Do you provide investment advice?",
      qAr: "هل تقدمون نصائح استثمارية؟",
      aEn: "No. PGR UAE provides physical bullion quote services only. We do not guarantee returns or recommend investments.",
      aAr: "لا. يقدم PGR UAE خدمات عروض أسعار للسبائك المادية فقط. لا نضمن عوائد ولا نوصي بالاستثمار.",
    },
    {
      qEn: "Can Iraqi customers request gold bar quotes?",
      qAr: "هل يمكن للعملاء العراقيين طلب عروض سبائك الذهب؟",
      aEn: "Yes. Iraqi customers may request Dubai desk-confirmed quotes. Documentation and delivery arrangements are confirmed case by case after desk review.",
      aAr: "نعم. يمكن للعملاء العراقيين طلب عروض مؤكدة من دبي. تُرتب المستندات والتسليم حسب كل حالة بعد مراجعة المكتب.",
    },
  ] as DeskFaq[],
};

export const SILVER_BARS_CONTENT = {
  introEn:
    "Request desk-confirmed quotes for physical silver bars in the UAE. PGR UAE supplies SAM, PALM, and other accredited silver formats subject to availability — with transparent quote documentation and compliance review when required.",
  introAr:
    "اطلب عروض أسعار مؤكدة لسبائك الفضة المادية في الإمارات. يوفر PGR UAE صيغ SAM وPALM وفضة معتمدة أخرى حسب التوفر — مع توثيق شفاف ومراجعة امتثال عند الحاجة.",
  weightsEn: "1oz, 50g, 100g, 500g, 1kg",
  weightsAr: "١ أونصة، ٥٠ج، ١٠٠ج، ٥٠٠ج، ١كغ",
  purityEn: "999 / 999.9 fine silver where applicable",
  purityAr: "فضة 999 / 999.9 حيث ينطبق",
  sections: [
    {
      h2En: "Silver Bars in the UAE",
      h2Ar: "سبائك الفضة في الإمارات",
      paragraphsEn: [
        "Physical silver bars remain a core product for PGR UAE desk inquiries. We coordinate with accredited refiners for SAM and PALM cast bars popular with regional buyers, including Iraqi customers sourcing through Dubai.",
        "Availability is subject to desk confirmation. Indicative market references do not constitute a firm offer.",
      ],
      paragraphsAr: [
        "تبقى سبائك الفضة المادية منتجاً أساسياً لاستفسارات مكتب PGR UAE. ننسق مع مصافٍ معتمدة لسبائك SAM وPALM الشائعة لدى المشترين الإقليميين بما فيهم العراقيون عبر دبي.",
        "التوفر خاضع لتأكيد المكتب. المراجع السوقية الاسترشادية لا تشكل عرضاً ملزماً.",
      ],
    },
    {
      h2En: "Pricing and premiums",
      h2Ar: "التسعير والهوامش",
      paragraphsEn: [
        "Silver desk quotes reflect spot reference, refiner premium, weight, and compliance requirements. VAT treatment may apply depending on product format and client profile — confirmed by the desk.",
        "Final quote confirmed by PGR UAE desk before order settlement.",
      ],
      paragraphsAr: [
        "تعكس عروض الفضة مرجع السوق وهامش المصافي والوزن ومتطلبات الامتثال. قد تطبق ضريبة القيمة المضافة حسب صيغة المنتج — يؤكدها المكتب.",
        "عرض السعر النهائي يؤكده مكتب PGR UAE قبل تسوية الطلب.",
      ],
    },
    {
      h2En: "Requesting a silver bar quote",
      h2Ar: "طلب عرض سعر سبائك الفضة",
      paragraphsEn: [
        "Use the quote form or WhatsApp desk with your preferred weight (e.g. 500g PALM, 1kg SAM). Our team confirms stock, premium, and delivery or collection options.",
        "No guaranteed returns. Physical bullion products only.",
      ],
      paragraphsAr: [
        "استخدم نموذج العرض أو واتساب المكتب مع الوزن المفضل (مثل PALM ٥٠٠ج أو SAM ١كغ). يؤكد فريقنا المخزون والهامش وخيارات التسليم أو الاستلام.",
        "لا عوائد مضمونة. سبائك مادية فقط.",
      ],
    },
  ] as DeskContentSection[],
  faqs: [
    {
      qEn: "Is VAT applied to silver bars in the UAE?",
      qAr: "هل تطبق ضريبة القيمة المضافة على سبائك الفضة؟",
      aEn: "VAT treatment depends on product purity, format, and client status. The desk confirms applicable tax treatment in your firm quote.",
      aAr: "تعتمد المعاملة الضريبية على النقاوة والصيغة ووضع العميل. يؤكد المكتب المعاملة في عرض السعر المؤكد.",
    },
    {
      qEn: "Which silver brands are available?",
      qAr: "ما علامات الفضة المتاحة؟",
      aEn: "SAM and PALM are commonly requested. Other accredited formats may be available subject to refiner stock at the time of inquiry.",
      aAr: "SAM وPALM من الأكثر طلباً. صيغ معتمدة أخرى قد تتوفر حسب مخزون المصافي وقت الاستفسار.",
    },
    {
      qEn: "Are prices shown online binding?",
      qAr: "هل الأسعار المعروضة ملزمة؟",
      aEn: "No. Online figures are indicative market references only until the desk issues a confirmed quote.",
      aAr: "لا. الأرقام على الموقع مراجع استرشادية فقط حتى يصدر المكتب عرضاً مؤكداً.",
    },
  ] as DeskFaq[],
};

export const IRAQ_SEO_KEYWORDS_EN = [
  "Dubai to Iraq bullion quote",
  "Gold bars Dubai Iraq",
  "Silver bars UAE Iraq",
  "Physical bullion quote desk Dubai",
];

export const IRAQ_EXTRA_SECTIONS = {
  en: [
    {
      h2: "Dubai to Iraq bullion quote corridor",
      body: "PGR UAE assists customers requesting Dubai desk-confirmed quotes for physical bullion products. Orders, documentation, collection, and delivery arrangements are confirmed case by case. No investment advice. No guaranteed returns. All prices are indicative until confirmed by the desk.",
    },
    {
      h2: "Gold bars Dubai · Silver bars UAE · Iraq delivery",
      body: "Whether you need gold bars sourced in Dubai or silver bars from accredited UAE refiners for Iraqi customers, our quote desk coordinates product availability, compliance review, and logistics after your firm quote is issued.",
    },
  ],
  ar: [
    {
      h2: "ممر عروض السبائك من دبي إلى العراق",
      body: "يساعد PGR UAE العملاء في طلب عروض أسعار مؤكدة من دبي للسبائك المادية. الطلبات والمستندات والاستلام والتوصيل تُؤكد حسب كل حالة. لا نصائح استثمارية. لا عوائد مضمونة. جميع الأسعار استرشادية حتى تأكيد المكتب.",
    },
    {
      h2: "سبائك ذهب دبي · فضة الإمارات · توصيل العراق",
      body: "سواء احتجت سبائك ذهب من دبي أو فضة من مصافٍ إماراتية معتمدة للعملاء العراقيين، ينسق مكتب العروض التوفر ومراجعة الامتثال واللوجستيات بعد إصدار عرض السعر المؤكد.",
    },
  ],
};

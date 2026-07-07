/**
 * PGR UAE desk service lines — inspired by institutional bullion desk taxonomy (a-mark style).
 * Quote desk only; no direct wholesale trading API.
 */

export interface DeskService {
  key: string;
  icon: "wholesale" | "storage" | "minting" | "sellback";
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  ctaEn: string;
  ctaAr: string;
  path: string;
}

export const DESK_SERVICES: DeskService[] = [
  {
    key: "wholesale-desk",
    icon: "wholesale",
    titleEn: "Bullion Quote Desk",
    titleAr: "مكتب عروض السبائك",
    bodyEn:
      "Request desk-confirmed quotes for physical gold and silver bars and coins. Pricing, premium, and availability are reviewed by the PGR UAE team — not instant checkout.",
    bodyAr:
      "اطلب عروض أسعار مؤكدة لسبائك الذهب والفضة وعملات السبائك المادية. يراجع فريق PGR UAE التسعير والعلاوة والتوفر — دون شراء مباشر عبر السلة.",
    ctaEn: "Request Firm Quote",
    ctaAr: "طلب عرض سعر",
    path: "/request-quote",
  },
  {
    key: "storage-logistics",
    icon: "storage",
    titleEn: "Allocated Storage & Logistics",
    titleAr: "التخزين المخصص واللوجستيات",
    bodyEn:
      "Arrange insured allocated storage and coordinated delivery or collection from Dubai after your quote is confirmed and compliance is cleared.",
    bodyAr:
      "تنسيق التخزين المخصص المؤمّن والتوصيل أو الاستلام من دبي بعد تأكيد عرض السعر وإتمام متطلبات الامتثال.",
    ctaEn: "Storage Terms",
    ctaAr: "شروط التخزين",
    path: "/allocated-storage",
  },
  {
    key: "minting-sourcing",
    icon: "minting",
    titleEn: "Minting & Custom Sourcing",
    titleAr: "السك والتوريد المخصص",
    bodyEn:
      "Custom bullion sourcing from accredited refineries and mint products subject to desk availability, KYC review, and lead time confirmation.",
    bodyAr:
      "توريد سبائك مخصص من مصافٍ معتمدة ومنتجات سك حسب التوفر، مع مراجعة KYC وتأكيد مدة التوريد من المكتب.",
    ctaEn: "Custom Inquiry",
    ctaAr: "استفسار مخصص",
    path: "/custom-inquiry",
  },
  {
    key: "sell-back",
    icon: "sellback",
    titleEn: "Sell-Back & Liquidation",
    titleAr: "إعادة الشراء والتسييل",
    bodyEn:
      "Submit physical bullion for desk repurchase review. Final buy-back price depends on assay, hallmark verification, and market conditions.",
    bodyAr:
      "قدّم السبائك المادية لمراجعة إعادة الشراء من المكتب. يعتمد سعر الشراء النهائي على الفحص والختم والظروف السوقية.",
    ctaEn: "Sell-Back Policy",
    ctaAr: "سياسة إعادة الشراء",
    path: "/sell-back",
  },
];

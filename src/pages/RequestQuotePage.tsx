import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import QuoteFormFields from "../components/premium/QuoteFormFields";

export default function RequestQuotePage() {
  const { currentLang } = useApp();
  const isAr = currentLang === "ar";
  const [params] = useSearchParams();
  const prefilled = params.get("product") || undefined;

  return (
    <PremiumLayout>
      <section className="page-hero border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-gold-base">
            {isAr ? "طلب عرض سعر" : "Request Firm Quote"}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-[#F5F0E8]">
            {isAr ? "اطلب عرض سعر مؤكد للسبائك والمعادن الثمينة" : "Request a Firm Bullion Quote"}
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            {isAr
              ? "قدّم استفسارك. سيراجع PGR UAE التوفر والمرجع السوقي والهوامش ومعاملة الضريبة والتسليم ومتطلبات KYC/AML قبل إصدار عرض سعر مؤكد."
              : "Submit your inquiry. PGR UAE will review availability, market reference, premiums, VAT/tax treatment, delivery/collection, KYC/AML requirements, and confirm a firm quote."}
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8 max-w-2xl mx-auto">
        <div className="premium-card p-6 md:p-8">
          <QuoteFormFields currentLang={currentLang} prefilledProduct={prefilled} embedded />
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-6 font-mono leading-relaxed">
          {isAr
            ? "الأسعار إرشادية حتى إصدار عرض سعر مؤكد. لا يوجد ضمان لإعادة الشراء أو عوائد مضمونة."
            : "Prices are indicative until a firm quote is issued. No guaranteed buyback or returns."}
        </p>
      </section>
    </PremiumLayout>
  );
}

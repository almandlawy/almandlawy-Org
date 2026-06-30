import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PremiumLayout from "../components/premium/PremiumLayout";
import LegalOverlayModal from "../components/LegalOverlayModal";

const PATH_TO_DOC: Record<string, string> = {
  "/terms": "terms",
  "/privacy-policy": "privacy",
  "/kyc-aml-policy": "aml",
  "/pricing-disclaimer": "pricing",
  "/refund-cancellation-policy": "refund",
  "/delivery-collection-policy": "delivery",
  "/allocated-storage-terms": "storage",
  "/sell-back-policy": "sellback",
  "/risk-disclosure": "risk",
  "/cookie-policy": "cookie",
};

interface LegalPageProps {
  path: string;
}

export default function LegalPage({ path }: LegalPageProps) {
  const { currentLang } = useApp();
  const navigate = useNavigate();
  const docId = PATH_TO_DOC[path] || "compliance";

  return (
    <PremiumLayout hideFooter>
      <div className="relative min-h-[70vh]">
        <LegalOverlayModal
          currentLang={currentLang}
          defaultDoc={docId}
          onClose={() => navigate("/compliance")}
        />
      </div>
    </PremiumLayout>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import PremiumLayout from "./components/premium/PremiumLayout";
import FloatingActions from "./components/premium/FloatingActions";
import HomePage from "./pages/HomePage";
import RequestQuotePage from "./pages/RequestQuotePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductLandingPages, {
  SilverBarsPage,
  BullionCoinsPage,
  CustomInquiryPage,
} from "./pages/ProductLandingPages";
import {
  AllocatedStoragePage,
  SellBackPage,
  FaqPage,
  ContactPage,
  CompliancePage,
} from "./pages/InfoPages";
import LegalPage from "./pages/LegalPage";
import AdminPanel from "./components/AdminPanel";
import AIConcierge from "./components/AIConcierge";
import { useApp } from "./context/AppContext";

function HomeWithLayout() {
  return (
    <PremiumLayout>
      <HomePage />
    </PremiumLayout>
  );
}

function AppShell() {
  const { currentLang } = useApp();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeWithLayout />} />
        <Route path="/request-quote" element={<RequestQuotePage />} />
        <Route path="/gold-bars" element={<ProductLandingPages slug="gold-bars" />} />
        <Route path="/silver-bars" element={<SilverBarsPage />} />
        <Route path="/bullion-coins" element={<BullionCoinsPage />} />
        <Route path="/custom-inquiry" element={<CustomInquiryPage />} />
        <Route path="/allocated-storage" element={<AllocatedStoragePage />} />
        <Route path="/sell-back" element={<SellBackPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPanel currentLang={currentLang} />} />
        <Route path="/terms" element={<LegalPage path="/terms" />} />
        <Route path="/privacy-policy" element={<LegalPage path="/privacy-policy" />} />
        <Route path="/kyc-aml-policy" element={<LegalPage path="/kyc-aml-policy" />} />
        <Route path="/pricing-disclaimer" element={<LegalPage path="/pricing-disclaimer" />} />
        <Route path="/refund-cancellation-policy" element={<LegalPage path="/refund-cancellation-policy" />} />
        <Route path="/delivery-collection-policy" element={<LegalPage path="/delivery-collection-policy" />} />
        <Route path="/allocated-storage-terms" element={<LegalPage path="/allocated-storage-terms" />} />
        <Route path="/sell-back-policy" element={<LegalPage path="/sell-back-policy" />} />
        <Route path="/risk-disclosure" element={<LegalPage path="/risk-disclosure" />} />
        <Route path="/cookie-policy" element={<LegalPage path="/cookie-policy" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FloatingActions onOpenAI={() => setIsAIChatOpen(true)} />

      {isAIChatOpen && (
        <AIConcierge currentLang={currentLang} onClose={() => setIsAIChatOpen(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}

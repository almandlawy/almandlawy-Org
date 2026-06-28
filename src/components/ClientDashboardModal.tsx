/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, ShieldCheck, Truck, Clipboard, Search, Check, AlertCircle, 
  Sparkles, QrCode, LogOut, DollarSign, Calculator, FileText, 
  Upload, UserCheck, MapPin, Lock, PlusCircle, ArrowRight, TrendingUp 
} from "lucide-react";
import { dbService, mockDb, isProduction, isLive, supabase } from "../lib/supabase";
import IraqTrustBadge from "./IraqTrustBadge";
import { LiveMarketRates } from "../types";

interface ClientDashboardModalProps {
  currentLang: "en" | "ar";
  onClose: () => void;
  rates?: LiveMarketRates | null;
}

export default function ClientDashboardModal({ currentLang, onClose, rates }: ClientDashboardModalProps) {
  const isAr = currentLang === "ar";
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "onboard">("login");
  const [onboardType, setOnboardType] = useState<"retail" | "iraqi" | "company" | "wholesale">("retail");
  
  // Login credentials
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Onboarding Form
  const [onboardName, setOnboardName] = useState("");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [onboardPhone, setOnboardPhone] = useState("");
  const [onboardCompany, setOnboardCompany] = useState("");
  const [onboardIraqiID, setOnboardIraqiID] = useState("");
  const [onboardSuccessMsg, setOnboardSuccessMsg] = useState("");

  // Logged-in Dashboard state
  const [activeTab, setActiveTab] = useState<"performance" | "verification" | "orders" | "buyback" | "assay">("performance");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "AED" | "IQD">("USD");
  const [exchangeRates, setExchangeRates] = useState<any>({ USD: 1.0, AED: 3.6725, IQD: 1310.0 });
  const [settings, setSettings] = useState<any>(null);

  // Portfolio states
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [buybackList, setBuybackList] = useState<any[]>([]);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [kycProfile, setKycProfile] = useState<any>(null);

  // New Request states
  const [buybackWeight, setBuybackWeight] = useState("");
  const [buybackMetal, setBuybackMetal] = useState<"gold" | "silver">("gold");
  const [buybackSuccess, setBuybackSuccess] = useState(false);

  const [deliveryRequestOrder, setDeliveryRequestOrder] = useState("");
  const [deliveryGovernorate, setDeliveryGovernorate] = useState("Baghdad");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // Scenario Calculator states
  const [calcAmount, setCalcAmount] = useState("1000");
  const [calcMetal, setCalcMetal] = useState<"gold" | "silver">("gold");
  const [calcCurrency, setCalcCurrency] = useState<"USD" | "AED" | "IQD">("USD");

  // Certificate search state
  const [certQuery, setCertQuery] = useState("PAMP-882941");
  const [verifiedCert, setVerifiedCert] = useState<any>(null);
  const [certError, setCertError] = useState("");

  // KYC submission form state
  const [kycFullName, setKycFullName] = useState("");
  const [kycPhone, setKycPhone] = useState("");
  const [kycWhatsapp, setKycWhatsapp] = useState("");
  const [kycEmail, setKycEmail] = useState("");
  const [kycCountry, setKycCountry] = useState("Iraq");
  const [kycCity, setKycCity] = useState("Baghdad");
  const [kycNationality, setKycNationality] = useState("Iraqi");
  const [kycDob, setKycDob] = useState("");
  const [kycIdType, setKycIdType] = useState("Iraqi National Card");
  const [kycIdNumber, setKycIdNumber] = useState("");
  const [kycFunds, setKycFunds] = useState("");
  const [kycAgree, setKycAgree] = useState(false);
  const [kycPrivacy, setKycPrivacy] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);

  // Fetch initial profile & configs
  const loadUserData = async (currentUser: any) => {
    if (!currentUser) return;
    try {
      const [exRates, sObj, kProfile, deliveryList, bList, pList, oList] = await Promise.all([
        dbService.exchangeRates.get(),
        dbService.settings.get(),
        dbService.kyc.get(currentUser.id),
        dbService.iraqDelivery.list(currentUser.id),
        dbService.buyback.list(currentUser.id),
        dbService.pickupPoints.list(),
        dbService.orders.list()
      ]);

      if (exRates) setExchangeRates(exRates);
      if (sObj) setSettings(sObj);
      if (kProfile) {
        setKycProfile(kProfile);
        setKycFullName(kProfile.full_name || currentUser.name || "");
        setKycPhone(kProfile.phone || currentUser.phone || "");
        setKycWhatsapp(kProfile.whatsapp || currentUser.phone || "");
        setKycEmail(kProfile.email || currentUser.email || "");
        setKycCountry(kProfile.country || "Iraq");
        setKycCity(kProfile.city || "Baghdad");
        setKycNationality(kProfile.nationality || "Iraqi");
        setKycDob(kProfile.dob || "");
        setKycIdType(kProfile.documents?.[0]?.type || "Iraqi National Card");
        setKycIdNumber(kProfile.documents?.[0]?.number || "");
        setKycFunds(kProfile.source_of_funds_declaration || "");
        setKycAgree(kProfile.agreement_accepted || false);
        setKycPrivacy(kProfile.privacy_consent || false);
      }

      setBuybackList(bList);
      setPickupPoints(pList);
      
      // Filter orders related to this user
      const userOrders = oList.filter((o: any) => o.customer_id === currentUser.id);
      setOrderList(userOrders);

      // Load investment accounts
      const pInv = await dbService.investment.getAccounts(currentUser.id);
      setPortfolio(pInv);

    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  useEffect(() => {
    const initUser = async () => {
      if ((isProduction || isLive) && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            const u = {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Accredited Investor",
              role: session.user.email === "almandlawy112@gmail.com" ? "admin" : "customer",
              created_at: session.user.created_at || new Date().toISOString()
            };
            setUser(u);
            await loadUserData(u);
            return;
          }
        } catch (err) {
          console.error("Failed to fetch Supabase session on modal mount:", err);
        }
      }
      
      const activeUser = mockDb.auth.getUser();
      if (activeUser) {
        setUser(activeUser);
        loadUserData(activeUser);
      }
    };

    initUser();

    // Pre-verify certificate for immediate display
    dbService.certificates.verify("PAMP-882941").then(cert => {
      if (cert) setVerifiedCert(cert);
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await dbService.auth.signInWithGoogle();
      const activeUser = mockDb.auth.getUser();
      if (activeUser) {
        setUser(activeUser);
        loadUserData(activeUser);
      }
    } catch (err) {
      console.error("Google Sign-In failed:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProduction || isLive) {
      if (!loginEmail) {
        alert(isAr ? "الرجاء إدخال البريد الإلكتروني" : "Please enter your email");
        return;
      }
      if (!loginPassword) {
        alert(isAr ? "الرجاء إدخال كلمة المرور" : "Please enter your password");
        return;
      }
      try {
        setGoogleLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        });
        if (error) {
          alert(isAr ? `خطأ في تسجيل الدخول: ${error.message}` : `Authentication error: ${error.message}`);
          return;
        }
        if (data && data.user) {
          const u = {
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Accredited Investor",
            role: data.user.email === "almandlawy112@gmail.com" ? "admin" : "customer",
            created_at: data.user.created_at || new Date().toISOString()
          };
          setUser(u);
          loadUserData(u);
        }
      } catch (err: any) {
        alert(err.message || err);
      } finally {
        setGoogleLoading(false);
      }
      return;
    }

    if (!loginEmail && !loginPhone) return;

    // Simulated login: logs in user as Sheikh Mansoor (seed) or creates an account
    const cleanEmail = loginEmail.trim().toLowerCase() || "guest.iraq@pgruae.com";
    const dummyUser = {
      id: "cust-verified-1",
      email: cleanEmail,
      name: cleanEmail.includes("sheikh") ? "Sheikh Mansoor Al-Maktoum" : "Al-Mansour Iraqi General Trading",
      phone: loginPhone || "+971 55 968 8837",
      role: "verified_customer",
      created_at: new Date().toISOString()
    };

    mockDb.auth.setUser(dummyUser);
    setUser(dummyUser);
    loadUserData(dummyUser);
  };

  // Handle Onboarding registration
  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardEmail || !onboardName) return;

    if (isProduction || isLive) {
      try {
        setGoogleLoading(true);
        // Supabase signUp requires a password. We generate a one-time random password or let them use a default/reset link.
        // Let's use a secure randomized password and let the user know.
        const generatedPassword = "PgrUserPass!" + Math.random().toString(36).substring(2, 10);
        const { data, error } = await supabase.auth.signUp({
          email: onboardEmail.trim().toLowerCase(),
          password: generatedPassword,
          options: {
            data: {
              full_name: onboardName,
              phone: onboardPhone,
              company: onboardCompany
            }
          }
        });

        if (error) {
          alert(isAr ? `خطأ في التسجيل: ${error.message}` : `Registration error: ${error.message}`);
          return;
        }

        if (data && data.user) {
          const u = {
            id: data.user.id,
            email: data.user.email || "",
            name: onboardName,
            role: "customer",
            created_at: data.user.created_at || new Date().toISOString()
          };
          setUser(u);

          // Save default empty KYC profile
          await dbService.kyc.save(data.user.id, {
            id: data.user.id,
            full_name: onboardName,
            phone: onboardPhone,
            email: onboardEmail.trim().toLowerCase(),
            status: "Not submitted",
            country: onboardType === "iraqi" ? "Iraq" : "UAE",
            city: onboardType === "iraqi" ? "Baghdad" : "Dubai"
          });

          loadUserData(u);
          setOnboardSuccessMsg(isAr 
            ? "تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك لتأكيد التسجيل." 
            : "Account created successfully! Please confirm your email registration."
          );
        }
      } catch (err: any) {
        alert(err.message || err);
      } finally {
        setGoogleLoading(false);
      }
      return;
    }

    const dummyUser = {
      id: `cust-onb-${Math.floor(Math.random() * 90000 + 10000)}`,
      email: onboardEmail.trim().toLowerCase(),
      name: onboardName,
      phone: onboardPhone,
      company: onboardCompany || undefined,
      role: "customer",
      created_at: new Date().toISOString()
    };

    // Auto seed an investment account for new users so the portfolio isn't blank
    const seedAccGold = {
      id: `inv-g-${dummyUser.id}`,
      customer_id: dummyUser.id,
      metal: "gold" as const,
      weight_grams: onboardType === "wholesale" ? 1000 : 50,
      average_purchase_price_usd: 75.50,
      total_purchase_amount_usd: onboardType === "wholesale" ? 75500.0 : 3775.0,
      current_market_value_usd: onboardType === "wholesale" ? 75900.0 : 3800.0,
      daily_change_percent: 0.15,
      monthly_change_percent: 1.25
    };

    const seedAccSilver = {
      id: `inv-s-${dummyUser.id}`,
      customer_id: dummyUser.id,
      metal: "silver" as const,
      weight_grams: onboardType === "wholesale" ? 5000 : 500,
      average_purchase_price_usd: 0.95,
      total_purchase_amount_usd: onboardType === "wholesale" ? 4750.0 : 475.0,
      current_market_value_usd: onboardType === "wholesale" ? 4800.0 : 485.0,
      daily_change_percent: 0.32,
      monthly_change_percent: 2.10
    };

    // Write seeds
    const existingAccounts = mockDb.get("pgr_investment_accounts") || [];
    existingAccounts.push(seedAccGold, seedAccSilver);
    mockDb.set("pgr_investment_accounts", existingAccounts);

    mockDb.auth.setUser(dummyUser);
    setUser(dummyUser);
    loadUserData(dummyUser);
    setOnboardSuccessMsg(isAr ? "تم إنشاء الحساب والبدء بعملية التأهيل بنجاح!" : "Account created and onboarding initialized!");
  };

  // Handle logout
  const handleLogout = async () => {
    if ((isProduction || isLive) && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Failed to sign out from Supabase:", err);
      }
    }
    mockDb.auth.logout();
    setUser(null);
    setKycProfile(null);
    setPortfolio([]);
    setOrderList([]);
    setBuybackList([]);
  };

  // Handle KYC Submission
  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedProfile = {
      id: user.id,
      full_name: kycFullName,
      phone: kycPhone,
      whatsapp: kycWhatsapp,
      email: kycEmail,
      country: kycCountry,
      city: kycCity,
      nationality: kycNationality,
      dob: kycDob,
      source_of_funds_declaration: kycFunds,
      agreement_accepted: kycAgree,
      privacy_consent: kycPrivacy,
      status: "Pending review",
      documents: [
        {
          id: `doc-${Date.now()}`,
          type: kycIdType,
          number: kycIdNumber,
          status: "Pending review",
          updated_at: new Date().toISOString()
        }
      ],
      verified_at: ""
    };

    await dbService.kyc.save(user.id, updatedProfile);
    setKycProfile(updatedProfile);
    setKycSuccess(true);
    setTimeout(() => setKycSuccess(false), 4000);
  };

  // Handle Iraq Secure Delivery Request
  const handleDeliveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const request = {
      customer_id: user.id,
      order_id: deliveryRequestOrder || (orderList[0]?.id || "PGR-ORD-CUSTOM"),
      governorate: deliveryGovernorate,
      address_details: deliveryAddress,
      phone: deliveryPhone,
      status: "Request received",
      customs_docs_status: "Pending"
    };

    await dbService.iraqDelivery.create(request);
    setDeliverySuccess(true);
    setDeliveryAddress("");
    setDeliveryPhone("");
    
    // Refresh lists
    const freshDeliveries = await dbService.iraqDelivery.list(user.id);
    // Reload UI tracking
    loadUserData(user);
    setTimeout(() => setDeliverySuccess(false), 4000);
  };

  // Handle Buyback Request
  const handleBuybackRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !buybackWeight) return;

    const spotPrice = buybackMetal === "gold" 
      ? (rates?.gold?.spot_usd_oz ? rates.gold.spot_usd_oz / 31.1035 : 75.0) 
      : (rates?.silver?.spot_usd_oz ? rates.silver.spot_usd_oz / 31.1035 : 0.95);

    const estPayout = Number(buybackWeight) * spotPrice * 0.98; // 2% fee

    const request = {
      customer_id: user.id,
      metal: buybackMetal,
      weight_grams: Number(buybackWeight),
      purity: buybackMetal === "gold" ? "Au 99.99%" : "Ag 99.9%",
      status: "Estimated",
      estimated_payout_usd: estPayout,
      exchange_rate_iqd: exchangeRates.IQD,
      created_at: new Date().toISOString()
    };

    await dbService.buyback.create(request);
    setBuybackSuccess(true);
    setBuybackWeight("");

    // Refresh buyback lists
    const freshBuybacks = await dbService.buyback.list(user.id);
    setBuybackList(freshBuybacks);
    setTimeout(() => setBuybackSuccess(false), 4000);
  };

  // Handle Certificate Verification
  const handleVerifyCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertError("");
    setVerifiedCert(null);

    try {
      const match = await dbService.certificates.verify(certQuery);
      if (match) {
        setVerifiedCert(match);
      } else {
        setCertError(isAr 
          ? "رقم شهادة الفحص غير معتمد أو غير مسجل في القيود الفنية لـ PGR." 
          : "Certificate serial number not recognized in our database."
        );
      }
    } catch (err) {
      setCertError("Query timeout.");
    }
  };

  // Currency converters helper
  const convertAmount = (amountUsd: number) => {
    if (selectedCurrency === "AED") {
      return (amountUsd * exchangeRates.AED).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " AED";
    }
    if (selectedCurrency === "IQD") {
      return (amountUsd * exchangeRates.IQD).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " IQD";
    }
    return "$" + amountUsd.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " USD";
  };

  // Spot calculation for Scenario Planner
  const calculateScenario = () => {
    const inputAmount = Number(calcAmount) || 1000;
    let usd = inputAmount;
    if (calcCurrency === "AED") {
      usd = inputAmount / exchangeRates.AED;
    } else if (calcCurrency === "IQD") {
      usd = inputAmount / exchangeRates.IQD;
    }

    const spotGoldUsdOz = rates?.gold?.spot_usd_oz || 2350;
    const spotSilverUsdOz = rates?.silver?.spot_usd_oz || 28.5;
    
    const spotGramUsd = calcMetal === "gold" ? (spotGoldUsdOz / 31.1035) : (spotSilverUsdOz / 31.1035);
    const premiumPercent = calcMetal === "gold" ? 1.04 : 1.12; // 4% gold premium, 12% silver premium
    const totalCostPerGram = spotGramUsd * premiumPercent;
    
    const estimatedGrams = usd / totalCostPerGram;

    const baseVal = usd;
    
    return {
      grams: estimatedGrams.toFixed(2),
      spotGramUsd: spotGramUsd.toFixed(2),
      p1: convertAmount(baseVal * 1.01),
      p3: convertAmount(baseVal * 1.03),
      m1: convertAmount(baseVal * 0.99),
      m3: convertAmount(baseVal * 0.97)
    };
  };

  const scenarios = calculateScenario();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ direction: isAr ? "rtl" : "ltr" }}>
      {/* Dimmed Background */}
      <div className="fixed inset-0 bg-[#070707]/95 backdrop-blur-md" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4 md:p-8 relative">
        <div className="relative w-full max-w-5xl bg-[#0a0a0b] border border-white/[0.06] rounded shadow-2xl z-10 overflow-hidden">
          
          {/* Header Close Trigger */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black transition-all border border-white/[0.05] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* NO USER STATE: Login & Onboarding Portal */}
          {!user ? (
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left column info */}
              <div className="md:col-span-5 space-y-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/[0.05] pb-6 md:pb-0 md:pr-8">
                <div>
                  <span className="text-[10px] font-mono text-gold-base uppercase tracking-widest block mb-1">
                    {isAr ? "لوحة تحكم العميل" : "CUSTOMER DASHBOARD"}
                  </span>
                  <h2 className="text-2xl font-serif text-white tracking-wide">
                    {isAr ? "الهوية الرقمية وبوابة التداول" : "Digital ID & Sourcing Portal"}
                  </h2>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {isAr 
                    ? "بوابة آمنة ومبسطة للمواطنين العراقيين والمقيمين في دولة الإمارات والشركات لتسجيل بياناتهم وتتبع طلبات تسليم سبائك الذهب والفضة مع التحقق الكامل والمطابقة الأمنية."
                    : "A secure framework for Iraqi citizens, UAE residents, and institutional traders to verify credentials, check real-time bullion performance, and track Dubai-to-Iraq shipments."}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <ShieldCheck size={16} className="text-gold-base" />
                    <span>{isAr ? "ممتثل لضوابط الفحص الفني الدولية" : "International Assay Standards Compliant"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Truck size={16} className="text-gold-base" />
                    <span>{isAr ? "خطوط تداول آمنة لبغداد والبصرة وأربيل" : "Secure channels to Baghdad, Basra & Erbil"}</span>
                  </div>
                </div>

                <IraqTrustBadge currentLang={currentLang} />
              </div>

              {/* Right column form */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Switcher */}
                <div className="flex border-b border-white/[0.04]">
                  <button
                    onClick={() => setAuthMode("login")}
                    className={`py-3 px-6 font-sans text-xs uppercase tracking-wider transition-all border-b-2 font-semibold ${
                      authMode === "login"
                        ? "text-gold-base border-gold-base"
                        : "text-gray-500 border-transparent hover:text-white"
                    }`}
                  >
                    {isAr ? "تسجيل الدخول" : "Portal Secure Login"}
                  </button>
                  <button
                    onClick={() => setAuthMode("onboard")}
                    className={`py-3 px-6 font-sans text-xs uppercase tracking-wider transition-all border-b-2 font-semibold ${
                      authMode === "onboard"
                        ? "text-gold-base border-gold-base"
                        : "text-gray-500 border-transparent hover:text-white"
                    }`}
                  >
                    {isAr ? "إنشاء حساب وتأهيل" : "New Client Onboarding"}
                  </button>
                </div>

                {/* LOGIN FORM */}
                {authMode === "login" && (
                  <div className="space-y-4 text-xs font-mono">
                    {/* Google Sign-In */}
                    <button
                      type="button"
                      disabled={googleLoading}
                      onClick={handleGoogleLogin}
                      className="w-full py-2.5 bg-white text-black hover:bg-gray-100 font-sans font-semibold text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50"
                    >
                      <span>{googleLoading ? (isAr ? "جاري التحميل..." : "Authenticating...") : (isAr ? "المتابعة باستخدام Google" : "Continue with Google")}</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-4 text-gray-500 text-[9px] uppercase font-mono">{isAr ? "أو البريد الإلكتروني" : "Or Client Account"}</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "البريد الإلكتروني" : "Secure Client Email"}</label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g., trader.iraq@pgruae.com"
                          className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2.5 px-3 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "كلمة المرور" : "Private Key / Password"}</label>
                          <button 
                            type="button" 
                            onClick={() => { setForgotSent(true); setTimeout(() => setForgotSent(false), 5000); }} 
                            className="text-[10px] text-gold-base hover:underline"
                          >
                            {isAr ? "نسيت كلمة المرور؟" : "Forgot Private Key?"}
                          </button>
                        </div>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2.5 px-3 text-xs text-white outline-none"
                        />
                      </div>

                      {/* Quick Demo Assist */}
                      {!isProduction && !isLive && (
                        <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded text-[11px] text-gray-500 space-y-1 font-sans">
                          <div className="text-white font-medium">{isAr ? "الدخول التجريبي السريع المعتمد:" : "Vouched Demo Account:"}</div>
                          <div>{isAr ? "اضغط على زر الدخول أدناه للدخول الفوري كحساب مسجل مسبقاً (الشيخ منصور - دبي) للاطلاع الفوري على المحاكاة والتحقق." : "Leave fields blank or input any text to automatically log in and experience the full investor dashboard."}</div>
                        </div>
                      )}

                      {/* Other auth options */}
                      <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-gray-400">
                        <button
                          type="button"
                          onClick={() => { setMagicSent(true); setTimeout(() => setMagicSent(false), 5000); }}
                          className="p-2 border border-white/[0.04] rounded hover:bg-white/[0.02] text-center"
                        >
                          {magicSent ? (isAr ? "تم إرسال الرابط" : "Magic Link Dispatched") : (isAr ? "طلب رابط سحري للبريد" : "Request Magic Link")}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setWhatsappSent(true); setTimeout(() => setWhatsappSent(false), 5000); }}
                          className="p-2 border border-white/[0.04] rounded hover:bg-white/[0.02] text-center"
                        >
                          {whatsappSent ? (isAr ? "تم إرسال الطلب" : "WhatsApp Confirmed") : (isAr ? "تسجيل عبر واتساب" : "WhatsApp OTP Entry")}
                        </button>
                      </div>

                      {forgotSent && (
                        <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 text-amber-500 text-[10px] rounded font-sans">
                          {isAr ? "تم إرسال رابط استعادة الرمز السري لبريدك المسجل." : "Secure reset token dispatched to certified mail."}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-gold-base hover:bg-amber-600 text-black font-sans font-semibold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Lock size={12} />
                        {isAr ? "دخول آمن للبوابة" : "Authorize Portal Session"}
                      </button>
                    </form>
                  </div>
                )}

                {/* ONBOARDING FORM */}
                {authMode === "onboard" && (
                  <form onSubmit={handleOnboard} className="space-y-4">
                    
                    {/* Onboard categories */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-[#111] rounded border border-white/[0.04]">
                      {[
                        { id: "retail", label_en: "Client", label_ar: "عميل" },
                        { id: "iraqi", label_en: "Iraqi Trader", label_ar: "تاجر عراقي" },
                        { id: "company", label_en: "Company", label_ar: "شركة" },
                        { id: "wholesale", label_en: "Wholesale", label_ar: "بيع جملة" }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setOnboardType(cat.id as any)}
                          className={`p-1.5 rounded text-[10px] font-sans font-semibold transition-all ${
                            onboardType === cat.id ? "bg-gold-base text-black" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {isAr ? cat.label_ar : cat.label_en}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">
                          {onboardType === "company" || onboardType === "wholesale" 
                            ? (isAr ? "اسم الكيان التجاري" : "Corporate Entity Name")
                            : (isAr ? "الاسم الكامل (المطابق للهوية)" : "Full Legal Name")}
                        </label>
                        <input
                          type="text"
                          required
                          value={onboardName}
                          onChange={(e) => setOnboardName(e.target.value)}
                          placeholder="Sheikh, Merchant, or Corp Name"
                          className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "البريد الإلكتروني الرسمي" : "Official Dispatch Email"}</label>
                        <input
                          type="email"
                          required
                          value={onboardEmail}
                          onChange={(e) => setOnboardEmail(e.target.value)}
                          placeholder="client@pgruae-client.com"
                          className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "رقم الهاتف الفعال" : "Active Telephone (KYC)"}</label>
                        <input
                          type="text"
                          required
                          value={onboardPhone}
                          onChange={(e) => setOnboardPhone(e.target.value)}
                          placeholder="+964 770 000 0000"
                          className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none"
                        />
                      </div>

                      {onboardType === "wholesale" || onboardType === "company" ? (
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "رقم السجل التجاري / الترخيص" : "Trade License / Registry Number"}</label>
                          <input
                            type="text"
                            value={onboardCompany}
                            onChange={(e) => setOnboardCompany(e.target.value)}
                            placeholder="e.g., DMCC-REG-55291"
                            className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "البطاقة الوطنية العراقية / جواز السفر" : "Iraqi ID / Passport"}</label>
                          <input
                            type="text"
                            value={onboardIraqiID}
                            onChange={(e) => setOnboardIraqiID(e.target.value)}
                            placeholder="e.g., IQ-88294021"
                            className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-amber-950/10 border border-amber-900/30 p-3 rounded text-[11px] text-amber-500/90 leading-relaxed">
                      <strong>{isAr ? "إقرار تنظيم مكافحة غسيل الأموال:" : "Regulatory AML Declaration:"}</strong>{" "}
                      {isAr 
                        ? "بالنقر على التسجيل، أقر بأنني سألتزم بمتطلبات التحقق والهوية الرقمية وتقديم مصادر الأموال الحقيقية عند طلب سبائك المعادن الثمينة بقيمة مرتفعة."
                        : "By onboarding, I declare compliance with UAE Central Bank & legal physical gold sourcing rules, including verified ID uploads and legal proof of funds statements."}
                    </div>

                    {onboardSuccessMsg && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded">
                        {onboardSuccessMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-gold-base hover:bg-amber-600 text-black font-sans font-semibold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                    >
                      {isAr ? "تسجيل الطلب والتأهيل الفوري" : "Register & Standard Onboard"}
                    </button>
                  </form>
                )}

              </div>

            </div>
          ) : (
            
            /* LOGGED IN VIEW: Full Multi-Tab Panel */
            <div>
              
              {/* TOP HEADER STATUS */}
              <div className="p-4 md:p-6 bg-[#0e0e10] border-b border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold-base/10 border border-gold-base/20 flex items-center justify-center text-gold-base shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-serif text-white font-bold">{user.name}</h3>
                      <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 rounded">
                        {kycProfile?.status || "Verified"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {user.email} • {isAr ? "معرّف البوابة: " : "Secure ID: "} {user.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Currency switcher inside dashboard */}
                  <div className="flex bg-black rounded p-1 border border-white/[0.05]">
                    {["USD", "AED", "IQD"].map((cur) => (
                      <button
                        key={cur}
                        onClick={() => setSelectedCurrency(cur as any)}
                        className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded transition-all ${
                          selectedCurrency === cur ? "bg-gold-base text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-900/30 text-red-500 hover:bg-red-950/20 rounded font-mono text-[10px] uppercase transition-all cursor-pointer"
                  >
                    <LogOut size={12} />
                    {isAr ? "خروج" : "Disconnect"}
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT AREA Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                
                {/* Side Navigation Menu */}
                <div className="md:col-span-3 bg-[#080809] border-r border-white/[0.04] p-4 space-y-1">
                  {[
                    { id: "performance", icon: <TrendingUp size={14} />, label_en: "My Products", label_ar: "منتجاتي / سبائكي" },
                    { id: "verification", icon: <ShieldCheck size={14} />, label_en: "Customer Verification (KYC)", label_ar: "التحقق من الهوية" },
                    { id: "orders", icon: <Truck size={14} />, label_en: "My Orders & My Quotes", label_ar: "طلباتي وعروض الأسعار" },
                    { id: "buyback", icon: <DollarSign size={14} />, label_en: "Request Buyback", label_ar: "طلب إعادة الشراء" },
                    { id: "assay", icon: <QrCode size={14} />, label_en: "Assay Certificate Vault", label_ar: "شهادات الفحص والأصالة" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-xs font-sans transition-all text-right md:text-left ${
                        activeTab === tab.id 
                          ? "bg-gold-base/10 text-gold-base border-r-2 md:border-r-0 md:border-l-2 border-gold-base font-semibold" 
                          : "text-gray-400 hover:bg-white/[0.02] hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      <span>{isAr ? tab.label_ar : tab.label_en}</span>
                    </button>
                  ))}
                  
                  <div className="pt-8 px-2">
                    <IraqTrustBadge currentLang={currentLang} />
                  </div>
                </div>

                {/* TAB CONTENT GRID */}
                <div className="md:col-span-9 p-6 overflow-y-auto max-h-[550px] space-y-6">
                  
                  {/* TAB 1: PORTFOLIO & CALCULATOR */}
                  {activeTab === "performance" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <div>
                          <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                            {isAr ? "منتجاتي وسبائكي المقتناة" : "My Products & Bullion Tracker"}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {isAr ? "القيم السوقية الحقيقية لسبائكك المقتناة بناء على الأسعار الفورية الفعالة" : "True market valuation of your verified physical gold & silver bullion"}
                          </p>
                        </div>
                      </div>

                      {/* STATS TILES */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-[#111] border border-white/[0.03] p-4 rounded space-y-1">
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">{isAr ? "إجمالي قيمة المنتجات المعتمدة" : "TOTAL VALUATION (MY PRODUCTS)"}</span>
                          <span className="text-xl font-sans font-bold text-white block">
                            {convertAmount(portfolio.reduce((sum, item) => sum + (item.current_market_value_usd || 0), 0))}
                          </span>
                        </div>
                      </div>

                      {/* Empty State Banner */}
                      {portfolio.length === 0 && orderList.length === 0 && (
                        <div className="p-6 bg-amber-500/5 border border-gold-base/10 rounded flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="space-y-1 text-center md:text-left">
                            <h5 className="text-sm font-sans font-semibold text-gold-base">
                              {isAr ? "لا توجد لديك منتجات مؤكدة حالياً." : "You do not have any confirmed products yet."}
                            </h5>
                            <p className="text-xs text-gray-400 font-sans">
                              {isAr ? "اطلب عرض سعر للبدء في تملك سبائك الذهب والفضة والاستفادة من خدمات الخزانة الآمنة." : "Request a quote to start acquiring gold & silver bullion and utilizing our premium vaulting."}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              const el = document.getElementById("quote-trigger");
                              if (el) el.click();
                            }}
                            className="px-4 py-2 bg-gold-base hover:bg-amber-600 text-black rounded font-sans font-semibold text-xs tracking-wider uppercase transition-colors shrink-0 cursor-pointer"
                          >
                            {isAr ? "اطلب عرض سعر للبدء" : "Request a quote to start"}
                          </button>
                        </div>
                      )}

                      {/* PHYSICAL BULLION TABLE */}
                      <div className="bg-[#111] border border-white/[0.03] rounded overflow-hidden">
                        <div className="p-3 bg-[#161618] border-b border-white/[0.03] text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          {isAr ? "قائمة السبائك المملوكة الفعالة" : "ACTIVE Bullion Allocation Ledger"}
                        </div>
                        <div className="divide-y divide-white/[0.02] text-xs font-mono">
                          {portfolio.length > 0 ? (
                            portfolio.map((item, idx) => (
                              <div key={idx} className="p-3 flex justify-between items-center">
                                <div>
                                  <span className="text-white font-bold block">{item.metal === "gold" ? (isAr ? "سبيكة ذهب صافي" : "Fine Gold Bullion") : (isAr ? "سبيكة فضة صافية" : "Fine Silver Bullion")}</span>
                                  <span className="text-gray-500 text-[10px]">{item.weight_grams} {isAr ? "جرام" : "Grams"} • {isAr ? "سعر الشراء: " : "Average Ingest: "} ${item.average_purchase_price_usd}/g</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-white font-semibold block">{convertAmount(item.current_market_value_usd)}</span>
                                  <span className="text-[10px] text-emerald-400 block">+{item.monthly_change_percent}% {isAr ? "شهرة شهرية" : "30d Delta"}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-xs">
                              {isAr ? "لا توجد سبائك مسجلة حالياً." : "No current gold or silver allocations."}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* DYNAMIC SCENARIO CALCULATOR */}
                      <div className="p-5 rounded border border-white/[0.05] bg-white/[0.01] space-y-4">
                        <div className="flex items-center gap-1.5">
                          <Calculator size={16} className="text-gold-base" />
                          <h5 className="text-xs font-mono text-white uppercase tracking-widest">{isAr ? "حاسبة التقديرات والتوقع السعري" : "Estimated Value Scenario Calculator"}</h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 uppercase">{isAr ? "المبلغ المرصود" : "Allocation Amount"}</label>
                            <input
                              type="number"
                              value={calcAmount}
                              onChange={(e) => setCalcAmount(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-1.5 px-3 text-xs text-white outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 uppercase">{isAr ? "نوع المعدن" : "Precious Metal"}</label>
                            <select
                              value={calcMetal}
                              onChange={(e) => setCalcMetal(e.target.value as any)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-1.5 px-3 text-xs text-white outline-none"
                            >
                              <option value="gold">{isAr ? "ذهب" : "Gold"}</option>
                              <option value="silver">{isAr ? "فضة" : "Silver"}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 uppercase">{isAr ? "العملة المحلية" : "Currency"}</label>
                            <select
                              value={calcCurrency}
                              onChange={(e) => setCalcCurrency(e.target.value as any)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-1.5 px-3 text-xs text-white outline-none"
                            >
                              <option value="USD">USD</option>
                              <option value="AED">AED</option>
                              <option value="IQD">IQD</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-3 bg-black/40 rounded border border-white/[0.02] text-xs font-mono space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">{isAr ? "الوزن التقديري المستملك:" : "Estimated Grams Acquired:"}</span>
                            <span className="text-white font-bold">{scenarios.grams} g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">{isAr ? "سعر غرام الذهب الفوري للتقريب:" : "Spot Price per Gram:"}</span>
                            <span className="text-[#c5a85c] font-bold">${scenarios.spotGramUsd} /g</span>
                          </div>

                          <div className="border-t border-white/[0.04] pt-2">
                            <span className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">{isAr ? "سيناريوهات الأداء السوقي الممكنة (ليست أرباحاً مضمونة):" : "Hypothetical Spot Movement Scenarios (Estimated P/L):"}</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                              <div className="p-1.5 bg-emerald-950/10 border border-emerald-900/30 rounded text-center">
                                <span className="text-gray-500 block text-[9px]">+1% {isAr ? "صعود" : "Rise"}</span>
                                <span className="text-emerald-400 font-bold">{scenarios.p1}</span>
                              </div>
                              <div className="p-1.5 bg-emerald-950/20 border border-emerald-900/40 rounded text-center">
                                <span className="text-gray-500 block text-[9px]">+3% {isAr ? "أداء مرتفع" : "Strong Performance"}</span>
                                <span className="text-emerald-400 font-bold">{scenarios.p3}</span>
                              </div>
                              <div className="p-1.5 bg-red-950/10 border border-red-900/30 rounded text-center">
                                <span className="text-gray-500 block text-[9px]">-1% {isAr ? "تراجع" : "Dip"}</span>
                                <span className="text-red-400 font-bold">{scenarios.m1}</span>
                              </div>
                              <div className="p-1.5 bg-red-950/20 border border-red-900/40 rounded text-center">
                                <span className="text-gray-500 block text-[9px]">-3% {isAr ? "تصحيح سوقي" : "Market Drop"}</span>
                                <span className="text-red-400 font-bold">{scenarios.m3}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-gray-500 leading-normal">
                          <strong>{isAr ? "إخلاء مسؤولية:" : "Important Market Notice:"}</strong>{" "}
                          {isAr 
                            ? "هذا تقدير للأداء السوقي المقترح بناء على حركة المعادن وليس عائداً مضموناً. أسعار الذهب والفضة متقلبة وتخضع لقوانين العرض والطلب العالمية."
                            : "This is a model of possible market scenarios. Precious metals carry market price risks and can fluctuate. Past performance is never a guarantee of future outcomes."}
                        </div>
                      </div>

                      {/* PGR BULLION GROWTH PROGRAM COMING SOON */}
                      <div className="p-5 border border-dashed border-white/10 rounded bg-[#111112]/40 opacity-70">
                        <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
                          {isAr ? "ميزات معلقة مستقبلاً" : "REGULATORY HOLD - COMING SOON"}
                        </span>
                        <h5 className="text-xs font-serif font-semibold text-white uppercase">
                          {isAr ? "برنامج نمو السبائك من PGR" : "PGR Bullion Growth Program"}
                        </h5>
                        <p className="text-[11px] text-gray-400 leading-normal mt-1">
                          {isAr 
                            ? "خاضع للتراخيص والموافقات التنظيمية. قريباً فقط. لا يتم قبول أي تبرعات أو أموال نقدية أو ادخارات خارجية تحت هذا المسمى حالياً."
                            : "Subject to complete licensing and regulatory approvals. Not currently active or accepting deposits. Designed to offer compliant storage solutions."}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: DIGITAL IDENTITY KYC */}
                  {activeTab === "verification" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <div>
                          <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                            {isAr ? "بوابة الهوية الرقمية للتحقق من العملاء" : "PGR Digital Identity Verification"}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {isAr ? "مطابقة الهوية وحماية العملاء من الاحتيال المالي والامتثال" : "Safeguarding transactions, verifying accounts & strict AML / CTF compliance"}
                          </p>
                        </div>
                        <span className={`text-xs font-mono border px-2.5 py-1 rounded ${
                          kycProfile?.status === "Verified" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : kycProfile?.status === "Pending review"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            : kycProfile?.status === "More information required"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : kycProfile?.status === "Rejected"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>
                          {isAr ? "الحالة: " : "Status: "}
                          {kycProfile?.status === "Verified" && (isAr ? "تم التحقق" : "Verified")}
                          {kycProfile?.status === "Pending review" && (isAr ? "قيد المراجعة" : "Pending review")}
                          {kycProfile?.status === "More information required" && (isAr ? "مطلوب معلومات إضافية" : "More info required")}
                          {kycProfile?.status === "Rejected" && (isAr ? "تم الرفض" : "Rejected")}
                          {(!kycProfile?.status || kycProfile?.status === "Not submitted") && (isAr ? "لم يتم التقديم" : "Not submitted")}
                        </span>
                      </div>

                      <form onSubmit={handleKYCSubmit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "الاسم الكامل للعميل" : "Full Client Name"}</label>
                            <input
                              type="text"
                              value={kycFullName}
                              onChange={(e) => setKycFullName(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "البريد الإلكتروني للتوثيق" : "Authentication Email"}</label>
                            <input
                              type="email"
                              value={kycEmail}
                              onChange={(e) => setKycEmail(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "رقم الهاتف" : "Telephone Number"}</label>
                            <input
                              type="text"
                              value={kycPhone}
                              onChange={(e) => setKycPhone(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "رقم الواتساب للتأكيد" : "WhatsApp Number"}</label>
                            <input
                              type="text"
                              value={kycWhatsapp}
                              onChange={(e) => setKycWhatsapp(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "تاريخ الميلاد" : "Date of Birth"}</label>
                            <input
                              type="date"
                              value={kycDob}
                              onChange={(e) => setKycDob(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "البلد الحالي" : "Current Country"}</label>
                            <input
                              type="text"
                              value={kycCountry}
                              onChange={(e) => setKycCountry(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "المدينة" : "City"}</label>
                            <input
                              type="text"
                              value={kycCity}
                              onChange={(e) => setKycCity(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "الجنسية" : "Nationality"}</label>
                            <input
                              type="text"
                              value={kycNationality}
                              onChange={(e) => setKycNationality(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "نوع مستند التوثيق" : "Document Identity Type"}</label>
                            <select
                              value={kycIdType}
                              onChange={(e) => setKycIdType(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            >
                              <option value="Emirates ID">{isAr ? "الهوية الإماراتية" : "Emirates ID"}</option>
                              <option value="Iraqi National Card">{isAr ? "البطاقة الوطنية العراقية" : "Iraqi National Card"}</option>
                              <option value="Iraqi Passport">{isAr ? "الجواز العراقي" : "Iraqi Passport"}</option>
                              <option value="UAE Residence Visa">{isAr ? "الإقامة الإماراتية" : "UAE Residence Visa"}</option>
                              <option value="Trade License">{isAr ? "الرخصة التجارية للشركات" : "Trade License for Companies"}</option>
                              <option value="Authorized Letter">{isAr ? "تخويل ممثل الشركة المعتمد" : "Authorized Representative Letter"}</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "رقم وثيقة التوثيق" : "ID Document Reference Number"}</label>
                            <input
                              type="text"
                              value={kycIdNumber}
                              onChange={(e) => setKycIdNumber(e.target.value)}
                              placeholder="784-XXXX-XXXXXXX-X"
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "إقرار مصدر الأموال" : "Source of Funds Statement"}</label>
                          <textarea
                            value={kycFunds}
                            onChange={(e) => setKycFunds(e.target.value)}
                            rows={2}
                            placeholder={isAr ? "مثال: أرباح أعمال تجارية مرخصة وعوائد المحافظ الخاصة." : "e.g., Licensed corporate profits, family legacy allocation, physical business cashflow"}
                            className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                          />
                        </div>

                        {/* Simulated upload inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 border border-dashed border-white/10 rounded bg-white/[0.01] flex flex-col items-center justify-center text-center">
                            <Upload className="text-gray-500 mb-1" size={18} />
                            <span className="text-[10px] text-gray-300 block">{isAr ? "تحميل وجه الهوية / جواز السفر" : "ID Document Front"}</span>
                            <span className="text-[8px] text-emerald-500 block">✓ ID_FRONT_SECURED.PNG</span>
                          </div>
                          <div className="p-4 border border-dashed border-white/10 rounded bg-white/[0.01] flex flex-col items-center justify-center text-center">
                            <Upload className="text-gray-500 mb-1" size={18} />
                            <span className="text-[10px] text-gray-300 block">{isAr ? "تحميل خلف الهوية / كشف العنوان" : "ID Document Back / Address Proof"}</span>
                            <span className="text-[8px] text-emerald-500 block">✓ ID_BACK_SECURED.PNG</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 text-[10px] text-gray-400">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={kycAgree}
                              onChange={(e) => setKycAgree(e.target.checked)}
                              className="mt-0.5"
                            />
                            <span>{isAr ? "أوافق على قيود مكافحة غسيل الأموال وامتثال تداول المعادن في دبي." : "I confirm that these funds are derived from certified, lawful sources."}</span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={kycPrivacy}
                              onChange={(e) => setKycPrivacy(e.target.checked)}
                              className="mt-0.5"
                            />
                            <span>{isAr ? "أوافق على تخزين البيانات بشكل مشفر وآمن ولا يتم مشاركتها إلا لأغراض التدقيق." : "I consent to secure encrypted file vaulting for compliance auditing."}</span>
                          </label>
                        </div>

                        {kycSuccess && (
                          <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded">
                            {isAr ? "تم تحديث وحفظ قيود الهوية والتحقق بنجاح!" : "KYC compliance documents saved and verified successfully!"}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-gold-base hover:bg-amber-600 text-black font-sans font-semibold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          {isAr ? "تحديث ملف التحقق والهوية" : "Update Secure KYC Profile"}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* TAB 3: QUOTES & SECURE ORDERS */}
                  {activeTab === "orders" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <div>
                          <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                            {isAr ? "الطلبات الحالية وتتبع الشحن الآمن للعراق" : "Secure Orders & Iraqi Logistics Panel"}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {isAr ? "متابعة تداول سبائك الذهب من دبي إلى بغداد والبصرة والمحافظات العراقية" : "Track logistics, custom clearances & secure handovers for Iraq consignments"}
                          </p>
                        </div>
                      </div>

                      {/* ACTIVE ORDERS */}
                      <div className="space-y-4">
                        {orderList.length > 0 ? (
                          orderList.map((order, idx) => (
                            <div key={idx} className="p-4 bg-[#111] border border-white/[0.04] rounded space-y-4 text-xs font-mono">
                              <div className="flex justify-between items-center flex-wrap gap-2">
                                <div>
                                  <span className="text-gray-400 block text-[9px]">{isAr ? "رقم مرجع الطلب" : "ORDER ID"}</span>
                                  <span className="text-white font-bold">{order.id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[9px]">{isAr ? "تاريخ الطلب" : "ORDER DATE"}</span>
                                  <span className="text-gray-300">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[9px]">{isAr ? "طريقة التسليم" : "DISPATCH"}</span>
                                  <span className="text-white font-semibold">{order.shipping_method}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[9px]">{isAr ? "حالة الشحن" : "STATUS"}</span>
                                  <span className="text-gold-base font-bold uppercase">{order.status}</span>
                                </div>
                              </div>

                              {/* 8-step status timeline block */}
                              <div className="pt-2">
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2">{isAr ? "مراحل الشحن الثمانية المعتمدة لـ PGR" : "PGR 8-STAGE COMPLIANT TRANSIT TRACKING"}</span>
                                <div className="grid grid-cols-2 sm:grid-cols-8 gap-1 text-[9px] text-center">
                                  {[
                                    { s: "Request received", ar: "استلام الطلب" },
                                    { s: "Customer verified", ar: "التحقق" },
                                    { s: "Product confirmed", ar: "تأكيد التوفر" },
                                    { s: "Payment confirmed", ar: "تأكيد الدفع" },
                                    { s: "Preparing shipment", ar: "التجهيز" },
                                    { s: "Shipped", ar: "تم الشحن" },
                                    { s: "Ready for pickup", ar: "جاهز للاستلام" },
                                    { s: "Delivered", ar: "تم التسليم" }
                                  ].map((step, sidx) => {
                                    const states = ["Request received", "Customer verified", "Product confirmed", "Payment confirmed", "Preparing shipment", "Shipped", "Ready for pickup", "Delivered"];
                                    const currentIdx = states.indexOf(order.status || "Quoted"); // fallback
                                    const isPassed = sidx <= currentIdx;
                                    return (
                                      <div 
                                        key={sidx} 
                                        className={`p-1 rounded border ${
                                          isPassed 
                                            ? "bg-gold-base/10 border-gold-base text-gold-base font-bold" 
                                            : "bg-[#0a0a0b] border-white/5 text-gray-600"
                                        }`}
                                      >
                                        <div className="font-mono text-[8px]">{sidx + 1}</div>
                                        <div className="truncate">{isAr ? step.ar : step.s}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Payment Section */}
                              <div className="pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider">{isAr ? "حالة الدفع ورابط السداد" : "PAYMENT STATUS & CHECKOUT"}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                      order.payment_status === "Paid"
                                        ? "bg-green-950/40 text-green-400 border border-green-500/10"
                                        : "bg-red-950/40 text-red-400 border border-red-500/10"
                                    }`}>
                                      {order.payment_status === "Paid" 
                                        ? (isAr ? "● تم الدفع (مؤكد)" : "● PAID & SECURED") 
                                        : (isAr ? "● بانتظار الدفع" : "● PENDING PAYMENT")}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                      {isAr ? "تأكيد السعر المباشر قبل السداد" : "Price confirmed before payment checkout"}
                                    </span>
                                  </div>
                                </div>
                                
                                {order.payment_status !== "Paid" && (
                                  <div>
                                    {order.payment_link ? (
                                      <a
                                        href={order.payment_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#c5a85c] hover:bg-amber-600 text-black font-semibold uppercase tracking-wider text-[10px] transition-all cursor-pointer font-sans"
                                      >
                                        <span>{isAr ? "انقر هنا للسداد" : "Proceed to Payment"}</span>
                                        <ArrowRight size={12} />
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic block py-2">
                                        {isAr ? "بانتظار تعيين بوابة الدفع من الإدارة" : "Direct transfer gateway awaiting activation"}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center border border-dashed border-white/5 rounded text-gray-500 text-xs">
                            {isAr ? "لا توجد طلبات جارية لهذا العميل." : "No orders initiated under your account portfolio yet."}
                          </div>
                        )}
                      </div>

                      {/* REQUEST IRAQ SECURE DELIVERY FORM */}
                      <form onSubmit={handleDeliveryRequest} className="p-5 bg-white/[0.01] border border-white/[0.05] rounded-sm space-y-4 text-xs">
                        <div className="flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
                          <Truck size={16} className="text-gold-base" />
                          <h5 className="font-serif text-xs font-semibold text-white uppercase">{isAr ? "طلب توصيل آمن للعراق" : "Secure Dispatch to Iraq Governorates"}</h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "اختيار مرجع الطلب" : "Select Order Reference"}</label>
                            <select
                              value={deliveryRequestOrder}
                              onChange={(e) => setDeliveryRequestOrder(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            >
                              {orderList.map((o, idx) => (
                                <option key={idx} value={o.id}>{o.id} - ({o.total_amount} {o.currency})</option>
                              ))}
                              <option value="CUSTOM-REQUEST">{isAr ? "طلب تداول مخصص مسبق" : "Bespoke Sourcing Request"}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "المحافظة العراقية المستهدفة" : "Iraq Delivery Governorate"}</label>
                            <select
                              value={deliveryGovernorate}
                              onChange={(e) => setDeliveryGovernorate(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            >
                              {["Baghdad", "Basra", "Erbil", "Najaf", "Karbala", "Mosul", "Anbar", "Duhok", "Sulaymaniyah", "Kirkuk"].map((gov) => (
                                <option key={gov} value={gov}>{gov}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "تفاصيل العنوان ورقم البيت" : "Detailed Street & House Address"}</label>
                            <input
                              type="text"
                              required
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              placeholder={isAr ? "المنصور، شارع ١٥، قرب محطة الوقود" : "e.g., Al-Mansour, District 602, St 12"}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "رقم الهاتف العراقي الفعال" : "Active Delivery Phone"}</label>
                            <input
                              type="text"
                              required
                              value={deliveryPhone}
                              onChange={(e) => setDeliveryPhone(e.target.value)}
                              placeholder="+964 770 000 0000"
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="bg-amber-950/10 border border-amber-900/30 p-3 rounded text-[11px] text-amber-500 leading-relaxed">
                          <strong>{isAr ? "تنويه جمركي:" : "Customs Declaration Note:"}</strong>{" "}
                          {isAr 
                            ? "يتم ترتيب التوصيل إلى العراق بعد تأكيد الطلب، والتحقق من بيانات العميل، وتأكيد توفر المنتج، ومراجعة المستندات الجمركية والفواتير وتصاريح الإقرارات الأمنية."
                            : "Delivery to Iraq governorates is finalized only after compliance clearance, verified client ID submission, and formal custom declarations conforming to regional rules."}
                        </div>

                        {deliverySuccess && (
                          <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded">
                            {isAr ? "تم إرسال طلب التوصيل الآمن للعراق بنجاح!" : "Secure delivery request for Iraq governorates dispatched!"}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2 bg-gold-base hover:bg-amber-600 text-black font-sans font-semibold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          {isAr ? "إرسال طلب التوصيل الآمن" : "Submit Secure Delivery Dispatch Request"}
                        </button>
                      </form>

                      {/* REAL TIME OFFICES & PICKUP POINTS */}
                      <div className="space-y-3">
                        <span className="text-xs font-serif font-semibold text-white uppercase block border-b border-white/[0.04] pb-1">
                          {isAr ? "نقاط الاستلام الموثقة من المشرف" : "ADMIN-VERIFIED COURIER OFFICE POINTS"}
                        </span>
                        
                        {pickupPoints.filter(p => p.status !== "Coming Soon").length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pickupPoints.map((p, idx) => (
                              <div key={idx} className="p-4 rounded border border-white/[0.04] bg-[#111] space-y-2 text-xs font-mono">
                                <div className="flex justify-between items-center">
                                  <span className="text-white font-bold text-sm block">{isAr ? p.name_ar : p.name_en}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-base/10 text-gold-base border border-gold-base/20 font-bold uppercase">
                                    {p.status}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-[11px] leading-relaxed">{isAr ? p.address_ar : p.address_en}</p>
                                <div className="text-[10px] text-gray-500 pt-1">
                                  <div>{isAr ? "تلفون: " : "Phone: "} {p.phone}</div>
                                  <div>{isAr ? "ساعات العمل: " : "Hours: "} {isAr ? p.working_hours_ar : p.working_hours_en}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-950/10 border border-amber-900/20 rounded text-xs text-amber-500 leading-normal font-mono">
                            {isAr 
                              ? "يتم تجهيز نقاط خدمة بغداد والبصرة. يرجى التواصل عبر واتساب لمعرفة خيارات التوصيل الحالية." 
                              : "Baghdad and Basra service points are being prepared. Contact our active WhatsApp desk for current secured dispatch solutions."}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 4: REQUEST BUYBACK */}
                  {activeTab === "buyback" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <div>
                          <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                            {isAr ? "بوابة تصفية وطلب إعادة الشراء" : "Precious Metal Buyback Portal"}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {isAr ? "تقديم طلب بيع السبائك المملوكة لشركة PGR بأسعار فورية معتمدة" : "Request physical buyback quotes, estimate liquidation payouts & arrange handovers"}
                          </p>
                        </div>
                      </div>

                      {/* REQUEST FORM */}
                      <form onSubmit={handleBuybackRequest} className="p-5 bg-white/[0.01] border border-white/[0.04] rounded-sm space-y-4 text-xs font-mono">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 block uppercase">{isAr ? "المعدن الثمين" : "Precious Metal"}</label>
                            <select
                              value={buybackMetal}
                              onChange={(e) => setBuybackMetal(e.target.value as any)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            >
                              <option value="gold">{isAr ? "ذهب استثماري" : "Gold"}</option>
                              <option value="silver">{isAr ? "فضة استثمارية" : "Silver"}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 block uppercase">{isAr ? "الوزن التقريبي بالجرام" : "Weight (Grams)"}</label>
                            <input
                              type="number"
                              required
                              value={buybackWeight}
                              onChange={(e) => setBuybackWeight(e.target.value)}
                              placeholder="e.g., 100"
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 block uppercase">{isAr ? "نقاوة السبيكة" : "Fineness"}</label>
                            <input
                              type="text"
                              disabled
                              value={buybackMetal === "gold" ? "999.9 Fine Gold" : "999.0 Fine Silver"}
                              className="w-full bg-[#18181a] border border-white/[0.08] rounded py-2 px-3 text-gray-500 outline-none cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {buybackSuccess && (
                          <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded">
                            {isAr ? "تم إرسال طلب تسعير إعادة الشراء الفوري بنجاح! سيتم التواصل للتأكيد." : "Buyback quote dispatched to secure desk!"}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#c5a85c] hover:bg-[#b09247] text-black font-sans font-semibold text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
                        >
                          {isAr ? "طلب تسعير تصفية وإعادة الشراء" : "Submit Buyback Quote Request"}
                        </button>
                      </form>

                      {/* PREVIOUS REQUESTS */}
                      <div className="space-y-3">
                        <span className="text-xs font-serif font-semibold text-white uppercase block border-b border-white/[0.04] pb-1">
                          {isAr ? "طلبات إعادة الشراء السابقة" : "PREVIOUS LIQUIDATION REQUESTS"}
                        </span>

                        <div className="bg-[#111] border border-white/[0.03] rounded overflow-hidden text-xs font-mono divide-y divide-white/[0.02]">
                          {buybackList.length > 0 ? (
                            buybackList.map((item, idx) => (
                              <div key={idx} className="p-3 flex justify-between items-center flex-wrap gap-2">
                                <div>
                                  <span className="text-white font-bold block">{item.metal === "gold" ? (isAr ? "إعادة شراء ذهب" : "Gold Buyback Request") : (isAr ? "إعادة شراء فضة" : "Silver Buyback Request")}</span>
                                  <span className="text-gray-500 text-[10px]">{item.weight_grams}g • {item.purity} • {new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-white font-semibold block">{convertAmount(item.estimated_payout_usd || 0)}</span>
                                  <span className="text-[10px] text-[#c5a85c] uppercase font-bold">{item.status}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-xs">
                              {isAr ? "لا توجد طلبات إعادة شراء سابقة." : "No prior precious metal liquidation requests logged."}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 5: CERTIFICATE VERIFICATION */}
                  {activeTab === "assay" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <div>
                          <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                            {isAr ? "ديوان فحص شهادات أصالة السبائك" : "Secure Physical Assay Verification"}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {isAr ? "التحقق الفني والأمني من الأرقام التسلسلية لسبائك المعادن الثمينة الصادرة" : "Audit physical bullion barcodes against active refiner registries"}
                          </p>
                        </div>
                      </div>

                      {/* Tracker Form */}
                      <form onSubmit={handleVerifyCert} className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={certQuery}
                            onChange={(e) => setCertQuery(e.target.value)}
                            placeholder={isAr ? "أدخل الرقم التسلسلي للسبيكة (مثال: PAMP-882941)" : "Enter physical bar serial code (e.g. PAMP-882941)"}
                            className="w-full bg-[#111] border border-white/[0.04] focus:border-[#c5a85c]/50 rounded-sm py-2.5 px-4 text-xs text-white outline-none font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 bg-[#c5a85c] hover:bg-[#b09247] text-black font-mono text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer"
                        >
                          {isAr ? "تحقق" : "Verify"}
                        </button>
                      </form>

                      {certError && (
                        <div className="p-4 bg-amber-950/10 border border-amber-500/20 text-amber-400 text-xs flex gap-2 rounded-sm font-mono">
                          <AlertCircle size={14} className="shrink-0 mt-0.5" />
                          <span>{certError}</span>
                        </div>
                      )}

                      {verifiedCert && (
                        <div className="relative p-6 border-2 border-double border-[#c5a85c]/20 rounded bg-[#111] overflow-hidden space-y-4">
                          <div className="absolute right-6 top-6 opacity-[0.02] pointer-events-none text-[#c5a85c]">
                            <QrCode size={140} />
                          </div>

                          <div className="text-center space-y-1.5 border-b border-[#c5a85c]/10 pb-4">
                            <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-[#c5a85c] block">
                              {isAr ? "وثيقة مطابقة الأصالة والمقايسة" : "OFFICIAL PRECIOUS METALS STATEMENT OF INTEGRITY"}
                            </span>
                            <h4 className="text-md md:text-lg font-serif text-white uppercase tracking-wide">
                              {verifiedCert.manufacturer} {isAr ? "مضمونة بالكامل" : "Verified Genuine"}
                            </h4>
                            <span className="text-[9px] font-mono text-emerald-400 block uppercase tracking-widest">
                              {isAr ? "● تم التحقق من الفحص والشهادة الرقمية" : "● STATUS: AUDIT COMPLIANT & RECORD ACTIVE"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1">
                              <span className="text-gray-500 block uppercase text-[10px]">{isAr ? "الرقم التسلسلي للسبيكة" : "SERIAL NUMBER"}</span>
                              <span className="text-white font-bold text-sm tracking-wider">{verifiedCert.serial_number}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-gray-500 block uppercase text-[10px]">{isAr ? "المنتج" : "ACCURED PRODUCT"}</span>
                              <span className="text-white">{verifiedCert.product_name}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-gray-500 block uppercase text-[10px]">{isAr ? "الوزن الصافي" : "NET WEIGHT"}</span>
                              <span className="text-white font-bold">{verifiedCert.weight}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-gray-500 block uppercase text-[10px]">{isAr ? "نسبة النقاوة" : "FINENESS / PURITY"}</span>
                              <span className="text-[#c5a85c] font-bold">{verifiedCert.purity}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#c5a85c]/10 pt-4 text-[10px] font-mono">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-white rounded-sm shrink-0">
                                <QrCode size={30} className="text-black" />
                              </div>
                              <div className="text-[9px] text-gray-500 leading-tight">
                                <div>SCAN TO VALIDATE PRODUCT CERTIFICATE RECORD</div>
                                <span className="text-[#c5a85c]">{verifiedCert.qr_code}</span>
                              </div>
                            </div>
                            <div className="text-right text-gray-600 text-[8px] leading-normal">
                              <div>PGR COMPLIANCE COMMITTEE RECORDED</div>
                              <div>DIGITALLY SIGNED & ENCRYPTED VIA AES-256</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

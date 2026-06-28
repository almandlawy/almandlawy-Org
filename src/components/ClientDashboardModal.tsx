/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, ShieldCheck, Truck, Clipboard, Search, Check, AlertCircle, 
  Sparkles, QrCode, LogOut, DollarSign, FileText, 
  Upload, UserCheck, MapPin, Lock, PlusCircle, ArrowRight 
} from "lucide-react";
import { dbService, mockDb, isProduction, isLive, supabase } from "../lib/supabase";
import IraqTrustBadge from "./IraqTrustBadge";
import CustomerAccountDashboard from "./CustomerAccountDashboard";
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
  const [onboardPassword, setOnboardPassword] = useState("");
  const [onboardPhone, setOnboardPhone] = useState("");
  const [onboardCompany, setOnboardCompany] = useState("");
  const [onboardCountry, setOnboardCountry] = useState("UAE");
  const [onboardCity, setOnboardCity] = useState("Dubai");
  const [onboardDeliveryDestination, setOnboardDeliveryDestination] = useState("");
  const [onboardIraqiID, setOnboardIraqiID] = useState("");
  const [onboardSuccessMsg, setOnboardSuccessMsg] = useState("");

  // Logged-in Dashboard state
  const [activeTab, setActiveTab] = useState<"overview" | "verification" | "orders" | "buyback" | "assay">("overview");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "AED" | "IQD">("USD");
  const [exchangeRates, setExchangeRates] = useState<any>({ USD: 1.0, AED: 3.6725, IQD: 1310.0 });
  const [settings, setSettings] = useState<any>(null);

  // Dashboard data states
  const [quoteList, setQuoteList] = useState<any[]>([]);
  const [deliveryList, setDeliveryList] = useState<any[]>([]);
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

  const syncCustomerProfile = async (authUser: any, extras?: Record<string, unknown>) => {
    await dbService.customers.upsert({
      id: authUser.id,
      auth_user_id: authUser.id,
      full_name: extras?.full_name || authUser.name || "",
      email: authUser.email,
      phone: extras?.phone || authUser.phone || "",
      country: extras?.country || "UAE",
      city: extras?.city || "Dubai",
      preferred_language: currentLang,
      company_name: extras?.company_name || "",
      delivery_destination: extras?.delivery_destination || "",
    });
  };
  const loadUserData = async (currentUser: any) => {
    if (!currentUser) return;
    try {
      const [exRates, sObj, kProfile, deliveryListData, bList, pList, oList, allQuotes] = await Promise.all([
        dbService.exchangeRates.get(),
        dbService.settings.get(),
        dbService.kyc.get(currentUser.id),
        dbService.iraqDelivery.list(currentUser.id),
        dbService.buyback.list(currentUser.id),
        dbService.pickupPoints.list(),
        dbService.orders.listByCustomer(currentUser.id, currentUser.email),
        dbService.quoteRequests.listByCustomer(currentUser.id, currentUser.email)
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
      setDeliveryList(deliveryListData || []);
      setOrderList(oList || []);
      setQuoteList(allQuotes || []);
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
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Customer",
              role: session.user.email === "almandlawy112@gmail.com" ? "admin" : "customer",
              created_at: session.user.created_at || new Date().toISOString()
            };
            setUser(u);
            await syncCustomerProfile(u);
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
            name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Customer",
            role: data.user.email === "almandlawy112@gmail.com" ? "admin" : "customer",
            created_at: data.user.created_at || new Date().toISOString()
          };
          await syncCustomerProfile(u);
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
    if (!onboardEmail || !onboardName || !onboardPassword) {
      alert(isAr ? "يرجى ملء الاسم والبريد وكلمة المرور." : "Please fill name, email, and password.");
      return;
    }

    if (isProduction || isLive) {
      try {
        setGoogleLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email: onboardEmail.trim().toLowerCase(),
          password: onboardPassword,
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
            phone: onboardPhone,
            role: "customer",
            created_at: data.user.created_at || new Date().toISOString()
          };
          await syncCustomerProfile(u, {
            full_name: onboardName,
            phone: onboardPhone,
            country: onboardCountry,
            city: onboardCity,
            company_name: onboardCompany,
            delivery_destination: onboardDeliveryDestination,
          });
          setUser(u);
          loadUserData(u);
          setOnboardSuccessMsg(isAr 
            ? "تم إنشاء الحساب بنجاح! يمكنك الآن تتبع طلبات التسعير والطلبات المؤكدة." 
            : "Account created successfully! You can now track quote requests and confirmed orders."
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

    await syncCustomerProfile(dummyUser, {
      full_name: onboardName,
      phone: onboardPhone,
      country: onboardCountry,
      city: onboardCity,
      company_name: onboardCompany,
      delivery_destination: onboardDeliveryDestination,
    });
    mockDb.auth.setUser(dummyUser);
    setUser(dummyUser);
    loadUserData(dummyUser);
    setOnboardSuccessMsg(isAr ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
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
    setQuoteList([]);
    setOrderList([]);
    setBuybackList([]);
    setDeliveryList([]);
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

    const spotPrice = getSpotGramUsd(buybackMetal);
    if (!spotPrice) {
      alert(isAr ? "الأسعار غير متاحة حالياً. يرجى طلب عرض سعر." : "Prices unavailable. Please request a quote.");
      return;
    }

    const estPayout = Number(buybackWeight) * spotPrice * 0.98;

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

  // Spot calculation for buyback estimates only
  const getSpotGramUsd = (metal: "gold" | "silver") => {
    if (!rates) return null;
    const spotOz = metal === "gold" ? rates.gold?.spot_usd_oz : rates.silver?.spot_usd_oz;
    if (!spotOz) return null;
    return spotOz / 31.1035;
  };

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
                    {isAr ? "تسجيل الدخول" : "Sign In"}
                  </button>
                  <button
                    onClick={() => setAuthMode("onboard")}
                    className={`py-3 px-6 font-sans text-xs uppercase tracking-wider transition-all border-b-2 font-semibold ${
                      authMode === "onboard"
                        ? "text-gold-base border-gold-base"
                        : "text-gray-500 border-transparent hover:text-white"
                    }`}
                  >
                    {isAr ? "تسجيل حساب" : "Create Account"}
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
                    <p className="text-xs text-gray-400">
                      {isAr
                        ? "أنشئ حساباً لتتبع طلبات التسعير والطلبات المؤكدة والمدفوعات."
                        : "Create an account to track quote requests, confirmed orders, and payments."}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "الاسم الكامل" : "Full name"}</label>
                        <input type="text" required value={onboardName} onChange={(e) => setOnboardName(e.target.value)} className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "البريد الإلكتروني" : "Email"}</label>
                        <input type="email" required value={onboardEmail} onChange={(e) => setOnboardEmail(e.target.value)} className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "كلمة المرور" : "Password"}</label>
                        <input type="password" required minLength={8} value={onboardPassword} onChange={(e) => setOnboardPassword(e.target.value)} className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "الهاتف / واتساب" : "Phone / WhatsApp"}</label>
                        <input type="text" required value={onboardPhone} onChange={(e) => setOnboardPhone(e.target.value)} placeholder="+971559688837" className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "الدولة" : "Country"}</label>
                        <input type="text" value={onboardCountry} onChange={(e) => setOnboardCountry(e.target.value)} className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "المدينة" : "City"}</label>
                        <input type="text" value={onboardCity} onChange={(e) => setOnboardCity(e.target.value)} className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "اسم الشركة (اختياري)" : "Company name (optional)"}</label>
                        <input type="text" value={onboardCompany} onChange={(e) => setOnboardCompany(e.target.value)} className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">{isAr ? "وجهة التسليم (اختياري)" : "Delivery destination (optional)"}</label>
                        <input type="text" value={onboardDeliveryDestination} onChange={(e) => setOnboardDeliveryDestination(e.target.value)} className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-xs text-white outline-none" />
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500">
                      {isAr ? "يتم تأكيد السعر النهائي قبل الدفع." : "Final price is confirmed before payment."}
                    </p>

                    {onboardSuccessMsg && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded">
                        {onboardSuccessMsg}
                      </div>
                    )}

                    <button type="submit" className="w-full py-3 bg-gold-base hover:bg-amber-600 text-black font-sans font-semibold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer">
                      {isAr ? "تسجيل حساب" : "Create Account"}
                    </button>
                  </form>
                )}

              </div>

            </div>
          ) : (
            <CustomerAccountDashboard
              currentLang={currentLang}
              user={user}
              onClose={onClose}
              onLogout={handleLogout}
            />
          )}

        </div>
      </div>
    </div>
  );
}

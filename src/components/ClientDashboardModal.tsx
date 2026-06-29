/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, ShieldCheck, Truck, Clipboard, Search, Check, AlertCircle, 
  Sparkles, QrCode, LogOut, DollarSign, FileText, 
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

  // Portfolio states (quote/order focused — no investment accounts)
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

  // Scenario Calculator states — removed (quote desk only)

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

  // Advanced Compliance KYC file and category states
  const [kycType, setKycType] = useState<"individual" | "company">("individual");
  const [uploadedFilesRegistry, setUploadedFilesRegistry] = useState<Record<string, { name: string; size: number; date: string }>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    setOrderList([]);
    setBuybackList([]);
  };

  // Handle KYC Submission
  const [kycTypeSaved, setKycTypeSaved] = useState<string>("individual");

  const handleFileChange = (_docKey: string, _file: File | null) => {
    setUploadError(isAr
      ? "رفع المستندات غير متاح حالياً عبر الموقع. قد يطلب فريق PGR UAE مستندات KYC عبر قناة رسمية آمنة."
      : "Document upload is coming soon. PGR UAE may request KYC documents through an official secure channel.");
  };

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!kycAgree || !kycPrivacy) {
      setUploadError(isAr ? "يجب الموافقة على شروط التحقق والخصوصية." : "You must consent to both compliance and privacy terms.");
      return;
    }

    setUploadError(null);

    // Save actual profile
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
      kyc_type: kycType,
      uploaded_files: uploadedFilesRegistry,
      documents: [
        {
          id: `doc-${Date.now()}`,
          type: kycType === "company" ? "Trade License & Corporate Registry" : kycIdType,
          number: kycIdNumber, // We will mask this on rendering
          status: "Pending review",
          updated_at: new Date().toISOString()
        }
      ],
      verified_at: ""
    };

    await dbService.kyc.save(user.id, updatedProfile);
    setKycProfile(updatedProfile);
    setKycSuccess(true);
    setKycTypeSaved(kycType);
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
                    {isAr ? "الهوية الرقمية وبوابة العروض" : "Digital ID & Quote Portal"}
                  </h2>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {isAr 
                    ? "بوابة لتسجيل بياناتك وتتبع طلبات عروض الأسعار وحالة KYC والطلبات والتسليم."
                    : "Register your details and track quote requests, KYC status, orders, delivery, and storage requests."}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <ShieldCheck size={16} className="text-gold-base" />
                    <span>{isAr ? "ممتثل لضوابط الفحص الفني الدولية" : "International Assay Standards Compliant"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Truck size={16} className="text-gold-base" />
                    <span>{isAr ? "خطوط توصيل آمنة لبغداد والبصرة وأربيل" : "Secure delivery channels to Baghdad, Basra & Erbil"}</span>
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
                          <div>{isAr ? "اضغط على زر الدخول أدناه للدخول الفوري كحساب مسجل مسبقاً (الشيخ منصور - دبي) للاطلاع الفوري على المحاكاة والتحقق." : "Leave fields blank or input any text to automatically log in and experience the full customer dashboard."}</div>
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
                            placeholder="e.g., REG-55291"
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
                    { id: "performance", icon: <TrendingUp size={14} />, label_en: "My Quotes & Status", label_ar: "عروض الأسعار والحالة" },
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
                  
                  {/* TAB 1: QUOTES & STATUS OVERVIEW */}
                  {activeTab === "performance" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <div>
                          <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                            {isAr ? "عروض الأسعار وحالة الطلبات" : "Quote Requests & Order Status"}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {isAr ? "تتبع طلبات عروض الأسعار وحالة KYC والطلبات والتسليم" : "Track quote requests, KYC status, firm quotes, orders, and delivery"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#111] border border-white/[0.03] p-4 rounded space-y-1">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">{isAr ? "حالة KYC" : "KYC Status"}</span>
                          <span className="text-sm font-sans font-bold text-white block">{kycProfile?.status || (isAr ? "لم يُقدَّم" : "Not submitted")}</span>
                        </div>
                        <div className="bg-[#111] border border-white/[0.03] p-4 rounded space-y-1">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">{isAr ? "طلبات التسعير" : "Quote Requests"}</span>
                          <span className="text-lg font-sans font-bold text-white block">{orderList.filter(o => o.status === "Quoted" || o.status === "awaiting_confirmation").length}</span>
                        </div>
                        <div className="bg-[#111] border border-white/[0.03] p-4 rounded space-y-1">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">{isAr ? "الطلبات المؤكدة" : "Confirmed Orders"}</span>
                          <span className="text-lg font-sans font-bold text-white block">{orderList.filter(o => o.status !== "Quoted" && o.status !== "awaiting_confirmation").length}</span>
                        </div>
                        <div className="bg-[#111] border border-white/[0.03] p-4 rounded space-y-1">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">{isAr ? "طلبات إعادة البيع" : "Sell-Back Requests"}</span>
                          <span className="text-lg font-sans font-bold text-white block">{buybackList.length}</span>
                        </div>
                      </div>

                      {orderList.length === 0 && (
                        <div className="p-6 bg-amber-500/5 border border-gold-base/10 rounded flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="space-y-1 text-center md:text-left">
                            <h5 className="text-sm font-sans font-semibold text-gold-base">
                              {isAr ? "لا توجد طلبات عروض أسعار حالياً." : "No quote requests yet."}
                            </h5>
                            <p className="text-xs text-gray-400 font-sans">
                              {isAr ? "اطلب عرض سعر مؤكد للبدء في عملية الشراء أو التخزين أو التسليم." : "Request a firm quote to begin a physical bullion purchase, storage, or delivery inquiry."}
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
                            {isAr ? "طلب عرض سعر" : "Request Firm Quote"}
                          </button>
                        </div>
                      )}

                      {rates && rates.gold?.spot_usd_oz > 0 && (
                        <div className="p-4 bg-[#111] border border-white/[0.03] rounded text-xs font-mono space-y-2">
                          <span className="text-[10px] text-gold-base uppercase tracking-widest block">{isAr ? "قيمة إرشادية فقط" : "Indicative Reference Value Only"}</span>
                          <p className="text-gray-400">
                            {isAr
                              ? "الأسعار المعروضة إرشادية فقط. يتم تأكيد السعر النهائي من المكتب قبل أي عملية."
                              : "Displayed prices are indicative only. Final pricing is confirmed by the desk before any transaction."}
                          </p>
                          <div className="flex justify-between text-gray-300">
                            <span>{isAr ? "الذهب (أونصة)" : "Gold (oz)"}</span>
                            <span>{convertAmount(rates.gold.spot_usd_oz)}</span>
                          </div>
                          {rates.silver?.spot_usd_oz > 0 && (
                            <div className="flex justify-between text-gray-300">
                              <span>{isAr ? "الفضة (أونصة)" : "Silver (oz)"}</span>
                              <span>{convertAmount(rates.silver.spot_usd_oz)}</span>
                            </div>
                          )}
                        </div>
                      )}

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

                      {/* Account KYC Type Switch Toggle */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-gray-400 block uppercase">
                          {isAr ? "فئة التوثيق القانوني" : "Legal Entity Classification"}
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.02] border border-white/[0.04] rounded">
                          <button
                            type="button"
                            onClick={() => {
                              setKycType("individual");
                              setKycIdType("Emirates ID");
                            }}
                            className={`py-2 text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer ${kycType === "individual" ? "bg-gold-base text-black font-bold shadow-lg" : "text-gray-400 hover:text-white"}`}
                          >
                            {isAr ? "تحقق الأفراد (طلب شخصي)" : "Individual Class"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setKycType("company");
                              setKycIdType("Trade License");
                            }}
                            className={`py-2 text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer ${kycType === "company" ? "bg-gold-base text-black font-bold shadow-lg" : "text-gray-400 hover:text-white"}`}
                          >
                            {isAr ? "تحقق الشركات (مؤسسات)" : "Corporate Class"}
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleKYCSubmit} className="space-y-4 text-xs">
                        {/* Global Client Demographics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">
                              {kycType === "company" 
                                ? (isAr ? "الاسم التجاري الكامل للشركة *" : "Registered Company Name *")
                                : (isAr ? "الاسم الكامل للمكتتب *" : "Full Legal Name *")}
                            </label>
                            <input
                              type="text"
                              required
                              value={kycFullName}
                              onChange={(e) => setKycFullName(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "البريد الإلكتروني للاتصال والفوترة *" : "Official Communications Email *"}</label>
                            <input
                              type="email"
                              required
                              value={kycEmail}
                              onChange={(e) => setKycEmail(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "رقم الهاتف المباشر *" : "Corporate Telephone *"}</label>
                            <input
                              type="text"
                              required
                              value={kycPhone}
                              onChange={(e) => setKycPhone(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "رقم الواتساب للتواصل والتوثيق *" : "WhatsApp Line *"}</label>
                            <input
                              type="text"
                              required
                              value={kycWhatsapp}
                              onChange={(e) => setKycWhatsapp(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">
                              {kycType === "company" ? (isAr ? "تاريخ التأسيس *" : "Date of Incorporation *") : (isAr ? "تاريخ الميلاد *" : "Date of Birth *")}
                            </label>
                            <input
                              type="date"
                              required
                              value={kycDob}
                              onChange={(e) => setKycDob(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "بلد التسجيل / الإقامة" : "Country of Residence/Registry"}</label>
                            <input
                              type="text"
                              value={kycCountry}
                              onChange={(e) => setKycCountry(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "الولاية / المدينة" : "City / Prefecture"}</label>
                            <input
                              type="text"
                              value={kycCity}
                              onChange={(e) => setKycCity(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">
                              {kycType === "company" ? (isAr ? "الولاية القضائية *" : "Regulatory Jurisdiction *") : (isAr ? "الجنسية *" : "Nationality *")}
                            </label>
                            <input
                              type="text"
                              required
                              value={kycNationality}
                              onChange={(e) => setKycNationality(e.target.value)}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        {/* Document Type and Reference ID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">{isAr ? "نوع المستند المعرف *" : "Identity Reference Document *"}</label>
                            {kycType === "company" ? (
                              <select
                                value={kycIdType}
                                onChange={(e) => setKycIdType(e.target.value)}
                                className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                              >
                                <option value="Trade License">{isAr ? "الرخصة التجارية للشركات" : "Corporate Trade License"}</option>
                                <option value="MOA/AOA">{isAr ? "عقد التأسيس والنظام الأساسي" : "MOA / AOA Registry"}</option>
                              </select>
                            ) : (
                              <select
                                value={kycIdType}
                                onChange={(e) => setKycIdType(e.target.value)}
                                className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                              >
                                <option value="Emirates ID">{isAr ? "الهوية الإماراتية" : "Emirates ID"}</option>
                                <option value="Passport">{isAr ? "جواز السفر الدولي" : "International Passport"}</option>
                                <option value="Residence Visa">{isAr ? "الإقامة الإماراتية" : "Residence Visa"}</option>
                              </select>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">
                              {kycType === "company" ? (isAr ? "رقم السجل التجاري / الرخصة *" : "Trade License / CR Number *") : (isAr ? "رقم الهوية / الجواز *" : "Document Reference ID Number *")}
                            </label>
                            <input
                              type="text"
                              required
                              value={kycIdNumber}
                              onChange={(e) => setKycIdNumber(e.target.value)}
                              placeholder={kycType === "company" ? "e.g., ICC-88291A" : "784-XXXX-XXXXXXX-X"}
                              className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                            />
                          </div>
                        </div>

                        {/* Source of Wealth Disclaimer */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 block uppercase">
                            {kycType === "company" ? (isAr ? "إقرار مصدر الثروة والسبائك للشركة *" : "Corporate Source of Funds/Wealth Declaration *") : (isAr ? "إقرار مصدر الأموال الشخصية *" : "Personal Source of Funds Declaration *")}
                          </label>
                          <textarea
                            required
                            value={kycFunds}
                            onChange={(e) => setKycFunds(e.target.value)}
                            rows={2}
                            placeholder={isAr ? "مثال: أرباح أعمال تجارية مرخصة ومصادر أموال مشروعة." : "e.g., Licensed corporate profits, lawful business income, physical business cashflow"}
                            className="w-full bg-[#111] border border-white/[0.08] focus:border-gold-base rounded py-2 px-3 text-white outline-none"
                          />
                        </div>

                        {/* Document upload — coming soon (Option B) */}
                        <div className="space-y-2">
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-200">
                            {isAr
                              ? "رفع المستندات قريباً. يمكنك تقديم بيانات الاستفسار الآن، وقد يطلب فريق PGR UAE مستندات KYC عبر قناة رسمية آمنة."
                              : "Document upload coming soon. You may submit your inquiry details now. PGR UAE may request KYC documents through an official secure channel."}
                          </div>
                          <label className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">
                            {isAr ? "الوثائق (غير متاحة حالياً)" : "Documents (not available yet)"}
                          </label>

                          {kycType === "company" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50 pointer-events-none">
                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "تحميل الرخصة التجارية *" : "Corporate Trade License *"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("trade_license", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["trade_license"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["trade_license"].name} ({(uploadedFilesRegistry["trade_license"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "تحميل عقد التأسيس (MOA) واللوائح" : "MOA / AOA Document"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("moa_aoa", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["moa_aoa"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["moa_aoa"].name} ({(uploadedFilesRegistry["moa_aoa"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "هوية المفوض بالتوقيع والمدير *" : "Authorized Signatory Passport/ID *"}</span>
                                <input
                                  type="file"
                                  required={!uploadedFilesRegistry["signatory_id"]}
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("signatory_id", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["signatory_id"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["signatory_id"].name} ({(uploadedFilesRegistry["signatory_id"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "سجل المستفيدين الحقيقيين (UBO) *" : "Ultimate Beneficial Owners (UBO) list *"}</span>
                                <input
                                  type="file"
                                  required={!uploadedFilesRegistry["ubo_details"]}
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("ubo_details", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["ubo_details"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["ubo_details"].name} ({(uploadedFilesRegistry["ubo_details"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "إثبات عنوان الشركة المعمّد" : "Company Address Proof"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("company_address", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["company_address"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["company_address"].name} ({(uploadedFilesRegistry["company_address"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "خطاب تفويض مجلس الإدارة" : "Board Authorization Letter"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("auth_letter", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["auth_letter"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["auth_letter"].name} ({(uploadedFilesRegistry["auth_letter"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50 pointer-events-none">
                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "تحميل وجه الهوية الإماراتية *" : "Emirates ID Front *"}</span>
                                <input
                                  type="file"
                                  required={!uploadedFilesRegistry["emirates_id_front"]}
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("emirates_id_front", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["emirates_id_front"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["emirates_id_front"].name} ({(uploadedFilesRegistry["emirates_id_front"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "تحميل خلف الهوية الإماراتية *" : "Emirates ID Back *"}</span>
                                <input
                                  type="file"
                                  required={!uploadedFilesRegistry["emirates_id_back"]}
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("emirates_id_back", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["emirates_id_back"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["emirates_id_back"].name} ({(uploadedFilesRegistry["emirates_id_back"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "جواز السفر الدولي *" : "International Passport *"}</span>
                                <input
                                  type="file"
                                  required={!uploadedFilesRegistry["passport"]}
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("passport", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["passport"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["passport"].name} ({(uploadedFilesRegistry["passport"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "تأشيرة الإقامة (إن وجدت)" : "UAE Residence Visa"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("residence_visa", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["residence_visa"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["residence_visa"].name} ({(uploadedFilesRegistry["residence_visa"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "إثبات محل السكن (فاتورة مرافق)" : "Proof of Residential Address"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("proof_address", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["proof_address"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["proof_address"].name} ({(uploadedFilesRegistry["proof_address"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>

                              <label className="p-3 border border-dashed border-white/10 rounded bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                                <Upload className="text-gray-500 mb-1" size={16} />
                                <span className="text-[10px] text-gray-300 block">{isAr ? "خطاب إقرار مصدر الأموال" : "Source of Funds Statement File"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => handleFileChange("funds_file", e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadedFilesRegistry["funds_file"] ? (
                                  <span className="text-[8px] text-emerald-400 font-mono mt-1 block">✓ {uploadedFilesRegistry["funds_file"].name} ({(uploadedFilesRegistry["funds_file"].size / 1024 / 1024).toFixed(2)} MB)</span>
                                ) : (
                                  <span className="text-[8px] text-gray-500 block mt-1">{isAr ? "انقر للاختيار" : "Click to browse"}</span>
                                )}
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Error Alert Box */}
                        {(uploadError || uploadError) && (
                          <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-[11px] rounded font-mono">
                            ⚠ {uploadError}
                          </div>
                        )}

                        <div className="space-y-2 pt-2 text-[10px] text-gray-400">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              required
                              checked={kycAgree}
                              onChange={(e) => setKycAgree(e.target.checked)}
                              className="mt-0.5"
                            />
                            <span>{isAr ? "أؤكد بصفتي أصيلاً أو ممثلاً مخولاً أن هذه الأموال مستمدة من مصادر مشروعة ومعتمدة بالكامل." : "I confirm that these funds are derived from certified, lawful sources."}</span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              required
                              checked={kycPrivacy}
                              onChange={(e) => setKycPrivacy(e.target.checked)}
                              className="mt-0.5"
                            />
                            <span>{isAr ? "أوافق على معالجة بياناتي لأغراض الامتثال KYC/AML. قد يطلب فريق PGR UAE مستندات عبر قناة رسمية آمنة." : "I consent to KYC/AML data processing. PGR UAE may request documents through an official secure channel."}</span>
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
                            {isAr ? "متابعة توصيل سبائك الذهب من دبي إلى بغداد والبصرة والمحافظات العراقية" : "Track delivery, customs clearance & handovers for Iraq consignments"}
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
                            {isAr ? "لا توجد طلبات جارية لهذا العميل." : "No active orders for this account yet."}
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
                            {isAr ? "تم إرسال طلب عرض سعر إعادة البيع بنجاح! سيتم التواصل للتأكيد." : "Sell-back quote request submitted! We will contact you for desk confirmation."}
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

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LiveMarketRates } from "../types";
import { isLive, supabase, mockDb } from "../lib/supabase";

type Lang = "en" | "ar";

interface AppContextValue {
  currentLang: Lang;
  setCurrentLang: (lang: Lang) => void;
  toggleLanguage: () => void;
  selectedCurrency: string;
  setSelectedCurrency: (c: string) => void;
  rates: LiveMarketRates | null;
  isRefreshing: boolean;
  fetchRates: () => Promise<void>;
  user: any;
  setUser: (u: any) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const OUNCE_TO_GRAM = 31.1034768;

function getInitialRates(): LiveMarketRates {
  const defaultSpots = { gold: 2365.4, silver: 29.85, platinum: null as number | null, palladium: null as number | null };
  const exchangeRates = { USD: 1.0, AED: 3.6725, EUR: 0.925, GBP: 0.785, SAR: 3.7505 };
  const ratesObj: any = { source_status: "reference" };
  Object.entries(defaultSpots).forEach(([metal, spotUsd]) => {
    ratesObj[metal] = { spot_usd_oz: spotUsd, currencies: {} as Record<string, { ounce: number; gram: number }> };
    if (spotUsd == null) return;
    Object.entries(exchangeRates).forEach(([currency, rate]) => {
      const ouncePrice = spotUsd * rate;
      ratesObj[metal].currencies[currency] = {
        ounce: parseFloat(ouncePrice.toFixed(2)),
        gram: parseFloat((ouncePrice / OUNCE_TO_GRAM).toFixed(4)),
      };
    });
  });
  return ratesObj as LiveMarketRates;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState<Lang>("ar");
  const [selectedCurrency, setSelectedCurrency] = useState("AED");
  const [rates, setRates] = useState<LiveMarketRates | null>(getInitialRates());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleUserLogin = useCallback(async (supabaseUser: any) => {
    const email = supabaseUser.email;
    const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "Client";
    const mappedUser = {
      id: supabaseUser.id,
      email,
      name: fullName,
      role: email === "almandlawy112@gmail.com" ? "admin" : "customer",
      created_at: supabaseUser.created_at || new Date().toISOString(),
    };
    mockDb.auth.setUser(mappedUser);
    setUser(mappedUser);
    try {
      if (supabase) {
        const { data: existing } = await supabase.from("customers").select("*").eq("email", email).single();
        const profile = {
          id: supabaseUser.id,
          full_name: fullName,
          email,
          avatar_url: supabaseUser.user_metadata?.avatar_url || "",
          provider: supabaseUser.app_metadata?.provider || "google",
          last_login: new Date().toISOString(),
        };
        if (existing) await supabase.from("customers").update(profile).eq("id", supabaseUser.id);
        else await supabase.from("customers").insert({ ...profile, created_at: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Customer profile sync failed:", err);
    }
  }, []);

  useEffect(() => {
    if (isLive && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) handleUserLogin(session.user);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) await handleUserLogin(session.user);
        else if (event === "SIGNED_OUT") {
          mockDb.auth.logout();
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
    const active = mockDb.auth.getUser();
    if (active) setUser(active);
  }, [handleUserLogin]);

  const fetchRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/prices");
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.source_status !== "request_quote" && data.rates) {
          setRates({
            ...data.rates,
            source_status: data.source_status,
            updated_at: data.updated_at,
            cache_timestamp: data.cache_timestamp,
          });
        }
      }
    } catch {
      /* keep reference rates */
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const id = setInterval(fetchRates, 60000);
    return () => clearInterval(id);
  }, [fetchRates]);

  const toggleLanguage = () => setCurrentLang((p) => (p === "en" ? "ar" : "en"));

  return (
    <AppContext.Provider
      value={{
        currentLang,
        setCurrentLang,
        toggleLanguage,
        selectedCurrency,
        setSelectedCurrency,
        rates,
        isRefreshing,
        fetchRates,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

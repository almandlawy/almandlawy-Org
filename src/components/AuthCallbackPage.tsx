/**
 * OAuth callback — exchanges PKCE code and redirects to client destination.
 */

import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { ensureSupabaseReady, supabase } from "../lib/supabase";
import {
  mapSupabaseUser,
  persistAppUser,
  resolvePostAuthPath,
  upsertCustomerProfile,
  ensureKycStub,
} from "../lib/clientAuth";
import { getCanonicalSiteOrigin, isBareProductionDomain } from "../lib/siteOrigin";
import { trackSignUp } from "../lib/gtag";

export default function AuthCallbackPage() {
  const [error, setError] = useState("");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    let cancelled = false;

    async function completeAuth() {
      if (isBareProductionDomain()) {
        const canonical = `${getCanonicalSiteOrigin()}${window.location.pathname}${window.location.search}`;
        window.location.replace(canonical);
        return;
      }

      const ready = await ensureSupabaseReady();
      if (!ready || !supabase) {
        if (!cancelled) {
          setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");
        }
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next") || "/dashboard";
        const code = params.get("code");

        // detectSessionInUrl may already exchange the code on client init — check first.
        let {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user && code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          ({
            data: { session },
          } = await supabase.auth.getSession());
        }

        if (!session?.user) {
          throw new Error("No session after OAuth callback.");
        }

        const user = mapSupabaseUser(session.user);
        persistAppUser(user);
        const provider = (session.user.app_metadata?.provider as string) || "google";
        await upsertCustomerProfile(user, provider);
        try {
          await ensureKycStub(user);
        } catch (err) {
          console.warn("[AuthCallback] KYC stub deferred:", err);
        }
        trackSignUp(provider === "google" ? "google" : "email");

        const destination = await resolvePostAuthPath(next);
        window.history.replaceState({}, document.title, destination);
        window.location.assign(destination);
      } catch (err: unknown) {
        console.error("[AuthCallback] OAuth failed:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Authentication failed.");
        }
      }
    }

    completeAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-brand-card border border-soft-border rounded-xl p-8 text-center space-y-4 shadow-premium">
        {error ? (
          <>
            <ShieldAlert className="mx-auto text-red-600" size={36} />
            <h1 className="text-lg font-serif text-text-charcoal">Sign-in could not be completed</h1>
            <p className="text-sm text-text-secondary">{error}</p>
            <a
              href="/login"
              className="inline-block mt-2 px-5 py-2.5 bg-gold-base hover:bg-gold-dark text-text-charcoal text-xs font-mono font-bold uppercase tracking-widest rounded-lg"
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <RefreshCw className="animate-spin text-gold-base mx-auto" size={36} />
            <h1 className="text-lg font-serif text-text-charcoal">Completing sign-in…</h1>
            <p className="text-sm text-text-secondary">Redirecting to your PGR UAE account.</p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Client authentication — email/password, Google OAuth, session helpers.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { User } from "@supabase/supabase-js";
import {
  BOOTSTRAP_ADMIN_EMAILS,
  dbService,
  ensureSupabaseReady,
  getAuthCallbackUrl,
  isLive,
  isProduction,
  mockDb,
  supabase,
} from "./supabase";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  accountType?: "individual" | "corporate";
  role: "customer" | "admin" | "verified_customer";
  created_at?: string;
}

const MOCK_USERS_KEY = "pgr_registered_users";

interface MockRegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  accountType?: "individual" | "corporate";
  role: AppUser["role"];
  created_at: string;
}

function safeStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readMockUsers(): MockRegisteredUser[] {
  const storage = safeStorage();
  if (!storage || isProduction) return [];
  try {
    return JSON.parse(storage.getItem(MOCK_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeMockUsers(users: MockRegisteredUser[]) {
  const storage = safeStorage();
  if (!storage || isProduction) return;
  storage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export function isBootstrapAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return BOOTSTRAP_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
}

export function mapSupabaseUser(user: User): AppUser {
  const email = user.email || "";
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email,
    name: meta.full_name || meta.name || email.split("@")[0] || "PGR Client",
    phone: meta.phone || undefined,
    company: meta.company || undefined,
    accountType: meta.account_type || "individual",
    role: isBootstrapAdmin(email) ? "admin" : "customer",
    created_at: user.created_at || new Date().toISOString(),
  };
}

export function mapMockRegisteredUser(u: MockRegisteredUser): AppUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    company: u.company,
    accountType: u.accountType,
    role: u.role,
    created_at: u.created_at,
  };
}

export function persistAppUser(user: AppUser) {
  if (!isProduction) {
    mockDb.auth.setUser(user);
  }
}

export async function getAccessToken(): Promise<string | null> {
  await ensureSupabaseReady();
  if (isLive && supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
  const mock = mockDb.auth.getUser();
  return mock ? `mock-token-${mock.id}` : null;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  await ensureSupabaseReady();
  if (isLive && supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const mapped = mapSupabaseUser(data.session.user);
      persistAppUser(mapped);
      return mapped;
    }
  }
  return mockDb.auth.getUser();
}

export function getAuthCallbackUrlWithNext(nextPath = "/dashboard"): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.pgruae.com";
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function getLoginRedirectPath(): string {
  if (typeof window === "undefined") return "/dashboard";
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

export async function upsertCustomerProfile(user: AppUser): Promise<void> {
  if (!isLive || !supabase) return;
  try {
    const profile = {
      id: user.id,
      full_name: user.name,
      email: user.email,
      phone: user.phone || null,
      company: user.company || null,
      account_type: user.accountType || "individual",
      provider: "email",
      last_login: new Date().toISOString(),
    };
    await supabase.from("customers").upsert(
      { ...profile, created_at: user.created_at || new Date().toISOString() },
      { onConflict: "id" }
    );
  } catch (err) {
    console.warn("[clientAuth] customers upsert skipped:", err);
  }
}

export async function ensureKycStub(user: AppUser): Promise<void> {
  const existing = await dbService.kyc.get(user.id);
  if (existing) return;
  await dbService.kyc.save(user.id, {
    id: user.id,
    full_name: user.name,
    phone: user.phone || "",
    whatsapp: user.phone || "",
    email: user.email,
    country: "Iraq",
    city: "Baghdad",
    nationality: "Iraqi",
    dob: "",
    source_of_funds_declaration: "",
    agreement_accepted: false,
    privacy_consent: false,
    status: "Not submitted",
    documents: [],
  });
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  const normalizedEmail = email.trim().toLowerCase();
  await ensureSupabaseReady();

  if (isLive && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Sign-in failed.");
    const user = mapSupabaseUser(data.user);
    persistAppUser(user);
    await upsertCustomerProfile(user);
    return user;
  }

  const match = readMockUsers().find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );
  if (!match) {
    throw new Error("Invalid email or password.");
  }
  const user = mapMockRegisteredUser(match);
  persistAppUser(user);
  await ensureKycStub(user);
  return user;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  accountType: "individual" | "corporate";
  company?: string;
}

export async function signUpWithEmail(
  input: SignUpInput
): Promise<{ user: AppUser; needsEmailConfirm: boolean }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  await ensureSupabaseReady();

  if (isLive && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          phone: input.phone,
          company: input.company || null,
          account_type: input.accountType,
        },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Registration failed.");

    const user = mapSupabaseUser(data.user);
    user.name = input.fullName;
    user.phone = input.phone;
    user.company = input.company;
    user.accountType = input.accountType;

    if (data.session) {
      persistAppUser(user);
    }
    await upsertCustomerProfile(user);
    await ensureKycStub(user);

    return { user, needsEmailConfirm: !data.session };
  }

  const users = readMockUsers();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const mockUser: MockRegisteredUser = {
    id: `cust-${Math.floor(100000 + Math.random() * 900000)}`,
    email: normalizedEmail,
    password: input.password,
    name: input.fullName,
    phone: input.phone,
    company: input.company,
    accountType: input.accountType,
    role: "customer",
    created_at: new Date().toISOString(),
  };
  users.push(mockUser);
  writeMockUsers(users);

  const user = mapMockRegisteredUser(mockUser);
  persistAppUser(user);
  await ensureKycStub(user);
  return { user, needsEmailConfirm: false };
}

export async function signInWithGoogle(nextPath?: string): Promise<AppUser | void> {
  await ensureSupabaseReady();
  const redirectTo = getAuthCallbackUrlWithNext(nextPath || getLoginRedirectPath());

  if (isLive && supabase) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
    return;
  }

  const mockUser: AppUser = {
    id: `google-${Date.now()}`,
    email: "client.demo@pgruae.com",
    name: "PGR Demo Client",
    phone: "+971559688837",
    role: "customer",
    accountType: "individual",
    created_at: new Date().toISOString(),
  };
  persistAppUser(mockUser);
  await ensureKycStub(mockUser);
  return mockUser;
}

export async function signOut(): Promise<void> {
  await ensureSupabaseReady();
  if (isLive && supabase) {
    await supabase.auth.signOut();
  }
  mockDb.auth.logout();
}

export async function resolvePostAuthPath(
  preferredPath: string
): Promise<string> {
  const user = await getCurrentUser();
  if (!user) return `/login?next=${encodeURIComponent(preferredPath)}`;

  const profile = await dbService.kyc.get(user.id);
  const quotePaths = ["/request-quote", "/iraq-bullion-quote"];
  const needsKyc =
    quotePaths.some((p) => preferredPath.startsWith(p)) &&
    (profile?.status === "Not submitted" ||
      !profile?.status ||
      profile.status === "Rejected" ||
      profile.status === "More information required");

  if (needsKyc) {
    return `/kyc?next=${encodeURIComponent(preferredPath)}`;
  }
  return preferredPath;
}

/** @deprecated use getAuthCallbackUrlWithNext */
export { getAuthCallbackUrl };

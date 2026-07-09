-- PGR UAE Supabase admin + quote setup
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- 1. Admin users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_users (email, is_active)
VALUES ('almandlawy112@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_can_verify_own_admin_email" ON public.admin_users;
CREATE POLICY "authenticated_can_verify_own_admin_email"
  ON public.admin_users FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- 2. Website quote requests (form submissions from /request-quote)
CREATE TABLE IF NOT EXISTS public.website_quote_requests (
  id text PRIMARY KEY,
  inquiry_id text UNIQUE,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  company text,
  metal_interest text,
  product_category text,
  weight_preference text,
  message text,
  status text NOT NULL DEFAULT 'New Request',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.website_quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_website_quote_requests" ON public.website_quote_requests;
CREATE POLICY "anon_insert_website_quote_requests"
  ON public.website_quote_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_website_quote_requests" ON public.website_quote_requests;
CREATE POLICY "admin_select_website_quote_requests"
  ON public.website_quote_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
        AND au.is_active = true
    )
  );

-- Legacy quote_requests table left unchanged if used elsewhere

-- 3. Client accounts (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  phone text,
  company text,
  account_type text DEFAULT 'individual',
  avatar_url text,
  provider text,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customers_select_own" ON public.customers;
CREATE POLICY "customers_select_own"
  ON public.customers FOR SELECT TO authenticated
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "customers_upsert_own" ON public.customers;
CREATE POLICY "customers_upsert_own"
  ON public.customers FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. KYC profiles
CREATE TABLE IF NOT EXISTS public.kyc_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  whatsapp text,
  email text,
  country text,
  city text,
  nationality text,
  dob text,
  source_of_funds_declaration text,
  agreement_accepted boolean DEFAULT false,
  privacy_consent boolean DEFAULT false,
  status text NOT NULL DEFAULT 'Not submitted',
  documents jsonb DEFAULT '[]'::jsonb,
  uploaded_files jsonb DEFAULT '{}'::jsonb,
  kyc_type text DEFAULT 'individual',
  verified_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kyc_select_own" ON public.kyc_profiles;
CREATE POLICY "kyc_select_own"
  ON public.kyc_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "kyc_upsert_own" ON public.kyc_profiles;
CREATE POLICY "kyc_upsert_own"
  ON public.kyc_profiles FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Link website quotes to authenticated clients
ALTER TABLE public.website_quote_requests
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id);

DROP POLICY IF EXISTS "client_select_own_website_quotes" ON public.website_quote_requests;
CREATE POLICY "client_select_own_website_quotes"
  ON public.website_quote_requests FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

-- 6. Supabase Auth → URL Configuration
-- Site URL: https://www.pgruae.com
-- Redirect URLs:
--   https://www.pgruae.com/auth/callback
--   https://www.pgruae.com/admin
--   https://www.pgruae.com/dashboard
--   https://www.pgruae.com/kyc

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

-- 3. Supabase Auth → URL Configuration
-- Site URL: https://www.pgruae.com
-- Redirect URLs:
--   https://www.pgruae.com/auth/callback
--   https://www.pgruae.com/admin
--   https://www.pgruae.com

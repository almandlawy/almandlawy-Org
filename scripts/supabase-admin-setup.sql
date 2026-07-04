-- PGR UAE Supabase admin + quote setup
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- 1. Admin users directory
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
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- 2. Quote requests (used by /api/quote and admin dashboard)
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id text PRIMARY KEY,
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

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_quote_requests" ON public.quote_requests;
-- Serverless /api/quote uses anon key — allow inserts from API
DROP POLICY IF EXISTS "anon_insert_quote_requests" ON public.quote_requests;
CREATE POLICY "anon_insert_quote_requests"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_quote_requests" ON public.quote_requests;
CREATE POLICY "admin_select_quote_requests"
  ON public.quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
        AND au.is_active = true
    )
  );

-- 3. Supabase Auth URL settings (configure in Dashboard → Authentication → URL Configuration)
-- Site URL:              https://www.pgruae.com
-- Redirect URLs:
--   https://www.pgruae.com
--   https://www.pgruae.com/admin
--   https://www.pgruae.com/auth/callback
--   https://pgruae.com/auth/callback
--   https://pgruae.com/admin

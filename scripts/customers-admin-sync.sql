-- PGR UAE: customer accounts visible in admin + auto-sync from auth.users
-- Run in Supabase SQL Editor after supabase-admin-setup.sql

-- 1. Admin can read all customer profiles (browser admin panel without service-role API)
DROP POLICY IF EXISTS "admin_select_all_customers" ON public.customers;
CREATE POLICY "admin_select_all_customers"
  ON public.customers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
        AND au.is_active = true
    )
  );

-- 2. Auto-create / update customers row when auth user registers
CREATE OR REPLACE FUNCTION public.handle_auth_user_customer_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (
    id,
    email,
    full_name,
    phone,
    company,
    account_type,
    provider,
    created_at,
    last_login
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    COALESCE(NEW.created_at, now()),
    NEW.last_sign_in_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    company = COALESCE(EXCLUDED.company, customers.company),
    account_type = COALESCE(EXCLUDED.account_type, customers.account_type),
    provider = COALESCE(EXCLUDED.provider, customers.provider),
    last_login = EXCLUDED.last_login;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_customer_sync ON auth.users;
CREATE TRIGGER on_auth_user_customer_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_customer_sync();

-- 3. Backfill existing auth users into customers (one-time)
INSERT INTO public.customers (
  id,
  email,
  full_name,
  phone,
  company,
  account_type,
  provider,
  created_at,
  last_login
)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(COALESCE(u.email, ''), '@', 1)),
  u.raw_user_meta_data->>'phone',
  u.raw_user_meta_data->>'company',
  COALESCE(u.raw_user_meta_data->>'account_type', 'individual'),
  COALESCE(u.raw_app_meta_data->>'provider', 'email'),
  COALESCE(u.created_at, now()),
  u.last_sign_in_at
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
  phone = COALESCE(EXCLUDED.phone, customers.phone),
  last_login = EXCLUDED.last_login;

-- 4. Admin RPC fallback (works from browser when Vercel API is down)
CREATE OR REPLACE FUNCTION public.get_admin_customer_directory()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  company text,
  account_type text,
  provider text,
  created_at timestamptz,
  last_login timestamptz,
  kyc_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    COALESCE(k.full_name, c.full_name) AS full_name,
    c.email,
    c.phone,
    c.company,
    c.account_type,
    c.provider,
    c.created_at,
    c.last_login,
    COALESCE(k.status, 'Not submitted') AS kyc_status
  FROM public.customers c
  LEFT JOIN public.kyc_profiles k ON k.id = c.id
  WHERE EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
      AND au.is_active = true
  )
  ORDER BY c.created_at DESC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_customer_directory() TO authenticated;

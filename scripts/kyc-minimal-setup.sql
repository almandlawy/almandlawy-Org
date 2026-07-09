-- PGR UAE — minimal KYC setup (run once in Supabase SQL Editor)
-- Dashboard → SQL → New query → paste → Run

-- Client accounts
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  phone text,
  company text,
  account_type text DEFAULT 'individual',
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

-- KYC profiles
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

-- Private document storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "kyc_docs_insert_own" ON storage.objects;
CREATE POLICY "kyc_docs_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "kyc_docs_select_own" ON storage.objects;
CREATE POLICY "kyc_docs_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

NOTIFY pgrst, 'reload schema';

-- PGR UAE — repair existing kyc_profiles table (add missing columns)
-- Run in Supabase SQL Editor if the table was created with only basic fields.

ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS source_of_funds_declaration text;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS agreement_accepted boolean DEFAULT false;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS privacy_consent boolean DEFAULT false;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Not submitted';
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS uploaded_files jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS kyc_type text DEFAULT 'individual';
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.kyc_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- customers table (if missing columns)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'individual';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS provider text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Refresh PostgREST schema cache (fixes "schema cache" errors)
NOTIFY pgrst, 'reload schema';

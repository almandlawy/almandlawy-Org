-- Platform settings + public partner logos for mobile/site visitors
-- Run in Supabase SQL Editor

-- 1. Platform settings (admin APIs + partner logos persistence)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon_platform_settings" ON public.platform_settings;
CREATE POLICY "deny_anon_platform_settings"
  ON public.platform_settings FOR SELECT TO anon
  USING (false);

DROP POLICY IF EXISTS "admin_all_platform_settings" ON public.platform_settings;
CREATE POLICY "admin_all_platform_settings"
  ON public.platform_settings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
        AND au.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
        AND au.is_active = true
    )
  );

-- RPC: public partner logos (safe — no internal admin settings exposed)
CREATE OR REPLACE FUNCTION public.get_public_partner_logos()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_agg(elem ORDER BY (elem->>'display_order')::int NULLS LAST)
      FROM public.platform_settings ps,
        LATERAL jsonb_array_elements(COALESCE(ps.value->'partner_logos', '[]'::jsonb)) AS elem
      WHERE ps.key = 'pgr_admin_settings'
        AND COALESCE((elem->>'public_display_enabled')::boolean, true) = true
        AND length(trim(COALESCE(elem->>'logo_url', ''))) > 0
    ),
    '[]'::jsonb
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_public_partner_logos() TO anon, authenticated;

-- 2. Public CDN bucket for partners.json (mobile-safe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  1048576,
  ARRAY['application/json', 'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public_read_site_assets" ON storage.objects;
CREATE POLICY "public_read_site_assets"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "admin_upload_site_assets" ON storage.objects;
CREATE POLICY "admin_upload_site_assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
        AND au.is_active = true
    )
  );

DROP POLICY IF EXISTS "admin_update_site_assets" ON storage.objects;
CREATE POLICY "admin_update_site_assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
        AND au.is_active = true
    )
  );

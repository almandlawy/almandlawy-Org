-- PGR UAE — repair website_quote_requests for client dashboard visibility
-- Run in Supabase SQL Editor if quotes submit but do not appear on /dashboard.

ALTER TABLE public.website_quote_requests ADD COLUMN IF NOT EXISTS inquiry_id text;
ALTER TABLE public.website_quote_requests ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id);

-- Link past submissions to auth users by email
UPDATE public.website_quote_requests w
SET customer_id = u.id
FROM auth.users u
WHERE w.customer_id IS NULL
  AND w.email IS NOT NULL
  AND lower(w.email) = lower(u.email);

-- Clients can read their own rows by account id OR login email
DROP POLICY IF EXISTS "client_select_own_website_quotes" ON public.website_quote_requests;
CREATE POLICY "client_select_own_website_quotes"
  ON public.website_quote_requests FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );

-- Ensure insert still allowed for website form
DROP POLICY IF EXISTS "anon_insert_website_quote_requests" ON public.website_quote_requests;
CREATE POLICY "anon_insert_website_quote_requests"
  ON public.website_quote_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

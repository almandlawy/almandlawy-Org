-- Payment proof storage bucket + orders columns
-- Run in Supabase SQL Editor

-- Optional columns on orders (safe if already exist)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_storage_path TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_size TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at TIMESTAMPTZ;

-- Storage bucket for client payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users upload to their own folder
CREATE POLICY IF NOT EXISTS "payment_proofs_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "payment_proofs_select_own"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role / admin reads all proofs (admin panel signed URLs use service role via API if needed)

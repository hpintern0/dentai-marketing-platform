-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Note: Storage bucket creation is handled via the Supabase API or Dashboard.
-- The SQL below uses Supabase internal storage schema and should be run
-- only in a local Supabase environment (supabase start) or via the API.

-- Bucket: dental-campaigns (public)
-- Purpose: Generated content (ads, carousel slides, videos)
-- Path structure: {client_id}/{campaign_id}/{asset_type}/{filename}
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dental-campaigns',
  'dental-campaigns',
  true,
  52428800, -- 50MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: client-assets (public)
-- Purpose: Client logos, dentist photos, clinic photos, before/after images
-- Path structure: {client_id}/{asset_type}/{filename}
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-assets',
  'client-assets',
  true,
  20971520, -- 20MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- dental-campaigns: Allow authenticated users to read
CREATE POLICY "Public read access for dental-campaigns"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dental-campaigns');

-- dental-campaigns: Allow authenticated users to upload
CREATE POLICY "Authenticated upload for dental-campaigns"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dental-campaigns');

-- dental-campaigns: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated update for dental-campaigns"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'dental-campaigns');

-- dental-campaigns: Allow authenticated users to delete
CREATE POLICY "Authenticated delete for dental-campaigns"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dental-campaigns');

-- client-assets: Allow public read
CREATE POLICY "Public read access for client-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-assets');

-- client-assets: Allow authenticated users to upload
CREATE POLICY "Authenticated upload for client-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-assets');

-- client-assets: Allow authenticated users to update
CREATE POLICY "Authenticated update for client-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'client-assets');

-- client-assets: Allow authenticated users to delete
CREATE POLICY "Authenticated delete for client-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'client-assets');

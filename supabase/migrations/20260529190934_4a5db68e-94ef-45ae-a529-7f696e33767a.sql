-- Create public storage bucket for gym images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gym-images', 'gym-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read gym images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gym-images');

-- Authenticated owners can upload to their own folder (first path segment = user id)
CREATE POLICY "Owners upload gym images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gym-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners update gym images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gym-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners delete gym images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gym-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
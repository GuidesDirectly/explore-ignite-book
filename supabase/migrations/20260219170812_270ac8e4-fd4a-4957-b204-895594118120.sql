-- Fix 1: Create a public view for reviews that excludes reviewer_email
CREATE OR REPLACE VIEW public.reviews_public AS
SELECT id, reviewer_name, rating, comment, created_at, hidden, guide_user_id, booking_id, translations
FROM public.reviews
WHERE hidden = false;

GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;

-- Fix 2: Add public SELECT policy for guide-photos bucket so photos load correctly
CREATE POLICY "Public can view guide photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'guide-photos');

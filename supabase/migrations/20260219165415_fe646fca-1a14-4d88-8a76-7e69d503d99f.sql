
-- Fix 1: Remove overly permissive UPDATE policy on tour_plans (service role key handles updates via edge function)
DROP POLICY IF EXISTS "Anyone can update tour plans" ON public.tour_plans;

-- Fix 2: Replace open "Anyone can read reviews" with filtered SELECT (only non-hidden + no reviewer_email exposure)
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;

CREATE POLICY "Public can view non-hidden reviews"
ON public.reviews FOR SELECT
USING (hidden = false);

-- Fix 3: Restrict bookings INSERT so guide_user_id must match the authenticated user (guides create their own bookings)
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;

CREATE POLICY "Guides can create own bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = guide_user_id);

-- Fix 4: Storage RLS for guide-photos bucket (owners upload, public read)
CREATE POLICY "Guide owners can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'guide-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Guide owners can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'guide-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Guide owners can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'guide-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix 5: Storage RLS for guide-licenses bucket (private — owners upload, admins read only)
CREATE POLICY "Guide owners can upload licenses"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'guide-licenses'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view guide licenses"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'guide-licenses'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Guide owners can view own licenses"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'guide-licenses'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

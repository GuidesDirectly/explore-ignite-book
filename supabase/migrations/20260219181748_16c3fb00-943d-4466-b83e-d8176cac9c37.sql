-- Remove the public SELECT policy that exposes reviewer_email
DROP POLICY IF EXISTS "Public can view non-hidden reviews" ON public.reviews;

-- Add guide-scoped SELECT so guides can see their own reviews
CREATE POLICY "Guides can view own reviews"
ON public.reviews FOR SELECT
USING (auth.uid() = guide_user_id);
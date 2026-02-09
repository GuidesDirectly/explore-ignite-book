
-- Drop the existing insert policy that requires auth
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;

-- Allow anyone to submit a review (public page, no login needed)
CREATE POLICY "Anyone can submit reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

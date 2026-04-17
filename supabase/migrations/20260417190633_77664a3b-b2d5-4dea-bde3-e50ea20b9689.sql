-- Switch reviews_public view to security_invoker = true to resolve linter
DROP VIEW IF EXISTS public.reviews_public CASCADE;

CREATE VIEW public.reviews_public
WITH (security_invoker = true) AS
SELECT id, guide_user_id, reviewer_name, rating, comment, hidden, created_at, translations
FROM public.reviews
WHERE hidden = false;

GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Add public SELECT on reviews so the security_invoker view returns rows for anon
-- (reviewer_email column SELECT is already revoked from anon/authenticated)
DROP POLICY IF EXISTS "Public can read non-hidden reviews" ON public.reviews;
CREATE POLICY "Public can read non-hidden reviews"
ON public.reviews FOR SELECT
TO anon, authenticated
USING (hidden = false);
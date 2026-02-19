-- Fix SECURITY DEFINER view by recreating as SECURITY INVOKER
DROP VIEW IF EXISTS public.reviews_public;

CREATE VIEW public.reviews_public
WITH (security_invoker = true)
AS
SELECT id, reviewer_name, rating, comment, created_at, hidden, guide_user_id, booking_id, translations
FROM public.reviews
WHERE hidden = false;

GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;

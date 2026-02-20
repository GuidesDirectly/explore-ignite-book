
-- Create a view for guides to see their own reviews WITHOUT reviewer_email
DROP VIEW IF EXISTS public.reviews_guide;
CREATE VIEW public.reviews_guide
WITH (security_invoker = true)
AS
SELECT
  id,
  guide_user_id,
  reviewer_name,
  rating,
  comment,
  booking_id,
  hidden,
  created_at,
  translations
FROM public.reviews;

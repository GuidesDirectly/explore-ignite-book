DROP VIEW IF EXISTS public.guide_profiles_public;

CREATE VIEW public.guide_profiles_public
WITH (security_invoker = false) AS
SELECT
  id,
  user_id,
  service_areas,
  created_at,
  translations,
  is_spotlight,
  activation_status,
  jsonb_build_object(
    'firstName',       form_data ->> 'firstName',
    'lastName',        form_data ->> 'lastName',
    'biography',       form_data ->> 'biography',
    'languages',       form_data -> 'languages',
    'specializations', form_data -> 'specializations',
    'tourTypes',       form_data -> 'tourTypes',
    'targetAudience',  form_data -> 'targetAudience'
  ) AS form_data
FROM public.guide_profiles
WHERE status = 'approved' AND activation_status = 'active';

GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;
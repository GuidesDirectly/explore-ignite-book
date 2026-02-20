
DROP VIEW IF EXISTS public.guide_profiles_public;

CREATE VIEW public.guide_profiles_public
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  service_areas,
  status,
  created_at,
  translations,
  jsonb_build_object(
    'firstName', form_data->'firstName',
    'lastName', form_data->'lastName',
    'biography', form_data->'biography',
    'languages', form_data->'languages',
    'specializations', form_data->'specializations',
    'tourTypes', form_data->'tourTypes'
  ) AS form_data
FROM public.guide_profiles
WHERE status = 'approved';

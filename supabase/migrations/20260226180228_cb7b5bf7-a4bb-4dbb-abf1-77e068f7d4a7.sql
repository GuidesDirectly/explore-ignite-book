CREATE OR REPLACE VIEW public.guide_profiles_public
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
    'firstName', form_data -> 'firstName',
    'lastName', form_data -> 'lastName',
    'biography', form_data -> 'biography',
    'languages', form_data -> 'languages',
    'specializations', form_data -> 'specializations',
    'tourTypes', form_data -> 'tourTypes',
    'targetAudience', form_data -> 'targetAudience'
  ) AS form_data
FROM guide_profiles
WHERE status = 'approved';
-- Re-create guide_profiles_public with security_invoker = false
-- so the view runs with the definer's privileges and bypasses the
-- caller's RLS, matching the manual hotfix applied in SQL Editor.
DROP VIEW IF EXISTS public.guide_profiles_public;

CREATE VIEW public.guide_profiles_public
WITH (security_invoker = false) AS
SELECT
  g.id,
  g.user_id,
  g.service_areas,
  g.status,
  g.created_at,
  g.translations,
  g.is_spotlight,
  public.get_public_guide_form_data(g.form_data) AS form_data
FROM public.guide_profiles g
WHERE g.status = 'approved'
  AND g.activation_status = 'active';

GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;
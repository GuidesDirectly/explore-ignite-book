
-- Create a public view for guide_profiles that strips sensitive PII from form_data
CREATE OR REPLACE VIEW public.guide_profiles_public AS
SELECT
  id,
  user_id,
  service_areas,
  status,
  translations,
  created_at,
  form_data - '{email,phone,address,insuranceCompanyName,insurancePolicyNumber,licenseNumber}'::text[] AS form_data
FROM public.guide_profiles
WHERE status = 'approved';

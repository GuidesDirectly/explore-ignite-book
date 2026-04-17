-- Revoke form_data column entirely from anon/authenticated
REVOKE SELECT (form_data) ON public.guide_profiles FROM anon, authenticated;

-- Create a SECURITY DEFINER function that returns the sanitized JSON
CREATE OR REPLACE FUNCTION public.get_public_guide_form_data(_form_data jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'firstName',       _form_data -> 'firstName',
    'lastName',        _form_data -> 'lastName',
    'biography',       _form_data -> 'biography',
    'languages',       _form_data -> 'languages',
    'specializations', _form_data -> 'specializations',
    'tourTypes',       _form_data -> 'tourTypes',
    'targetAudience',  _form_data -> 'targetAudience'
  )
$$;

GRANT EXECUTE ON FUNCTION public.get_public_guide_form_data(jsonb) TO anon, authenticated;

-- Recreate the view to use the SECURITY DEFINER function for form_data extraction
DROP VIEW IF EXISTS public.guide_profiles_public;

-- Use SECURITY DEFINER on a wrapper function that returns the full safe row set
CREATE OR REPLACE FUNCTION public.list_public_guide_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  service_areas text[],
  status text,
  created_at timestamptz,
  translations jsonb,
  form_data jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    g.id,
    g.user_id,
    g.service_areas,
    g.status,
    g.created_at,
    g.translations,
    public.get_public_guide_form_data(g.form_data) AS form_data
  FROM public.guide_profiles g
  WHERE g.status = 'approved'
    AND g.activation_status = 'active';
$$;

GRANT EXECUTE ON FUNCTION public.list_public_guide_profiles() TO anon, authenticated;

-- View as security_invoker wrapper around the SECURITY DEFINER function
CREATE VIEW public.guide_profiles_public
WITH (security_invoker = true) AS
SELECT * FROM public.list_public_guide_profiles();

GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;
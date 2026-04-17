-- Recreate guide_profiles_public view with security_invoker=on so RLS of caller applies
-- and ensure anon/authenticated have SELECT on the view.

DROP VIEW IF EXISTS public.guide_profiles_public CASCADE;

CREATE VIEW public.guide_profiles_public
WITH (security_invoker = on) AS
SELECT
  gp.id,
  gp.user_id,
  public.get_public_guide_form_data(gp.form_data) AS form_data,
  gp.service_areas,
  gp.translations,
  gp.status,
  gp.created_at,
  gp.is_spotlight,
  gp.subscription_plan_id
FROM public.guide_profiles gp
WHERE gp.status = 'approved';

GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;

-- Ensure base table has a policy that allows anon/authenticated to read approved rows
-- (security_invoker means the view's SELECT runs under caller's permissions on base table).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guide_profiles'
      AND policyname = 'public_can_view_approved_profiles_via_view'
  ) THEN
    CREATE POLICY "public_can_view_approved_profiles_via_view"
      ON public.guide_profiles
      FOR SELECT
      TO anon, authenticated
      USING (status = 'approved');
  END IF;
END $$;
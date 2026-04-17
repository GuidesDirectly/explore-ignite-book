DROP POLICY IF EXISTS anon_can_view_approved_guides ON public.guide_profiles;
DROP POLICY IF EXISTS authenticated_can_view_approved_guides ON public.guide_profiles;

CREATE POLICY anon_can_view_approved_guides
  ON public.guide_profiles
  FOR SELECT
  TO anon
  USING (status = 'approved' AND activation_status = 'active');

CREATE POLICY authenticated_can_view_approved_guides
  ON public.guide_profiles
  FOR SELECT
  TO authenticated
  USING (status = 'approved' AND activation_status = 'active');
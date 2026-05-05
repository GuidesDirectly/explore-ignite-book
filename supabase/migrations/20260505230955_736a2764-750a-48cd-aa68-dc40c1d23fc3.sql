
-- 1. Fix reviewer_email public exposure: revoke column-level SELECT for anon/authenticated on reviews
REVOKE SELECT (reviewer_email) ON public.reviews FROM anon, authenticated;

-- 2. Convert SECURITY DEFINER views to SECURITY INVOKER (Postgres 15+)
ALTER VIEW public.reviews_public SET (security_invoker = true);
ALTER VIEW public.reviews_guide SET (security_invoker = true);
ALTER VIEW public.guide_profiles_public SET (security_invoker = true);

-- 3. Harden user_roles: add restrictive policy ensuring only admins can ever insert/update/delete
CREATE POLICY "Restrict role writes to admins"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Allow tour_plan owners to DELETE their own submission via update_token (within 1h)
CREATE POLICY "Token-validated plan deletes"
ON public.tour_plans
FOR DELETE
TO public
USING (
  created_at > (now() - interval '1 hour')
  AND update_token IS NOT NULL
  AND update_token = ((current_setting('request.headers'::text))::json ->> 'x-update-token'::text)
);

-- And SELECT via token so submitters can verify their own data
CREATE POLICY "Token-validated plan reads"
ON public.tour_plans
FOR SELECT
TO public
USING (
  created_at > (now() - interval '1 hour')
  AND update_token IS NOT NULL
  AND update_token = ((current_setting('request.headers'::text))::json ->> 'x-update-token'::text)
);

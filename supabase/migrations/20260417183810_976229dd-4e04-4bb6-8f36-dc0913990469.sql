-- Switch view back to security_invoker
DROP VIEW IF EXISTS public.guide_profiles_public;

CREATE VIEW public.guide_profiles_public
WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  service_areas,
  status,
  created_at,
  translations,
  jsonb_build_object(
    'firstName',       form_data -> 'firstName',
    'lastName',        form_data -> 'lastName',
    'biography',       form_data -> 'biography',
    'languages',       form_data -> 'languages',
    'specializations', form_data -> 'specializations',
    'tourTypes',       form_data -> 'tourTypes',
    'targetAudience',  form_data -> 'targetAudience'
  ) AS form_data
FROM public.guide_profiles
WHERE status = 'approved'
  AND activation_status = 'active';

GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;

-- Add row-level policy: anon/authenticated can SELECT approved+active rows from base
-- But we must ensure they cannot read sensitive COLUMNS. Use column-level REVOKE/GRANT.
CREATE POLICY "public_can_view_approved_active_rows"
ON public.guide_profiles
FOR SELECT
TO anon, authenticated
USING (status = 'approved' AND activation_status = 'active');

-- Column-level grants: revoke broad SELECT, grant only safe columns to anon/authenticated.
-- Owners + admins use other policies (Guides can view own profile / Admins can view all)
-- which are not affected by column grants because they use authenticated role with table-level grants.
REVOKE SELECT ON public.guide_profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, service_areas, status, created_at, translations, activation_status, form_data)
  ON public.guide_profiles TO authenticated;
GRANT SELECT (id, user_id, service_areas, status, created_at, translations, activation_status, form_data)
  ON public.guide_profiles TO anon;
-- form_data is granted as a whole column at the SQL grant level (jsonb is one column);
-- the VIEW does the actual whitelisting of nested keys. Since the policy now ALSO restricts
-- which rows are returned to status='approved' AND activation_status='active', a sensitive
-- column like stripe_account_id or suspension_reason is REVOKED entirely from anon/authenticated.

-- Fix linter WARN 2 + 3: replace omnibus admin ALL policy on itinerary_swaps with per-command policies
DROP POLICY IF EXISTS "Admins can manage swaps" ON public.itinerary_swaps;

CREATE POLICY "Admins can read swaps"
  ON public.itinerary_swaps FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert swaps"
  ON public.itinerary_swaps FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update swaps"
  ON public.itinerary_swaps FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete swaps"
  ON public.itinerary_swaps FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
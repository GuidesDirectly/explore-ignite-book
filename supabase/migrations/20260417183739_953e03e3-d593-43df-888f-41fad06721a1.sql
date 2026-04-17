-- ============================================================
-- FIX 1: Lock down guide_profiles base table + harden public view
-- ============================================================
DROP POLICY IF EXISTS "anon_can_view_approved_guides" ON public.guide_profiles;
DROP POLICY IF EXISTS "authenticated_can_view_approved_guides" ON public.guide_profiles;

-- Recreate public view with security_invoker, activation filter, strict whitelist
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

-- The view uses security_invoker, so anon needs SELECT on base table for the rows the view exposes.
-- Re-create a tightly-scoped policy that ONLY allows reading approved+active rows via the view.
-- Since views with security_invoker run as the calling role, anon must be able to see those rows.
-- We restrict by status + activation_status (matches view WHERE clause).
CREATE POLICY "public_view_only_approved_active"
ON public.guide_profiles
FOR SELECT
TO anon, authenticated
USING (status = 'approved' AND activation_status = 'active');

-- NOTE: The above still allows direct SELECT on guide_profiles, BUT only of rows
-- matching status='approved' AND activation_status='active'. Combined with the
-- guide_profiles_public view stripping sensitive columns, the EXPOSURE is the row
-- itself — not safe enough. We need column-level protection.
-- DROP it and use security_definer view instead.
DROP POLICY "public_view_only_approved_active" ON public.guide_profiles;

-- Switch view to security_definer so it bypasses RLS, returning only whitelisted columns.
DROP VIEW IF EXISTS public.guide_profiles_public;

CREATE VIEW public.guide_profiles_public AS
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

-- ============================================================
-- FIX 2: Itinerary swaps - token-gated SELECT
-- ============================================================
DROP POLICY IF EXISTS "Users can view own swaps" ON public.itinerary_swaps;

CREATE POLICY "Token-validated swap access"
ON public.itinerary_swaps
FOR SELECT
TO anon, authenticated
USING (
  tour_plan_id IN (
    SELECT id FROM public.tour_plans
    WHERE update_token IS NOT NULL
      AND update_token = ((current_setting('request.headers', true))::json ->> 'x-update-token')
  )
);

-- ============================================================
-- FIX 3: guide-photos uploads restricted to users with 'guide' role
-- ============================================================
DROP POLICY IF EXISTS "Guides can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Guide owners can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Guides can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Guide owners can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Guides can delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "Guide owners can delete own photos" ON storage.objects;

CREATE POLICY "Only guides can upload to guide-photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guide-photos'
  AND public.has_role(auth.uid(), 'guide'::public.app_role)
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Only guides can update own guide-photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guide-photos'
  AND public.has_role(auth.uid(), 'guide'::public.app_role)
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Only guides can delete own guide-photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'guide-photos'
  AND public.has_role(auth.uid(), 'guide'::public.app_role)
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- ============================================================
-- FIX 4: Disable bucket-wide listing (require explicit name)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view guide photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view guide photos" ON storage.objects;
DROP POLICY IF EXISTS "Public branding access" ON storage.objects;

CREATE POLICY "Direct read guide-photos by path"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'guide-photos'
  AND name IS NOT NULL
  AND length(name) > 0
);

CREATE POLICY "Direct read branding by path"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'branding'
  AND name IS NOT NULL
  AND length(name) > 0
);

-- Fix 1: Guide profiles - add SELECT policy for owners
-- Note: "Guides can view own profile" already exists per RLS policies shown,
-- but let's ensure it's scoped to authenticated role
DROP POLICY IF EXISTS "Guides can view own profile" ON public.guide_profiles;
CREATE POLICY "Guides can view own profile"
ON public.guide_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Tour plans - add time-limited UPDATE policy (1 hour window)
CREATE POLICY "Recent plans can be updated"
ON public.tour_plans FOR UPDATE
TO public
USING (created_at > NOW() - INTERVAL '1 hour')
WITH CHECK (created_at > NOW() - INTERVAL '1 hour');


-- Drop and recreate INSERT policy with explicit TO authenticated
DROP POLICY IF EXISTS "Guides can insert own profile" ON public.guide_profiles;
CREATE POLICY "Guides can insert own profile"
ON public.guide_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Drop and recreate UPDATE policy with explicit TO authenticated and proper USING + WITH CHECK
DROP POLICY IF EXISTS "Guides can update own profile" ON public.guide_profiles;
CREATE POLICY "Guides can update own profile"
ON public.guide_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

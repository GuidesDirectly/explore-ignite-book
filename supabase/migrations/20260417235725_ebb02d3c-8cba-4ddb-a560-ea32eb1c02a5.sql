GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guide_profiles'
      AND policyname = 'Public can view approved active guides'
  ) THEN
    CREATE POLICY "Public can view approved active guides"
      ON public.guide_profiles
      FOR SELECT
      TO anon, authenticated
      USING (status = 'approved' AND activation_status = 'active');
  END IF;
END $$;
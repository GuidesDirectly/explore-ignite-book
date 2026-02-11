-- Add translations JSONB column to reviews
ALTER TABLE public.reviews
ADD COLUMN translations jsonb DEFAULT '{}'::jsonb;

-- Add translations JSONB column to guide_profiles
ALTER TABLE public.guide_profiles
ADD COLUMN translations jsonb DEFAULT '{}'::jsonb;

-- Allow anyone to read tour_plans (needed for the translate function to update)
-- The translate function will use the service role key so no extra policies needed
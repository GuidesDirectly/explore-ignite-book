
-- Add service_areas to guide_profiles form_data isn't ideal for filtering,
-- so add a proper column for service areas
ALTER TABLE public.guide_profiles
ADD COLUMN service_areas TEXT[] DEFAULT '{}';

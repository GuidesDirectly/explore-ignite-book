-- 1. Add new columns to tours
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS min_group_size integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiry_count integer NOT NULL DEFAULT 0;

-- 2. Atomic counter RPC functions
CREATE OR REPLACE FUNCTION public.increment_tour_view(_tour_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.tours SET view_count = view_count + 1 WHERE id = _tour_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_tour_inquiry(_tour_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.tours SET inquiry_count = inquiry_count + 1 WHERE id = _tour_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_tour_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tour_inquiry(uuid) TO anon, authenticated;

-- 3. App setting: required tour photos for publish
INSERT INTO public.app_settings (key, value, category, description)
VALUES ('required_tour_photos', '3'::jsonb, 'tours', 'Minimum photos required before a tour can be published')
ON CONFLICT (key) DO NOTHING;

-- 4. Allow public to read this setting
-- (already covered by existing "Public can read safe settings" policy if key is in the array — extending below)
DROP POLICY IF EXISTS "Public can read safe settings" ON public.app_settings;
CREATE POLICY "Public can read safe settings"
ON public.app_settings
FOR SELECT
TO anon, authenticated
USING (key = ANY (ARRAY[
  'app_name','default_currency','default_language','min_tour_price','max_tour_price',
  'booking_enabled','group_tours_enabled','reviews_enabled',
  'founding_guide_limit','founding_guide_current_count','founding_guide_free_until','founding_guide_locked_price',
  'required_tour_photos'
]));
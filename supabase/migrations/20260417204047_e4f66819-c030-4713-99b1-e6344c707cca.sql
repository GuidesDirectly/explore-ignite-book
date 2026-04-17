-- Atomic increment for founding_guide_current_count in app_settings.
-- Returns the new count after increment. Used by guide-subscribe edge function
-- when assigning a new guide to the founding plan.
CREATE OR REPLACE FUNCTION public.increment_founding_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_val integer;
  limit_val integer;
  new_val integer;
BEGIN
  -- Lock the row, read current count and limit
  SELECT (value #>> '{}')::integer INTO current_val
    FROM public.app_settings
    WHERE key = 'founding_guide_current_count'
    FOR UPDATE;

  SELECT (value #>> '{}')::integer INTO limit_val
    FROM public.app_settings
    WHERE key = 'founding_guide_limit';

  IF current_val IS NULL OR limit_val IS NULL THEN
    RAISE EXCEPTION 'founding_guide_current_count or founding_guide_limit setting missing';
  END IF;

  IF current_val >= limit_val THEN
    RAISE EXCEPTION 'founding_guide_limit_reached';
  END IF;

  new_val := current_val + 1;

  UPDATE public.app_settings
    SET value = to_jsonb(new_val), updated_at = now()
    WHERE key = 'founding_guide_current_count';

  RETURN new_val;
END;
$$;

-- Allow public read of the founding settings via the existing
-- "Public can read safe settings" policy by adding the founding keys to it.
DROP POLICY IF EXISTS "Public can read safe settings" ON public.app_settings;
CREATE POLICY "Public can read safe settings"
  ON public.app_settings
  FOR SELECT
  TO anon, authenticated
  USING (key = ANY (ARRAY[
    'app_name',
    'default_currency',
    'default_language',
    'min_tour_price',
    'max_tour_price',
    'booking_enabled',
    'group_tours_enabled',
    'reviews_enabled',
    'founding_guide_limit',
    'founding_guide_current_count',
    'founding_guide_free_until',
    'founding_guide_locked_price'
  ]));
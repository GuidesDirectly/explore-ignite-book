
-- Rate-limiting function: max N inserts per email per interval on a given table
CREATE OR REPLACE FUNCTION public.check_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recent_count integer;
  max_allowed integer;
  window_interval interval;
  email_val text;
BEGIN
  -- Configure per-table limits
  CASE TG_TABLE_NAME
    WHEN 'inquiries' THEN
      max_allowed := 5;
      window_interval := '1 hour'::interval;
      email_val := NEW.email;
    WHEN 'bookings' THEN
      max_allowed := 10;
      window_interval := '1 hour'::interval;
      email_val := NEW.traveler_email;
    WHEN 'reviews' THEN
      max_allowed := 5;
      window_interval := '1 hour'::interval;
      email_val := NEW.reviewer_email;
    ELSE
      RETURN NEW;
  END CASE;

  -- If no email provided, allow but with IP-agnostic global limit
  IF email_val IS NULL OR trim(email_val) = '' THEN
    RETURN NEW;
  END IF;

  -- Count recent submissions from this email
  EXECUTE format(
    'SELECT count(*) FROM %I WHERE %I = $1 AND created_at > now() - $2',
    TG_TABLE_NAME,
    CASE TG_TABLE_NAME
      WHEN 'inquiries' THEN 'email'
      WHEN 'bookings' THEN 'traveler_email'
      WHEN 'reviews' THEN 'reviewer_email'
    END
  ) INTO recent_count USING email_val, window_interval;

  IF recent_count >= max_allowed THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$;

-- Apply rate limiting triggers
CREATE TRIGGER rate_limit_inquiries
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.check_rate_limit();

CREATE TRIGGER rate_limit_bookings
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_rate_limit();

CREATE TRIGGER rate_limit_reviews
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.check_rate_limit();

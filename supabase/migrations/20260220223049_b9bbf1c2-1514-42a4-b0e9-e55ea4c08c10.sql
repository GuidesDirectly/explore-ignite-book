
-- Server-side input validation triggers for bookings, inquiries, and reviews
-- Using triggers instead of CHECK constraints (per Supabase guidelines)

-- ==================== BOOKINGS ====================
CREATE OR REPLACE FUNCTION public.validate_booking_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- traveler_name: required, max 100 chars
  IF NEW.traveler_name IS NULL OR trim(NEW.traveler_name) = '' THEN
    RAISE EXCEPTION 'traveler_name is required';
  END IF;
  IF length(NEW.traveler_name) > 100 THEN
    RAISE EXCEPTION 'traveler_name must be 100 characters or fewer';
  END IF;

  -- traveler_email: optional but must be valid format if provided
  IF NEW.traveler_email IS NOT NULL AND NEW.traveler_email != '' THEN
    IF NEW.traveler_email !~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'traveler_email must be a valid email address';
    END IF;
    IF length(NEW.traveler_email) > 255 THEN
      RAISE EXCEPTION 'traveler_email must be 255 characters or fewer';
    END IF;
  END IF;

  -- tour_type: required, max 200 chars
  IF NEW.tour_type IS NULL OR trim(NEW.tour_type) = '' THEN
    RAISE EXCEPTION 'tour_type is required';
  END IF;
  IF length(NEW.tour_type) > 200 THEN
    RAISE EXCEPTION 'tour_type must be 200 characters or fewer';
  END IF;

  -- time: required
  IF NEW.time IS NULL OR trim(NEW.time) = '' THEN
    RAISE EXCEPTION 'time is required';
  END IF;

  -- group_size: must be between 1 and 200
  IF NEW.group_size IS NOT NULL AND (NEW.group_size < 1 OR NEW.group_size > 200) THEN
    RAISE EXCEPTION 'group_size must be between 1 and 200';
  END IF;

  -- location: max 200 chars
  IF NEW.location IS NOT NULL AND length(NEW.location) > 200 THEN
    RAISE EXCEPTION 'location must be 200 characters or fewer';
  END IF;

  -- notes: max 1000 chars
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 1000 THEN
    RAISE EXCEPTION 'notes must be 1000 characters or fewer';
  END IF;

  -- Sanitize: trim whitespace from string fields
  NEW.traveler_name := trim(NEW.traveler_name);
  IF NEW.traveler_email IS NOT NULL THEN
    NEW.traveler_email := trim(NEW.traveler_email);
  END IF;
  NEW.tour_type := trim(NEW.tour_type);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_booking_input ON public.bookings;
CREATE TRIGGER trg_validate_booking_input
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_input();

-- ==================== INQUIRIES ====================
CREATE OR REPLACE FUNCTION public.validate_inquiry_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- name: required, max 100 chars
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'name is required';
  END IF;
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'name must be 100 characters or fewer';
  END IF;

  -- email: required, valid format, max 255 chars
  IF NEW.email IS NULL OR trim(NEW.email) = '' THEN
    RAISE EXCEPTION 'email is required';
  END IF;
  IF NEW.email !~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'email must be a valid email address';
  END IF;
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'email must be 255 characters or fewer';
  END IF;

  -- destination: required
  IF NEW.destination IS NULL OR trim(NEW.destination) = '' THEN
    RAISE EXCEPTION 'destination is required';
  END IF;
  IF length(NEW.destination) > 500 THEN
    RAISE EXCEPTION 'destination must be 500 characters or fewer';
  END IF;

  -- phone: max 30 chars
  IF NEW.phone IS NOT NULL AND length(NEW.phone) > 30 THEN
    RAISE EXCEPTION 'phone must be 30 characters or fewer';
  END IF;

  -- group_size: max 20 chars (stored as text)
  IF NEW.group_size IS NOT NULL AND length(NEW.group_size) > 20 THEN
    RAISE EXCEPTION 'group_size value is invalid';
  END IF;

  -- message: max 2000 chars
  IF NEW.message IS NOT NULL AND length(NEW.message) > 2000 THEN
    RAISE EXCEPTION 'message must be 2000 characters or fewer';
  END IF;

  -- Sanitize: trim whitespace
  NEW.name := trim(NEW.name);
  NEW.email := trim(NEW.email);
  NEW.destination := trim(NEW.destination);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_inquiry_input ON public.inquiries;
CREATE TRIGGER trg_validate_inquiry_input
  BEFORE INSERT OR UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.validate_inquiry_input();

-- ==================== REVIEWS ====================
CREATE OR REPLACE FUNCTION public.validate_review_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- reviewer_name: required, max 100 chars
  IF NEW.reviewer_name IS NULL OR trim(NEW.reviewer_name) = '' THEN
    RAISE EXCEPTION 'reviewer_name is required';
  END IF;
  IF length(NEW.reviewer_name) > 100 THEN
    RAISE EXCEPTION 'reviewer_name must be 100 characters or fewer';
  END IF;

  -- reviewer_email: optional but must be valid format if provided
  IF NEW.reviewer_email IS NOT NULL AND NEW.reviewer_email != '' THEN
    IF NEW.reviewer_email !~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'reviewer_email must be a valid email address';
    END IF;
    IF length(NEW.reviewer_email) > 255 THEN
      RAISE EXCEPTION 'reviewer_email must be 255 characters or fewer';
    END IF;
  END IF;

  -- rating: must be between 1 and 10
  IF NEW.rating IS NULL OR NEW.rating < 1 OR NEW.rating > 10 THEN
    RAISE EXCEPTION 'rating must be between 1 and 10';
  END IF;

  -- comment: max 2000 chars
  IF NEW.comment IS NOT NULL AND length(NEW.comment) > 2000 THEN
    RAISE EXCEPTION 'comment must be 2000 characters or fewer';
  END IF;

  -- Sanitize: trim whitespace
  NEW.reviewer_name := trim(NEW.reviewer_name);
  IF NEW.reviewer_email IS NOT NULL THEN
    NEW.reviewer_email := trim(NEW.reviewer_email);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_review_input ON public.reviews;
CREATE TRIGGER trg_validate_review_input
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review_input();

-- Add unique constraint on app_settings.key (required for ON CONFLICT)
ALTER TABLE public.app_settings
  DROP CONSTRAINT IF EXISTS app_settings_key_key;
ALTER TABLE public.app_settings
  ADD CONSTRAINT app_settings_key_key UNIQUE (key);

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

INSERT INTO public.app_settings (key, category, value, description)
VALUES (
  'send_notification_url',
  'system',
  '"https://oegfwomloaihzwomwypx.supabase.co/functions/v1/send-notification"'::jsonb,
  'URL of the send-notification Edge Function used by DB triggers'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.app_settings (key, category, value, description)
VALUES (
  'send_notification_anon_key',
  'system',
  to_jsonb('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ2Z3b21sb2FpaHp3b213eXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM4NTAsImV4cCI6MjA4NjA3OTg1MH0.ZRn_9BDZZM5uTdqAxaeBcwckzjqXe7HQXUN8OZSbLNM'::text),
  'Anon key for invoking send-notification from DB triggers'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

CREATE OR REPLACE FUNCTION public.notify_email(event_type text, payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  fn_url text;
  anon_key text;
BEGIN
  SELECT value #>> '{}' INTO fn_url FROM public.app_settings WHERE key = 'send_notification_url';
  SELECT value #>> '{}' INTO anon_key FROM public.app_settings WHERE key = 'send_notification_anon_key';
  IF fn_url IS NULL OR anon_key IS NULL THEN
    RAISE WARNING 'notify_email: missing settings';
    RETURN;
  END IF;
  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', anon_key,
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('type', event_type, 'data', payload)
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_email failed for %: %', event_type, SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_guide_profile_inserted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  guide_email text;
  guide_first text;
  guide_last text;
BEGIN
  IF NEW.status NOT IN ('pending', 'submitted') THEN
    RETURN NEW;
  END IF;
  guide_first := COALESCE(NEW.form_data->>'firstName', '');
  guide_last  := COALESCE(NEW.form_data->>'lastName', '');
  guide_email := NEW.form_data->>'email';
  IF guide_email IS NULL THEN
    SELECT email INTO guide_email FROM auth.users WHERE id = NEW.user_id;
  END IF;
  IF guide_email IS NOT NULL THEN
    PERFORM public.notify_email('guide_application', jsonb_build_object(
      'guideName', trim(guide_first || ' ' || guide_last),
      'guideEmail', guide_email
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guide_profile_inserted ON public.guide_profiles;
CREATE TRIGGER trg_guide_profile_inserted
  AFTER INSERT ON public.guide_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_guide_profile_inserted();

CREATE OR REPLACE FUNCTION public.tg_guide_status_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  guide_email text;
  guide_first text;
  guide_last text;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('approved', 'rejected') THEN RETURN NEW; END IF;
  guide_first := COALESCE(NEW.form_data->>'firstName', '');
  guide_last  := COALESCE(NEW.form_data->>'lastName', '');
  guide_email := NEW.form_data->>'email';
  PERFORM public.notify_email('guide_status', jsonb_build_object(
    'guideName', trim(guide_first || ' ' || guide_last),
    'guideEmail', guide_email,
    'guideUserId', NEW.user_id::text,
    'status', NEW.status
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guide_status_changed ON public.guide_profiles;
CREATE TRIGGER trg_guide_status_changed
  AFTER UPDATE OF status ON public.guide_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_guide_status_changed();

CREATE OR REPLACE FUNCTION public.tg_booking_inserted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  guide_name text;
BEGIN
  IF NEW.traveler_email IS NULL OR NEW.traveler_email = '' THEN RETURN NEW; END IF;
  SELECT trim(COALESCE(form_data->>'firstName','') || ' ' || COALESCE(form_data->>'lastName',''))
    INTO guide_name FROM public.guide_profiles WHERE user_id = NEW.guide_user_id LIMIT 1;
  PERFORM public.notify_email('booking_request', jsonb_build_object(
    'travelerName', NEW.traveler_name,
    'travelerEmail', NEW.traveler_email,
    'guideName', COALESCE(guide_name, 'your guide'),
    'tourType', NEW.tour_type,
    'date', NEW.date::text,
    'time', NEW.time,
    'location', NEW.location,
    'groupSize', NEW.group_size
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_booking_inserted ON public.bookings;
CREATE TRIGGER trg_booking_inserted
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_booking_inserted();

CREATE OR REPLACE FUNCTION public.tg_inquiry_inserted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_email('inquiry', jsonb_build_object(
    'name', NEW.name,
    'email', NEW.email,
    'phone', NEW.phone,
    'destination', NEW.destination,
    'group_size', NEW.group_size,
    'message', NEW.message
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inquiry_inserted ON public.inquiries;
CREATE TRIGGER trg_inquiry_inserted
  AFTER INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.tg_inquiry_inserted();
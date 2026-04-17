CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;

-- Store the cron target URL
INSERT INTO public.app_settings (key, category, value, description)
VALUES (
  'activation_reminders_url',
  'system',
  '"https://oegfwomloaihzwomwypx.supabase.co/functions/v1/guide-activation-reminders"'::jsonb,
  'Daily cron target for guide activation reminders'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ⚠️ MANUAL STEP REQUIRED ⚠️
-- The Vault secret below uses a PLACEHOLDER. After this migration runs, you MUST
-- open the Supabase SQL Editor and run:
--
--   SELECT vault.update_secret(
--     (SELECT id FROM vault.secrets WHERE name = 'service_role_key'),
--     '<paste-your-real-service-role-key-here>'
--   );
--
-- Until you do this, the cron job will receive 401s from the Edge Function.
-- The real key must NEVER appear in code or migration files.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'service_role_key') THEN
    PERFORM vault.create_secret(
      '<YOUR_SERVICE_ROLE_KEY>',
      'service_role_key',
      'Service role key used by pg_cron to call internal Edge Functions'
    );
  END IF;
END
$$;

-- Unschedule any existing job with the same name (idempotent)
DO $$
DECLARE
  jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'daily-activation-reminders';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END
$$;

-- Schedule daily at 09:00 UTC
SELECT cron.schedule(
  'daily-activation-reminders',
  '0 9 * * *',
  $cron$
    SELECT net.http_post(
      url := (SELECT value #>> '{}' FROM public.app_settings WHERE key = 'activation_reminders_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
      ),
      body := '{}'::jsonb
    );
  $cron$
);
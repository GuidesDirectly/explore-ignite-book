-- Fix: Remove hardcoded anon key from badge-expiration cron job.
-- Use current_setting to dynamically reference the anon key from supabase config.

-- First, unschedule the existing job
SELECT cron.unschedule('badge-expiration-daily');

-- Re-create with dynamic key reference
SELECT cron.schedule(
  'badge-expiration-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://oegfwomloaihzwomwypx.supabase.co/functions/v1/badge-expiration',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', current_setting('supabase.anon_key', true))
    ),
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

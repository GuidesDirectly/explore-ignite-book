
-- Schedule badge expiration cron job to run daily at midnight UTC
SELECT cron.schedule(
  'badge-expiration-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://oegfwomloaihzwomwypx.supabase.co/functions/v1/badge-expiration',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ2Z3b21sb2FpaHp3b213eXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM4NTAsImV4cCI6MjA4NjA3OTg1MH0.ZRn_9BDZZM5uTdqAxaeBcwckzjqXe7HQXUN8OZSbLNM"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

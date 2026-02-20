
-- Persistent cache for HIBP k-anonymity prefix responses
-- Only the edge function (service role) writes to this table
-- No client-side access is needed or allowed

CREATE TABLE IF NOT EXISTS public.password_breach_cache (
  prefix      TEXT PRIMARY KEY,          -- 5-char uppercase SHA-1 prefix
  hashes      TEXT NOT NULL,             -- raw HIBP range response (suffix:count lines)
  fetched_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: no public access — only service role (edge function) touches this table
ALTER TABLE public.password_breach_cache ENABLE ROW LEVEL SECURITY;

-- No policies = deny all for anon/authenticated; service role bypasses RLS
-- This is intentional: cache is internal infrastructure only

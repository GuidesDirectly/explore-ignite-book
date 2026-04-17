-- Add activation columns
ALTER TABLE public.guide_profiles
  ADD COLUMN IF NOT EXISTS activation_status text NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_plan_id uuid REFERENCES public.subscription_plans(id),
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_reminder_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text;

-- Constrain activation_status values
ALTER TABLE public.guide_profiles
  DROP CONSTRAINT IF EXISTS guide_profiles_activation_status_check;
ALTER TABLE public.guide_profiles
  ADD CONSTRAINT guide_profiles_activation_status_check
  CHECK (activation_status IN ('inactive','active','suspended'));

-- Index for daily reminder cron
CREATE INDEX IF NOT EXISTS idx_guide_profiles_activation_lookup
  ON public.guide_profiles (status, activation_status, payment_reminder_count);

-- Backfill: all approved guides → active on Founding plan
UPDATE public.guide_profiles
SET
  activation_status = 'active',
  subscription_plan_id = (SELECT id FROM public.subscription_plans WHERE slug = 'founding' LIMIT 1),
  subscription_tier = COALESCE(subscription_tier, 'founding'),
  subscription_status = COALESCE(subscription_status, 'active'),
  subscription_started_at = COALESCE(subscription_started_at, now()),
  subscription_expires_at = NULL
WHERE status = 'approved';
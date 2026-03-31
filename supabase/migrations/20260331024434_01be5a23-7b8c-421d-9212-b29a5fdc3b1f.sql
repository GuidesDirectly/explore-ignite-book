
ALTER TABLE public.guide_profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'founding',
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

CREATE OR REPLACE FUNCTION public.validate_subscription_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.subscription_tier IS NOT NULL AND NEW.subscription_tier NOT IN ('founding', 'pro', 'featured') THEN
    RAISE EXCEPTION 'subscription_tier must be founding, pro, or featured';
  END IF;
  IF NEW.subscription_status IS NOT NULL AND NEW.subscription_status NOT IN ('active', 'inactive', 'past_due', 'cancelled') THEN
    RAISE EXCEPTION 'subscription_status must be active, inactive, past_due, or cancelled';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_subscription ON public.guide_profiles;
CREATE TRIGGER trg_validate_subscription
  BEFORE INSERT OR UPDATE ON public.guide_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_subscription_fields();

UPDATE public.guide_profiles
  SET subscription_tier = 'founding', subscription_status = 'active'
  WHERE subscription_tier IS NULL;

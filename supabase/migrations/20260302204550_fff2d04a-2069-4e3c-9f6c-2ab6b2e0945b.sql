
-- Add Stripe Connect account ID to guide_profiles
ALTER TABLE public.guide_profiles
ADD COLUMN stripe_account_id text DEFAULT NULL;

-- Add Stripe onboarding status
ALTER TABLE public.guide_profiles
ADD COLUMN stripe_onboarding_complete boolean DEFAULT false;

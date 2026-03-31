

# Stripe Subscription Billing System

## Overview
Add guide subscription billing with three tiers (Founding $0, Pro $29, Featured $59), Stripe Checkout integration, webhook handling, dashboard UI, and admin manual override.

## Task 1 — Database Migration

Add 5 columns to `guide_profiles` using a validation trigger (not CHECK constraints, per guidelines):

```sql
ALTER TABLE public.guide_profiles
  ADD COLUMN subscription_tier text DEFAULT 'founding',
  ADD COLUMN subscription_status text DEFAULT 'active',
  ADD COLUMN stripe_customer_id text,
  ADD COLUMN stripe_subscription_id text,
  ADD COLUMN subscription_current_period_end timestamptz;

-- Validation trigger instead of CHECK constraints
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

CREATE TRIGGER trg_validate_subscription
  BEFORE INSERT OR UPDATE ON public.guide_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_subscription_fields();

-- Set all existing guides
UPDATE public.guide_profiles
  SET subscription_tier = 'founding', subscription_status = 'active'
  WHERE subscription_tier IS NULL;
```

## Task 2 — Edge Function: guide-subscribe

Create `supabase/functions/guide-subscribe/index.ts`:
- CORS headers matching existing functions
- Validate input: `guide_user_id`, `price_id`, `success_url`, `cancel_url`
- Verify guide exists in `guide_profiles`
- Get or create Stripe customer (lookup `stripe_customer_id`, else create from auth.users email, save back)
- Create Stripe Checkout Session with `mode: "subscription"`, the given `price_id`, and `metadata: { guide_user_id }`
- Return `{ url: session.url }`
- Uses `STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (both already configured)

## Task 3 — Update stripe-webhook

File: `supabase/functions/stripe-webhook/index.ts`

Add 5 new event handlers after existing `checkout.session.expired` block:

- `customer.subscription.created` — extract `guide_user_id` from `subscription.metadata`, update `guide_profiles` with `subscription_status='active'`, `stripe_subscription_id`, `subscription_current_period_end`
- `customer.subscription.updated` — same update logic
- `customer.subscription.deleted` — set `subscription_status='cancelled'`
- `invoice.payment_failed` — find guide by `stripe_customer_id` from invoice customer, set `subscription_status='past_due'`
- `invoice.payment_succeeded` — find guide by `stripe_customer_id`, set `subscription_status='active'`

No existing handlers modified.

## Task 4 — Subscription UI Component

Create `src/components/dashboard/SubscriptionManager.tsx`:
- Fetches guide's `subscription_tier`, `subscription_status`, `subscription_current_period_end` from `guide_profiles`
- Displays current plan badge and status
- Three plan cards side by side (Founding/Pro/Featured) with feature lists as specified
- Upgrade buttons call `guide-subscribe` edge function via `supabase.functions.invoke()` and redirect to returned Stripe URL
- Contact fallback note at bottom
- Props: `userId: string`

Add to `GuideDashboard.tsx`:
- Import and render `<SubscriptionManager userId={user.id} />` after the AI Banner section (before Analytics)

## Task 5 — Admin Subscription Column

In `src/pages/Admin.tsx`:
- Add `subscription_tier` to the `GuideApplication` interface
- In `renderGuideCard`, after the status badge, add a subscription tier badge
- Add a `<select>` dropdown (founding/pro/featured) that updates `guide_profiles.subscription_tier` directly via Supabase client
- Dropdown only shown when guide card is expanded

## Files Changed
1. New migration SQL (5 columns + validation trigger)
2. New file: `supabase/functions/guide-subscribe/index.ts`
3. Modified: `supabase/functions/stripe-webhook/index.ts` (add 5 event handlers)
4. New file: `src/components/dashboard/SubscriptionManager.tsx`
5. Modified: `src/pages/GuideDashboard.tsx` (import + render SubscriptionManager)
6. Modified: `src/pages/Admin.tsx` (subscription badge + dropdown)

## What does NOT change
- `create-checkout-session` — untouched
- `BookingCheckout.tsx` — untouched
- No images generated
- No existing components modified beyond specified additions


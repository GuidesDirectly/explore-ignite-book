-- 1. Add is_spotlight flag
ALTER TABLE public.guide_profiles ADD COLUMN IF NOT EXISTS is_spotlight boolean NOT NULL DEFAULT false;

-- 2. Recreate the public view to include is_spotlight + subscription_plan_id
DROP VIEW IF EXISTS public.guide_profiles_public;

CREATE VIEW public.guide_profiles_public
WITH (security_invoker = true)
AS
SELECT
  g.id,
  g.user_id,
  g.service_areas,
  g.status,
  g.created_at,
  g.translations,
  g.is_spotlight,
  g.subscription_plan_id,
  public.get_public_guide_form_data(g.form_data) AS form_data
FROM public.guide_profiles g
WHERE g.status = 'approved'
  AND g.activation_status = 'active';

GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;

-- 3. Insert Spotlight add-on plan (idempotent)
INSERT INTO public.subscription_plans
  (slug, name, price_monthly, price_yearly, is_active, sort_order, features, featured_placement, priority_support)
VALUES
  ('spotlight', 'Spotlight', 49, 490, true, 4,
   '["Top 3 city placement","Spotlight badge","Newsletter feature","AI Planner priority","Zero commission"]'::jsonb,
   true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  features = EXCLUDED.features,
  featured_placement = EXCLUDED.featured_placement,
  priority_support = EXCLUDED.priority_support,
  updated_at = now();
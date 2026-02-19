
-- Fix security definer view by setting security_invoker
ALTER VIEW public.guide_profiles_public SET (security_invoker = true);

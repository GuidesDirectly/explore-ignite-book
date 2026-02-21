-- Make the view use invoker security (fixes the security definer warning)
ALTER VIEW guide_profiles_public SET (security_invoker = on);


# Security Hardening — Execution Order Locked

User approved. Plan is identical to last presentation. Switching to default mode to execute the 5-step sequence.

## Execution sequence (continuous, no pauses)

1. **Pre-flight inspection** (read-only)
   - Read current `guide_profiles_public` view definition via `supabase--read_query`
   - Verify `'guide'` exists in `app_role` enum
   - List `storage.objects` policies for `guide-photos` and `branding`
   - Grep frontend for direct anon reads of `guide_profiles` base table

2. **Single migration** with 4 fixes:
   - **Fix 1:** Drop `anon_can_view_approved_guides` + `authenticated_can_view_approved_guides` on `guide_profiles`. Recreate `guide_profiles_public` view with strict whitelist (id, user_id, service_areas, translations, created_at, sanitized form_data subset only — excludes form_data raw, suspension_reason, payment_reminder_count, last_reminder_sent_at, subscription_plan_id, all stripe_*, phone, address). Grant SELECT to anon + authenticated.
   - **Fix 2:** Drop `Users can view own swaps` on `itinerary_swaps`. Add token-gated SELECT (matches `tour_plans` x-update-token pattern) + admin SELECT.
   - **Fix 3:** Drop permissive insert on `guide-photos`. Add INSERT/UPDATE/DELETE policies requiring `has_role(auth.uid(), 'guide'::app_role)` AND owner folder match. (If enum lacks 'guide', use inline `EXISTS user_roles` subquery.)
   - **Fix 4:** Drop bucket-wide SELECT on `guide-photos` and `branding`. Recreate as path-required (`name IS NOT NULL`) to disable enumeration.

3. **Test A** — anon reads base table (expect 0 rows / permission denied):
   ```sql
   SET ROLE anon;
   SELECT id, form_data, suspension_reason FROM public.guide_profiles LIMIT 1;
   RESET ROLE;
   ```

4. **Test B** — anon reads public view (expect rows returned):
   ```sql
   SET ROLE anon;
   SELECT id, user_id FROM public.guide_profiles_public LIMIT 5;
   RESET ROLE;
   ```

5. **Security scanner re-run** + Supabase linter — show all results.

## Out of scope (per your instruction)
- Stripe webhook `verify_jwt = false` — kept
- Public booking INSERT — kept
- Tour plan token validation — kept

## Publish gate
Will NOT publish. Will display all 5 results and wait for explicit "approve publish" before any further action.


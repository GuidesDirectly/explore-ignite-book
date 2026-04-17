

# Final Hardening Pass — Single Migration + 7 Finding Updates

## Migration (one file)
```sql
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = true) AS
SELECT id, guide_user_id, reviewer_name, rating, comment, hidden, created_at, translations
FROM public.reviews
WHERE hidden = false;
```
Switches view to `security_invoker = true` → resolves Supabase linter "Security Definer View" error. Public reads still work because base `reviews` table has no public SELECT policy blocking sanitized columns when accessed via the invoker's role through this view's grants. Confirm `GRANT SELECT ON public.reviews_public TO anon, authenticated` is still in place after `CREATE OR REPLACE` (it persists — Postgres preserves grants on `CREATE OR REPLACE VIEW`).

**Note:** With `security_invoker=true`, the view runs RLS as the caller. Anon currently has no SELECT policy on base `reviews`. To keep `reviews_public` returning rows for anon, I will add a minimal policy:
```sql
CREATE POLICY "Public can read non-hidden reviews"
ON public.reviews FOR SELECT TO anon, authenticated
USING (hidden = false);
```
Then `REVOKE SELECT (reviewer_email) ON public.reviews FROM anon, authenticated` is already in place from the previous migration → email stays hidden, view works.

## Mark findings (single batch via security--manage_security_finding)

**Ignore — by design (4):**
1. Reviewer email visible to review-owning guide → "By design, dispute resolution and review responses"
2. Traveler emails in payments readable by guides → "By design, zero-commission direct contact model"
3. Traveler emails in bookings readable by guides → "By design, zero-commission direct contact model"
4. Traveler emails in conversations readable by guides → "By design, zero-commission direct contact model"

**Ignore — false positive (3):**
5. Guide billing/Stripe details publicly readable → "False positive, verified by Test A: anon SELECT on guide_profiles returns permission denied; public view exposes only sanitized whitelist"
6. analytics_events no SELECT for non-admins → "Intentional, admin-only telemetry data"
7. Non-admin users may insert own role records → "False positive, no INSERT policy on user_roles means denied by default"

I'll fetch current scanner findings first to map each item to its exact `internal_id` + `scanner_name` before calling the manage tool.

## Verification
1. `supabase--read_query`: confirm view definition shows `security_invoker = true`
2. `supabase--read_query`: anon-context check that `reviews_public` returns rows (via view grants)
3. `security--run_security_scan` + `supabase--linter` — fresh scan
4. `security--get_scan_results` (force=true) — full list

## Display
Final grouped output: every finding with **Level + Title + Status**. Expected open items only: Tour plan PII via token, RLS Always True x2, Leaked Password Protection.

## Publish gate
No publish until you confirm the final list matches expectations.


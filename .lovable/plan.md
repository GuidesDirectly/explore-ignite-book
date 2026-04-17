

# Refresh Security Scan + Show Full Results

I'm in plan mode (read-only). On approval I will switch to default mode and execute this single sequence.

## Steps
1. `security--run_security_scan` — fresh scan against current DB state (post-migration)
2. `supabase--linter` — independent second opinion
3. `security--get_scan_results` (force=true) — grab full finding list from all scanners
4. For each previously-open finding now resolved by the 3 migrations (guide_profiles RLS, itinerary_swaps token gate, storage policies, bucket listing), call `security--manage_security_finding` with `mark_as_fixed` + the migration that resolved it
5. Display **complete** output grouped by scanner: every finding with **Level** (Error / Warning / Info) + **Title** + **Status** (Open / Fixed / Ignored)

## Out of scope
- No code changes
- No new migrations
- No publish — wait for explicit approval after you review the refreshed list
- The 3 info items you flagged keep-as-is (Stripe webhook JWT, public bookings INSERT, tour plan token) will remain Open, not ignored, not fixed


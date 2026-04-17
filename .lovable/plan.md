

# Build Approved — Switching to Default Mode to Execute

The plan is locked. I'm currently in plan mode (read-only) and cannot run migrations, deploy Edge Functions, or write files. Approving this plan switches me to default mode so I can execute Phases 1–7 in one continuous run.

## Execution order on approval

1. **Phase 1** — Migration: rename `subscription_plans` rows to Founding/Pro/Featured at $0/$29/$59 (name, slug, price_monthly only — no Stripe ID changes)
2. **Phase 2** — Migration: add 7 activation columns to `guide_profiles`, index, backfill approved guides → `active` on Founding plan
3. **🛑 PAUSE** — Run and show:
   ```sql
   SELECT COUNT(*), activation_status FROM guide_profiles GROUP BY activation_status;
   ```
   Wait for your "go" before Phase 3.
4. **Phase 3** — Migration: drop + recreate `anon_can_view_approved_guides` and `authenticated_can_view_approved_guides` RLS policies to require `activation_status='active'`
5. **Phase 4** — Email infra: `app_settings.notification_webhook_url`, `notify_email()` helper, 4 triggers (guide_profiles INSERT/UPDATE, bookings INSERT, inquiries INSERT); extend `send-notification` with 11 typed handlers; remove duplicate client-side invokes from 4 form components
6. **Phase 5** — Activation system: update `guide-subscribe` (Free branch), `stripe-webhook` (set activation fields), create `guide-activation-reminders` (daily cron with reminders + expiry sweep + 30-day suspension)
7. **Phase 6** — Frontend: `<ActivationGate />` (3 states), status badges in `GuideDashboard`, `<ActivationFunnel />` admin widget with MRR estimate
8. **Phase 7** — Cron: `vault.create_secret('<YOUR_SERVICE_ROLE_KEY>', 'service_role_key', ...)` with replace-me comment, `app_settings` URL row, `cron.schedule('daily-activation-reminders', '0 9 * * *', ...)` reading key from `vault.decrypted_secrets`

## Reminders honored
- Pause after Phase 2 with verification query — yes
- `<YOUR_SERVICE_ROLE_KEY>` placeholder, never the real key in code — yes
- No Header/Hero/design changes — yes
- No Stripe price ID changes — yes

Approve to begin Phase 1.




# Single Migration: Fixes 1, 2, 3, 4, 5 + Full Verification

## Migration contents (one file)

### Fix 1 — Reviews email leak
- Recreate `public.reviews_public` view: `id, guide_user_id, reviewer_name, rating, comment, hidden, created_at, translations` (no `reviewer_email`), `WHERE hidden = false`, `security_invoker = false`
- `GRANT SELECT ON public.reviews_public TO anon, authenticated`
- `REVOKE SELECT (reviewer_email) ON public.reviews FROM anon, authenticated`
- Base `reviews` table keeps existing guide-owner + admin SELECT only (no public SELECT exists today — confirmed in schema dump)

### Fix 2 — Notifications INSERT lockdown
- `DROP POLICY "System can create notifications" ON public.notifications`
- `CREATE POLICY "Users insert own notifications only" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())`
- Triggers / edge functions use `service_role` → bypass RLS, unaffected

### Fix 3 — Conversations schema + INSERT lockdown
- `ALTER TABLE public.conversations ADD COLUMN traveler_user_id uuid REFERENCES auth.users(id)` (nullable)
- `DROP POLICY "Authenticated users can create conversations" ON public.conversations`
- `CREATE POLICY "Authenticated users create own conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = guide_user_id OR auth.uid() = traveler_user_id)`
- Add SELECT for travelers: `CREATE POLICY "Travelers view own conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = traveler_user_id)`

### Fix 4 — Messages schema + INSERT lockdown
- `ALTER TABLE public.messages ADD COLUMN sender_user_id uuid REFERENCES auth.users(id)` (nullable)
- `DROP POLICY "Users can insert messages in own conversations" ON public.messages`
- `CREATE POLICY "Conversation participants send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_user_id = auth.uid() AND conversation_id IN (SELECT id FROM conversations WHERE guide_user_id = auth.uid() OR traveler_user_id = auth.uid()))`
- Update SELECT/UPDATE policies on `messages` to include traveler participant: drop and recreate matching `conversations.guide_user_id = auth.uid() OR conversations.traveler_user_id = auth.uid()`

### Fix 5 — app_settings whitelist
- `DROP POLICY "Anyone can read settings" ON public.app_settings`
- `CREATE POLICY "Public can read safe settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (key IN ('app_name','default_currency','default_language','min_tour_price','max_tour_price','booking_enabled','group_tours_enabled','reviews_enabled'))`
- Admin ALL policy unchanged. `notify_email()` is `SECURITY DEFINER` → bypasses RLS, email infra unaffected.

## Verification (6 checks via supabase--read_query)

1. Anon `SELECT reviewer_email FROM reviews LIMIT 1` → permission denied
2. Anon `SELECT * FROM reviews_public LIMIT 1` → row without email column
3. Confirm `notifications` INSERT policy now has `WITH CHECK (user_id = auth.uid())`
4. Anon `SELECT key, value FROM app_settings WHERE key='send_notification_anon_key'` → 0 rows
5. Anon `SELECT key FROM app_settings WHERE key='app_name'` → 1 row
6. `\d conversations` + `\d messages` → confirm new columns exist

## Final step
- `security--run_security_scan` + `supabase--linter`
- Display **complete** finding list grouped by scanner with Level + Title + Status
- Mark resolved findings as fixed via `security--manage_security_finding`
- **No publish.** Wait for explicit approval.

## Out of scope (kept-as-is per your instruction)
- Stripe webhook `verify_jwt=false`
- Public bookings INSERT
- tour_plans token validation


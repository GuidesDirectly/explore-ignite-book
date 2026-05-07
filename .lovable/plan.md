## Plan: Harden `stripe-webhook` edge function

Three targeted edits to `supabase/functions/stripe-webhook/index.ts`. No logic, event, or styling changes beyond what's listed.

### 1. Idempotency guard
Right after `event = stripe.webhooks.constructEvent(...)` and the `console.log` line, before the first `if (event.type === ...)` block:
- Query `stripe_processed_events` for a row matching `event.id`.
- If found, log and return `{ received: true, duplicate: true }` with status 200.
- Otherwise, insert `{ stripe_event_id: event.id }` immediately, then continue.

(Confirmed: `public.stripe_processed_events` table already exists.)

### 2. Error response status codes
Replace the outer `catch (e)` block so:
- Signature errors (message contains `"signature"` or `"No signatures found"`) → status **400**.
- All other errors → status **500** (so Stripe retries).
- Response body becomes the generic `{ error: "Webhook handler failed" }` (no longer leaks `e.message`).

### 3. Fail loudly on DB errors in `checkout.session.completed`
Inside the `checkout.session.completed` branch, when `paymentError` is set, after logging:
- Return a 500 response with `{ error: "Database update failed" }` instead of falling through.

(Per the user's spec, only the `paymentError` path is changed. The booking update and notification inserts in the same block are left as-is.)

### Files
- `supabase/functions/stripe-webhook/index.ts` — three edits as above.

No other files, no DB migration, no new secrets.
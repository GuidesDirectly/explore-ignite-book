## Plan — Harden stripe-webhook signature verification

### Problem
`supabase/functions/stripe-webhook/index.ts` currently falls back to `JSON.parse(body)` when either `STRIPE_WEBHOOK_SECRET` or the `stripe-signature` header is missing. This lets any unauthenticated caller forge Stripe events (mark payments completed, activate subscriptions, etc.).

### Change
In `supabase/functions/stripe-webhook/index.ts`, replace the existing block:

```ts
let event: Stripe.Event;

if (webhookSecret && sig) {
  event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
} else {
  // For development/sandbox without webhook signature verification
  event = JSON.parse(body);
}
```

with:

```ts
let event: Stripe.Event;

if (!webhookSecret) {
  console.error("STRIPE_WEBHOOK_SECRET is not configured");
  return new Response(JSON.stringify({ error: "Webhook secret not configured" }), { status: 400 });
}

if (!sig) {
  console.error("Missing stripe-signature header");
  return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
}

event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

### Files touched
- `supabase/functions/stripe-webhook/index.ts` — single block replacement only

### Untouched
All other webhook logic, other edge functions, frontend, DB, config.

### After
Deploy the `stripe-webhook` function. `STRIPE_WEBHOOK_SECRET` is already set in project secrets, so legitimate Stripe deliveries continue to verify; forged/unsigned requests are rejected with 400.

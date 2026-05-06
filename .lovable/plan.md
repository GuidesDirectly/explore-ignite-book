## Goal
Add a shared cron/admin auth gate to four scheduled edge functions so they reject anonymous public callers but still work for pg_cron, manual admin runs, and external schedulers.

## Files to change
1. `supabase/functions/guide-activation-reminders/index.ts`
2. `supabase/functions/badge-expiration/index.ts`
3. `supabase/functions/draft-guide-reminder/index.ts`
4. `supabase/functions/expansion-digest/index.ts`

## Change
In each file, immediately after the `if (req.method === "OPTIONS")` early return and before any other logic (Supabase client creation, body parsing, queries), insert:

```ts
// Reject unauthorized callers — cron/admin only
const authHeader = req.headers.get("authorization");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const cronSecret = Deno.env.get("CRON_SECRET");

const isAuthorized =
  (authHeader && authHeader === `Bearer ${serviceRoleKey}`) ||
  (cronSecret && authHeader === `Bearer ${cronSecret}`);

if (!isAuthorized) {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

Insertion points (approx):
- `guide-activation-reminders/index.ts` — after line 18, inside the `try` (or just before it; will place inside try to ensure error handling catches nothing here — but no awaits, so place right after OPTIONS check, before `try`).
- `badge-expiration/index.ts` — after the OPTIONS check (~line 23), before the `try` block.
- `draft-guide-reminder/index.ts` — after OPTIONS check (~line 13), before `try`.
- `expansion-digest/index.ts` — after OPTIONS check (~line 25), before `try`.

No other logic, frontend, DB, or config changes. `CRON_SECRET` is optional — if not set, only service-role calls are accepted, which is safe.

## Post-deploy notes (informational, not code)
- Existing pg_cron jobs that call these functions using the anon key will start returning 401. After deploy, those cron schedules must be updated to send `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` (or a `CRON_SECRET`). I will flag this in the completion message but will not modify cron SQL as part of this change per your instructions.

## Verification
After applying, I will report the exact line numbers added in each of the four files.

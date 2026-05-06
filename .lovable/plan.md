## Plan — Secure create-checkout-session edge function

Add two guards to `supabase/functions/create-checkout-session/index.ts`, plus expand one `select` clause.

### 1. JWT authentication (after the OPTIONS check, before `req.json()`)
Insert ~22 lines that:
- Require `Authorization: Bearer <token>` header → 401 if missing.
- Build a user-scoped Supabase client with the token.
- Call `userSupabase.auth.getUser()` → 401 if invalid/expired.

### 2. Expand booking select
Change:
```ts
.select("price, status, guide_user_id")
```
to:
```ts
.select("price, status, guide_user_id, traveler_email")
```

### 3. Ownership check (after price validation, before Stripe session creation)
Insert ~9 lines that compare the authenticated user's email (case-insensitive) to `booking.traveler_email` → 403 if mismatched.

### Files
| File | Change |
|------|--------|
| `supabase/functions/create-checkout-session/index.ts` | PATCH only — exact snippets from the user's request |

### Untouched
Stripe session params, payment record insert, all other edge functions, frontend, DB.

### After
Function auto-deploys. Frontend already calls via `supabase.functions.invoke()` which forwards the user's JWT, so no client change is needed.

## Plan — Secure guide-subscribe edge function

Add two guards to `supabase/functions/guide-subscribe/index.ts`:

### 1. JWT authentication (after OPTIONS, before `req.json()`)
Insert ~25 lines that:
- Require `Authorization: Bearer <token>` header → return 401 if missing.
- Build a user-scoped Supabase client with the token.
- Call `userSupabase.auth.getUser()` → return 401 if invalid/expired.

### 2. Ownership check (after `const { guide_user_id, ... } = await req.json()` and the existing missing-fields check)
Insert ~6 lines that compare `user.id` to `guide_user_id` → return 403 if mismatched.

### Files
| File | Change |
|------|--------|
| `supabase/functions/guide-subscribe/index.ts` | PATCH only — two inserted blocks, exactly as specified in the user's snippets |

### Untouched
Founding free-plan flow, Stripe checkout flow, founding-count RPC, all other edge functions, frontend, DB.

### After
Function auto-deploys. Frontend already calls via `supabase.functions.invoke()` which forwards the user's JWT, so no client change needed.

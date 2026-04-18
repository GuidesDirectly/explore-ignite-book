

## Plan — Diagnose & fix silent fetch failure on `/guides`

### Investigation
Looking at the current `GuidesPage.tsx` (already shown in context):
- Query: `.from("guide_profiles_public").select("id, user_id, form_data, service_areas, translations, status, created_at, is_spotlight").eq("status", "approved")`
- Already has `console.error("[GuidesPage] guides fetch failed:", err)` — so failures aren't fully silent, but they may not surface clearly.
- Does NOT filter by `activation_status` (good).
- Does filter `.eq("status", "approved")` — the view already filters this, so it's redundant but not harmful.

Need to verify the view actually returns `status` and `is_spotlight` columns. Let me check via `supabase--read_query` and also inspect `Tours.tsx`.

### Likely root cause
Two strong candidates:
1. **Column mismatch**: the recreated view may not include `is_spotlight` or `status`, so `.select(...)` with those fields throws a 400. The current catch logs a warning but state stays empty.
2. **Stale browser state**: prior 401 cached → React Query/Supabase client retains failure. (Less likely — there's no React Query here, plain `useState`.)

### Fix plan

**Step A — Verify view columns** (`supabase--read_query`):
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'guide_profiles_public';
```
And confirm row count:
```sql
SELECT id, user_id, status FROM public.guide_profiles_public;
```

**Step B — Inspect `Tours.tsx`** to see if it also queries `guide_profiles_public` and needs the same treatment.

**Step C — Harden `GuidesPage.tsx`**:
- Change `.select(...)` to `.select("*")` to be resilient to view column changes (matches what user requested).
- Remove the redundant `.eq("status", "approved")` filter — view already enforces this.
- Add explicit `console.error("Guides fetch error:", error)` and `console.log("Guides data:", data)` as user requested (in addition to the existing try/catch).
- If `is_spotlight` is missing from the view, the spotlight sort fallback `(b.is_spotlight ? 1 : 0)` already handles `undefined` gracefully.

**Step D — Apply same hardening to `Tours.tsx`** if it queries `guide_profiles_public`.

**Step E — Migration (only if Step A reveals view is missing required columns)**: re-create view including `is_spotlight` and `status`.

### Files touched
| Type | Path | Change |
|---|---|---|
| Edit | `src/pages/GuidesPage.tsx` | `.select("*")`, remove `.eq("status","approved")`, add explicit console.error/log |
| Edit | `src/pages/Tours.tsx` | Same treatment if it queries the view |
| Migration (conditional) | new SQL | Re-create view with all needed columns if missing |

### Untouched
Header, Hero, Navbar, all RLS policies, Stripe, founding logic, all other pages.

### After
Publish.


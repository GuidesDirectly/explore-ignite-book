

## Plan — Remove diagnostic strip + persist view security_invoker fix

### Task 1: Remove diagnostic UI from `GuidesPage.tsx`
Remove three pieces:
1. The diagnostic strip JSX block (lines ~239–253: the `{!loading && (...)}` block showing `Supabase: ... · Rows: ... · Status: ...`).
2. The `console.log("[GuidesPage] Supabase URL:", ...)` line in the fetch effect.
3. The unused diagnostic state setters' visible output — keep `fetchStatus`/`rowCount`/`fetchError` state since `usingFallback` logic depends on `fetchStatus`. Just remove the rendered strip and the URL console log. The `supabaseHost` derived var becomes unused → remove it too.

Keep: `FALLBACK_GUIDES`, `usingFallback` logic, and the silent `console.error`/`console.warn` calls (useful in DevTools, invisible to users).

### Task 2: Persist `security_invoker = false` on `guide_profiles_public`
Create a new migration that re-creates the view with `WITH (security_invoker = false)` so future redeploys don't revert the manual SQL Editor fix.

```sql
-- Re-create guide_profiles_public with security_invoker = false
-- so the view runs with the definer's privileges and bypasses the
-- caller's RLS, matching the manual hotfix applied in SQL Editor.
DROP VIEW IF EXISTS public.guide_profiles_public;

CREATE VIEW public.guide_profiles_public
WITH (security_invoker = false) AS
SELECT
  g.id,
  g.user_id,
  g.service_areas,
  g.status,
  g.created_at,
  g.translations,
  g.is_spotlight,
  public.get_public_guide_form_data(g.form_data) AS form_data
FROM public.guide_profiles g
WHERE g.status = 'approved'
  AND g.activation_status = 'active';

GRANT SELECT ON public.guide_profiles_public TO anon, authenticated;
```

Note: Column list mirrors what `GuidesPage.tsx` consumes (`id, user_id, form_data, service_areas, translations, status, created_at, is_spotlight`). `form_data` goes through the existing `get_public_guide_form_data()` whitelist function for column-level security, so even with `security_invoker = false` no PII leaks.

### Files touched
| Path | Change |
|---|---|
| `src/pages/GuidesPage.tsx` | Remove diagnostic strip JSX, URL console.log, unused `supabaseHost` var |
| New migration | Re-create view `WITH (security_invoker = false)` + re-grant SELECT |

### Untouched
Fallback logic, fetch error handling, all RLS policies on base table, Header, Hero, Navbar, all other pages.

### After
Publish.


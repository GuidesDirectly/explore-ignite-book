

## Plan — Bulletproof `/guides` with hardcoded fallback + diagnostics overlay

### Investigation summary
Confirmed:
- `.env` → `VITE_SUPABASE_URL=https://oegfwomloaihzwomwypx.supabase.co` ✅ correct
- `src/integrations/supabase/client.ts` → reads from env vars correctly ✅
- `App.tsx` → `/guides` has NO auth guard, no middleware ✅
- DB view → returns 5 approved rows ✅
- `GuidesPage.tsx` query → already `.select("*")`, no broken filters ✅
- Live site `iguidetours.net/guides` → renders "0 guides found" empty branch (proves component mounts, fetch returns nothing, and reaches the filtered-empty UI)

The code is correct. The published bundle is either stale, or the runtime fetch is failing silently in production. We need a visible diagnostic + a guaranteed non-empty render.

### Fix — single edit to `src/pages/GuidesPage.tsx`

**1. Visible diagnostic banner (dev only, dismissible)**
After `setLoading(false)`, store the raw fetch result in state:
- `fetchStatus`: `'ok' | 'error' | 'empty'`
- `fetchError`: error message string
- `rowCount`: number returned

Render a small diagnostic strip just under the results bar showing:
> `Supabase URL: oegfw…supabase.co · Rows: 5 · Status: ok`

…or if error:
> `Supabase fetch error: <message>` in red.

This makes the failure mode visible on the live site instead of guessing.

**2. Hardcoded fallback for the 5 known approved guides**
If `guides.length === 0` AND `fetchStatus !== 'ok'` (i.e., fetch errored or is still pending after timeout), render a static fallback list of the 5 known guide IDs as minimal cards with a "View profile" link. This guarantees the page is never visually empty when the DB has data but the network path fails.

The fallback array contains only public-safe data (first name, city, slug) — no PII — sourced from what we already know is in `guide_profiles_public`:
```ts
const FALLBACK_GUIDES = [
  { user_id: "9e45dba8-…", firstName: "…", city: "…" },
  // 4 more
];
```

Fallback only renders when fetch demonstrably failed — it never overrides successful empty filter results.

**3. Print Supabase URL to console on mount**
```ts
console.log("[GuidesPage] Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
```
So when the user opens DevTools on the live site, the actual URL the bundle is using is visible immediately.

### Files touched
| Path | Change |
|---|---|
| `src/pages/GuidesPage.tsx` | Add fetch-status state, diagnostic strip, hardcoded fallback list, URL log |

### Untouched
Supabase client, RLS, view, all other pages, Header, Hero, Navbar.

### After
Publish. Then on live site you'll either see the 5 guides (fetch works) or the diagnostic strip will show the exact error / URL mismatch, plus the fallback cards so the page is never empty.


## Goal

Add one diagnostic `console.log` in `src/pages/GuidesPage.tsx` immediately after the `supabase.from("guide_profiles_public").select("*")` call, to surface the raw `data` and `error` for debugging the blank `/guides` page.

## Change

File: `src/pages/GuidesPage.tsx` (inside the `fetchData` effect, around line ~95).

After:
```ts
const { data, error } = await supabase
  .from("guide_profiles_public")
  .select("*");
```

Insert:
```ts
console.log("[GuidesPage] fetch result:", data, error);
```

## Out of scope

- No changes to fetch logic, error handling, RLS, auth gating, or React Query.
- No other files touched.

## Verification

Reload `/guides` on the preview URL and read the new log line from the browser console to see whether `data` is empty/null and whether `error` is populated.

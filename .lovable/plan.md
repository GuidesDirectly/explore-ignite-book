## Goal

Add diagnostic `console.log` statements around the slug-based lookup in `fetchGuide` (`src/pages/GuideProfilePage.tsx`) to determine whether the `withTimeout` wrapper is timing out, whether `res.data` is empty, or whether the slug-matching `find()` fails to locate the guide.

## Changes

**File:** `src/pages/GuideProfilePage.tsx` — slug lookup `else` branch (currently lines 180–197)

1. **Before** the `withTimeout` call (line 181):
   ```ts
   console.log("[fetchGuide] starting slug lookup for:", id);
   ```

2. **After** the `withTimeout` call returns (line 185, before the `if (res.data && !res.error)` check):
   ```ts
   console.log("[fetchGuide] slug lookup result:", res.data, res.error);
   ```

3. **After** the `find()` call assigns `data` (after line 194), log the matched result and total candidates scanned:
   ```ts
   console.log("[fetchGuide] slug match result:", { matched: data, candidateCount: res.data?.length ?? 0 });
   ```

## Out of Scope

- No logic changes to the lookup, timeout duration, or query columns.
- No changes to the UUID branch, `fetchSecondary`, GA4 event, or rendering.
- No changes to `withTimeout` itself.

## Verification

After approval, reload `/guide/michael-zlotnitsky-washington-dc` on the preview URL and inspect the browser console for the three new log lines to determine which stage fails.


## Plan — Remove FALLBACK_GUIDES, show error message instead

### Changes to `src/pages/GuidesPage.tsx`

1. **Delete** the `FALLBACK_GUIDES` constant (lines ~14–20).
2. **Delete** `usingFallback` derived var and replace `displayList` with just `filtered`.
3. **Replace** the empty-state block to distinguish two cases:
   - `fetchStatus === "error"` OR (`fetchStatus === "empty"` and no filters set) → show:
     > "Unable to load guides at this time. Please try again shortly."
   - Otherwise (filters returned no matches) → keep existing "No guides found for your search…" + Clear filters button.
4. **Keep** `fetchStatus`, `fetchError`, `rowCount` state since the empty-state branch uses `fetchStatus`. Silent `console.error`/`console.warn` calls stay for DevTools.

### Files touched
| Path | Change |
|---|---|
| `src/pages/GuidesPage.tsx` | Remove fallback array + logic, add error message branch |

### Untouched
View, migration, RLS, fetch logic, all other pages, Header, Hero, Navbar.

### After
Publish.


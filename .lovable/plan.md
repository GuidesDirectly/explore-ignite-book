

# Hero Search Redirect Fix

## Change

**File: `src/components/HeroSection.tsx`, line 27**

Change the navigate target from `/explore` to `/tours`:

```
// Before
navigate(qs ? `/explore?${qs}` : "/explore");

// After
navigate(qs ? `/tours?${qs}` : "/tours");
```

That's the only change. Everything else stays the same:
- Query params `q`, `date`, `guests` already built correctly (lines 23-26)
- `/tours` page already reads `q` param for filtering
- `/explore` route remains accessible via direct URL or nav links
- No visual or layout changes to the search bar


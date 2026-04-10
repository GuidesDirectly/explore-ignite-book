

# Redirect /tours to /guides

## Change

**`src/App.tsx`** — Replace the `/tours` route element:

```tsx
// Before
<Route path="/tours" element={<Tours />} />

// After
<Route path="/tours" element={<Navigate to="/guides" replace />} />
```

`Navigate` is already imported. No other files touched. `Tours.tsx` remains in place.


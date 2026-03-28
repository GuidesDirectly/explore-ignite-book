

# Add Top Padding to GuidesPage Header

**File:** `src/pages/GuidesPage.tsx` — one style change.

**Change:** Line ~153, the Section 1 `<section>` currently uses inline style `paddingTop: 60`. Replace with Tailwind classes `pt-32 md:pt-40` and keep `paddingBottom: 40` inline (or convert to `pb-10`).

```tsx
// Before
<section style={{ background: "#0A1628", paddingTop: 60, paddingBottom: 40 }}>

// After
<section style={{ background: "#0A1628" }} className="pt-32 md:pt-40 pb-10">
```

No other changes. No other files touched.


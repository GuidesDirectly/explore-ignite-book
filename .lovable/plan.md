

# Reduce GuidesPage Header Padding

**File:** `src/pages/GuidesPage.tsx` — one class change

**Change:** Section 1 `<section>` element — replace `pt-32 md:pt-40` with `pt-24 md:pt-28`. Keep `pb-10` unchanged.

```tsx
// Before
<section style={{ background: "#0A1628" }} className="pt-32 md:pt-40 pb-10">

// After
<section style={{ background: "#0A1628" }} className="pt-24 md:pt-28 pb-10">
```

One line, one file. Nothing else touched.


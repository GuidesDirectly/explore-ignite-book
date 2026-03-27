

# Two Quick Fixes — Navbar Routing + Promise Bar Rebrand

## Fix 1 — Guides navbar link → `/guides` route

**File:** `src/components/Navbar.tsx`

Change line 49 from:
```typescript
{ label: "Guides", href: "#meet-guides" },
```
to:
```typescript
{ label: "Guides", href: "/guides", isRoute: true },
```

The existing `isRoute` handling (lines 105-116) already calls `navigate(link.href)` — so this will trigger proper router navigation to `/guides` with no other changes needed.

## Fix 2 — Rebrand promise bar to navy/gold

**File:** `src/pages/ExploreCities.tsx`, line 228

Replace:
```html
<div className="bg-primary py-4">
  <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-primary-foreground text-sm font-semibold text-center">
```

With inline styles for exact brand colors:
```html
<div className="py-4" style={{ background: '#0A1628', borderTop: '1px solid rgba(201,168,76,0.2)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
  <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-semibold text-center" style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '0.1em' }}>
```

All text content stays exactly the same. No other files touched.

## Files modified
- `src/components/Navbar.tsx` — one line change (line 49)
- `src/pages/ExploreCities.tsx` — two lines changed (228-229)

## Not touched
- No other navbar links, no TrustBarSection, no LaunchStripSection, no Home.tsx, no images, no text changes


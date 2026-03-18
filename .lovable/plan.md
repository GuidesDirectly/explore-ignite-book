

## Navbar Clickability Fix — Ready to Execute

This plan has been approved. Upon approval here, I will immediately make these edits:

### `src/components/Navbar.tsx` — 3 edits

1. **Line 67**: `z-50` → `z-[100]`
2. **Desktop "Book a Guide" (~line 172-180)**: Replace scroll-to-`#meet-guides` with `navigate("/explore")`
3. **Mobile "Book a Guide" (~line 258-267)**: Same — `navigate("/explore")`

### `src/components/HeroSection.tsx` — 2 edits

4. **Line 30** (background wrapper): `"absolute inset-0"` → `"absolute inset-0 pointer-events-none"`
5. **Line 35** (content container): `"relative container…"` → add `pointer-events-auto`

No other files affected.


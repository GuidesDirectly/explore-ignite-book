

# Redesign — WhyDirectSection Comparison Block

**File:** `src/components/WhyDirectSection.tsx` — full rewrite of component internals

## What changes
Replace the entire component body with a two-column comparison block. No other files touched. Section stays in same Home.tsx position.

## Structure

```text
┌─────────────────────────────────────────┐
│  bg: #0A1628, py: 80px                  │
│                                         │
│  WHY BOOK DIRECT (gold eyebrow)         │
│  "The difference is more than the       │
│   price." (serif H2, #F5F0E8)           │
│  Subheading (white 65% opacity)         │
│                                         │
│  ┌── Other Platforms ──┐ ┌─ Guides Directly ─┐
│  │ red header bg       │ │ green header bg    │
│  │ ✗ item 1            │ │ ✓ item 1           │
│  │ ✗ item 2            │ │ ✓ item 2           │
│  │ ... (6 items)       │ │ ... (6 items)      │
│  └─────────────────────┘ └────────────────────┘
│                                         │
│  Italic closing statement (50% white)   │
└─────────────────────────────────────────┘
```

## Technical details

- Remove all existing imports (motion, Check, X, useTranslation) except `Check` and `X` from lucide-react
- Remove framer-motion animations and i18n — all text is hardcoded per spec
- Background `#0A1628`, padding `py-20` (80px)
- Eyebrow: `#C9A84C`, 11px, uppercase, tracking `0.12em`
- H2: serif (`font-display`), 36px desktop / 26px mobile, weight 600, color `#F5F0E8`
- Subheading: 16px, `rgba(255,255,255,0.65)`, max-w `480px`
- Two-column grid: `max-w-[860px]`, `grid-cols-1 md:grid-cols-2`, gap 24px, mt 48px
- Left column: red theme (`#C0392B`) with specified rgba backgrounds/borders, 6 items with X icon
- Right column: green theme (`#2D6A4F`) with specified rgba backgrounds/borders, 6 items with Check icon
- Italic footer text: 15px, `rgba(255,255,255,0.5)`, max-w `500px`, mt 32px
- All border radii, padding, and colors exactly as specified
- Mobile: columns stack, Other Platforms on top

## Files touched
- `src/components/WhyDirectSection.tsx` — rewritten

No other files modified. No images. No routing changes.


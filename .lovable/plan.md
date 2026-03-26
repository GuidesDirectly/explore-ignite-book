

# Hero Text Update Plan

## Current State
- The hero headline and subtitle use i18n keys `hero.headline` and `hero.subtitle` from translation files
- There are **no CTA buttons** in the hero section currently — only a glassmorphism search bar and trust strip
- The user requests two new CTA buttons ("Find a Guide" and "I'm a Guide — Join Free")

## Changes

### 1. Update `src/i18n/locales/en.json` — Text strings only

| Key | Current Value | New Value |
|---|---|---|
| `hero.headline` | "Book Local Guides Directly — Cities & Ecotourism Worldwide" | "See Every City, Landmarks & Landscape Through Local Eyes" |
| `hero.subtitle` | "No middlemen. No commissions. Just real people and authentic experiences." | "Connect directly with trusted local guides who design your experience — no middlemen, no markups, no hidden fees." |

### 2. Update `src/components/HeroSection.tsx` — Add two CTA buttons

Insert a `motion.div` block between the subtitle (line 82) and the search bar (line 84) containing:

- **Primary button**: "Find a Guide" — navigates to `/guides` using `navigate("/guides")`. Uses the existing `hero` variant from the button component (gold gradient style).
- **Secondary button**: "I'm a Guide — Join Free" — navigates to `/guide-register`. Uses the existing `heroOutline` variant (transparent with border).

Both buttons will be inside a flex row with `gap-4`, matching the existing motion animation pattern. No new styling — uses existing button variants already defined in `button.tsx`.

### 3. Files modified
- `src/i18n/locales/en.json` — 2 string values changed
- `src/components/HeroSection.tsx` — add Button import + CTA block between subtitle and search bar

### 4. Not touched
- No images, logo, layout structure, routing logic, database, or other components
- Other locale files are not updated (only English requested)


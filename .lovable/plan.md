

# Guides Page Rebuild — Final Implementation Plan

## Overview
Create `src/pages/GuidesPage.tsx` and update `src/App.tsx` routing. Two files changed, nothing else touched.

## File 1: `src/pages/GuidesPage.tsx` (NEW)

Full guide discovery page with 4 sections:

**Section 1 — Header** (`#0A1628` bg, pt-60 pb-40)
- Eyebrow: "Find Your Guide" — gold, 12px, uppercase, 0.1em spacing
- H1: "Find a Guide Who Fits You" — serif, 600, cream `#F5F0E8`, clamp(28px, 5vw, 40px)
- Subheading: muted white, 16px, max-w 560px centered
- Glassmorphism search bar (max-w 640px, rounded-full, blur backdrop):
  - City input (60%) with gold MapPin icon
  - Language select (40%) with gold Globe icon — options include all 21 languages
  - Gold circle search button

**Section 2 — Results bar** (`#122040` bg)
- Left: "[N] guides found"
- Right: Sort dropdown (Recommended / Most Reviews / Newest Members)

**Section 3 — Guide cards grid** (`#0A1628` bg, 48px padding)
- Data: `guide_profiles_public` where `status = 'approved'` + `reviews_public` for sort
- Client-side filtering by city (service_areas) and language (form_data.languages)
- Grid: 3-col desktop / 2-col tablet / 1-col mobile, gap-6, max-w 1200px
- Card (`#1A2F50` bg, 0.5px gold border, 12px radius, hover lift):
  1. Square initials avatar — gold serif 52px on `#0A1628`, "VERIFIED" badge if approved
  2. Language flags row — emoji from 21-lang mapping, max 4 + "+N"
  3. Name — serif 20px cream
  4. City — 📍 prefix, 13px muted
  5. Bio — 100 chars + "...", 13px
  6. Specialization pills — gold, max 3, clickable → `/guide/[id]?specialization=[value]`
  7. "Message [firstName]" button — gold bg, full width, rounded bottom → `/guide/[id]`
- Empty state with "Clear filters" gold outlined button

**Section 4 — Recruitment banner**
- "Are you a local guide?" + subtext + gold CTA → `/guide-register`

**Language flag mapping (all 21):**
English→🇺🇸, Русский→🇷🇺, Polski→🇵🇱, Deutsch→🇩🇪, Français→🇫🇷, Español→🇪🇸, 中文→🇨🇳, 日本語→🇯🇵, עברית→🇮🇱, العربية→🇸🇦, Português→🇧🇷, 한국어→🇰🇷, Italiano→🇮🇹, हिन्दी→🇮🇳, Tiếng Việt→🇻🇳, Bahasa Indonesia→🇮🇩, Nederlands→🇳🇱, ไทย→🇹🇭, Türkçe→🇹🇷, Svenska→🇸🇪, Українська→🇺🇦

## File 2: `src/App.tsx` (line 52)

Add import:
```tsx
import GuidesPage from "./pages/GuidesPage";
```

Change line 52 from:
```tsx
<Route path="/guides" element={<Tours />} />
```
To:
```tsx
<Route path="/guides" element={<GuidesPage />} />
```

## Not touched
Tours.tsx, TourCard.tsx, MeetGuidesSection.tsx, Home.tsx, Navbar.tsx, Footer.tsx, Supabase policies, translation files, /tours route.




# Comprehensive Hero Cleanup — 7 Fixes

## Files to modify
- `src/components/Navbar.tsx`
- `src/components/HeroSection.tsx`
- `src/pages/Home.tsx`
- `src/components/Footer.tsx`
- `src/i18n/locales/en.json`

---

## FIX 1 — Remove small logo from navbar

**File:** `src/components/Navbar.tsx`

- Remove `import logoImg from "@/assets/logo.jpg"` (line 12)
- Remove the `<img>` tag at line 76. The `<a>` wrapper keeps the wordmark "GuidesDirectly" and "by iGuide Tours" text only.

---

## FIX 2 — Remove large iGuide Tours logo from hero

**File:** `src/components/HeroSection.tsx`

- Remove `import logoImg from "@/assets/logo.jpg"` (line 12)
- Remove the entire `motion.div` block at lines 47-62 (the "Powered by iGuide Tours" trust badge with logo image)

---

## FIX 3 — Add phone number to navbar (desktop only)

**File:** `src/components/Navbar.tsx`

- Add `Phone` to the lucide-react import
- Insert a phone link between the "About" nav link area and the divider before Login (after line 128, before the RIGHT actions div). Specifically, place it inside the RIGHT actions div (line 132 block), before the divider at line 153:

```tsx
<a
  href="tel:+12022438336"
  className="hidden lg:inline-flex items-center gap-1.5 text-[13px] text-white/80 hover:text-cta-book transition-colors whitespace-nowrap"
>
  <Phone className="w-4 h-4" />
  +1 (202) 243-8336
</a>
```

Place this just before the `<div className="w-px h-6 bg-white/20 mx-1" />` divider at line 153. The `hidden lg:inline-flex` ensures it only shows on desktop (matching the parent container's `hidden lg:flex`).

---

## FIX 4 — Replace search bar with city + language guide finder

**File:** `src/components/HeroSection.tsx`

Replace the entire 3-segment search form (lines 112-188) with a new 2-field finder:

- **State changes:** Remove `when`, `guests` state. Keep `where` (rename conceptually to city). Add `language` state initialized to `""`.
- **Remove imports:** `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent`, `format`, `date-fns`, `cn`, `CalendarIcon`, `Users`. Add `MessageCircle` if not already imported.
- **Label above bar:** A `<p>` with text `"Find your guide — search by city and language"`, font size 13px (`text-[13px]`), `text-white/85`, centered, `mb-3`.
- **Bar structure:** Same glassmorphism rounded bar style, but with 2 segments + button:
  - **Field 1 (60% width):** `MapPin` icon + text input, placeholder `"Which city are you visiting?"`
  - **Divider**
  - **Field 2 (40% width):** `MessageCircle` icon + `<select>` dropdown with options: `""` (Any Language), English, Russian, Spanish, French, German, Hebrew, Arabic, Chinese, Japanese, Portuguese, Italian, Korean, Hindi, Polish, Vietnamese, Indonesian, Dutch, Thai, Turkish, Swedish, Ukrainian
  - **Search button:** Gold `bg-[#C9A84C]` rounded-full, `Search` icon at 18px (`w-[18px] h-[18px]`), icon color navy `text-[#0A1628]`
- **On submit:** Navigate to `/guides` with query params `city` and `language` (only if non-empty)

---

## FIX 5 — Label and style the AI chat widget

**File:** `src/pages/Home.tsx`

Replace the floating `<Link>` at lines 104-110 with a styled version:

- Background: `bg-[#C9A84C]` instead of `bg-primary`
- Icon: `Sparkles` (AI spark) in navy `text-[#0A1628]`
- Add text label `"AI Planner"` below/beside the icon: `text-[11px] font-semibold text-[#0A1628]`
- Make the button slightly wider to accommodate the label (e.g., `w-auto px-3 py-2 rounded-2xl` instead of `w-14 h-14 rounded-full`)
- Add `title="Chat with our AI Trip Architect"` for the tooltip
- Keep `to="/chat"` routing unchanged

Import `Sparkles` (already imported in other files) and keep `MessageCircle` import if used elsewhere.

---

## FIX 6 — Update trust strip labels

**File:** `src/i18n/locales/en.json`

Update these 4 values exactly:

| Key | New Value |
|---|---|
| `hero.trust1` | `Verified & Licensed Guides` |
| `hero.trust2` | `Direct Guide Contact` |
| `hero.trust3` | `City & Ecotourism Experts` |
| `hero.trust4` | `100% Earnings to Guides` |

No icon changes needed — the icons (ShieldCheck, MessageCircle, Leaf, DollarSign) already match the specified icons.

---

## FIX 7 — Update footer co-brand and address

**File:** `src/i18n/locales/en.json`

Update `footer.rights` from `"Guides Directly / iGuide Tours. All rights reserved."` to exactly:
`"Guides Directly, powered by iGuide Tours — All Rights Reserved"`

**File:** `src/components/Footer.tsx`

- Change the copyright line (line 102-104) to use hardcoded `© 2025–2026` instead of `new Date().getFullYear()`
- Change the address text (line 76) from `"Bethesda, MD"` to `"Bethesda, MD · Washington DC Area"`

Phone number already exists in the footer at line 68. No change needed there.

---

## What is NOT touched
- H1 headline text (stays as `t("hero.headline")` = "See Every City, Landmarks & Landscape Through Local Eyes")
- Subheadline text
- "Find a Guide" and "I'm a Guide — Join Free" CTA buttons
- Hero background image
- Nav links (Destinations, Guides, How It Works, About)
- Login text link styling
- Language/flag switcher
- Any Supabase/backend logic
- Non-English translation files
- Security policies


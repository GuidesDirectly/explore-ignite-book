

# Section 3 — Meet Our Guides (Founding Guides + Recruitment)

## Correction applied
- "Browse all our verified guides →" link routes to **`/guides`** (not `/tours`)

## File: `src/components/MeetGuidesSection.tsx` — full rewrite

### Data fetching
- Query `guide_profiles_public` with `.limit(2)`
- Fetch review stats and photos as before

### Section wrapper
- `id="meet-guides"`, background `#122040`, `py-20`

### Heading block (centered)
- Eyebrow: "Our Founding Guides" — gold, 12px uppercase, `tracking-[0.1em]`
- H2: "Meet the People Behind Your Experience" — serif, 40/28px, `#F5F0E8`
- Subheading: "Our founding guides set the standard..." — 16px, `rgba(255,255,255,0.65)`, max-w-[520px]

### 4-card grid
- `grid grid-cols-1 md:grid-cols-2 gap-7 max-w-[900px] mx-auto mt-14`

### Cards 1 & 2 — Real guide profiles
Each card (bg `#1A2F50`, border `1px solid rgba(201,168,76,0.25)`, rounded-xl, hover lift + border glow):

1. **Initials avatar** (1:1 square, navy bg, gold initials 48px serif). Photo if available with `loading="lazy"`. "FOUNDING GUIDE" badge bottom-left.
2. **Name** — 22px serif semibold, `#F5F0E8`
3. **Title line** — Hardcoded per guide:
   - "Michael Zlotnitsky" → "Founder & President, iGuide Tours"
   - "Mike McMains" → "President, Chicago Tour-Guide Professionals Association (CTPA)"
   - Color: `#C9A84C`, 13px
4. **City & Languages** — from DB, 13px, muted
5. **Bio excerpt** — 120 chars + "...", 14px
6. **Specialization pills** — max 3, gold-tinted
7. **Experience line** — "35+ Years Experience" for Michael only
8. **Message button** — full-width gold, "Message {firstName}", navigates to `/guide/{id}`

### Cards 3 & 4 — Recruitment cards
- Dashed gold border, subtle bg
- Centered: `PlusCircle` icon, "Become a Founding Guide", description, 3 perks, "Apply as Founding Guide" → `/guide-register`

### Below grid
- "Already a guide? Browse all our verified guides →" — gold link to **`/guides`**, `mt-10`

## Not touched
- Home.tsx, any section above, no images generated, no Supabase schema changes


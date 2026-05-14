## Plan: Add About Page

### Files

**1. Create `src/pages/About.tsx`** — new page using existing design tokens (`bg-background`, `text-foreground`, `text-primary` for gold, `font-display` for Playfair, `font-body` for DM Sans). Structure:

- `<Navbar />` at top
- `<main>` with `pt-[72px]` to clear fixed navbar, sections separated by `py-20`/`py-24`:
  1. **Hero** — centered, gold eyebrow label, `font-display text-5xl md:text-6xl` H1 "About Guides Directly", muted subheadline "A platform built by a guide, for guides"
  2. **Our Mission** — two-column or centered prose block with the exact copy provided, gold accent border/quote styling
  3. **The Problem We Solve** — heading + 2–3 paragraphs explaining 20–30% commission extraction by major platforms, ownership of client relationships, commoditization. Closing line: "GuidesDirectly eliminates that extraction entirely."
  4. **Founder Section** — two-column (image left, text right on desktop; stacked mobile). Image slot = initials avatar fallback ("MZ") in gold-on-navy circle (per project Media Policy: no AI/stock photos). Name "Michael Zlotnitsky", role line "Licensed DC Tour Guide & Architectural Historian", bio paragraphs covering 35 years guiding DC, Founder & President of iGuide Tours, built GuidesDirectly from lived experience.
  5. **Our Values** — 5-card grid (`grid md:grid-cols-2 lg:grid-cols-3 gap-6`), each card uses `bg-card border border-border rounded-2xl` with a lucide icon in a gold circle, title, one-line description. Icons: `Users`, `DollarSign`, `Link2`, `ShieldCheck`, `Sparkles`.
  6. **Where We Are Today** — centered block: cities (Washington DC, Chicago, Los Angeles) + Founding Guide program callout (50 spots, free through end of 2026) in a highlighted `bg-primary/10 border border-primary/20` panel.
  7. **Footer CTA** — centered heading + two buttons side-by-side: "Find a Guide" (primary/gold) → `navigate('/guides')`, "Join as a Founding Guide" (outline) → `navigate('/guide-register')`.
- `<Footer />` at bottom
- Include `<SEO />` with title "About Guides Directly" and meta description.

Use `framer-motion` fade-in-on-view animations consistent with `AboutSection.tsx`.

**2. Edit `src/App.tsx`** — add `import About from "./pages/About";` and `<Route path="/about" element={<About />} />` above the catch-all.

**3. Edit `src/components/Navbar.tsx`** — change the About entry in `navLinks`:
```ts
{ label: t("nav.contact", "About"), href: "/about", isRoute: true }
```
This routes both desktop and mobile renderers through the existing `isRoute` branch (same pattern as Guides). No other navbar changes.

### Out of scope
No edits to any other files. No i18n key changes. No backend/data changes. Founder photo is an initials avatar (per Media Policy memory) — no image asset added.

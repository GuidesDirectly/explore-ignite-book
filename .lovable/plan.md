## Fix About page styling

Two targeted style-only edits to `src/pages/About.tsx`. No content or structural changes.

### 1. Force dark navy theme

The page currently uses `bg-background` which resolves to a light HSL token in the default (light) `:root`, so the page renders white. Other dark pages hardcode the navy.

- Change outer wrapper from `<div className="min-h-screen bg-background text-foreground">` to:
  `<div className="min-h-screen text-white" style={{ background: "#0A1628" }}>`
- Update text colors throughout to read on dark navy:
  - `text-foreground` → `text-white` (headings, emphasis lines, city labels, founder name, value titles)
  - `text-muted-foreground` → `text-white/70` (body paragraphs, descriptions)
  - Keep gold/primary accents (`text-primary`, `text-gradient-gold`, `bg-gradient-gold`) as-is
- Section band backgrounds (currently `bg-card`, which is light) → `style={{ background: "#0F1E33" }}` (subtle lift over `#0A1628`) on the three banded sections (Our Mission, Founder, Where We Are Today)
- Value cards (`bg-card border-border`) → `style={{ background: "#0F1E33" }}` with `border border-white/10`
- City pill cards (`bg-background border-border`) → `style={{ background: "#0A1628" }}` with `border border-white/10`
- Founder badge chip (`bg-background border-primary/30`) → `style={{ background: "#0A1628" }}` with `border border-primary/40`
- Founding Guide callout panel: keep `bg-primary/10 border-primary/30` (already works on dark)
- Founder avatar inner text `text-secondary` → keep (gold gradient + dark text reads fine); same for value icons

### 2. Tighten Hero → Our Mission gap

The hero uses `py-24 md:py-32` and Our Mission uses `py-20 md:py-24`, producing a large void between them.

- Hero section: `py-24 md:py-32` → `pt-16 pb-12 md:pt-20 md:pb-16`
- Our Mission section: `py-20 md:py-24` → `pt-12 pb-20 md:pt-16 md:pb-24`
- Leave subsequent sections' spacing unchanged

### Out of scope
- No copy changes, no section reordering, no new components
- No edits to `index.css`, Tailwind config, Navbar, Footer, or any other file



## Premium Marketplace UI — Execution Plan

### 1. `src/index.css` — 2 variable edits

**Line 42** — darken hero overlay:
```css
--hero-overlay: linear-gradient(135deg, hsla(220, 30%, 10%, 0.7), hsla(220, 30%, 10%, 0.6));
```

**Lines 58-59** — vibrant blue Join CTA:
```css
--cta-join: 220 80% 55%;
--cta-join-foreground: 0 0% 100%;
```

### 2. `src/components/HeroSection.tsx` — Full rewrite

Replace entire file with 3-segment glassmorphism search bar:

- **Imports**: Replace `Search` with `MapPin, Calendar, Users, Search` from lucide-react
- **State**: Replace single `query` with `where`, `when`, `guests`
- **Submit**: Build URL `/explore?q=<where>&date=<when>&guests=<guests>`, omitting empty params
- **Search bar markup** (replaces lines 60-76):
  - Container: `max-w-2xl rounded-2xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl`
  - Layout: `flex flex-col sm:flex-row` for mobile stacking
  - Three segments, each a `flex-1 flex items-center gap-2 px-4 py-3` with icon + transparent input
  - Desktop dividers: `hidden sm:block w-px h-8 bg-white/20` between segments
  - Circular search button on right: `w-10 h-10 rounded-full bg-cta-book flex items-center justify-center` with Search icon
- Trust strip stays unchanged

### 3. `src/components/Navbar.tsx` — Remove "Book a Guide"

**Desktop (lines 171-178)**: Delete the entire "Book a Guide" `<Button>` block. Keep the divider, "Join as Guide", phone, and language switcher.

**Mobile (lines 296-303)**: Delete the "Book a Guide" `<Button>` block. Keep "Join as Guide" button.

Result: Desktop right section → `[Login] | [Join as Guide] | 📞 🌐`

### Files affected
1. `src/index.css` — 3 lines changed
2. `src/components/HeroSection.tsx` — search bar rewrite
3. `src/components/Navbar.tsx` — remove 2 button blocks


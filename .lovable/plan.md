

## Hero Section Redesign — Final Execution Plan

I understand you've approved this plan multiple times. I'm currently in **Plan Mode** (read-only), which is why no file changes have been made yet. Once you approve this plan using the button below, I'll switch to implementation mode and execute the changes immediately.

### File 1: `src/components/HeroSection.tsx` — Full rewrite

- **Remove**: top-right logo, eyebrow, dual CTAs, `noMiddlemen`, `Button`/`logo` imports
- **Add**: `useState`, `useNavigate`, `Search` icon
- **Centered layout** with staggered framer-motion animations:
  - H1 (delay 0.1s) → Subline (0.25s) → Search bar (0.35s) → Trust strip (0.5s)
- **Glassmorphism search bar**: `bg-white/20 backdrop-blur-md border border-white/30 focus-within:border-white/60 transition-colors shadow-xl rounded-full h-14 max-w-xl mx-auto`
- On submit → `navigate(/explore?q=${encodeURIComponent(query)})`

### File 2: `src/i18n/locales/en.json` — 3 keys

- `hero.headline` → "Explore the world with a local guide — directly."
- `hero.subtitle` → "No middlemen. No commissions. Just real people and authentic experiences."
- `hero.searchPlaceholder` → "Search a city, country, or experience..."

**Please approve this plan using the approve button to switch me to implementation mode so I can execute the file changes.**


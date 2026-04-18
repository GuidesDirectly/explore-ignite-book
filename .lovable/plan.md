

## Plan — Fix unreadable buttons + declutter header

### Issue 1: Button contrast (`src/components/Navbar.tsx`)

Header bg is dark navy (`hsla(220,30%,8%,0.8–0.95)`), but the two outline buttons use `border-white/40 text-white/90` with no fill — low contrast and visually weak. Fix:

- **Sign In** → solid white background, dark navy text:
  ```
  bg-white text-[#0A1628] border border-white hover:bg-white/90
  ```
- **Join Free as Traveler** → transparent bg, gold border, white text (defers to gold "Find a Guide"):
  ```
  bg-transparent border border-cta-book/70 text-white hover:bg-cta-book/10 hover:border-cta-book
  ```
- **Find a Guide** (gold primary) — upgrade from outline to solid gold fill so it reads as the dominant CTA:
  ```
  bg-cta-book text-cta-book-foreground border border-cta-book hover:bg-cta-book/90
  ```
- **My Dashboard** (logged-in state) → keep solid white treatment same as Sign In for readability.

### Issue 2: Header crowding

- **Remove phone number from desktop header** (lines 186–195, including the divider that follows). Footer already shows it (`Footer.tsx` line ~92).
- **Keep phone in mobile menu** (it's not crowded there).
- **Increase right-group spacing**: change `gap-2 xl:gap-3` → `gap-3 xl:gap-4` for breathing room between buttons.
- **Language switcher**: keep at far right but remove the `w-px` divider before it; rely on gap spacing. (Moving it next to the logo would unbalance the 3-column layout — keeping it right is safer and matches existing pattern.)

### Final desktop header (logged-out)

```
LEFT:   Logo
CENTER: Destinations | Guides | How It Works | About
RIGHT:  [Sign In white] [Join Free as Traveler outlined] [Find a Guide gold solid] For Guides · 🌐
```

### Mobile menu

- Keep current order; update Sign In + Join Free as Traveler classes to match new desktop styling (white solid + gold-outline).
- Find a Guide → solid gold.
- Phone link stays at the bottom (mobile only).

### Files touched

| Path | Change |
|---|---|
| `src/components/Navbar.tsx` | Remove desktop phone block + divider, restyle Sign In (white solid), Join Free as Traveler (gold-outline), Find a Guide (solid gold), update mobile menu button styles to match, increase right-group gap |

### Untouched
Logo, Hero, Footer, all routes, all other pages, mobile phone link, language switcher position, all logged-in user menu elements.

### After
Publish.


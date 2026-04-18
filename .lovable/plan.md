

## Plan — Restore phone in header + final right-side order

### Change to `src/components/Navbar.tsx`

**Desktop right-side group, in this exact order:**
1. `+1 (202) 243-8336` — text-only with Phone icon, white/muted (`text-white/80 hover:text-cta-book`), `text-[13px]`. Re-add as `<a href="tel:+12022438336">`.
2. **Sign In** — white solid bg, dark navy text (current styling kept).
3. **Join Free as Traveler** — transparent bg, gold border + gold text (change text from `text-white` → `text-cta-book`), `size="sm"`.
4. **Find a Guide** — solid gold primary CTA (current styling kept), made visually largest by using `size="default"` instead of `sm`.
5. **For Guides** — small muted text link (current styling kept).
6. **LanguageSwitcher** (current).

**Spacing:** keep `gap-3 xl:gap-4`. Phone goes first in the right group with no divider.

**Mobile menu:** unchanged (phone already at bottom, button styles already match).

**Logged-in state:** phone still appears first; My Dashboard / Admin Panel replaces Sign In + Join Free as Traveler (current logic preserved).

### Files touched

| Path | Change |
|---|---|
| `src/components/Navbar.tsx` | Re-insert desktop phone link as first item in right group; update Join Free as Traveler text color to gold; bump Find a Guide to default size for visual emphasis |

### Untouched
Logo, center nav links, mobile menu, logged-in user menu, language switcher, Hero, Footer, all routes, all other pages.

### After
Publish.


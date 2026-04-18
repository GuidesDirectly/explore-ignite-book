

## Plan — Minimal header rebuild

### Change to `src/components/Navbar.tsx`

**Logo (left):** Remove the `"by iGuide Tours"` tagline span. Keep `GuidesDirectly` text logo only.

**Center nav (unchanged):** Destinations | Guides | How It Works | About

**Desktop right group — strip down to:**

Logged out:
1. **Sign In** — white solid bg, dark navy text (current styling kept)
2. **LanguageSwitcher**

Logged in (traveler/guide):
1. **My Dashboard** — white solid bg, dark navy text → `/traveler/dashboard` or `/guide-dashboard`
2. **Avatar** (`NavbarUserMenu`)
3. **LanguageSwitcher**

Logged in (admin):
1. **Admin Panel** — white solid bg, dark navy text → `/admin`
2. **Avatar** (`NavbarUserMenu`)
3. **LanguageSwitcher**

**Remove entirely from desktop:**
- Phone link (`+1 (202) 243-8336`)
- Join Free as Traveler button
- Find a Guide gold CTA
- For Guides text link
- Sparkles (Travel Preferences) icon button
- Heart (Saved Guides) icon button
- `TravelerProfileForm` import + state + render (no longer triggered from header)

(Saved Guides and Travel Preferences remain accessible from `/traveler/dashboard` and `NavbarUserMenu`.)

**Mobile menu — mirror the simplification:**
- Keep nav links (Destinations, Guides, How It Works, About)
- Logged out: Sign In button only
- Logged in: My Dashboard / Admin Panel button only
- Remove: phone link, Join Free as Traveler, Find a Guide, For Guides, Saved Guides shortcut

**Spacing:** keep `gap-3 xl:gap-4` on right group — fewer items will naturally breathe.

### Files touched

| Path | Change |
|---|---|
| `src/components/Navbar.tsx` | Strip logo tagline; remove phone, Join Free, Find a Guide, For Guides, Sparkles, Heart, TravelerProfileForm; simplify mobile menu to match |

### Untouched
Hero, Footer, all routes, color tokens, all other pages, NavbarUserMenu, LanguageSwitcher, role detection logic, all logged-in dashboards.

### After
Publish.


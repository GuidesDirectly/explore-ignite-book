

# Create /for-guides Landing Page

## Files to Create/Modify

### 1. Create `src/pages/ForGuidesPage.tsx`
Full new page with 6 sections, all self-contained (no DB queries):

- **Section 1 — Hero** (dark navy `#0A1628`): Eyebrow "FOR PROFESSIONAL TOUR GUIDES", H1 "Own your clients. Keep every dollar.", two CTAs (gold filled to `/guide-register`, outlined scrolls to `#how-it-works`)
- **Section 2 — Commission Problem** (champagne `#F0E6C8`): H2 about 20-30% commission, stat pills (red "Up to $90 lost" / green "$0 taken"), same style as TruePriceSection
- **Section 3 — What You Get** (`id="how-it-works"`, dark navy): 8 feature cards in 2x4 grid (Search, DollarSign, MessageCircle, Sparkles, Video, Star, Share2, Globe icons)
- **Section 4 — Pricing** (`#122040`): 3 pricing cards — Founding Guide ($0, "FREE FOREVER" green badge), Pro ($29, "COMING SOON" gold), Featured ($59, "COMING SOON" gold). 60-day notice text below.
- **Section 5 — Founding Guides** (dark navy): Hardcoded cards for Michael Zlotnitsky (DC) and Mike McMains (Chicago) with city background images imported from existing assets, initials avatars, bios, and "View Profile" buttons using slug URLs
- **Section 6 — Final CTA** (champagne `#F0E6C8`): "Founding spots are limited." with gold button to `/guide-register`

Imports: Navbar, Footer, lucide-react icons, `useNavigate`, city images from `@/assets/`

### 2. Modify `src/App.tsx`
Add route: `<Route path="/for-guides" element={<ForGuidesPage />} />` before the catch-all

### 3. Modify `src/components/Navbar.tsx`
Add "For Guides" as a route-based nav link after "About" in the `navLinks` array:
```
{ label: "For Guides", href: "/for-guides", isRoute: true }
```
This automatically renders in both desktop and mobile menus using existing nav link rendering logic.

## Design Approach
- Reuse existing visual patterns (TruePriceSection stat pills, gold/navy theme, serif headings)
- City background images already exist in `src/assets/`
- No database queries — all content hardcoded
- Responsive: grid cols adapt via Tailwind (1 col mobile, 2-3 cols desktop)


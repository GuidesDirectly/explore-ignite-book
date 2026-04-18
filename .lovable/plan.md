

## Plan — SEO metadata + sitemap + robots (FINAL, approved)

### Setup
- Add `react-helmet-async` to `package.json`
- Wrap `<App />` in `<HelmetProvider>` in `src/main.tsx`
- New `src/components/seo/SEO.tsx` — reusable: `title`, `description`, `keywords?`, `ogImage?`, `ogUrl?`, `ogType?`, `canonical?`. Defaults: og:site_name "GuidesDirectly", twitter:card "summary_large_image", og:image "/og-image.jpg"

### `index.html`
- Update `author` to `GuidesDirectly`
- Update canonical to `https://iguidetours.net` (non-www)
- Keep existing JSON-LD TravelAgency schema

### Per-page `<SEO />` mounts

| Page | Title | Description |
|---|---|---|
| `Home.tsx` + `Index.tsx` | `GuidesDirectly — Book Private Tour Guides Directly \| Zero Commission` | "Connect directly with licensed local tour guides. No booking fees, no commission markup, no middlemen. Washington DC, Chicago, Los Angeles and more. Keep 100% of what you pay with your guide." |
| `GuidesPage.tsx` | `Find a Local Tour Guide — Browse by City & Language \| GuidesDirectly` | "Browse verified local tour guides across Washington DC, Chicago, Los Angeles and more. Direct booking, zero platform fees. Your guide keeps 100% of what you pay." |
| `GuideProfilePage.tsx` | `{fullName} — Private Tour Guide in {city} \| GuidesDirectly` | First 155 chars of `form_data.bio` + " Book directly on GuidesDirectly — zero commission." og:image = guide photo (fallback `/og-image.jpg`), og:type "profile" |
| `ForGuidesPage.tsx` | `Become a Tour Guide on GuidesDirectly — Keep 100% of Your Earnings` | "Join GuidesDirectly as a founding guide. Free until 2027, zero commission, keep 100% of every booking." |
| `ExploreCities.tsx` | `Explore Cities & Destinations — Private Tour Guides Worldwide \| GuidesDirectly` | "Discover guides in 150+ destinations. Book directly, zero commission." |
| `AiPlannerPage.tsx` | `AI Trip Planner — Custom Itineraries with Local Guides \| GuidesDirectly` | "Plan your perfect trip with AI. Personalized itineraries, direct guide connections." |
| `Login.tsx` | `Sign In or Create Account \| GuidesDirectly` | (auth) |
| `GuideRegister.tsx` | `Register as a Tour Guide — Founding Member Free \| GuidesDirectly` | (register) |
| `TrustPage.tsx`, `PrivacyPolicy.tsx`, `Support.tsx` | standard |

### robots.txt (`public/robots.txt` — overwrite)
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /guide-dashboard
Disallow: /traveler/dashboard

Sitemap: https://iguidetours.net/sitemap.xml
```

### Sitemap (`/sitemap.xml`)
SPA constraint: cannot serve dynamic XML from a static SPA route. Implement as a Supabase Edge Function `generate-sitemap` that:
- Queries `guide_profiles_public` for all active guide `user_id`s
- Returns XML with static URLs + per-guide URLs

Then expose at `https://iguidetours.net/sitemap.xml` via:
- Add a rewrite in `public/_headers` is insufficient — instead add a `public/_redirects` rule:  
  `/sitemap.xml  https://oegfwomloaihzwomwypx.supabase.co/functions/v1/generate-sitemap  200`

This is a server-side rewrite (200 = transparent proxy), so crawlers see XML at the canonical URL.

Static URLs included:
- `/` priority 1.0
- `/guides` priority 0.9
- `/for-guides` priority 0.8
- `/#how-it-works` priority 0.7
- `/#about` priority 0.6
- `/guide/{user_id}` priority 0.8 for each public guide

### og:image (`public/og-image.jpg`)
Cannot generate/manipulate binary images in read-only inspection, but `index.html` already references `/og-image.jpg`. Will check if it exists; if not, ask the user to upload a 1200×630 DC skyline image (cannot fabricate one). The SEO component will reference `/og-image.jpg` regardless — image upload is a one-time asset task by the user.

### Files touched

| Path | Change |
|---|---|
| `package.json` | Add `react-helmet-async` |
| `src/main.tsx` | Wrap in `HelmetProvider` |
| `src/components/seo/SEO.tsx` | NEW |
| `index.html` | Author + canonical update |
| 11 page files above | Mount `<SEO />` |
| `public/robots.txt` | Overwrite with disallow rules + sitemap line |
| `public/_redirects` | NEW — proxy `/sitemap.xml` to edge function |
| `supabase/functions/generate-sitemap/index.ts` | NEW — XML generator |
| `supabase/config.toml` | Register `generate-sitemap` as public (verify_jwt = false) |

### Untouched
Header/Navbar, Hero, Footer, color tokens, messaging system, Stripe, RLS, table schemas.

### After
Publish. Note for user: upload `og-image.jpg` (1200×630) to `/public` if not already present.


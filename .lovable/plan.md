

## Plan — Fix Soft 404s for empty dynamic pages

### Problem
Google flags `/guide/:id` and `/tour/:guideId` pages as Soft 404 when the ID doesn't resolve. The pages currently render a brief "not found" panel but still emit a `200 OK` and don't tell crawlers the page is missing.

### Constraint
This is a SPA on Lovable hosting — we cannot send a real HTTP 404 status. The accepted SEO fix is to inject `<meta name="robots" content="noindex, nofollow">` plus `<meta name="prerender-status-code" content="404">` on the not-found view, set a clear `<title>`, and render a real "Not found" UI with navigation back into the site. Google honors `noindex` and treats the page as removed from the index, eliminating the Soft 404 warning.

### Changes

**1. `src/components/seo/NotFoundMeta.tsx` (NEW)**
Tiny component that, on mount, injects:
- `<meta name="robots" content="noindex, nofollow">`
- `<meta name="googlebot" content="noindex, nofollow">`
- `<meta name="prerender-status-code" content="404">`
- Sets `document.title` to the passed title
- Cleans up tags on unmount so they don't leak into other routes

**2. `src/pages/NotFound.tsx` (REPLACE)**
Replace the bare placeholder with a branded 404 page:
- Mounts `<Navbar />` and `<Footer />` for site continuity
- Uses `<NotFoundMeta title="Page Not Found | Guides Directly" />`
- Heading: "Page Not Found" + subtitle
- Two CTAs: `Link to "/"` (Home) and `Link to "/guides"` (Browse Guides)
- Logs the bad path to console (existing behavior kept)
- Uses existing deep-navy palette for visual consistency

**3. `src/pages/GuideProfilePage.tsx` (PATCH lines 339–356)**
Enhance the existing `notFound` branch:
- Add `<NotFoundMeta title="Guide Not Found | Guides Directly" />` so crawlers see `noindex`
- Keep the existing "Guide not found" message + "Back to Guides" button
- Add a second CTA link to `/` (Home)
- Add `<Footer />` for completeness

**4. `src/pages/TourDetail.tsx` (PATCH lines 223–237)**
Enhance the existing `notFound` branch:
- Add `<NotFoundMeta title="Tour Not Found | Guides Directly" />`
- Keep "Tour Not Found" message + "Browse All Guides" button
- Add second CTA to `/`
- Footer already present — keep

**5. `src/App.tsx` — no change needed**
Verified: catch-all `<Route path="*" element={<NotFound />} />` already exists (line 81). All unmatched routes already render `NotFound`.

### Why this fixes Soft 404 in Search Console
- `noindex` removes the URL from the index → Search Console reclassifies from "Soft 404" to "Excluded by 'noindex' tag" (a clean, intentional state).
- `prerender-status-code: 404` is read by Google's rendering pipeline and many prerender services as the effective HTTP status.
- A real "Not Found" UI with internal links eliminates the "thin/empty content" signal that triggers Soft 404 in the first place.
- Crawlers that hit `/guide/<deleted-id>` or `/tour/<bad-id>` now get an unambiguous "this page does not exist" signal.

### Files touched

| Path | Change |
|---|---|
| `src/components/seo/NotFoundMeta.tsx` | NEW — injects noindex + prerender 404 meta |
| `src/pages/NotFound.tsx` | REPLACE — branded 404 with Navbar/Footer + meta |
| `src/pages/GuideProfilePage.tsx` | PATCH — mount NotFoundMeta in notFound branch + Home CTA + Footer |
| `src/pages/TourDetail.tsx` | PATCH — mount NotFoundMeta in notFound branch + Home CTA |

### Untouched
Navbar, Hero, App.tsx routes, all other pages, RLS, Supabase queries, data-fetching logic, founding/spotlight badges, SEO on valid pages.

### After
Publish. Re-submit affected URLs in Search Console → "Validate Fix"; Google will re-crawl, see `noindex`, and clear the Soft 404 reports within a few days.


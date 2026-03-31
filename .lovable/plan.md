

# SEO Enhancement — Four Targeted Improvements

## Improvement 1 — Update index.html Defaults

**File: `index.html`**

- Change `<title>` to `"Guides Directly — Find Local Tour Guides | Zero Commission | Washington DC & Beyond"`
- Update `<meta name="description">` to the new copy about zero commission, city/language search
- Add `<meta name="robots" content="index, follow">`
- Change `<meta name="theme-color">` from `#0284c7` to `#0A1628`
- Update `<link rel="canonical">` from lovable.app URL to `https://www.iguidetours.net`
- Update OG/Twitter titles and descriptions to match
- Update JSON-LD `name`, `description`, and `url` to use "Guides Directly" / iguidetours.net

## Improvement 2 — GuidesPage SEO

**File: `src/pages/GuidesPage.tsx`**

- Add `useEffect` that sets `document.title` to `"Find Local Tour Guides | Guides Directly"` and updates the meta description
- Cleanup function restores default title on unmount

## Improvement 3 — Slug-based Guide URLs

**Files: `src/pages/GuideProfilePage.tsx`, `src/pages/GuidesPage.tsx`, `src/components/MeetGuidesSection.tsx`, `src/App.tsx`**

A shared `generateGuideSlug(firstName, lastName, city)` helper function producing clean URLs like `michael-zlotnitsky-washington-dc`.

**App.tsx**: No new route needed — the existing `/guide/:id` route already catches both UUIDs and slugs since `:id` is a generic param.

**GuideProfilePage.tsx**:
- Add `isUUID()` helper and `generateGuideSlug()` helper
- Update `fetchGuide` (line 71): if param is UUID, fetch by `id` as now; if not UUID, fetch all approved guides and match by generated slug
- Update SEO `useEffect`: canonical URL and JSON-LD `url` use `https://www.iguidetours.net/guide/${slug}` instead of lovable.app UUID URL
- Cleanup title uses new "Guides Directly" default

**GuidesPage.tsx** (lines 334, 353): Update `navigate(/guide/${guide.id})` calls to use `navigate(/guide/${generateGuideSlug(...)})`.

**MeetGuidesSection.tsx** (lines 241, 263): Same slug-based navigation updates.

**AiTourPlanner.tsx** (line 362): This uses a `guideId` variable that may be a UUID from AI results — leave as-is (UUID fallback still works).

**GuideDashboard.tsx** (line 461): Guide viewing own profile — leave as UUID (internal link).

## Improvement 4 — Enhanced JSON-LD Schema

**File: `src/pages/GuideProfilePage.tsx`** (lines 185-203)

Replace current `TouristGuide` schema with enhanced `Person` schema:
- Add `jobTitle: "Local Tour Guide"`
- Add `worksFor` Organization block (Guides Directly / iguidetours.net)
- Add `hasOfferCatalog` mapping `tourTypes` to `Offer` objects
- Add `areaServed` as single City (primary area)
- Map `languages` to `Language` objects with `name` property
- Conditionally include `image` and `aggregateRating`

## Technical Details

- `generateGuideSlug` is duplicated in 3 files (GuideProfilePage, GuidesPage, MeetGuidesSection). Could extract to a shared util but keeping it inline per the spec's simplicity. Alternatively place in `src/lib/utils.ts` and import — I'll use the shared util approach for DRY code.
- Slug matching: fetch guides with `.eq("status", "approved")` then filter client-side by generated slug. Not ideal at scale but works for current guide count.
- Both UUID and slug URLs continue to work — no breaking changes.

## Files Changed
1. `index.html` — title, meta tags, canonical, JSON-LD
2. `src/lib/utils.ts` — add `generateGuideSlug` helper
3. `src/pages/GuidesPage.tsx` — SEO useEffect + slug navigation
4. `src/pages/GuideProfilePage.tsx` — slug routing, SEO URLs, enhanced JSON-LD
5. `src/components/MeetGuidesSection.tsx` — slug navigation

## What does NOT change
- No visual/styling changes
- No routing structure changes (reuses existing `/guide/:id` param)
- No images generated
- `BookingCheckout.tsx` untouched
- `create-checkout-session` untouched


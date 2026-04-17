

## Plan — Fix duplicate cards + tour images on /tours

### Issue 1: Duplicate cards (Tours.tsx, lines ~115–145)
Current loop creates one listing per `city × tourType`, producing 6+ cards per guide. Change to **one listing per guide** (per city if they serve multiple, but collapsed across tour types).

Fix in `src/pages/Tours.tsx`:
- Replace the nested `cities.forEach → tourTypes.forEach` with a single pass: one listing per guide (use primary city = first `service_areas`).
- Store full `tourTypes: string[]` array on the listing instead of a single `tourType: string`.
- Update `TourListing` interface: `tourType: string` → `tourTypes: string[]`.
- Filter logic (`filterType`): match if `t.tourTypes.includes(filterType)` instead of equality.
- Search string includes joined `tourTypes`.
- Price lookup: use the lowest available price across the guide's published tours, or `null` if none.
- Link target: keep `/tour/${guideUserId}` but drop the `?type=` param (or pass first type) since the card now represents the guide overall.

### Issue 2: Tour card images (TourCard.tsx)
Current fallback uses `tour.photoUrl` which is the guide's profile face photo. Replace with city-based Unsplash destination images when no dedicated tour photo exists.

Fix in `src/components/TourCard.tsx`:
- Add a `getCityImage(city: string)` helper mapping:
  - `Washington DC` / `Washington` → `https://images.unsplash.com/photo-1617581629397-a72507c3de9e` (DC monuments)
  - `Los Angeles` / `Hollywood` → `https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3` (LA skyline)
  - `Chicago` → `https://images.unsplash.com/photo-1494522855154-9297ac14b55f` (Chicago skyline)
  - default → `https://images.unsplash.com/photo-1488646953014-85cb44e25828` (generic travel)
- Stop passing the guide profile photo as `photoUrl`. In `Tours.tsx` set `photoUrl: null` (or remove the storage lookup entirely — saves N requests per page load).
- `TourCard` always renders city image via `getCityImage(tour.city)` with `?w=800&q=80&auto=format&fit=crop` query for sizing.
- Render `tourTypes` as small chips below the title (replace single tour type badge in top-left with a primary "Tours" badge, list types as chips inside the card body).

### Card heading update
- Title: `"Tours with {guideName}"` (was `"{tourType} in {city}"`).
- Tour-type chips row: render `tour.tourTypes.slice(0, 4)` as small `<Badge variant="secondary">` chips with the existing emoji map.

### Files touched
- `src/pages/Tours.tsx` — collapse loop, drop photo fetch, update interface, fix filter/search/sort.
- `src/components/TourCard.tsx` — city-image helper, tour-type chips, title change.

### Out of scope (untouched)
- "Contact for pricing" copy — kept.
- Header / Hero / Navbar — kept.
- Filter UI, sort UI, search bar — kept.
- All other pages.

### After
Publish.


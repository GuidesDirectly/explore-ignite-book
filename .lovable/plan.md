

## Final Plan — Tours Feature Build (with 2 additions)

All previously approved scope stands. Two additions confirmed:

### Addition 1 — Publish-time photo validation
In `TourForm.tsx`, when user clicks **Publish Now** (status = 'published'):
- Read `required_tour_photos` from `app_settings` (default 3) on form mount.
- Block submit if `photos.length < required` → show toast `"Please add at least 3 photos before publishing"`.
- **Save as Draft path is unrestricted** (0 photos allowed for drafts).

### Addition 2 — Empty-state note on guide cards without tours
- `Tours.tsx`: when a guide has no published tours, keep rendering the guide-level card (current fallback) but add a small muted note line: `"No tours listed yet — contact to inquire"`.
- `GuidesPage.tsx`: same note appears on guide cards where the tour count = 0 (guide remains fully discoverable and contactable).
- `TourCard.tsx`: accept optional `noToursNote` boolean prop; if true, render the note line below the title.

### Final files touched
| Type | Path |
|---|---|
| Migration | new — `tours` columns + RPC functions + `app_settings.required_tour_photos` |
| Edit | `src/components/dashboard/TourForm.tsx` (description, min_group_size, photos uploader, expanded categories, publish-time photo validation) |
| Edit | `src/components/dashboard/ToursManager.tsx` (counters, duplicate, publish toggle) |
| Edit | `src/pages/TourDetail.tsx` (rewrite to support tour-by-id + analytics increment) |
| Edit | `src/App.tsx` (route param handling — keep `/tour/:guideId` working) |
| Edit | `src/pages/Tours.tsx` (one card per published tour + empty-state note for guides without tours) |
| Edit | `src/components/TourCard.tsx` (cover image + tour title + `noToursNote` prop) |
| Edit | `src/pages/GuidesPage.tsx` (tour count pill + empty-state note) |
| Edit | `src/pages/Admin.tsx` (Tours tab content) |
| Edit | `src/components/BookingRequestForm.tsx` (optional `tourId` prop → inquiry increment) |

### Risks / Notes (unchanged)
- View/inquiry counters use `SECURITY DEFINER` RPC — atomic, no race conditions.
- `category` column reused as `tour_type` (existing list expanded to 9 types).
- `cover_image_url` kept in sync with `photos[0]` on save.
- No Header / Hero / Navbar / Stripe / founding logic changes.

### After implementation
Publish.


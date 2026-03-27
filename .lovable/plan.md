

# Emergency Fix — Force Initials-Only Avatars in MeetGuidesSection

## Problem
The `MeetGuidesSection` fetches profile photos from the `guide-photos` storage bucket (lines 57-72). If AI-generated photos were uploaded there, they get displayed. The code itself has no hardcoded fake image URLs.

## Fix — `src/components/MeetGuidesSection.tsx`

**Remove the entire photo-fetching block** (lines 57-72) and the `photoUrl` property, so the component always renders initials avatars.

1. Delete the photo-fetching `for` loop and `photoUrls` map (lines 57-72)
2. Set `photoUrl: null` always in the enriched data (line 77)
3. Remove the `guide.photoUrl` conditional branch (lines 185-191) — keep only the initials `<div>`
4. Update initials font size from 48px to 64px per the spec
5. Remove `photoUrl` from the `GuideProfile` interface

## Audit of other components
No hardcoded fake person photos found anywhere else in source code:
- `GuideProfilePage.tsx` — fetches from storage (user-uploaded only)
- `GuideGallery.tsx` — fetches portfolio images from storage (user-uploaded only)
- `Admin.tsx` — fetches from storage for admin review
- `GuideDashboard.tsx` — upload/delete flow for guide's own photos
- No unsplash, pexels, randomuser, or AI image service URLs found

The storage bucket itself may contain uploaded files that need manual deletion, but that's outside the codebase.

## Result
Guide cards will always show gold initials (MZ, MM) on navy background — no photos displayed regardless of storage contents.


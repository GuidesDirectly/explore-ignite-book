

## Plan — Traveler Profile Frontend

### Investigation
- `traveler_profiles` table exists with RLS already correct (users own their rows). Existing `useTravelerProfile` hook + `TravelerProfileForm` cover preferences modal but **lack** first/last name, country, profile photo.
- `bookings`, `saved_guides`, `conversations`, `messages`, `reviews` tables all exist with proper RLS.
- No traveler dashboard route exists. Login redirects guides → `/guide/dashboard` only.
- Storage: `guide-photos` bucket exists (public). We'll reuse it under a `traveler-avatars/` prefix to avoid creating extra infra.

### Required schema additions (migration)
Add columns to `traveler_profiles`:
- `first_name text`, `last_name text`, `country text`, `avatar_url text`, `onboarding_complete boolean default false`

Existing RLS already restricts to `auth.uid() = user_id` ✅ no policy changes needed.

### Files to create
| Path | Purpose |
|---|---|
| `src/pages/TravelerOnboarding.tsx` | 5-step wizard (name → country → languages → interests → photo) |
| `src/pages/TravelerDashboard.tsx` | Tabs: Upcoming, Past, Saved, Messages + edit-profile button |
| `src/components/traveler/UpcomingBookings.tsx` | List bookings where `date >= today` & status ≠ cancelled |
| `src/components/traveler/PastTours.tsx` | Past bookings + "Leave a Review" CTA |
| `src/components/traveler/SavedGuidesList.tsx` | Pulls from `saved_guides` joined with `guide_profiles_public` |
| `src/components/traveler/MessagesInbox.tsx` | Conversations list with last message preview |
| `src/components/traveler/LeaveReviewDialog.tsx` | Inserts into `reviews` with `booking_id`, 1–10 rating |

### Files to modify (small, surgical)
| Path | Change |
|---|---|
| `src/hooks/useTravelerProfile.ts` | Extend `TravelerProfile` interface + `save()` payload with the 5 new fields |
| `src/pages/Login.tsx` | After login, if user has no admin/agency/guide role AND `traveler_profiles.onboarding_complete !== true` → redirect to `/traveler/onboarding`, else `/traveler/dashboard` |
| `src/App.tsx` | Add 2 routes: `/traveler/onboarding`, `/traveler/dashboard` |
| `src/components/NavbarUserMenu.tsx` | Add "My Dashboard" link for traveler users (no Header/Hero/Navbar layout changes) |

### Key flows
1. **Onboarding trigger** — checked in `Login.tsx` post-auth handler. If `onboarding_complete = false` (or row missing), route to wizard. Wizard saves and sets flag, then routes to dashboard.
2. **Review prompt** — `PastTours` component scans for past bookings without a matching review (`reviews.booking_id`) and shows pulsing "Leave a Review" button → opens `LeaveReviewDialog`.
3. **Photo upload** — uses existing `guide-photos` public bucket under `traveler-avatars/{userId}/avatar.jpg`. URL stored in `avatar_url`.

### Untouched (per memory rules)
Header, Hero, Navbar layout, all guide/admin flows, all other pages, Stripe, founding logic.

### After
Publish.


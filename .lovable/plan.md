

## Plan — Fix /guides regression + improve /tours empty state

### Investigation
- Database has 5 approved guides in `guide_profiles_public` (Michael, Mike, Eduard, Farmers, Americo).
- `GuidesPage.tsx` query already only filters `status='approved'` — correct, no tour-existence filter is being applied. The "No guides found" message the user is seeing is the **filtered-empty branch**, possibly triggered by stale state, but the fetch itself looks correct.
- The actual regression risk: the runtime "Failed to fetch" error in the snapshot suggests one of the three parallel queries in `Promise.all` is failing transiently. If `toursRes` or `reviewsRes` rejects, `guidesRes.data` is still set — but the whole effect could surface an uncaught error. We'll harden it by **decoupling the queries** so a tours/reviews failure can't block guide rendering.
- `Tours.tsx` empty state currently says "No tours found — Try adjusting your search or filters." It needs the new traveler-friendly copy + "Browse Guides" CTA.

### Fix 1 — `src/pages/GuidesPage.tsx`
- Replace the single `Promise.all` with three independent awaits wrapped in try/catch each. Guide fetch runs first and always sets state regardless of whether tours/reviews succeed.
- Keep query exactly: `.from("guide_profiles_public").select(...).eq("status","approved")` — no tour filter, no activation filter (view already projects only safe rows).
- Tour count map remains; guides with 0 tours render the existing italic note "No tours listed yet — contact to inquire" (already implemented at lines 372–407).
- Empty state copy stays as-is (only triggered when filters return zero matches).

### Fix 2 — `src/pages/Tours.tsx` empty state (lines 411–416)
Replace the current empty-state block with:
- Heading: "Tours coming soon"
- Body: "Our guides are setting up their tours. Browse our guides directly or check back soon."
- Primary button: "Browse Guides →" linking to `/guides` (uses existing `useNavigate` or react-router `Link`).
- Keep the `Compass` icon for visual continuity.

### Files touched
| Path | Change |
|---|---|
| `src/pages/GuidesPage.tsx` | Decouple parallel queries → guide list always renders even if reviews/tours queries fail |
| `src/pages/Tours.tsx` | New empty-state copy + "Browse Guides" CTA |

### Untouched
Header, Hero, Navbar, all DB schema, RLS, Stripe, founding logic, all other pages.

### After
Publish.




## Plan — Two traveler dashboard fixes

### Fix 1: Sign-up redirect skips onboarding

**Root cause** — `Login.tsx` `routeAfterAuth()` runs immediately after `signUp` returns (line 145). At that exact moment the DB trigger `handle_new_user` has fired, but the new `traveler_profiles` row has **not** been created yet (no trigger creates it). So the query `traveler_profiles.select(onboarding_complete).maybeSingle()` returns `null`. 

Re-reading the existing logic:
```ts
else if (!travelerProfile?.onboarding_complete) navigate("/traveler/onboarding");
```
`null?.onboarding_complete` is `undefined`, `!undefined` is `true` → should route to onboarding. So this already works on paper.

**Likely real bug**: a race/caching issue, OR the user already has a profile row with `onboarding_complete = true` from a prior test. Defensive fix:

In `Login.tsx`, change the **sign-up** branch to skip the role/profile lookup entirely and route directly to `/traveler/onboarding` — a brand-new sign-up is by definition a traveler with no completed onboarding. Sign-in keeps the existing `routeAfterAuth` logic.

```ts
// In handleSignup, replace `await routeAfterAuth(authData.user.id)` with:
navigate("/traveler/onboarding");
```

### Fix 2: Red notification dot on tabs

**Investigation result** — searched all components; no notification-dot, unread badge, or `bg-red-*` indicator is rendered on the dashboard tabs or by `MessagesInbox` / `UpcomingBookings` / etc. The codebase contains no `unread`, `is_read`, `notification` state.

The only red element on screen is the **Heart icon in the Navbar** (`hover:text-red-400`, line 146 of `Navbar.tsx`) which only colors red on hover.

**Defensive action**: confirm by re-reading the rendered components once more in default mode; if a stray indicator is found (e.g. a leftover `<span className="bg-red-500 ...">` introduced somewhere I haven't grep'd), remove it. If nothing is found, add a one-line note in the implementation message explaining the dashboard renders zero notification indicators and asking the user to share a screenshot if the dot persists.

### Files touched

| Path | Change |
|---|---|
| `src/pages/Login.tsx` | In `handleSignup` success branch, route directly to `/traveler/onboarding` instead of calling `routeAfterAuth` |
| (read-only verification) | Re-confirm no notification-dot JSX exists in `TravelerDashboard.tsx`, `MessagesInbox.tsx`, `UpcomingBookings.tsx`, `PastTours.tsx`, `SavedGuidesList.tsx` |

### Untouched
Header, Hero, Navbar, all routes, all RLS, all other pages, sign-in flow.

### After
Publish.




## Plan — Header rebuild + 4 UX fixes (FINAL, approved)

### FIX 1 — Header rebuild (`src/components/Navbar.tsx`)

**Desktop layout:**
- LEFT: Logo (unchanged)
- CENTER: `Destinations` | `Guides` | `How It Works` | `About`
- RIGHT (logged-out):
  1. `+1 (202) 243-8336` — phone icon + text only (single instance)
  2. **Sign In** — outline button → `/login`
  3. **Join Free as Traveler** — secondary outline (white/40) → `/login?tab=signup`
  4. **Find a Guide** — gold primary → `/guides` *(was /tours)*
  5. **For Guides** — small muted text link → `/for-guides`
  6. LanguageSwitcher
- REMOVE: existing "Join as Guide" gold button

**Mobile menu:** mirrors desktop in same order; phone at bottom; remove Join as Guide.

### FIX 5 — Logged-in header state (same file)

Extend existing auth `useEffect` to also query `user_roles` and `guide_profiles` (existence check). Replace Sign In + Join Free as Traveler with one contextual link, keep Find a Guide + For Guides + avatar:
- `admin` → **Admin Panel** → `/admin`
- `guide` (or has guide_profile row) → **My Dashboard** → `/guide-dashboard`
- traveler → **My Dashboard** → `/traveler/dashboard`

### FIX 2 — Guide cards copy (`src/pages/GuidesPage.tsx`)

Change `"No tours listed yet — contact to inquire"` → `"Available for custom tours — send a message"`.

### FIX 3 — Founding guides section (`src/components/MeetGuidesSection.tsx`) [APPROVED SIMPLIFICATION]

Use `guide_profiles_public` directly as the PRIMARY query — no two-step, no `subscription_plan_id` filter:
```ts
supabase.from('guide_profiles_public').select('*')
```
The view already enforces `status='approved' AND activation_status='active'`, so today all 4 results = all founding guides. Remove the broken `.eq("subscription_plan_id", foundingPlanId)` filter and the `useFoundingProgram` plan-id dependency for this query. Keep ordering and any display limits as-is.

### FIX 4 — Title-case location formatting

Add `toTitleCase(str)` helper in `src/lib/utils.ts` with smart-acronym handling (`DC`, `USA`, `UK`, `NYC`, `LA`).

Apply to:
- `GuidesPage.tsx` city display
- `MeetGuidesSection.tsx` `service_areas[0]` display

Example: `"LOS ANGELES"` → `"Los Angeles"`, `"WASHINGTON DC"` → `"Washington DC"`.

### Bonus — Login `?tab=signup` (`src/pages/Login.tsx`)

Read `useSearchParams()`; if `tab === "signup"`, initialize Tabs to `"signup"`.

### Files touched
| Path | Change |
|---|---|
| `src/components/Navbar.tsx` | Full rebuild + role-aware logged-in state |
| `src/pages/GuidesPage.tsx` | Empty-tour copy + Title Case city |
| `src/components/MeetGuidesSection.tsx` | Direct `guide_profiles_public` query, drop founding filter, Title Case |
| `src/lib/utils.ts` | Add `toTitleCase` helper |
| `src/pages/Login.tsx` | Read `?tab=signup` query param |

### Untouched
Logo, Hero, all routes, color tokens, design system, all other pages, RLS, all dashboards.

### After
Publish.


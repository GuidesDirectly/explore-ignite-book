

## Plan — Admin Analytics dashboard

### File: `src/pages/Admin.tsx` only

Add new "Analytics" tab to existing tab structure. All queries gated by `has_role(admin)` check already in place on the page.

### New component: `src/components/admin/AnalyticsDashboard.tsx`

Single self-contained component mounted inside the new tab. Five sections rendered in order using existing `Card` + `lucide-react` icons + Tailwind tokens (navy/gold).

**1. Key metrics cards (6-card grid, `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`)**
- Total users → `supabase.from('user_roles').select('user_id', { count: 'exact', head: true })` (distinct via Set on client if needed — small dataset)
- Approved guides → `guide_profiles` count where `status='approved'`
- Total bookings → `bookings` count
- Total inquiries → `inquiries` count
- Founding spots claimed → `app_settings` key `founding_guide_current_count` / `founding_guide_limit` shown as "X / Y"
- Days until founding ends → computed from `2026-12-31` minus today

**2. Guide pipeline funnel (horizontal bars, widths proportional to top-of-funnel)**
- Total applications → `guide_profiles` count (all)
- Approved → count where `status='approved'`
- Active → count where `activation_status='active'`
- With tours published → distinct `guide_user_id` from `tours` where `status='published'`

Rendered as 4 stacked rows, each: label · number · gold bar with width `(count / max) * 100%`.

**3. Recent activity feed**
- `analytics_events` ordered by `created_at desc` limit 10
- Icon mapping per `event_type` (swap_request → Shuffle, cta_click → MousePointer, ai_demo_submit → Sparkles, tour_plan_generated → Map, guide_matched → Users, fallback → Activity)
- Show event type (humanized), relative time (`date-fns formatDistanceToNow`), small JSON preview of `event_data`

**4. Geographic coverage**
- Query `guide_profiles` where `status='approved' AND activation_status='active'`, select `service_areas`
- Flatten arrays client-side, count occurrences per city, sort desc, render as list with city name + badge count

**5. MRR estimate (prominent card, gold accent)**
- Query `guide_profiles` grouped by `subscription_tier` where `subscription_status='active'`
- Pro (`pro`) × $29 + Featured (`featured`) × $59 + Spotlight (computed via `is_spotlight=true`) × $49
- Show component breakdown + total in large gold typography

### Data fetching pattern
- Single `useEffect` on mount, `Promise.all` of ~7 queries via existing `supabase` client
- Local loading state, skeleton cards while loading
- Errors logged to console, sections degrade gracefully

### Admin gate
`Admin.tsx` already checks `has_role(admin)` before rendering content — Analytics tab inherits that gate. No additional auth code.

### Files touched

| Path | Change |
|---|---|
| `src/components/admin/AnalyticsDashboard.tsx` | NEW — full dashboard |
| `src/pages/Admin.tsx` | Add Analytics tab + trigger; mount `<AnalyticsDashboard />` |

### Untouched
Header/Navbar, Hero, Footer, all other pages, table schemas, RLS, Stripe, messaging, SEO.

### After
Publish.


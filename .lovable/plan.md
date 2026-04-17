

## Plan — 4 Founding/Pricing/Spotlight Fixes

### FIX 1 — MeetGuidesSection: show all 5 founding guides
**Root cause:** The component first queries `guide_profiles` (which for anonymous homepage visitors only returns rows under the `public_can_view_approved_active_rows` policy) but the column shape & ordering currently lands inconsistent results. More importantly, the `guide_profiles_public` view does NOT expose `subscription_plan_id`, forcing a two-step query that's fragile.

**Fix (single approach, defensive):** Rewrite the fetch to:
1. Query `guide_profiles` directly with `.select('user_id').eq('subscription_plan_id', foundingPlanId).eq('status','approved').eq('activation_status','active').order('created_at')`. This works for anon (RLS allows it) and for authed users (admin/own).
2. Then query `guide_profiles_public` with `.in('user_id', userIds)` for the sanitised data.
3. Add a console.warn fallback if step 1 returns 0 → also try `guide_profiles_public.select('user_id, form_data')` and filter where `form_data` matches founders (no-op safety net).

Result: all 5 (Michael, Mike, Eduard, Farmers Gregory, Americo Fernandes) render in the gold grid.

### FIX 2 — Pricing page copy (i18n strings)
Update `src/i18n/locales/en.json` `forGuides` section only:
- `tier1Sub` → `"Free until December 31, 2026"` (plus add new key `tier1SubLine2`: `"Then $29/mo — your rate locked forever"`)
- `tier1Note` → `"Your founding rate is locked forever, even after 2026"`
- `tier2Badge` → `"AVAILABLE NOW"`
- `tier3Badge` → `"AVAILABLE NOW"`
- `early1` → `"Free until Dec 31, 2026 — then $29/mo locked forever"`
- `pricingDisclaimer` → updated to reflect Dec 31, 2026 + locked $29 messaging

Update `ForGuidesPage.tsx` Founding card body to render two stacked sub-lines (`tier1Sub` + `tier1SubLine2`) instead of one.

### FIX 3 — Spotlight Guide $49 add-on box
**Database (migration):**
```sql
INSERT INTO subscription_plans (slug, name, price_monthly, price_yearly, is_active, sort_order, features, featured_placement, priority_support)
VALUES ('spotlight','Spotlight',49,490,true,4,
  '["Top 3 city placement","Spotlight badge","Newsletter feature","AI Planner priority","Zero commission"]'::jsonb,
  true,true);
```

**UI in `ForGuidesPage.tsx`:** Below the 3 plan cards, add a single highlighted full-width gold-bordered box with:
- Heading `"SPOTLIGHT GUIDE — $49/mo add-on"` (gold)
- Subtext `"Available to Pro or Featured guides only · Limited to 3 guides per city"`
- 5 feature bullets (Top 3 placement, gold banner, newsletter, AI priority, zero commission)
- CTA button `"Add Spotlight"` → `mailto:allharmony@gmail.com?subject=Spotlight%20Guide%20Enrollment&body=I'd like to add Spotlight to my guide profile.`
- Closing line: `"Want to appear first in your city? Add Spotlight for $49/mo — only 3 spots per city available."`

All copy added to `forGuides` i18n keys (`spotlightTitle`, `spotlightFeat1..5`, `spotlightCta`, `spotlightNote`, `spotlightAvailability`).

### FIX 4 — `is_spotlight` flag + sorting & banner
**Migration:**
```sql
ALTER TABLE guide_profiles ADD COLUMN IF NOT EXISTS is_spotlight boolean DEFAULT false;
```
Then drop & recreate `guide_profiles_public` view to add the `is_spotlight` column (kept in public projection — it's a non-sensitive boolean used for sort/badge display). Also adds `subscription_plan_id` so future joins don't need a second query.

**UI:**
- Create `src/components/SpotlightBanner.tsx` — small gold "⭐ SPOTLIGHT" badge component (matches FoundingGuideBadge styling but with `Star` icon).
- `GuidesPage.tsx`:
  - Sort guides: spotlight guides first within each city group (`sort((a,b) => (b.is_spotlight?1:0) - (a.is_spotlight?1:0))` applied after city filter, before render).
  - Render `<SpotlightBanner />` next to existing badges on guide cards.
- `GuideProfilePage.tsx`: render `<SpotlightBanner size="md" />` in header next to founding badge if `is_spotlight === true`.
- `Tours.tsx`: same sort + banner on tour cards.

### Files touched
| Type | Path |
|------|------|
| Migration | new — `ALTER guide_profiles + INSERT spotlight plan + recreate guide_profiles_public view` |
| Edit | `src/components/MeetGuidesSection.tsx` (fetch fix) |
| Edit | `src/pages/ForGuidesPage.tsx` (pricing card copy + spotlight box) |
| Edit | `src/i18n/locales/en.json` (pricing + spotlight keys) |
| New | `src/components/SpotlightBanner.tsx` |
| Edit | `src/pages/GuidesPage.tsx` (spotlight sort + banner) |
| Edit | `src/pages/GuideProfilePage.tsx` (spotlight banner in header) |
| Edit | `src/pages/Tours.tsx` (spotlight sort + banner) |

### Untouched
Header, Hero, Navbar, Stripe price IDs, founding flow, all other plans/pages.

### After
Publish.


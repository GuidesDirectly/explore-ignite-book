

Let me explore the remaining files to plan precisely.
<lov-tool-use id="toolu_vrtx_01MztjyVrKR9dQpsuPfke4Bk" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/GuidesPage.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01N3f1ZDMDEU2dC3D6gYJyDm" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/GuideProfilePage.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01GDyUd65P8vp8g2rtS661MH" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Admin.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01HtxxHxFk2QDnFhkTcVHTq9" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/GuidesPage.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01GWyFRerhXH1qnuAWXaKvj7" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/GuideProfilePage.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01NFDeHLa9kiJqn7jSEsVZxc" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Admin.tsx\"}">
</lov-tool-use>
I have enough context. The plan is clear — present concise plan and stop.

<lov-plan>

## Plan — Finish Founding Guide UI placements (4 items, single pass)

### 1. `src/pages/GuidesPage.tsx` — wire founding badges
The hook + `foundingUserIds` state already exist (lines 70, 72) but never gets populated and the badge is never rendered. Add:
- After fetching guides, query `guide_profiles` for `subscription_plan_id = foundingProgram.foundingPlanId` AND `status='approved'` AND `activation_status='active'`, build `Set<user_id>`, store via `setFoundingUserIds`.
- In the card render (around line 290, near VERIFIED badge), render `<FoundingGuideBadge size="sm" />` if `foundingUserIds.has(guide.user_id)`.

### 2. `src/pages/GuideProfilePage.tsx` — header badge
- Import `useFoundingProgram` + `FoundingGuideBadge`.
- Add `isFounding` state. After the existing guide fetch, run a single `guide_profiles` lookup by `user_id` for `subscription_plan_id` and compare to `foundingProgram.foundingPlanId`.
- Render `<FoundingGuideBadge size="md" />` immediately after the `<h1>` name (around line 424) inside a flex wrapper.

### 3. `src/components/dashboard/ActivationFunnel.tsx` — founding section
Add a new section above the existing stats grid:
- Pull `useFoundingProgram` data → render counter card "X of 50 claimed · Y remaining" + countdown "Free period ends in N days (Dec 31, 2026)" computed from `freeUntil`.
- Below it, a `<Collapsible>` (Radix already in project) listing founding guides (filter existing `guide_profiles` query by `subscription_plan_id === foundingPlanId`): show name, `activation_status` badge, formatted `updated_at`. Reuses existing fetch pattern; adds one extra select for plan_id on the existing query.

### 4. `src/pages/Admin.tsx` — guide-row badges
- Import `useFoundingProgram` + `FoundingGuideBadge`.
- In `renderGuideCard` (line 347), after the existing tier `<Badge>` at line 381–383, render `<FoundingGuideBadge size="sm" />` if `guide.subscription_plan_id === foundingProgram?.foundingPlanId`.
- Add `subscription_plan_id` to the `GuideApplication` interface (line 35–59).

### Files touched
- `src/pages/GuidesPage.tsx` (wire fetch + badge)
- `src/pages/GuideProfilePage.tsx` (badge in header)
- `src/components/dashboard/ActivationFunnel.tsx` (counter + countdown + collapsible list)
- `src/pages/Admin.tsx` (badge in guide rows + interface field)

### No changes
- Database, edge functions, Stripe, Header/Hero/Nav, design tokens.

### After implementation
Publish.


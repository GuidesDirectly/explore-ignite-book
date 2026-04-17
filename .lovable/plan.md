

## Final Plan — Founding Guide Campaign (with additions)

All previously approved scope stands. Two additions confirmed:

### Addition to Part 4 — "50th spot claimed" handling
After incrementing `founding_guide_current_count` in `guide-subscribe`, if the new count `== 50`:
- Send admin alert via `send-notification` (new type `founding_spots_filled`):
  - To: `allharmony@gmail.com`
  - Subject: "All 50 Founding Guide spots are claimed!"
  - Body: confirms all spots filled, notes new guides now go to paid flow, includes ISO timestamp of fill event.
- Frontend: `GuideRegister.tsx` already reads `founding_guide_current_count` on mount. When `remaining <= 0`, render a clear "Founding Guide spots are now full — join as a Pro guide for $29/mo" message in place of the gold banner. (No extra logic needed — driven by the same setting.)

Add the corresponding `founding_spots_filled` case to `send-notification/index.ts` template switch.

### Confirmation — `useFoundingProgram` hook caching
Single fetch on mount, stored in `useState`, no refetch on render:
```ts
const [data, setData] = useState<{
  foundingPlanId: string | null;
  limit: number;
  currentCount: number;
  remaining: number;
  freeUntil: string;
  lockedPrice: number;
  isFull: boolean;
} | null>(null);

useEffect(() => {
  let cancelled = false;
  (async () => {
    const [plan, settings] = await Promise.all([
      supabase.from("subscription_plans").select("id").eq("slug", "founding").maybeSingle(),
      supabase.from("app_settings").select("key, value")
        .in("key", ["founding_guide_limit","founding_guide_current_count","founding_guide_free_until","founding_guide_locked_price"]),
    ]);
    if (cancelled) return;
    // build object, setData(...)
  })();
  return () => { cancelled = true; };
}, []);
```
Components import this hook → one network call per page load, shared by `GuideRegister`, `MeetGuidesSection`, `ActivationGate`, `ActivationFunnel`, `GuidesPage`, `GuideProfilePage`, `Admin`, and the `FoundingGuideBadge` detector.

### Unchanged from prior approved plan
Parts 1, 2, 3, 5, 6, 7 exactly as previously approved. No design/Header/Hero/nav changes. No Stripe price ID changes.

### Files (final)
| Type | Path |
|------|------|
| New | `src/components/FoundingGuideBadge.tsx` |
| New | `src/hooks/useFoundingProgram.ts` |
| Edit | `src/pages/GuideRegister.tsx` |
| Edit | `src/components/MeetGuidesSection.tsx` |
| Edit | `src/pages/GuideProfilePage.tsx` |
| Edit | `src/pages/GuidesPage.tsx` |
| Edit | `src/pages/Admin.tsx` |
| Edit | `src/components/dashboard/ActivationGate.tsx` |
| Edit | `src/components/dashboard/ActivationFunnel.tsx` |
| Edit | `supabase/functions/guide-activation-reminders/index.ts` (3 new jobs + 3 email types) |
| Edit | `supabase/functions/guide-subscribe/index.ts` (founding branch + 50th-spot alert) |
| Edit | `supabase/functions/send-notification/index.ts` (5 new email types: `founding_guide_welcome`, `founding_30day_warning`, `founding_7day_warning`, `founding_expired`, `founding_spots_filled`) |

### Risks / Notes (unchanged)
- Counter increment is read-modify-write; acceptable at 50-guide volume.
- Date logic in cron is UTC; safe to deploy now (no fires until Dec 1, 2026).
- Admin alert hard-coded to `allharmony@gmail.com` per request.


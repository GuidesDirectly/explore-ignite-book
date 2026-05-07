# Two Targeted Fixes

## Fix 1 — `src/pages/GuideProfilePage.tsx`
In the slug-based lookup branch of `fetchGuide` (line 119), add `activation_status` to the select so the page doesn't render blank when filtering on it later:

```ts
.select("id, user_id, form_data, service_areas, translations, activation_status") as any);
```

(UUID branch on line 110 is left untouched per request.)

## Fix 2 — `src/pages/GuidesPage.tsx`
Make each guide card clickable to `/guide/{slug}` while keeping the Message button independent.

- Add `cursor: "pointer"` to the card's outer `<div>` style.
- Add `onClick` on the outer `<div>` that navigates to `/guide/${generateGuideSlug(fd.firstName || "", fd.lastName || "", city)}`.
- On the existing specialization pill `<button>`s (which already navigate), add `e.stopPropagation()` so they aren't double-handled.
- Wrap the `MessageGuideButton` in a container `<div>` with `onClick={(e) => e.stopPropagation()}` so clicking the message button (and its dialog) does not trigger card navigation.

No other logic, styling, or behavior changes.

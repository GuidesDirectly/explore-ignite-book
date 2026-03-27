

# Guide Card City Backgrounds

## Single file changed: `src/pages/GuidesPage.tsx`

### Step 1 — Add image imports (after line 6)

```tsx
import dcImg from "@/assets/hero-dc.jpg";
import chicagoImg from "@/assets/city-cards/chicago.jpg";
```

### Step 2 — Add city image lookup function (after the LANGUAGE_OPTIONS array, before the component)

```tsx
function getCityImage(guide: GuideProfile): string | null {
  const areas = guide.service_areas || [];
  const areasStr = JSON.stringify(areas).toLowerCase();
  if (areasStr.includes("washington") || areasStr.includes("dc") || areasStr.includes("d.c")) return dcImg;
  if (areasStr.includes("chicago")) return chicagoImg;
  return null;
}
```

### Step 3 — Update avatar div (lines 295-315)

Replace the current avatar container with:
- Keep the outer div with `aspectRatio: 1/1` and `background: #0A1628`, add `overflow: hidden`
- If `getCityImage(guide)` returns a value, render an `<img>` filling the container at `opacity: 0.4`, `objectFit: cover`, absolutely positioned
- Add a dark gradient overlay div on top of the image (`linear-gradient(to top, rgba(10,22,40,0.7), rgba(10,22,40,0.3))`)
- Add `position: relative, zIndex: 1` to the initials `<span>` so it sits above the overlay
- Add `position: relative, zIndex: 1` (via style merge) to the VERIFIED badge so it sits above the overlay

Guides with no matching city get plain navy background with no image — no visual change.

### No other files touched

No changes to HeroSection.tsx, MeetGuidesSection.tsx, routing, text content, or any other file.


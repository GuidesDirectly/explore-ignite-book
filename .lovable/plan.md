

# Fix Duplicate `forGuides` Key Conflict in en.json

## Problem
`en.json` has two `"forGuides"` objects (lines 178 and 746). JSON keeps only the last one, so `ForGuidesSection.tsx` keys (label, title, subtitle, etc.) resolve to raw key names at runtime.

## Fix — 3 steps

### Step 1 — Merge into one `forGuides` group in `en.json`
Delete the first `forGuides` block (lines 178-191). Add a nested `"section"` object inside the second `forGuides` block (line 746) containing the 12 keys from the deleted block, plus a new `aiToolsNote` key for the hardcoded string on line 64:

```json
"forGuides": {
  "section": {
    "label": "For Guides",
    "title": "Work Directly With Travelers Worldwide",
    "subtitle": "Keep your earnings. Control your pricing. Choose your clients.",
    "costNote": "Joining is currently free during launch. Future paid tools will always be optional.",
    "cta": "Apply to Join",
    "feat1": "Zero commissions — ever",
    "feat2": "Global traveler audience",
    "feat3": "Direct traveler relationships",
    "whyEarlyTitle": "Why Join Early?",
    "early1": "Priority visibility",
    "early2": "Early traveler requests",
    "early3": "Founding guide status",
    "aiToolsNote": "Includes AI-powered business tools to help you price and plan effectively."
  },
  "heroEyebrow": "FOR PROFESSIONAL TOUR GUIDES",
  ... (all existing page keys unchanged)
}
```

### Step 2 — Update `ForGuidesSection.tsx`
Change all `t("forGuides.X")` calls to `t("forGuides.section.X")` and wire the hardcoded AI tools string:
- `t("forGuides.label")` → `t("forGuides.section.label")`
- `t("forGuides.title")` → `t("forGuides.section.title")`
- `t("forGuides.subtitle")` → `t("forGuides.section.subtitle")`
- `t("forGuides.costNote")` → `t("forGuides.section.costNote")`
- `t("forGuides.feat1/2/3")` → `t("forGuides.section.feat1/2/3")`
- `t("forGuides.whyEarlyTitle")` → `t("forGuides.section.whyEarlyTitle")`
- `t("forGuides.early1/2/3")` → `t("forGuides.section.early1/2/3")`
- `t("forGuides.cta")` → `t("forGuides.section.cta")`
- Hardcoded string on line 64 → `{t("forGuides.section.aiToolsNote")}`

### Step 3 — Run translation script
Run Python script via `code--exec` to add `forGuides.section.*` (13 keys) to all 20 non-English locale files using the Lovable AI Gateway, same batch approach as before.

## Files modified
- `src/i18n/locales/en.json` — merge duplicate, add `section` nest + `aiToolsNote`
- `src/components/ForGuidesSection.tsx` — update 12 `t()` paths, wire 1 hardcoded string
- 20 locale files — add `forGuides.section` translations via script

## What does NOT change
- `ForGuidesPage.tsx` — no changes (its keys remain `forGuides.heroEyebrow`, etc.)
- No styling, layout, or routing changes
- No other components modified




# Translation System Integration — Wire Hardcoded Components into i18n

## Summary
Add ~100 new translation keys to `en.json` under 4 new groups, then replace all hardcoded English strings in 4 components with `t()` calls. No visual, styling, routing, or logic changes. Non-English locale files untouched.

## Files Modified (5 total)

### 1. `src/i18n/locales/en.json`
Append 4 new key groups before the closing `}` (after the existing `badge` group at line 698):
- `truePrice` — 8 keys
- `whyDirect` — 17 keys
- `aiCta` — 13 keys
- `forGuides` — 42 keys (includes hero, commission, features, pricing tiers, founding features, pro features, featured features, founder bios, final CTA)

All keys exactly as specified in the prompt. No existing keys modified.

### 2. `src/components/TruePriceSection.tsx`
- Add `import { useTranslation } from "react-i18next"` and `const { t } = useTranslation()`
- Replace 8 hardcoded strings with `t("truePrice.*")` calls
- No styling changes

### 3. `src/components/WhyDirectSection.tsx`
- Add useTranslation import and hook
- Replace the 6 `otherPlatformItems` and 6 `guidesDirectlyItems` arrays to use `t()` — move them inside the component body so the hook is available
- Replace heading, subheading, column headers, footer — 5 more `t()` calls
- No styling changes

### 4. `src/components/TravelerAiCta.tsx`
- Add useTranslation import and hook
- Move `benefits` array inside component to access `t()`
- Replace 13 hardcoded strings with `t("aiCta.*")` calls
- No styling changes

### 5. `src/pages/ForGuidesPage.tsx`
- Add `import { useTranslation } from "react-i18next"` and `const { t } = useTranslation()`
- Move `features`, `foundingFeatures`, `proFeatures`, `featuredFeatures` arrays inside component to access `t()`
- Replace all ~42 hardcoded strings with `t("forGuides.*")` calls
- For "View Michael's Profile" link: `t("forGuides.viewProfile", { name: g.name.split(" ")[0] })`
- Founder data (names, bios, titles, cities) stays hardcoded — these are proper nouns / personal data, not translatable UI strings
- No styling or routing changes

## What does NOT change
- No existing translation keys modified
- No non-English locale files touched (handled separately)
- No visual design, styling, or layout changes
- No routing or logic changes
- No images generated
- GuidesPage.tsx and Admin.tsx deferred to next prompt

## Technical note on arrays
Components like `WhyDirectSection` use static arrays defined outside the component. Since `t()` requires the hook (only available inside the component), these arrays will be moved inside the component function body. This is a standard React pattern and has zero visual impact.


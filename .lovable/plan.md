

# Wire Hardcoded Strings + Translate New Keys

## Summary
Update `hero.cta2` in en.json, add 8 new i18n keys, wire `t()` calls in two components, then run translation script for all 20 locales. Three files modified + 20 locale files updated via script.

## File Changes

### 1. `src/i18n/locales/en.json`
- **Update** `hero.cta2`: `"Join as Guide"` → `"I'm a Guide — Join Free"`
- **Add** to `hero` group: `searchLabel`, `cityPlaceholder`, `languagePlaceholder`
- **Add** new `trustBar` group with `stat1Label`–`stat4Label` + `stat4Value`

### 2. `src/components/HeroSection.tsx`
Replace 5 hardcoded strings with `t()` calls:
- Search label text → `t("hero.searchLabel")`
- City placeholder → `t("hero.cityPlaceholder")`
- Language placeholder → `t("hero.languagePlaceholder")`
- "Find a Guide" button → `t("hero.cta1")`
- "I'm a Guide — Join Free" button → `t("hero.cta2")`

### 3. `src/components/TrustBarSection.tsx`
- Import `useTranslation`
- Move `stats` array inside component, replace labels with `t("trustBar.stat1Label")` through `t("trustBar.stat4Label")` and `textValue` with `t("trustBar.stat4Value")`

### 4. Translation script via `code--exec`
Run Python script calling Lovable AI Gateway (same approach as before) to translate the new keys (`hero.searchLabel`, `hero.cityPlaceholder`, `hero.languagePlaceholder`, `hero.cta2`, and full `trustBar` group) into all 20 non-English locales and merge into existing files.

## Verification checklist
All 10 items from the user's list will be confirmed after execution.


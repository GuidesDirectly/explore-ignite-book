

# Hero Subheadline Text Change

**File:** `src/i18n/locales/en.json` — line 18

**Change:** Replace the `hero.subtitle` value:

```
// Before
"subtitle": "Connect directly with trusted local guides who design your experience — no middlemen, no markups, no hidden fees."

// After
"subtitle": "Connect directly with your guide — no platform fees, no commission markup, no middlemen."
```

One line, one file. The HeroSection.tsx renders this via `t("hero.subtitle")` so no change needed there.


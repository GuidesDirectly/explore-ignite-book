

# Guide Card Fix — Replace Flag Emojis with Text Language Code Pills

**File:** `src/pages/GuidesPage.tsx` only

### Changes

1. **Remove `LANGUAGE_FLAGS` map** (lines 12-34) — no longer needed for card rendering. Keep it only if used elsewhere... checking: it's also used nowhere else in this file except `getFlags`. Remove it.

2. **Remove `getFlags` function** (lines 130-135) and replace with:
```tsx
function getLanguageCodes(languages: string[]): string[] {
  const codeMap: Record<string, string> = {
    English: "EN", "Русский": "RU", Polski: "PL", Deutsch: "DE",
    "Français": "FR", "Español": "ES", "中文": "ZH", "日本語": "JA",
    "עברית": "HE", "العربية": "AR", "Português": "PT", "한국어": "KO",
    Italiano: "IT", "हिन्दी": "HI", "Tiếng Việt": "VI",
    "Bahasa Indonesia": "ID", Nederlands: "NL", "ไทย": "TH",
    "Türkçe": "TR", Svenska: "SV", "Українська": "UK",
  };
  return languages.map(l => codeMap[l] || l.slice(0, 2).toUpperCase()).slice(0, 4);
}
```

3. **Update card rendering** — replace the `getFlags` call and emoji flags row (lines 344-358) with gold-on-dark language code pills using the user's exact styling. Show max 4 codes with `+N` overflow.

4. **Keep `LANGUAGE_FLAGS`** actually — it may still be needed for the language dropdown `<select>`. Checking... no, the dropdown uses `LANGUAGE_OPTIONS` which is just string names. But wait — `LANGUAGE_FLAGS` feeds into `LANGUAGE_OPTIONS` via `Object.keys(LANGUAGE_FLAGS)`. So **keep `LANGUAGE_FLAGS`** for the dropdown, just stop using it for card rendering.

### Summary
- Remove `getFlags` function, add `getLanguageCodes` function
- Replace emoji flags row with styled text code pills
- Keep `LANGUAGE_FLAGS` for dropdown functionality
- No other files touched


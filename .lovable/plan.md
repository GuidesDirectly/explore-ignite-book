

# Create translate-i18n-keys Edge Function (Revised)

## Summary
Create one new edge function that translates i18n keys into 20 languages via the Lovable AI Gateway (Gemini 2.5 Flash). Then run a local script to call it and write results to locale files.

## Changes

### 1. Create `supabase/functions/translate-i18n-keys/index.ts`
- POST endpoint accepting `{ keys, targetLanguages, context }`
- JWT authentication + admin role check via `has_role(uid, 'admin')`
- Batches languages in groups of 5, calls Lovable AI Gateway (`google/gemini-2.5-flash`)
- Returns `{ translations: { ar: {...}, de: {...}, ... }, translatedKeys, languages }`
- CORS headers, input validation, error handling (429/402 surfaced)

### 2. Update `supabase/config.toml`
```toml
[functions.translate-i18n-keys]
verify_jwt = true
```

### 3. Post-deploy: Python script via `code--exec`
- Reads en.json, extracts the 4 new key groups (truePrice, whyDirect, aiCta, forGuides)
- Calls the deployed edge function with admin auth
- Merges returned translations into each of the 20 locale files, preserving existing keys

## What does NOT change
- No existing edge functions modified
- No frontend components modified
- No existing locale file keys modified


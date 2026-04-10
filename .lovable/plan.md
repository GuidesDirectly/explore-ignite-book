

# Update ForGuidesSection Homepage Copy

## What changes
Update 12 text values in the `forGuides.section` group in `en.json` with stronger conversion-focused copy, then run the translation script for all 20 non-English locales.

## Step 1 — Update `src/i18n/locales/en.json` (lines 734-746)

Replace values only (keys unchanged):

| Key | Old | New |
|-----|-----|-----|
| label | "For Guides" | "FOR TOUR GUIDES" |
| title | "Work Directly With Travelers Worldwide" | "Own your clients. Keep every dollar." |
| subtitle | "Keep your earnings..." | "The only platform where you keep 100% of what you earn — forever. No commission. No middlemen." |
| costNote | "Joining is currently free..." | "Free forever for our first 50 founding guides." |
| cta | "Apply to Join" | "Join as a Founding Guide — Free" |
| feat1 | "Zero commissions — ever" | "Zero commission — ever" |
| feat2 | "Global traveler audience" | "Your own Google profile page" |
| feat3 | "Direct traveler relationships" | "Direct traveler relationships" (unchanged) |
| whyEarlyTitle | "Why Join Early?" | "Why join as a Founding Guide?" |
| early1 | "Priority visibility" | "Free forever — never changes" |
| early2 | "Early traveler requests" | "First access to new cities" |
| early3 | "Founding guide status" | "Founding Guide badge on profile" |
| aiToolsNote | "Includes AI-powered business tools..." | "Includes AI Content Co-Pilot — write in 21 languages instantly." |

## Step 2 — Run translation script

Python script via `code--exec` translating only `forGuides.section.*` (13 keys) into all 20 non-English locale files using Lovable AI Gateway, merging into existing files.

## Files modified
- `src/i18n/locales/en.json` — 12 value updates in `forGuides.section`
- 20 locale files — updated `forGuides.section` translations via script

## No changes to
- Any component files
- Any styling or layout
- Any other translation keys


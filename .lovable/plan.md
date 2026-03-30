

# CRM Onboarding Enhancements — Three Targeted Additions

## Overview
Three surgical additions to the existing guide onboarding flow. Nothing existing is modified.

## Feature 1 — Add `profile_reminder` email type to send-notification

**File:** `supabase/functions/send-notification/index.ts`

- Add `"profile_reminder"` to the `NotificationRequest` type union (line 30)
- Add `"profile_reminder"` to `VALID_TYPES` set (line 34)
- Add `"profile_reminder"` to `PUBLIC_TYPES` set (line 37) — this type will be called server-to-server from the draft-guide-reminder function, not from authenticated users
- Add a new `else if (type === "profile_reminder")` handler block after the existing handlers, before the final `resend.emails.send` call
- Email template: dark navy header (`#0A1628`) with "Guides Directly" in white, clean white body, gold CTA button (`#C9A84C` bg, `#0A1628` text) linking to `data.registration_url`, navy footer — matching the existing email styling pattern
- Subject: "Complete your Guides Directly profile — your spot is waiting"
- From: `iGuide Tours <noreply@iguidetours.net>`
- To: `data.guide_email`

## Feature 2 — New `draft-guide-reminder` edge function

**New file:** `supabase/functions/draft-guide-reminder/index.ts`

- Uses service role client to query `guide_profiles` where `status = 'draft'` and `created_at < now() - 48 hours`
- For each result with a non-null `form_data->>'email'`:
  - Calls send-notification via `fetch` (internal Supabase function URL) with `type: "profile_reminder"` payload
  - Passes `guide_name`, `guide_email`, and `registration_url` (link to `/guide-register`)
- Returns JSON `{ sent: number }` count
- Standard CORS headers matching other functions
- Add `[functions.draft-guide-reminder]` with `verify_jwt = false` to `supabase/config.toml`

## Feature 3 — Admin panel reminder button

**File:** `src/pages/Admin.tsx`

- Add a `draftGuides` filter: `guides.filter(g => g.status === "draft")`
- Above the pending guides section (around line 773), add a conditional block that renders when `draftGuides.length > 0`:
  - Button: "Send Reminders to Draft Guides" with `Mail` icon
  - Styled with gold-tinted background/border per spec
  - On click: calls `supabase.functions.invoke("draft-guide-reminder")`, shows loading state, then toast with count or error
- Add `sendingReminders` state boolean
- No other Admin.tsx features changed

## Files touched
1. `supabase/functions/send-notification/index.ts` — add type + handler
2. `supabase/functions/draft-guide-reminder/index.ts` — new file
3. `supabase/config.toml` — add function entry
4. `src/pages/Admin.tsx` — add button + draft filter

## What is NOT touched
- `GuideRegister.tsx` — unchanged
- Existing email types — unchanged
- Existing Admin approve/reject — unchanged
- No other frontend files


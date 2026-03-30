

# Welcome Email System Upgrade — Three Template Rewrites + One New Email

**File:** `supabase/functions/send-notification/index.ts` only. No other files changed.

## Change 1 — Rewrite `guide_application` template (lines 327–362)

Replace the entire `guide_application` handler body HTML and subject. Keep the admin notification email (lines 353–362) completely unchanged.

- **New subject:** `You're in — welcome to Guides Directly, [guideName]`
- **New HTML:** Guides Directly branded header (#0A1628 bg, white "GuidesDirectly" text, subdued "by iGuide Tours"), white body with the full copy from the prompt (three ✦ tips, zero-commission promise, signed by Michael Zlotnitsky), gold CTA button (#C9A84C) linking to `https://iguidetours.net/about`, grey footer with "© 2025–2026 Guides Directly" text
- **From address** on the primary send (line 613): stays as-is (shared across all types). The admin notification `from` (line 355) stays unchanged.
- **Data fields unchanged:** still uses `guideName`, `guideEmail`

## Change 2 — Rewrite `guide_status` approved branch only (lines 272–301)

Replace only the approved branch subject and HTML. The rejected branch (lines 302–308), admin notification (lines 317–326), and email lookup logic (lines 255–266) stay completely unchanged.

- **New approved subject:** `You're approved — your Guides Directly profile is now live`
- **New HTML:** Same branded header as Change 1. Body contains the four numbered next steps (video, share profile, languages, respond quickly), zero-commission promise, gold CTA "View Your Live Profile →" linking to `https://iguidetours.net/guide/[guideUserId]`, signed by Michael Zlotnitsky
- **Data fields unchanged:** still uses `guideName`, `guideEmail`, `guideUserId`, `status`

## Change 3 — Add traveler confirmation to `inquiry` handler (after line 196)

After the existing admin notification HTML is set (the `inquiry` block currently only sets `toEmails = [NOTIFY_EMAIL]` for the admin), add a second `resend.emails.send()` call that sends a confirmation email to the traveler.

- **Guard:** only send if `data.email` is truthy
- **To:** `data.email`
- **From:** `Guides Directly <noreply@iguidetours.net>`
- **Subject:** `We received your message, [name] — a guide will be in touch soon`
- **HTML:** Same branded header/footer. Body echoes back destination, group_size, message. Gold CTA "Browse Guides Now →" linking to `https://iguidetours.net/guides`. Includes zero-commission note. Signed by "The Guides Directly Team"
- **Existing admin notification email stays unchanged** — it still goes to NOTIFY_EMAIL with the current subject/body

## Change 4 — Update `from` on primary send (line 613)

Change from `"iGuide Tours <noreply@iguidetours.net>"` to `"Guides Directly <noreply@iguidetours.net>"` for brand consistency on the main `resend.emails.send` call. Admin notification `from` addresses inside individual handlers are left unchanged.

## What stays unchanged
- All type names, data field names, payload structures
- Rejection email template (guide_status rejected branch)
- All admin notification emails inside handlers
- Authentication/authorization logic
- profile_reminder template
- All other email types (review, tour_plan, booking_status, booking_request, review_request)
- No frontend files modified
- No routing changes

## Deployment
After editing, redeploy `send-notification` edge function.

## Technical details

The inquiry traveler confirmation is added as a second `resend.emails.send()` call wrapped in try/catch (matching the pattern used by other handlers for secondary emails), placed after the existing admin HTML is assigned but before the final shared `resend.emails.send()` call at line 612. The existing admin email continues to be sent via the shared call at line 612 (since `toEmails` remains `[NOTIFY_EMAIL]`).


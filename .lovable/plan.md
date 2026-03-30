

# Guide Profile Page — Brand Alignment & Feature Enhancement

**File:** `src/pages/GuideProfilePage.tsx` — single file rewrite. No other files touched.

## 7 Changes

### Change 1 — Dark brand background
Replace all `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border` references with hardcoded dark brand colors:
- Page background: `#0A1628`
- Cards: `#1A2F50` with `border: 1px solid rgba(201,168,76,0.15)`, radius `12px`
- Primary text: `#F5F0E8`
- Secondary text: `rgba(255,255,255,0.65)`
- Accent: `#C9A84C`
- Loading/not-found states also get dark treatment

### Change 2 — Replace CTA buttons
Remove the single "Request a Booking" button (lines 377–382). Replace with two stacked buttons:
1. **"Message {firstName}"** — gold filled (`#C9A84C` bg, `#0A1628` text), `MessageCircle` icon, `onClick` smooth-scrolls to `#contact-section`
2. **"Share This Guide"** — outlined (`1.5px solid #C9A84C`, transparent bg, gold text), `Share2` icon, uses `navigator.share()` with fallback to clipboard copy + toast

### Change 3 — Credential line
Between the guide name `<h1>` and the badges block, add conditional credential text:
- `firstName === "Michael"` → "Founder & President, iGuide Tours"
- `firstName === "Mike"` → "President, Chicago Tour-Guide Professionals Association (CTPA)"
- Others → nothing

Style: 13px, `#C9A84C`, margin `4px 0`.

### Change 4 — Video section
New section between About and Specializations. Heading: "Watch & Learn" with `PlayCircle` icon (gold).
- If `form_data.videoUrl` exists → render YouTube iframe (16:9, rounded)
- Otherwise → placeholder box (16:9, `#0A1628` bg, gold border) with centered PlayCircle icon + "Video coming soon" + "Check back to see {firstName}'s introduction video"

Add `videoUrl?: string` to the `GuideData.form_data` interface.

### Change 5 — Social sharing strip
New horizontal strip above the contact form (after Reviews, after BookingRequestForm, before GuideContactForm). Contains:
- Label: "Share {firstName}'s profile:"
- Three buttons: WhatsApp (green), Facebook (blue), Copy Link (gold)
- Each with specified rgba backgrounds, borders, icons, and click handlers
- Container: gold-tinted bg, gold border, 12px radius, flex-wrap

### Change 6 — Contact form anchor
Add `id="contact-section"` wrapper `<div>` around `<GuideContactForm>`. Update the contact form heading prop or wrapper to show "Send {firstName} a Message". The submit button label change depends on whether `GuideContactForm` accepts props for these — if not, we wrap with a heading above it.

### Change 7 — Back link target
Change `Link to="/home#meet-guides"` → `Link to="/guides"` (both the back link at top and the not-found state).

## New imports needed
- `MessageCircle, Share2, PlayCircle, Link as LinkIcon` from lucide-react
- `useToast` from `@/hooks/use-toast`

## Technical notes
- All inline styles use the exact hex/rgba values from the spec
- `CalendarCheck` import removed (no longer used)
- `BookingRequestForm` import kept (still rendered in the right column)
- Motion animations preserved
- All data fetching and SEO logic unchanged


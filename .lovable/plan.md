

# "Guides Directly" Brand Messaging Overhaul

This plan implements the recommended brand positioning changes throughout the website, integrating the "Guides Directly" concept and commission-free messaging into every major section.

---

## Overview

The core idea is to weave the **"Guides Directly -- Powered by iGuide Tours"** brand and the **commission-free, no-middlemen** message throughout the entire website. This touches the Hero, About, Services, Testimonials, Inquiry/Contact, Footer, Navbar, and adds a new "Why Guides Directly is Different" value proposition section.

All text changes go through the i18n translation system (updating `en.json` and ideally the other 7 locale files).

---

## Changes by Section

### 1. Hero Section (HeroSection.tsx + en.json)

**Current:** "Discover America / Like a Local" with subtitle about booking directly.

**Updated to:**
- Headline: **"GUIDES DIRECTLY"** with subline **"Powered by iGuide Tours"**
- Tagline: **"No Commissions. No Markups. No Middlemen."**
- Subtitle: "Connect directly with licensed local tour guides for authentic, unforgettable experiences across the USA and Canada."
- Sub-tagline: "Travel experiences created by guides, priced by guides -- you pay only what your guide sets."
- Buttons renamed: **"Book Directly With a Guide"** and **"Why Commission-Free Matters"** (scrolls to the new value prop section)
- Remove the existing "100% Guide-Paid" badge (it's now in the headline itself)

### 2. New Section: "Why Guides Directly is Different" (new component)

A new section placed **between the Hero and About sections** on the Home page with 3 icon cards:

| Icon | Title | Description |
|------|-------|-------------|
| Ban/DollarSign | Zero Commissions. Ever. | No markups or hidden fees -- what you see is what you pay. |
| MessageCircle | Direct Guide Relationships | Book and chat with guides without intermediaries. |
| Compass | Authentic Experiences | Real local guides designing real local experiences. |

Optionally includes a small **comparison table** (Guides Directly vs. Typical OTA) showing Commission, Direct chat, Transparent pricing, and Guides keep earnings.

New file: `src/components/ValuePropositionSection.tsx`

### 3. About Section (AboutSection.tsx + en.json)

- Update opening paragraph to include: "iGuide Tours -- now part of **Guides Directly**, a commission-free platform connecting you directly with guides."
- Update the highlighted card (about.p4) to include the narrative summary: "Guides Directly powered by iGuide Tours charges zero commissions, no markups, and no middlemen between you and your guide."

### 4. Services Section (ServicesSection.tsx + en.json)

- Add a new subsection or card: **"Book Directly - Your Guide Sets the Price"**
- Include the 4-step process:
  1. Browse guides and tours
  2. Contact the guide directly
  3. Agree on pricing and itinerary
  4. Pay with no platform commission

### 5. Testimonials Section (en.json)

- Update hardcoded testimonial text to include commission-free callouts:
  - t1 stays focused on the tour experience
  - t2 updated to mention: "I paid less and got more -- direct, honest pricing."
  - t3 updated to mention: "Booking direct with my guide felt personal and fair."

### 6. Inquiry / Contact Section (InquirySection.tsx + en.json)

- Add a short explainer line above or below the contact info: "Have questions about commission-free booking? Contact us -- Guides Directly ensures direct contact with no hidden costs."
- Update WhatsApp/phone call-to-action text: "Text or call to speak with a guide directly -- no commissions, no agents."

### 7. Footer (Footer.tsx + en.json)

- Update brand name display: **"iGuide Tours"** becomes **"Guides Directly"** with "powered by iGuide Tours" subtext
- Update footer description to include commission-free keywords
- Update copyright: "Guides Directly / iGuide Tours. All rights reserved."

### 8. Navbar (Navbar.tsx)

- Update brand text from "iGuideTours" to "Guides Directly" with smaller "by iGuide Tours" or keep "iGuideTours" with a "Guides Directly" tagline -- keeping it concise for the nav bar
- "Plan Your Tour" button renamed to **"Book Directly"**

### 9. Language Select Screen (LanguageSelectScreen.tsx)

- Update the title from "iGuide Tours" to **"Guides Directly"** with "Powered by iGuide Tours" subtitle

---

## Technical Details

### Files to Create
- `src/components/ValuePropositionSection.tsx` -- new 3-card + comparison table section

### Files to Modify
- `src/i18n/locales/en.json` -- all text updates (new keys for value prop section, updated hero/about/services/testimonials/inquiry/footer keys)
- `src/components/HeroSection.tsx` -- new headline structure, updated buttons, remove old badge
- `src/components/AboutSection.tsx` -- updated paragraph references
- `src/components/ServicesSection.tsx` -- add "Book Directly" step-by-step subsection
- `src/components/TestimonialsSection.tsx` -- minor: testimonial text changes come from en.json
- `src/components/InquirySection.tsx` -- add commission-free explainer text
- `src/components/Footer.tsx` -- brand name + description updates
- `src/components/Navbar.tsx` -- brand name + button label updates
- `src/components/LanguageSelectScreen.tsx` -- title update
- `src/pages/Home.tsx` -- add ValuePropositionSection between Hero and About

### SEO Keywords Embedded
The updated text will naturally include: "commission-free tour bookings", "direct guide relationships", "no OTA fees", "guide-priced tours", "local guides, no middlemen".

### Note on Other Languages
The initial implementation will update `en.json`. The other 7 locale files (ru, pl, de, fr, es, zh, ja) will need their translations updated separately -- this can be done in a follow-up step.


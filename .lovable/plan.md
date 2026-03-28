

# Homepage Cleanup — Remove 6 Sections

**File:** `src/pages/Home.tsx` only

### Imports to remove (lines 6-7, 15, 17-19):
- Line 6: `LaunchStripSection`
- Line 7: `WhatIsPlatformSection`
- Line 15: `AiTourPlanner`
- Line 17: `MonetizationSection`
- Line 18: `AboutSection`
- Line 19: `FAQSection`

### JSX to remove:
- Lines 58-59: LaunchStripSection comment + tag
- Lines 61-62: WhatIsPlatformSection comment + tag
- Lines 86-87: MonetizationSection comment + tag
- Lines 89-90: AboutSection comment + tag
- Lines 92-93: AiTourPlanner comment + tag
- Lines 95-96: FAQSection comment + tag

### Kept intact (in order):
Navbar → HeroSection → TrustBarSection → HowItWorksSection → DestinationsSection → WhyDirectSection → TravelerAiCta → TestimonialsSection → ForGuidesSection → TrustSection → FinalCtaSection → InquirySection → Footer → floating AI Planner button

### Not touched:
- No component files deleted
- No other files modified
- No styling, text, or image changes


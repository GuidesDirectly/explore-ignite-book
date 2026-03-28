

# Homepage Cleanup — Remove 6 Sections

**File:** `src/pages/Home.tsx` only

## Remove these imports (lines 8, 9, 18, 19, 20, 21):
- `LaunchStripSection`
- `WhatIsPlatformSection`
- `AiTourPlanner`
- `MonetizationSection`
- `AboutSection`
- `FAQSection`

## Remove these JSX usages:
- `{/* Section 2 — Launch Strip */}` + `<LaunchStripSection />`
- `{/* Section 3 — What Is This Platform */}` + `<WhatIsPlatformSection />`
- `{/* Section 11 — How We Make Money */}` + `<MonetizationSection />`
- `{/* Section 12 — About */}` + `<AboutSection />`
- `{/* AI Demo Widget */}` + `<AiTourPlanner />`
- `{/* Section 13 — FAQ */}` + `<FAQSection />`

## Keep untouched:
HeroSection, TrustBarSection, HowItWorksSection, DestinationsSection, WhyDirectSection, TravelerAiCta, TestimonialsSection, ForGuidesSection, TrustSection, FinalCtaSection, InquirySection, Footer, floating AI Planner `<Link>` button.

No files deleted. No other files modified.


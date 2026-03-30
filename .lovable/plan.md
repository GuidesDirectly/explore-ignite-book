

# New Section — TruePriceSection

## What
Create `src/components/TruePriceSection.tsx` and add it to `src/pages/Home.tsx` between TrustBarSection and HowItWorksSection.

## New file: `src/components/TruePriceSection.tsx`

A self-contained component with:
- Champagne background (`#F0E6C8`), 72px vertical padding
- Centered content container (max-w `720px`)
- Eyebrow: "THE GUIDES DIRECTLY DIFFERENCE" — 11px, bold, `#C9A84C`, uppercase, tracked
- H2 main statement: "On other platforms, your guide keeps 70 cents..." — serif, 40px/28px mobile, `#0A1628`
- Supporting paragraph — 18px, `rgba(10,22,40,0.7)`, max-w 560px
- Two stat pills side by side (flex, wrap on mobile, gap-16px):
  - "30%" red pill (red-tinted bg/border, `#C0392B` text)
  - "0%" green pill (green-tinted bg/border, `#2D6A4F` text)
  - Large numbers: serif, 48px/36px mobile, bold
- CTA button: "Find a Guide — Pay Them Directly" → navigates to `/guides`, gold bg `#C9A84C`, hover `#B8924A`
- Uses `Link` from react-router-dom for the CTA

## Home.tsx changes (2 edits)

1. **Add import** after line 5 (TrustBarSection import):
   ```tsx
   import TruePriceSection from "@/components/TruePriceSection";
   ```

2. **Add JSX** between TrustBarSection and HowItWorksSection (after line 47):
   ```tsx
   {/* True Price Moment */}
   <TruePriceSection />
   ```

## Files touched
- `src/components/TruePriceSection.tsx` — created
- `src/pages/Home.tsx` — import + JSX insertion

No other files modified. No images. No existing components changed.




# HeroSection Trust Seal & Spacing Fix

**Single file change: `src/components/HeroSection.tsx`**

## Changes

### 1. Hide Trust Seal on mobile
Add `hidden md:block` to the motion wrapper div (currently line ~51) className.

### 2. Adjust Trust Seal desktop position & size
- Change `md:top-36` → `md:top-40`
- Reduce container from `180px` → `160px`
- Keep all circular styling, padding, object-fit intact

### 3. Hero text spacing
- Headline: `mb-6` → `mb-8`
- Subheadline: `mb-10` → `mb-12`

### Nothing else changes
No Navbar, search bar, background, text content, or routing changes.


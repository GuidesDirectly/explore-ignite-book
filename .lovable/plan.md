

# Four Targeted Fixes

## FIX 1 — Trust strip single-row on desktop, 2×2 on mobile

**File:** `src/components/HeroSection.tsx`

**Line 161** — Container classes change from:
`flex flex-wrap justify-center gap-x-6 gap-y-3`
to:
`flex flex-wrap md:flex-nowrap justify-center items-center gap-x-4 gap-y-3`

**Line 164** — Each item changes from:
`flex items-center gap-2`
to:
`flex items-center gap-1.5 whitespace-nowrap w-1/2 md:w-auto justify-center md:justify-start`

**Line 166** — Label text changes from `text-sm` to `text-xs`

## FIX 2 — "Join as Guide" button gold outline

**File:** `src/components/Navbar.tsx`

**Lines 183-188** — Replace the blue-filled button with gold outline:

```tsx
<Button
  size="sm"
  variant="outline"
  className="border-[1.5px] border-[#C9A84C] text-[#C9A84C] bg-transparent hover:bg-[rgba(201,168,76,0.12)] hover:text-[#C9A84C] font-semibold whitespace-nowrap rounded-lg px-5 py-2.5 transition-[background] duration-150 ease-in"
  onClick={() => navigate("/guide-register")}
>
  Join as Guide
</Button>
```

"Find a Guide" button (lines 175-182) stays unchanged.

## FIX 3 — Hero bottom padding

**File:** `src/components/HeroSection.tsx`

**Line 47** — Change `pb-20` to `pb-10` (reduce to give more room) and change the section's `min-h-screen` to keep it. Also remove `overflow-hidden` from line 39.

Specifically:
- **Line 39**: Change `overflow-hidden` to `overflow-visible` (prevents clipping)
- **Line 47**: Change `pb-20` to `pb-32` (more bottom padding for trust strip)

## FIX 4 — Restore iGuide Tours logo to hero top-right

**File:** `src/components/HeroSection.tsx`

- Add import: `import logo from "@/assets/logo.jpg";` (same file used in LanguageSelectScreen.tsx)
- After the background `<div>` (after line 45), insert:

```tsx
{/* iGuide Tours co-brand logo — desktop only */}
<div className="hidden md:flex flex-col items-center absolute top-5 right-6 z-10">
  <img src={logo} alt="iGuide Tours" className="w-[100px] h-auto object-contain rounded-xl" />
  <span className="block w-[100px] text-center text-[10px] uppercase tracking-[0.05em] mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
    Powered by iGuide Tours
  </span>
</div>
```

Hidden on mobile, visible on desktop top-right. Uses the existing `logo.jpg` asset. No new images.

## Files modified
- `src/components/HeroSection.tsx` — trust strip, padding, overflow, logo
- `src/components/Navbar.tsx` — "Join as Guide" button styling

## Not touched
- H1, subheadline, CTA buttons, search bar, AI widget, footer, translations, routing, images


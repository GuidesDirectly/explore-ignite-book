

# Guide Dashboard Brand Alignment — Dark Navy + Gold

## Summary
Apply dark navy background and gold accent styling to GuideDashboard.tsx and SubscriptionManager.tsx. No functionality or routing changes.

## Files Modified (2 only)

### 1. `src/pages/GuideDashboard.tsx`

**Page background** (line 342): `bg-background` → inline style `backgroundColor: '#0A1628'`

**Header** (line 344): `bg-card` → inline style `backgroundColor: '#1A2F50'`, border color to gold `rgba(201,168,76,0.15)`, text colors to `#F5F0E8`

**StatCard component** (lines 53-76): Change `bg-card border-border/50` to inline styles for `#1A2F50` background, gold border, text colors `#F5F0E8` for primary and `rgba(255,255,255,0.65)` for muted

**Loading state** (line 335): `bg-background` → `#0A1628`

**Section headings** (lines 381, 429, 494): `text-foreground` → `text-[#F5F0E8]`

**All `bg-card` sections** (lines 428, 492): Add inline styles for `#1A2F50` bg and gold border

**Muted text** throughout: `text-muted-foreground` → `text-[rgba(255,255,255,0.65)]` or `text-white/65`

**Primary icon color**: Keep `text-primary` as-is (already blue, acceptable) or switch to gold `text-[#C9A84C]`

**Edit Profile button**: Keep variant outline but adjust border/text to gold tones

### 2. `src/components/dashboard/SubscriptionManager.tsx`

**Upgrade buttons** (lines 199-208): Replace `bg-primary text-primary-foreground hover:bg-primary/90` with:
- `bg-[#C9A84C] text-[#0A1628] font-semibold hover:bg-[#B8924A] border-none`

**Section wrapper** (line 138): `bg-card border-border/50` → `bg-[#1A2F50] border-[rgba(201,168,76,0.15)]`

**Loading wrapper** (line 122): Same card styling update

**Plan cards** (line 169): `border-border/50` → `border-[rgba(201,168,76,0.15)]`, current plan highlight uses gold border instead of primary

**Text colors**: `text-foreground` → `text-[#F5F0E8]`, `text-muted-foreground` → `text-white/65`

**Badges**: Adjust to work on dark background

**Contact email link**: `text-primary` → `text-[#C9A84C]`

**"Current Plan" button**: Remains disabled/grey — no change to its styling or handlers

## What stays the same
- All onClick handlers, routing, data fetching, state management
- All child dashboard components (not modified)
- No new files created, no images generated


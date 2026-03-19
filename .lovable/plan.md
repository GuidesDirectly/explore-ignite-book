

# Search Bar Privacy & UX Fix

**File: `src/components/HeroSection.tsx`**

## Changes

### 1. Destination input (~line 117-123)
Add autofill suppression attributes:
- `name="destination_search"`
- `autoComplete="new-password"`
- `aria-autocomplete="none"`

### 2. Guests input (~line 159-164)
- Change placeholder from `"Who?"` to `"Guests"`
- Add `name="guest_count"`, `autoComplete="new-password"`, `aria-autocomplete="none"`

### No other changes
Search logic, layout, calendar, Navbar — untouched.


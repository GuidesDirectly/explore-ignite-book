

## Add Date Picker to Hero Search Bar

### Changes in `src/components/HeroSection.tsx`

**1. Imports (lines 1-6)**
- Rename lucide `Calendar` to `CalendarIcon` to avoid conflict with the Calendar component
- Add: `format` from `date-fns`, `Popover/PopoverTrigger/PopoverContent`, `Calendar` component, `cn` utility

**2. State (line 12)**
- Change `when` from `string` to `Date | undefined`

**3. Submit handler (line 19)**
- Format date as `format(when, "yyyy-MM-dd")` instead of `when.trim()`

**4. Form container (line 69)**
- Remove `overflow-hidden` from the className so the popover can render outside the bar

**5. "When?" segment (lines 87-97)**
- Replace the `<input>` with a `<Popover>` containing:
  - **Trigger**: a `<div>` styled identically to other segments (`bg-transparent text-sm text-white cursor-pointer`) showing `format(when, "MMM d, yyyy")` or "When?" placeholder in `text-white/60`
  - **Content**: `<Calendar mode="single" selected={when} onSelect={setWhen} disabled={(date) => date < new Date()} className="p-3 pointer-events-auto" />` with `w-auto p-0` on PopoverContent

### File affected
- `src/components/HeroSection.tsx` — imports, state, handler, form class, and When segment


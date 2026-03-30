

# Two Fixes — GuidesPage Cards Above the Fold

**File:** `src/pages/GuidesPage.tsx` only

## Fix 1 — Remove header section
Delete the entire Section 1 (`<section>` with eyebrow, H1, subheading, and search bar — roughly lines 160–210). Keep the Navbar, results bar, cards grid, recruitment banner, and Footer.

## Fix 2 — Change avatar aspect ratio
In the guide card avatar `<div>`, change `aspectRatio: "1/1"` to `aspectRatio: "16/9"`.

## Result
- Page starts with Navbar → results bar → guide cards immediately
- Cards use landscape photos instead of square, making full cards visible above the fold
- No other files or content changed


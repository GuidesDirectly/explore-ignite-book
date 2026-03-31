

# Disable Commission Checkout Route

## What and Why
Replace the `/book/:guideId` route with a redirect to `/guides`, disabling the 15% commission checkout page that contradicts the zero-commission model.

## Change

**File: `src/App.tsx`**

1. Add `Navigate` to the react-router-dom import (line 5)
2. Replace `<Route path="/book/:guideId" element={<BookingCheckout />} />` with `<Route path="/book/:guideId" element={<Navigate to="/guides" replace />} />`
3. The `BookingCheckout` import can remain (file is not deleted)

## What does NOT change
- No other files modified
- No other routes changed
- `BookingCheckout.tsx` file remains in codebase
- No text or image changes


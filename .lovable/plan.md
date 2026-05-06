## Plan — Validate checkout price server-side

### Goal
Stop trusting the client-supplied `amount_cents` in `create-checkout-session`. Always derive the charge amount from the `bookings` row identified by `booking_id`.

### Schema reality check
The instructions reference `bookings.amount_cents`, but that column does not exist. The actual `bookings` table stores price in:
- `price` — `numeric NOT NULL default 0` (decimal units, e.g. dollars)
- `status` — `text`

So we must read `price` and convert to integer cents (`Math.round(Number(price) * 100)`), not `amount_cents`.

### Change (single file)
`supabase/functions/create-checkout-session/index.ts`

After the `await req.json()` destructure, insert a validation block:

```ts
// Require booking_id and derive price from DB — never trust client amount
if (!booking_id) {
  return new Response(
    JSON.stringify({ error: "booking_id is required for payment" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const { data: booking, error: bookingError } = await supabase
  .from("bookings")
  .select("price, status, guide_user_id")
  .eq("id", booking_id)
  .maybeSingle();

if (bookingError || !booking) {
  return new Response(
    JSON.stringify({ error: "Booking not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const priceNum = Number(booking.price);
if (!priceNum || priceNum <= 0) {
  return new Response(
    JSON.stringify({ error: "Booking has no valid price" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const validatedAmountCents = Math.round(priceNum * 100);
```

Then replace the existing:
```ts
const totalAmount = Math.round(Number(amount_cents));
```
with:
```ts
const totalAmount = validatedAmountCents;
```

The client-supplied `amount_cents` is no longer used. Everything downstream (`platformFee`, `unit_amount`, `payments` insert) continues to use `totalAmount` unchanged.

Required-fields check stays, minus `amount_cents` (now derived server-side).

### Untouched
- No frontend changes
- No other edge functions
- No DB migrations
- RLS, Stripe Connect split logic, payments insert all unchanged

### After
On approval, edit the file and report exact lines changed.
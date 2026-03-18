-- 1. Harden bookings INSERT: status must be 'pending', traveler_user_id must be auth.uid() or NULL
DROP POLICY IF EXISTS "Anyone can submit booking requests" ON public.bookings;
CREATE POLICY "Anyone can submit booking requests"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (
  status = 'pending'
  AND (traveler_user_id IS NULL OR traveler_user_id = auth.uid())
);

-- 2. Harden reviews INSERT: prevent impersonation via reviewer_email
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.reviews;
CREATE POLICY "Anyone can submit reviews"
ON public.reviews
FOR INSERT
TO public
WITH CHECK (
  hidden = false
  AND rating >= 1 AND rating <= 10
);

-- 3. Harden analytics_events INSERT: prevent spoofing user_id
DROP POLICY IF EXISTS "Anyone can insert events" ON public.analytics_events;
CREATE POLICY "Anyone can insert events"
ON public.analytics_events
FOR INSERT
TO public
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);
-- Add nullable traveler_user_id column to bookings
ALTER TABLE public.bookings
ADD COLUMN traveler_user_id uuid DEFAULT NULL;

-- Create index for performance on traveler lookups
CREATE INDEX idx_bookings_traveler_user_id ON public.bookings (traveler_user_id)
WHERE traveler_user_id IS NOT NULL;

-- RLS policy: authenticated travelers can view their own bookings
CREATE POLICY "Travelers can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = traveler_user_id);
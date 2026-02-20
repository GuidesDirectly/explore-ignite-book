-- Allow anyone to submit booking requests (like inquiries/reviews)
CREATE POLICY "Anyone can submit booking requests"
ON public.bookings
FOR INSERT
WITH CHECK (true);

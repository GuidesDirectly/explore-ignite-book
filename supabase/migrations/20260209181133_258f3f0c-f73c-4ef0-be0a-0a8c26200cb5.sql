
-- Allow admins to update guide profiles (for approve/reject)
CREATE POLICY "Admins can update all profiles"
ON public.guide_profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete guide profiles"
ON public.guide_profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
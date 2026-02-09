
ALTER TABLE public.reviews ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT false;

-- Allow admins to update reviews (for toggling hidden)
CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

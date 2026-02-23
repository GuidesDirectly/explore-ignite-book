-- Saved/favorite guides table
CREATE TABLE IF NOT EXISTS public.saved_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_profile_id uuid NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, guide_profile_id)
);

ALTER TABLE public.saved_guides ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved guides
CREATE POLICY "Users can view own saved guides"
  ON public.saved_guides FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save guides
CREATE POLICY "Users can save guides"
  ON public.saved_guides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave guides
CREATE POLICY "Users can unsave guides"
  ON public.saved_guides FOR DELETE
  USING (auth.uid() = user_id);

-- Admins full access
CREATE POLICY "Admins can manage saved guides"
  ON public.saved_guides FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));


-- Create tours table for the marketplace
CREATE TABLE public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_user_id uuid NOT NULL,
  guide_profile_id uuid REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  
  -- Section A: The Basics
  title text NOT NULL,
  duration_value numeric NOT NULL DEFAULT 1,
  duration_unit text NOT NULL DEFAULT 'hours', -- 'hours' or 'days'
  price_per_person numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  meeting_point text,
  meeting_point_lat numeric,
  meeting_point_lng numeric,
  max_group_size integer NOT NULL DEFAULT 10,
  
  -- Section B: The Experience
  highlights text[] DEFAULT '{}'::text[],  -- tags like "Walking", "Food Included", "Kid Friendly"
  detailed_itinerary text,                  -- rich text
  what_to_bring text[] DEFAULT '{}'::text[],
  inclusions text[] DEFAULT '{}'::text[],
  exclusions text[] DEFAULT '{}'::text[],
  cover_image_url text,
  
  -- Section C: Logistics
  cancellation_policy text NOT NULL DEFAULT 'flexible', -- flexible, moderate, strict
  difficulty_level integer NOT NULL DEFAULT 1,           -- 1-5 scale
  
  -- Location / searchability
  city text,
  country text,
  category text,        -- e.g. 'walking', 'food', 'adventure', 'cultural'
  languages text[] DEFAULT '{}'::text[],
  
  -- Status
  status text NOT NULL DEFAULT 'draft', -- draft, published, archived
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published tours"
  ON public.tours FOR SELECT
  USING (status = 'published');

CREATE POLICY "Guides can view own tours"
  ON public.tours FOR SELECT
  USING (auth.uid() = guide_user_id);

CREATE POLICY "Guides can create own tours"
  ON public.tours FOR INSERT
  WITH CHECK (auth.uid() = guide_user_id);

CREATE POLICY "Guides can update own tours"
  ON public.tours FOR UPDATE
  USING (auth.uid() = guide_user_id);

CREATE POLICY "Guides can delete own tours"
  ON public.tours FOR DELETE
  USING (auth.uid() = guide_user_id);

CREATE POLICY "Admins can manage all tours"
  ON public.tours FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Indexes for search
CREATE INDEX idx_tours_city ON public.tours(city);
CREATE INDEX idx_tours_status ON public.tours(status);
CREATE INDEX idx_tours_guide ON public.tours(guide_user_id);
CREATE INDEX idx_tours_category ON public.tours(category);

-- Updated_at trigger
CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

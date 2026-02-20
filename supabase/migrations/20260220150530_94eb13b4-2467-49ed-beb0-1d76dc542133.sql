-- Create guide availability table
CREATE TABLE public.guide_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_user_id UUID NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (guide_user_id, date)
);

-- Enable RLS
ALTER TABLE public.guide_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view availability (public calendar)
CREATE POLICY "Anyone can view guide availability"
ON public.guide_availability
FOR SELECT
USING (true);

-- Guides can manage their own availability
CREATE POLICY "Guides can insert own availability"
ON public.guide_availability
FOR INSERT
WITH CHECK (auth.uid() = guide_user_id);

CREATE POLICY "Guides can update own availability"
ON public.guide_availability
FOR UPDATE
USING (auth.uid() = guide_user_id);

CREATE POLICY "Guides can delete own availability"
ON public.guide_availability
FOR DELETE
USING (auth.uid() = guide_user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage all availability"
ON public.guide_availability
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_guide_availability_guide_date ON public.guide_availability (guide_user_id, date);

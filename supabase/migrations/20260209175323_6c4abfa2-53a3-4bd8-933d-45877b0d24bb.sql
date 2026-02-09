
-- Table to store customer tour plan requests
CREATE TABLE public.tour_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  destination TEXT NOT NULL,
  days TEXT,
  hours_per_day TEXT,
  budget TEXT,
  experiences TEXT[],
  guide_description TEXT,
  ai_plan TEXT,
  refinement_count INTEGER NOT NULL DEFAULT 0,
  refinement_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public-facing form)
CREATE POLICY "Anyone can submit tour plans"
ON public.tour_plans
FOR INSERT
WITH CHECK (true);

-- Anyone can update their own plan by id (no auth required for public visitors)
CREATE POLICY "Anyone can update tour plans"
ON public.tour_plans
FOR UPDATE
USING (true);

-- Admins can view all
CREATE POLICY "Admins can manage tour plans"
ON public.tour_plans
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_tour_plans_updated_at
BEFORE UPDATE ON public.tour_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

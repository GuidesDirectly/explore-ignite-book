-- Itinerary swap tracking table
CREATE TABLE public.itinerary_swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_plan_id uuid REFERENCES public.tour_plans(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  original_activity text NOT NULL,
  swapped_activity text NOT NULL,
  day_number integer,
  reason text,
  ai_response text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itinerary_swaps ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can insert (public form), admins can manage all
CREATE POLICY "Anyone can create swaps"
  ON public.itinerary_swaps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage swaps"
  ON public.itinerary_swaps FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view swaps for their own tour plans (matched by email)
CREATE POLICY "Users can view own swaps"
  ON public.itinerary_swaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tour_plans tp
      WHERE tp.id = itinerary_swaps.tour_plan_id
        AND tp.email = itinerary_swaps.user_email
    )
  );

-- Analytics events table for KPI tracking
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage events"
  ON public.analytics_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
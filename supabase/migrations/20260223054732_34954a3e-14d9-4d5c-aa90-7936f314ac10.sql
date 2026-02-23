
-- Traveler profiles for enhanced AI personalization
CREATE TABLE public.traveler_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  travel_style text DEFAULT 'balanced',
  pace text DEFAULT 'moderate',
  budget_preference text DEFAULT 'flexible',
  dietary_restrictions text[] DEFAULT '{}',
  mobility_needs text DEFAULT 'none',
  interests text[] DEFAULT '{}',
  group_type text DEFAULT 'solo',
  has_children boolean DEFAULT false,
  children_ages text DEFAULT '',
  preferred_languages text[] DEFAULT '{}',
  previous_destinations text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traveler_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own profile
CREATE POLICY "Users can view own profile"
  ON public.traveler_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.traveler_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.traveler_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON public.traveler_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage traveler profiles"
  ON public.traveler_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_traveler_profiles_updated_at
  BEFORE UPDATE ON public.traveler_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

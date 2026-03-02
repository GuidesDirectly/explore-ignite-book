
-- Create payments table to track Stripe transactions
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_checkout_session_id text UNIQUE,
  guide_user_id uuid NOT NULL,
  traveler_email text,
  amount_total integer NOT NULL DEFAULT 0,
  platform_fee integer NOT NULL DEFAULT 0,
  guide_payout integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Guides can view their own payments
CREATE POLICY "Guides can view own payments"
ON public.payments FOR SELECT
USING (auth.uid() = guide_user_id);

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role inserts (edge functions use service role)
CREATE POLICY "Service can insert payments"
ON public.payments FOR INSERT
WITH CHECK (true);

-- Service can update payments
CREATE POLICY "Service can update payments"
ON public.payments FOR UPDATE
USING (true);

-- Indexes
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_guide_user_id ON public.payments(guide_user_id);
CREATE INDEX idx_payments_stripe_intent ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Auto-update timestamp trigger
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

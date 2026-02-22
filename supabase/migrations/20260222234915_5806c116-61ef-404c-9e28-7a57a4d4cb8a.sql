
-- Badge type enum for extensibility (Phase 2 badges can be added later)
CREATE TYPE public.badge_type AS ENUM (
  'licensed_verified',
  'permit_confirmed',
  'certification_pending'
);

-- Guide badges table
CREATE TABLE public.guide_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_user_id uuid NOT NULL,
  badge_type badge_type NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  issued_by uuid,
  notes text,
  UNIQUE (guide_user_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.guide_badges ENABLE ROW LEVEL SECURITY;

-- Anyone can read badges (public trust signal)
CREATE POLICY "Anyone can read badges"
  ON public.guide_badges FOR SELECT
  USING (true);

-- Admins can manage badges
CREATE POLICY "Admins can manage badges"
  ON public.guide_badges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_guide_badges_guide_user_id ON public.guide_badges (guide_user_id);
CREATE INDEX idx_guide_badges_expires_at ON public.guide_badges (expires_at) WHERE expires_at IS NOT NULL;

-- Verification requests table
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  notes text
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Guides can view own verification requests
CREATE POLICY "Guides can view own requests"
  ON public.verification_requests FOR SELECT
  USING (auth.uid() = guide_user_id);

-- Guides can create own requests
CREATE POLICY "Guides can create own requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = guide_user_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage verification requests"
  ON public.verification_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_verification_requests_guide ON public.verification_requests (guide_user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests (status);

-- Verification documents table
CREATE TABLE public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_url text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Guides can view own docs (via request ownership)
CREATE POLICY "Guides can view own documents"
  ON public.verification_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.verification_requests vr
    WHERE vr.id = verification_documents.request_id
    AND vr.guide_user_id = auth.uid()
  ));

-- Guides can upload docs
CREATE POLICY "Guides can upload documents"
  ON public.verification_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.verification_requests vr
    WHERE vr.id = verification_documents.request_id
    AND vr.guide_user_id = auth.uid()
  ));

-- Admins can manage all docs
CREATE POLICY "Admins can manage verification documents"
  ON public.verification_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Audit log table for verification actions
CREATE TABLE public.verification_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_guide_id uuid NOT NULL,
  target_request_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write audit logs
CREATE POLICY "Admins can manage audit logs"
  ON public.verification_audit_log FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_log_guide ON public.verification_audit_log (target_guide_id);
CREATE INDEX idx_audit_log_admin ON public.verification_audit_log (admin_id);

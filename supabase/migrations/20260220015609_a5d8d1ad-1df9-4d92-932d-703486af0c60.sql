
-- Add update_token column for securing public updates
ALTER TABLE public.tour_plans ADD COLUMN update_token text;

-- Drop the old open UPDATE policy
DROP POLICY IF EXISTS "Recent plans can be updated" ON public.tour_plans;

-- New policy: require matching update_token + time window
CREATE POLICY "Token-validated plan updates"
ON public.tour_plans FOR UPDATE
TO public
USING (
  created_at > NOW() - INTERVAL '1 hour'
  AND update_token IS NOT NULL
  AND update_token = current_setting('request.headers')::json->>'x-update-token'
)
WITH CHECK (
  created_at > NOW() - INTERVAL '1 hour'
  AND update_token IS NOT NULL
  AND update_token = current_setting('request.headers')::json->>'x-update-token'
);

-- Also add SELECT policy so the client can read back the inserted row
-- (needed to get the id after insert)
CREATE POLICY "Admins can read all tour plans"
ON public.tour_plans FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

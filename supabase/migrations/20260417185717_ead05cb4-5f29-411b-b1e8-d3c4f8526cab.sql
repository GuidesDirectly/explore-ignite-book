
-- =============================================
-- FIX 1: Reviews — hide reviewer_email
-- =============================================
DROP VIEW IF EXISTS public.reviews_public CASCADE;

CREATE VIEW public.reviews_public
WITH (security_invoker = false) AS
SELECT id, guide_user_id, reviewer_name, rating, comment, hidden, created_at, translations
FROM public.reviews
WHERE hidden = false;

GRANT SELECT ON public.reviews_public TO anon, authenticated;

REVOKE SELECT (reviewer_email) ON public.reviews FROM anon, authenticated;

-- =============================================
-- FIX 2: Notifications — INSERT lockdown
-- =============================================
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users insert own notifications only"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================
-- FIX 3: Conversations — schema + INSERT lockdown
-- =============================================
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS traveler_user_id uuid REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

CREATE POLICY "Authenticated users create own conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = guide_user_id
  OR auth.uid() = traveler_user_id
);

CREATE POLICY "Travelers view own conversations"
ON public.conversations FOR SELECT TO authenticated
USING (auth.uid() = traveler_user_id);

-- =============================================
-- FIX 4: Messages — schema + participant lockdown
-- =============================================
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sender_user_id uuid REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in own conversations" ON public.messages;

CREATE POLICY "Conversation participants send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_user_id = auth.uid()
  AND conversation_id IN (
    SELECT id FROM conversations
    WHERE guide_user_id = auth.uid()
    OR traveler_user_id = auth.uid()
  )
);

CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.guide_user_id = auth.uid() OR conversations.traveler_user_id = auth.uid())
  )
);

CREATE POLICY "Participants can update messages"
ON public.messages FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.guide_user_id = auth.uid() OR conversations.traveler_user_id = auth.uid())
  )
);

-- =============================================
-- FIX 5: app_settings — whitelist public keys
-- =============================================
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;

CREATE POLICY "Public can read safe settings"
ON public.app_settings FOR SELECT TO anon, authenticated
USING (
  key IN (
    'app_name',
    'default_currency',
    'default_language',
    'min_tour_price',
    'max_tour_price',
    'booking_enabled',
    'group_tours_enabled',
    'reviews_enabled'
  )
);

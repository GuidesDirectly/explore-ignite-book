-- Enable Realtime publication
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations';
  END IF;
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_traveler_last_msg
  ON public.conversations (traveler_user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_guide_last_msg
  ON public.conversations (guide_user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_guide_traveler
  ON public.conversations (guide_user_id, traveler_user_id);
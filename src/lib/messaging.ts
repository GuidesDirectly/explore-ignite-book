import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  guide_user_id: string;
  traveler_user_id: string | null;
  traveler_name: string;
  traveler_email: string | null;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_type: "guide" | "traveler";
  content: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Find existing conversation between guide and traveler, or create one.
 */
export async function getOrCreateConversation(params: {
  guideUserId: string;
  travelerUserId: string;
  travelerName: string;
  travelerEmail?: string | null;
}): Promise<Conversation> {
  const { guideUserId, travelerUserId, travelerName, travelerEmail } = params;

  // Try to find existing
  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("guide_user_id", guideUserId)
    .eq("traveler_user_id", travelerUserId)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing as Conversation;

  // Create new
  const { data: created, error: insErr } = await supabase
    .from("conversations")
    .insert({
      guide_user_id: guideUserId,
      traveler_user_id: travelerUserId,
      traveler_name: travelerName || "Traveler",
      traveler_email: travelerEmail ?? null,
    })
    .select("*")
    .single();

  if (insErr) throw insErr;
  return created as Conversation;
}

/**
 * Send a message in a conversation. Updates conversation last_message_at.
 */
export async function sendMessage(params: {
  conversationId: string;
  senderUserId: string;
  senderType: "guide" | "traveler";
  content: string;
}): Promise<Message> {
  const { conversationId, senderUserId, senderType, content } = params;
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message is empty");

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_user_id: senderUserId,
      sender_type: senderType,
      content: trimmed,
    })
    .select("*")
    .single();

  if (error) throw error;

  // bump conversation timestamp (best-effort)
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return msg as Message;
}

/**
 * Mark all messages from the OTHER party as read.
 */
export async function markConversationRead(params: {
  conversationId: string;
  viewerUserId: string;
}): Promise<void> {
  const { conversationId, viewerUserId } = params;
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_user_id", viewerUserId);
}

/**
 * Fire-and-forget email/notification dispatch for a new message.
 */
export async function notifyNewMessage(params: {
  recipientUserId: string;
  senderName: string;
  preview: string;
  recipientRole: "guide" | "traveler";
  conversationId: string;
}): Promise<void> {
  try {
    await supabase.functions.invoke("send-notification", {
      body: {
        type: "new_message",
        data: {
          recipientUserId: params.recipientUserId,
          senderName: params.senderName,
          preview: params.preview.slice(0, 100),
          recipientRole: params.recipientRole,
          conversationId: params.conversationId,
        },
      },
    });
  } catch (e) {
    console.warn("[messaging] notifyNewMessage failed", e);
  }
}

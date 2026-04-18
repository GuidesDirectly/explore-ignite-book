import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  type Message,
  sendMessage,
  markConversationRead,
  notifyNewMessage,
} from "@/lib/messaging";
import { useToast } from "@/hooks/use-toast";

interface ConversationPanelProps {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
  peerUserId: string;
  peerName: string;
  peerInitials: string;
  peerAvatarUrl?: string | null;
  peerFirstName?: string;
  peerCity?: string;
  viewerRole: "traveler" | "guide";
  viewerUserId: string;
  viewerName: string;
}

const ConversationPanel = ({
  open,
  onClose,
  conversationId,
  peerUserId,
  peerName,
  peerInitials,
  peerAvatarUrl,
  peerFirstName,
  peerCity,
  viewerRole,
  viewerUserId,
  viewerName,
}: ConversationPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Suggested opener placeholder for empty traveler-initiated threads
  const suggestedPlaceholder =
    viewerRole === "traveler" && messages.length === 0 && peerFirstName
      ? `Hi ${peerFirstName}, I'm interested in a tour${
          peerCity ? ` in ${peerCity}` : ""
        }. Can you tell me more about your availability and pricing?`
      : "Type your message…";

  // Load messages + subscribe
  useEffect(() => {
    if (!open || !conversationId) return;
    let active = true;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (!active) return;
      if (!error && data) setMessages(data as Message[]);
      setLoading(false);
      // mark read after load
      await markConversationRead({ conversationId, viewerUserId });
    })();

    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          // mark read if from other party
          if (m.sender_user_id !== viewerUserId) {
            markConversationRead({ conversationId, viewerUserId });
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [open, conversationId, viewerUserId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!conversationId || !draft.trim() || sending) return;
    setSending(true);
    const content = draft.trim();
    try {
      await sendMessage({
        conversationId,
        senderUserId: viewerUserId,
        senderType: viewerRole,
        content,
      });
      setDraft("");
      // fire-and-forget notification to peer
      notifyNewMessage({
        recipientUserId: peerUserId,
        senderName: viewerName,
        preview: content,
        recipientRole: viewerRole === "traveler" ? "guide" : "traveler",
        conversationId,
      });
    } catch (e: any) {
      toast({
        title: "Could not send",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {peerAvatarUrl && <AvatarImage src={peerAvatarUrl} alt={peerName} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {peerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-base font-semibold text-foreground">{peerName}</span>
              {peerCity && (
                <span className="text-xs text-muted-foreground font-normal">{peerCity}</span>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
          {loading && (
            <p className="text-center text-sm text-muted-foreground">Loading…</p>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No messages yet. Say hi 👋
            </div>
          )}
          {messages.map((m) => {
            const mine = m.sender_user_id === viewerUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                    mine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.content}
                  <div
                    className={`text-[10px] mt-1 ${
                      mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3 bg-background">
          <div className="flex gap-2 items-end">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={suggestedPlaceholder}
              rows={2}
              className="resize-none min-h-[60px] text-sm"
              disabled={!conversationId || sending}
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!conversationId || !draft.trim() || sending}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationPanel;

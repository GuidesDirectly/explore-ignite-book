import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import ConversationPanel from "@/components/messaging/ConversationPanel";

interface ConvoRow {
  id: string;
  traveler_user_id: string | null;
  traveler_name: string;
  last_message_at: string;
  lastMessage?: string;
  unreadCount?: number;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "T";

const GuideMessagesInbox = ({
  userId,
  guideName,
}: {
  userId: string;
  guideName: string;
}) => {
  const [convos, setConvos] = useState<ConvoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ConvoRow | null>(null);

  const load = useCallback(async () => {
    const { data: convosData } = await supabase
      .from("conversations")
      .select("id, traveler_user_id, traveler_name, last_message_at")
      .eq("guide_user_id", userId)
      .order("last_message_at", { ascending: false })
      .limit(100);

    const ids = (convosData || []).map((c) => c.id);
    const previews: Record<string, string> = {};
    const unread: Record<string, number> = {};

    if (ids.length) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("conversation_id, content, created_at, sender_user_id, is_read")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false });

      (msgs || []).forEach((m: any) => {
        if (!previews[m.conversation_id]) previews[m.conversation_id] = m.content;
        if (!m.is_read && m.sender_user_id !== userId) {
          unread[m.conversation_id] = (unread[m.conversation_id] || 0) + 1;
        }
      });
    }

    setConvos(
      (convosData || []).map((c: any) => ({
        ...c,
        lastMessage: previews[c.id],
        unreadCount: unread[c.id] || 0,
      }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`guide-inbox-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations", filter: `guide_user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!convos.length)
    return (
      <p className="text-muted-foreground text-sm">
        No conversations yet. Travelers who message you will appear here.
      </p>
    );

  return (
    <>
      <div className="space-y-2">
        {convos.map((c) => {
          const unread = (c.unreadCount || 0) > 0;
          return (
            <Card
              key={c.id}
              className={`p-4 cursor-pointer hover:border-primary/40 transition ${
                unread ? "border-primary/60" : ""
              }`}
              onClick={() => setActive(c)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials(c.traveler_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${
                        unread ? "font-bold text-foreground" : "font-medium text-foreground"
                      }`}
                    >
                      {c.traveler_name}
                    </p>
                    {unread && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      unread ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {c.lastMessage || "(no messages)"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(c.last_message_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {active && (
        <ConversationPanel
          open={!!active}
          onClose={() => setActive(null)}
          conversationId={active.id}
          peerUserId={active.traveler_user_id || ""}
          peerName={active.traveler_name}
          peerInitials={initials(active.traveler_name)}
          viewerRole="guide"
          viewerUserId={userId}
          viewerName={guideName || "Guide"}
        />
      )}
    </>
  );
};

export default GuideMessagesInbox;

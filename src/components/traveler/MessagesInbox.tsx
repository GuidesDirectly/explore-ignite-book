import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  guide_user_id: string;
  last_message_at: string;
  lastMessage?: string;
}

const MessagesInbox = ({ userId }: { userId: string }) => {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: convosData } = await supabase
        .from("conversations")
        .select("id, guide_user_id, last_message_at")
        .eq("traveler_user_id", userId)
        .order("last_message_at", { ascending: false })
        .limit(50);

      const ids = (convosData || []).map((c) => c.id);
      const previews: Record<string, string> = {};
      if (ids.length) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("conversation_id, content, created_at")
          .in("conversation_id", ids)
          .order("created_at", { ascending: false });
        (msgs || []).forEach((m: any) => {
          if (!previews[m.conversation_id]) previews[m.conversation_id] = m.content;
        });
      }

      setConvos(
        (convosData || []).map((c) => ({ ...c, lastMessage: previews[c.id] })) as Conversation[]
      );
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!convos.length) return <p className="text-muted-foreground text-sm">No conversations yet.</p>;

  return (
    <div className="space-y-2">
      {convos.map((c) => (
        <Card key={c.id} className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{c.lastMessage || "(no messages)"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(c.last_message_at).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MessagesInbox;

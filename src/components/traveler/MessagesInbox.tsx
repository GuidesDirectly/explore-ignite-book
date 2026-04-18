import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ConversationPanel from "@/components/messaging/ConversationPanel";

interface ConvoRow {
  id: string;
  guide_user_id: string;
  last_message_at: string;
  lastMessage?: string;
  unreadCount?: number;
  guideName?: string;
  guideAvatar?: string | null;
  guideFirstName?: string;
  guideCity?: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "G";

const MessagesInbox = ({ userId }: { userId: string }) => {
  const [convos, setConvos] = useState<ConvoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ConvoRow | null>(null);
  const [viewerName, setViewerName] = useState("Traveler");

  useEffect(() => {
    supabase
      .from("traveler_profiles")
      .select("first_name, last_name")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const n = [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim();
        if (n) setViewerName(n);
      });
  }, [userId]);

  const load = useCallback(async () => {
    const { data: convosData } = await supabase
      .from("conversations")
      .select("id, guide_user_id, last_message_at")
      .eq("traveler_user_id", userId)
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

    // Resolve guide names via public view
    const guideIds = Array.from(new Set((convosData || []).map((c) => c.guide_user_id)));
    const guideInfo: Record<
      string,
      { name: string; firstName: string; city: string; avatar: string | null }
    > = {};
    if (guideIds.length) {
      const { data: guides } = await supabase
        .from("guide_profiles_public")
        .select("user_id, form_data, service_areas")
        .in("user_id", guideIds);
      (guides || []).forEach((g: any) => {
        const fd = g.form_data || {};
        const fn = fd.firstName || "";
        const ln = fd.lastName || "";
        const city = (g.service_areas && g.service_areas[0]) || "";
        guideInfo[g.user_id] = {
          name: `${fn} ${ln}`.trim() || "Guide",
          firstName: fn,
          city,
          avatar: fd.profilePhotoUrl || fd.photoUrl || null,
        };
      });
    }

    setConvos(
      (convosData || []).map((c: any) => {
        const info = guideInfo[c.guide_user_id];
        return {
          ...c,
          lastMessage: previews[c.id],
          unreadCount: unread[c.id] || 0,
          guideName: info?.name || "Guide",
          guideAvatar: info?.avatar || null,
          guideFirstName: info?.firstName,
          guideCity: info?.city,
        };
      })
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`traveler-inbox-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => load()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `traveler_user_id=eq.${userId}`,
        },
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
        No conversations yet. Browse guides and tap "Message" to start one.
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
                  {c.guideAvatar && <AvatarImage src={c.guideAvatar} alt={c.guideName} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials(c.guideName || "G")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${
                        unread ? "font-bold text-foreground" : "font-medium text-foreground"
                      }`}
                    >
                      {c.guideName}
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
          peerUserId={active.guide_user_id}
          peerName={active.guideName || "Guide"}
          peerInitials={initials(active.guideName || "G")}
          peerAvatarUrl={active.guideAvatar}
          peerFirstName={active.guideFirstName}
          peerCity={active.guideCity}
          viewerRole="traveler"
          viewerUserId={userId}
          viewerName={viewerName}
        />
      )}
    </>
  );
};

export default MessagesInbox;

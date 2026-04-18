import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateConversation } from "@/lib/messaging";
import ConversationPanel from "./ConversationPanel";

interface MessageGuideButtonProps {
  guideUserId: string;
  guideFirstName: string;
  guideLastName?: string;
  guideAvatarUrl?: string | null;
  guideCity?: string;
  children: ReactNode;
}

const MessageGuideButton = ({
  guideUserId,
  guideFirstName,
  guideLastName = "",
  guideAvatarUrl,
  guideCity,
  children,
}: MessageGuideButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState<string>("Traveler");
  const [loading, setLoading] = useState(false);

  // Cache current session for snappy re-clicks
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setViewerUserId(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setViewerUserId(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (loading) return;

    // Auth gate
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) {
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?tab=signup&returnTo=${returnTo}&context=message`);
      return;
    }

    setLoading(true);
    try {
      // Resolve viewer name (first/last from traveler_profiles, fallback to email)
      const { data: profile } = await supabase
        .from("traveler_profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const tName =
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
        user.email ||
        "Traveler";
      setViewerName(tName);

      const convo = await getOrCreateConversation({
        guideUserId,
        travelerUserId: user.id,
        travelerName: tName,
        travelerEmail: user.email ?? null,
      });
      setConversationId(convo.id);
      setOpen(true);
    } catch (e: any) {
      console.error("[MessageGuideButton]", e);
      toast({
        title: "Could not open conversation",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [guideUserId, location.pathname, location.search, navigate, toast, loading]);

  const peerName = [guideFirstName, guideLastName].filter(Boolean).join(" ").trim();
  const peerInitials =
    `${guideFirstName?.[0] || ""}${guideLastName?.[0] || ""}`.toUpperCase() || "G";

  return (
    <>
      <span onClick={handleClick} style={{ display: "contents", cursor: "pointer" }}>
        {children}
      </span>
      {open && conversationId && viewerUserId && (
        <ConversationPanel
          open={open}
          onClose={() => setOpen(false)}
          conversationId={conversationId}
          peerUserId={guideUserId}
          peerName={peerName || guideFirstName}
          peerInitials={peerInitials}
          peerAvatarUrl={guideAvatarUrl}
          peerFirstName={guideFirstName}
          peerCity={guideCity}
          viewerRole="traveler"
          viewerUserId={viewerUserId}
          viewerName={viewerName}
        />
      )}
    </>
  );
};

export default MessageGuideButton;

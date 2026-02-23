import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSavedGuides() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;

      const { data } = await supabase
        .from("saved_guides" as any)
        .select("guide_profile_id")
        .eq("user_id", uid);

      if (data) {
        setSavedIds(new Set((data as any[]).map((d: any) => d.guide_profile_id)));
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) setSavedIds(new Set());
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleSave = useCallback(async (guideProfileId: string) => {
    if (!userId) {
      toast.error("Please sign in to save guides.");
      return;
    }

    setLoading(true);
    const isSaved = savedIds.has(guideProfileId);

    if (isSaved) {
      const { error } = await supabase
        .from("saved_guides" as any)
        .delete()
        .eq("user_id", userId)
        .eq("guide_profile_id", guideProfileId);

      if (!error) {
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(guideProfileId);
          return next;
        });
        toast.success("Guide removed from favorites.");
      }
    } else {
      const { error } = await supabase
        .from("saved_guides" as any)
        .insert({ user_id: userId, guide_profile_id: guideProfileId });

      if (!error) {
        setSavedIds(prev => new Set(prev).add(guideProfileId));
        toast.success("Guide saved to favorites!");
      }
    }
    setLoading(false);
  }, [userId, savedIds]);

  return { savedIds, toggleSave, loading, isLoggedIn: !!userId };
}

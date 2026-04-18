import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

interface SavedGuide {
  id: string;
  guide_profile_id: string;
  guide: {
    id: string;
    user_id: string;
    form_data: any;
  } | null;
}

const SavedGuidesList = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<SavedGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("saved_guides")
      .select("id, guide_profile_id, guide:guide_profiles_public(id, user_id, form_data)")
      .eq("user_id", userId)
      .then(({ data }) => {
        setItems((data as unknown as SavedGuide[]) || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!items.length) return <p className="text-muted-foreground text-sm">No saved guides yet.</p>;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((s) => {
        const fd = s.guide?.form_data || {};
        const name = `${fd.firstName || ""} ${fd.lastName || ""}`.trim() || "Guide";
        return (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(fd.languages) ? fd.languages.slice(0, 2).join(", ") : ""}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => s.guide && navigate(`/guide/${s.guide.id}`)}>
                View
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SavedGuidesList;

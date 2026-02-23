import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SaveGuideButton from "@/components/SaveGuideButton";
import { useSavedGuides } from "@/hooks/useSavedGuides";
import { Heart, ArrowLeft, MapPin, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SavedGuideData {
  id: string;
  guide_profile_id: string;
  guide: {
    id: string;
    user_id: string;
    form_data: any;
    service_areas: string[];
  } | null;
  photoUrl?: string;
  avgRating?: number;
  reviewCount?: number;
}

const SavedGuides = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { savedIds, toggleSave, loading: toggleLoading } = useSavedGuides();
  const [guides, setGuides] = useState<SavedGuideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/");
        return;
      }

      const { data: savedData } = await supabase
        .from("saved_guides" as any)
        .select("id, guide_profile_id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!savedData || (savedData as any[]).length === 0) {
        setLoading(false);
        return;
      }

      const profileIds = (savedData as any[]).map((s: any) => s.guide_profile_id);

      const { data: profiles } = await supabase
        .from("guide_profiles_public" as any)
        .select("id, user_id, form_data, service_areas")
        .in("id", profileIds) as any;

      // Fetch photos and reviews for each guide
      const enriched: SavedGuideData[] = await Promise.all(
        (savedData as any[]).map(async (saved: any) => {
          const profile = (profiles as any[] || []).find((p: any) => p.id === saved.guide_profile_id);
          let photoUrl: string | undefined;
          let avgRating = 0;
          let reviewCount = 0;

          if (profile) {
            // Photo
            const { data: photoFiles } = await supabase.storage
              .from("guide-photos")
              .list(profile.user_id, { limit: 10 });
            const profileFile = photoFiles?.find(f => f.name.startsWith("profile"));
            if (profileFile) {
              const { data: urlData } = supabase.storage
                .from("guide-photos")
                .getPublicUrl(`${profile.user_id}/${profileFile.name}`);
              photoUrl = urlData?.publicUrl;
            }

            // Reviews
            const { data: reviews } = await supabase
              .from("reviews_public" as any)
              .select("rating")
              .eq("guide_user_id", profile.user_id)
              .eq("hidden", false) as any;

            if (reviews && reviews.length > 0) {
              reviewCount = reviews.length;
              avgRating = Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10;
            }
          }

          return {
            id: saved.id,
            guide_profile_id: saved.guide_profile_id,
            guide: profile || null,
            photoUrl,
            avgRating,
            reviewCount,
          };
        })
      );

      setGuides(enriched);
      setLoading(false);
    };

    fetchSaved();
  }, [navigate, savedIds]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            Saved Guides
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-lg">No saved guides yet.</p>
            <p className="text-sm text-muted-foreground">
              Browse guides and tap the heart icon to save your favorites.
            </p>
            <Button variant="outline" onClick={() => navigate("/home#meet-guides")}>
              Browse Guides
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guides.map((saved, idx) => {
              if (!saved.guide) return null;
              const fd = saved.guide.form_data;
              const initials = `${fd.firstName?.[0] || ""}${fd.lastName?.[0] || ""}`;

              return (
                <motion.div
                  key={saved.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={`/guide/${saved.guide.id}`}
                    className="block bg-card rounded-xl border border-border/50 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {saved.photoUrl ? (
                        <img
                          src={saved.photoUrl}
                          alt={`${fd.firstName} ${fd.lastName}`}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg flex items-center justify-center flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-bold text-foreground truncate">
                            {fd.firstName} {fd.lastName}
                          </h3>
                          <SaveGuideButton
                            isSaved={savedIds.has(saved.guide_profile_id)}
                            onToggle={() => toggleSave(saved.guide_profile_id)}
                            loading={toggleLoading}
                          />
                        </div>
                        {saved.guide.service_areas?.length > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {saved.guide.service_areas.join(", ")}
                          </p>
                        )}
                        {saved.reviewCount && saved.reviewCount > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-primary fill-primary" />
                            {saved.avgRating} ({saved.reviewCount} reviews)
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SavedGuides;

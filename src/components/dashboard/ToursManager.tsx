import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  ChevronUp,
  Copy,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import TourForm from "./TourForm";

interface Tour {
  id: string;
  title: string;
  description: string | null;
  city: string;
  country: string | null;
  price_per_person: number;
  currency: string;
  duration_value: number;
  duration_unit: string;
  min_group_size: number;
  max_group_size: number;
  category: string;
  status: string;
  highlights: string[];
  difficulty_level: number;
  cancellation_policy: string;
  meeting_point: string | null;
  detailed_itinerary: string | null;
  what_to_bring: string[];
  inclusions: string[];
  exclusions: string[];
  photos: string[];
  cover_image_url: string | null;
  view_count: number;
  inquiry_count: number;
  created_at: string;
}

interface ToursManagerProps {
  userId: string;
  guideProfileId: string | null;
}

const ToursManager = ({ userId, guideProfileId }: ToursManagerProps) => {
  const { t } = useTranslation();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchTours = useCallback(async () => {
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("guide_user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTours(data as any as Tour[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleDelete = async (tourId: string) => {
    if (!confirm("Delete this tour? This action cannot be undone.")) return;
    setDeletingId(tourId);
    const { error } = await supabase.from("tours").delete().eq("id", tourId);

    if (error) {
      toast.error("Failed to delete tour.");
    } else {
      toast.success("Tour deleted.");
      setTours((prev) => prev.filter((t) => t.id !== tourId));
    }
    setDeletingId(null);
  };

  const handleToggleStatus = async (tour: Tour) => {
    const next = tour.status === "published" ? "draft" : "published";
    setTogglingId(tour.id);
    const { error } = await supabase
      .from("tours")
      .update({ status: next })
      .eq("id", tour.id);
    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(next === "published" ? "Tour published." : "Tour unpublished.");
      setTours((prev) => prev.map((t) => (t.id === tour.id ? { ...t, status: next } : t)));
    }
    setTogglingId(null);
  };

  const handleDuplicate = async (tour: Tour) => {
    setDuplicatingId(tour.id);
    const { id, view_count, inquiry_count, created_at, ...rest } = tour as any;
    const dup = {
      ...rest,
      title: `${tour.title} (Copy)`,
      status: "draft",
      guide_user_id: userId,
      guide_profile_id: guideProfileId,
    };
    const { error } = await supabase.from("tours").insert(dup);
    if (error) {
      console.error(error);
      toast.error("Failed to duplicate tour.");
    } else {
      toast.success("Tour duplicated as draft.");
      fetchTours();
    }
    setDuplicatingId(null);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditingTour(null);
    fetchTours();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {t("guideDashboard.myTours", "My Tours")}
          <span className="text-sm font-normal text-muted-foreground">
            ({tours.length})
          </span>
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditingTour(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Close
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Create Tour
            </>
          )}
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-6 border border-primary/20 rounded-xl p-4 bg-primary/5">
          <h3 className="font-semibold text-foreground mb-4">
            {editingTour ? "Edit Tour" : "Create a New Tour"}
          </h3>
          <TourForm
            userId={userId}
            guideProfileId={guideProfileId}
            existingTour={editingTour}
            onSaved={handleFormSaved}
          />
        </div>
      )}

      {/* Tour List */}
      {tours.length === 0 && !showForm ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm mb-3">
            No tours yet. Create your first tour to start attracting travelers!
          </p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create Your First Tour
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => {
            const cover = tour.photos?.[0] || tour.cover_image_url;
            const conversion =
              tour.view_count > 0
                ? Math.round((tour.inquiry_count / tour.view_count) * 1000) / 10
                : 0;
            return (
              <div
                key={tour.id}
                className="border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <MapPin className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">
                        {tour.title}
                      </h3>
                      <Badge
                        variant={tour.status === "published" ? "default" : "secondary"}
                        className="text-[10px] shrink-0"
                      >
                        {tour.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tour.city}
                        {tour.country ? `, ${tour.country}` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tour.duration_value} {tour.duration_unit}
                      </span>
                      {tour.price_per_person > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {tour.price_per_person} {tour.currency}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tour.min_group_size}–{tour.max_group_size}
                      </span>
                    </div>
                    {/* Analytics row */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {tour.view_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> {tour.inquiry_count} inquiries
                      </span>
                      {tour.view_count > 0 && (
                        <span className="text-primary font-medium">
                          {conversion}% conv.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {tour.status === "published" && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View public page"
                      >
                        <Link to={`/tour/${tour.id}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleStatus(tour)}
                      disabled={togglingId === tour.id}
                      title={tour.status === "published" ? "Unpublish" : "Publish"}
                    >
                      {togglingId === tour.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : tour.status === "published" ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDuplicate(tour)}
                      disabled={duplicatingId === tour.id}
                      title="Duplicate"
                    >
                      {duplicatingId === tour.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingTour(tour);
                        setShowForm(true);
                      }}
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tour.id)}
                      disabled={deletingId === tour.id}
                      title="Delete"
                    >
                      {deletingId === tour.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ToursManager;

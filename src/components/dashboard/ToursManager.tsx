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
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import TourForm from "./TourForm";

interface Tour {
  id: string;
  title: string;
  city: string;
  country: string | null;
  price_per_person: number;
  currency: string;
  duration_value: number;
  duration_unit: string;
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

  const fetchTours = useCallback(async () => {
    const { data, error } = await supabase
      .from("tours" as any)
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
    const { error } = await supabase
      .from("tours" as any)
      .delete()
      .eq("id", tourId);

    if (error) {
      toast.error("Failed to delete tour.");
    } else {
      toast.success("Tour deleted.");
      setTours((prev) => prev.filter((t) => t.id !== tourId));
    }
    setDeletingId(null);
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
            {editingTour ? "Edit Tour" : "Quick Tour Creator"}
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
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {tour.city}{tour.country ? `, ${tour.country}` : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tour.duration_value} {tour.duration_unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {tour.price_per_person} {tour.currency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Max {tour.max_group_size}
                    </span>
                  </div>
                  {tour.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tour.highlights.slice(0, 4).map((h) => (
                        <Badge key={h} variant="outline" className="text-[10px]">
                          {h}
                        </Badge>
                      ))}
                      {tour.highlights.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{tour.highlights.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingTour(tour);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(tour.id)}
                    disabled={deletingId === tour.id}
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
          ))}
        </div>
      )}
    </section>
  );
};

export default ToursManager;

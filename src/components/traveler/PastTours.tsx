import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Star } from "lucide-react";
import LeaveReviewDialog from "./LeaveReviewDialog";

interface PastBooking {
  id: string;
  date: string;
  tour_type: string;
  guide_user_id: string;
  traveler_name: string;
  traveler_email: string | null;
  hasReview: boolean;
}

const PastTours = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = useState<PastBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<PastBooking | null>(null);

  const load = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("id, date, tour_type, guide_user_id, traveler_name, traveler_email")
      .eq("traveler_user_id", userId)
      .lt("date", today)
      .neq("status", "cancelled")
      .order("date", { ascending: false });

    const ids = (bookingsData || []).map((b) => b.id);
    let reviewedIds = new Set<string>();
    if (ids.length) {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("booking_id")
        .in("booking_id", ids);
      reviewedIds = new Set((reviews || []).map((r) => r.booking_id).filter(Boolean) as string[]);
    }

    setBookings(
      (bookingsData || []).map((b) => ({ ...b, hasReview: reviewedIds.has(b.id) })) as PastBooking[]
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!bookings.length) return <p className="text-muted-foreground text-sm">No past tours yet.</p>;

  return (
    <>
      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{b.tour_type}</h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> {b.date}
                </span>
              </div>
              {b.hasReview ? (
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Reviewed
                </span>
              ) : (
                <Button size="sm" onClick={() => setActiveBooking(b)} className="animate-pulse">
                  <Star className="w-4 h-4 mr-1" /> Leave a Review
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {activeBooking && (
        <LeaveReviewDialog
          open={!!activeBooking}
          onOpenChange={(o) => !o && setActiveBooking(null)}
          bookingId={activeBooking.id}
          guideUserId={activeBooking.guide_user_id}
          reviewerName={activeBooking.traveler_name}
          reviewerEmail={activeBooking.traveler_email ?? undefined}
          onSubmitted={load}
        />
      )}
    </>
  );
};

export default PastTours;

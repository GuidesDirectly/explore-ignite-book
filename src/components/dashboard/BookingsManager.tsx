import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Check,
  X,
  Loader2,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
} from "lucide-react";

interface Booking {
  id: string;
  traveler_name: string;
  traveler_email: string | null;
  date: string;
  time: string;
  tour_type: string;
  group_size: number;
  price: number;
  location: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  declined: { label: "Declined", variant: "destructive" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const BookingsManager = ({ userId, guideName }: { userId: string; guideName: string }) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

  const fetchBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("guide_user_id", userId)
      .order("date", { ascending: false });

    if (!error && data) setBookings(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId);
    const booking = bookings.find((b) => b.id === bookingId);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update booking.");
    } else {
      toast.success(`Booking ${newStatus}.`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      // Send email notification to traveler if they have an email
      if (booking?.traveler_email && (newStatus === "confirmed" || newStatus === "declined")) {
        try {
          await supabase.functions.invoke("send-notification", {
            body: {
              type: "booking_status",
              data: {
                bookingId,
                travelerName: booking.traveler_name,
                travelerEmail: booking.traveler_email,
                guideName,
                status: newStatus,
                tourType: booking.tour_type,
                date: booking.date,
                time: booking.time,
                location: booking.location,
              },
            },
          });
          toast.success("Notification sent to traveler.", { icon: "📧" });
        } catch (e) {
          console.error("Failed to send booking notification:", e);
        }
      }
    }
    setUpdating(null);
  };

  const filtered = bookings.filter((b) =>
    filter === "all" ? true : b.status === filter
  );

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-primary" />
          {t("guideDashboard.manageBookings", "Manage Bookings")}
          {pendingCount > 0 && (
            <Badge variant="default" className="ml-1">{pendingCount} pending</Badge>
          )}
        </h2>
        <div className="flex gap-2">
          {(["all", "pending", "confirmed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {filter === "all"
              ? "No bookings yet."
              : `No ${filter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const expanded = expandedId === booking.id;
            const isPending = booking.status === "pending";
            const cfg = statusConfig[booking.status] || statusConfig.pending;
            const isUpdating = updating === booking.id;

            return (
              <div
                key={booking.id}
                className={`border rounded-xl p-4 transition-colors ${
                  isPending ? "border-primary/30 bg-primary/5" : "border-border/50"
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer gap-3"
                  onClick={() => setExpandedId(expanded ? null : booking.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">
                        {booking.traveler_name}
                      </span>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(booking.date).toLocaleDateString()} · {booking.time}
                      </span>
                      <span>{booking.tour_type}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {booking.group_size}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPending && !expanded && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(booking.id, "confirmed");
                          }}
                        >
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(booking.id, "declined");
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Tour Type</span>
                        <p className="font-medium text-foreground">{booking.tour_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Group Size</span>
                        <p className="font-medium text-foreground">{booking.group_size} people</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Price</span>
                        <p className="font-medium text-foreground">${booking.price}</p>
                      </div>
                      {booking.location && (
                        <div>
                          <span className="text-muted-foreground text-xs">Location</span>
                          <p className="font-medium text-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.location}
                          </p>
                        </div>
                      )}
                      {booking.traveler_email && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground text-xs">Contact</span>
                          <p className="font-medium text-foreground">{booking.traveler_email}</p>
                        </div>
                      )}
                    </div>
                    {booking.notes && (
                      <div>
                        <span className="text-muted-foreground text-xs">Notes</span>
                        <p className="text-sm text-foreground mt-0.5">{booking.notes}</p>
                      </div>
                    )}
                    {isPending && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => updateStatus(booking.id, "confirmed")}
                        >
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Accept Booking
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isUpdating}
                          onClick={() => updateStatus(booking.id, "declined")}
                        >
                          <X className="w-3 h-3" />
                          Decline
                        </Button>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isUpdating}
                          onClick={() => updateStatus(booking.id, "completed")}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => updateStatus(booking.id, "cancelled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BookingsManager;

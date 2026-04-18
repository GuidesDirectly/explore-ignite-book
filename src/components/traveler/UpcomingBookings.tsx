import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";

interface Booking {
  id: string;
  date: string;
  time: string;
  tour_type: string;
  location: string | null;
  group_size: number;
  status: string;
}

const UpcomingBookings = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("bookings")
      .select("id, date, time, tour_type, location, group_size, status")
      .eq("traveler_user_id", userId)
      .gte("date", today)
      .neq("status", "cancelled")
      .order("date", { ascending: true })
      .then(({ data }) => {
        setBookings((data as Booking[]) || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!bookings.length) return <p className="text-muted-foreground text-sm">No upcoming tours yet.</p>;

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Card key={b.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{b.tour_type}</h3>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> {b.date} · {b.time}
                </span>
                {b.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {b.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {b.group_size}
                </span>
              </div>
            </div>
            <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>{b.status}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UpcomingBookings;

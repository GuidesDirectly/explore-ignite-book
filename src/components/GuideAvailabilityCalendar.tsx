import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { format, startOfMonth, endOfMonth, addMonths, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarCheck, Loader2 } from "lucide-react";

interface AvailabilityEntry {
  date: string;
  status: string;
}

const GuideAvailabilityCalendar = ({ guideUserId }: { guideUserId: string }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchAvailability = async () => {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(addMonths(currentMonth, 2)), "yyyy-MM-dd");

      const { data } = await supabase
        .from("guide_availability" as any)
        .select("date, status")
        .eq("guide_user_id", guideUserId)
        .gte("date", start)
        .lte("date", end);

      setEntries((data as any[]) || []);
      setLoading(false);
    };

    fetchAvailability();
  }, [guideUserId, currentMonth]);

  const availableDates = entries
    .filter((e) => e.status === "available")
    .map((e) => new Date(e.date + "T00:00:00"));

  const blockedDates = entries
    .filter((e) => e.status === "blocked")
    .map((e) => new Date(e.date + "T00:00:00"));

  const hasEntries = entries.length > 0;

  if (loading) {
    return (
      <section className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!hasEntries) return null; // Don't show if guide hasn't set any availability

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6">
      <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-primary" />
        {t("guideProfile.availability", "Availability")}
      </h2>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={1}
          disabled={(date) => isBefore(date, startOfDay(new Date()))}
          className={cn("p-3 pointer-events-auto")}
          modifiers={{
            available: availableDates,
            blocked: blockedDates,
          }}
          modifiersClassNames={{
            available: "!bg-green-500/20 !text-green-700 font-bold border border-green-500/40",
            blocked: "!bg-destructive/20 !text-destructive font-bold border border-destructive/40 line-through",
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/40" />
          {t("guideProfile.available", "Available")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
          {t("guideProfile.unavailable", "Unavailable")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-muted border border-border" />
          {t("guideProfile.notSet", "Not set")}
        </span>
      </div>
    </section>
  );
};

export default GuideAvailabilityCalendar;

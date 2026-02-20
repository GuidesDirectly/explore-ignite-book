import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, addMonths, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  X,
} from "lucide-react";

interface AvailabilityEntry {
  id: string;
  date: string;
  status: string;
}

const AvailabilityManager = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [mode, setMode] = useState<"available" | "blocked">("available");

  const fetchEntries = useCallback(async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(addMonths(currentMonth, 2)), "yyyy-MM-dd");

    const { data } = await supabase
      .from("guide_availability" as any)
      .select("id, date, status")
      .eq("guide_user_id", userId)
      .gte("date", start)
      .lte("date", end);

    setEntries((data as any[]) || []);
    setLoading(false);
  }, [userId, currentMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const getDateStatus = (date: Date): string | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = entries.find((e) => e.date === dateStr);
    return entry?.status || null;
  };

  const handleDayClick = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;

    setSelectedDates((prev) => {
      const dateStr = date.toISOString();
      if (prev.some((d) => d.toISOString() === dateStr)) {
        return prev.filter((d) => d.toISOString() !== dateStr);
      }
      return [...prev, date];
    });
  };

  const handleSave = async () => {
    if (selectedDates.length === 0) return;
    setSaving(true);

    for (const date of selectedDates) {
      const dateStr = format(date, "yyyy-MM-dd");
      const existing = entries.find((e) => e.date === dateStr);

      if (existing) {
        if (existing.status === mode) {
          // Remove if same status (toggle off)
          await supabase
            .from("guide_availability" as any)
            .delete()
            .eq("id", existing.id);
        } else {
          // Update status
          await (supabase
            .from("guide_availability" as any)
            .update({ status: mode })
            .eq("id", existing.id) as any);
        }
      } else {
        await supabase
          .from("guide_availability" as any)
          .insert({
            guide_user_id: userId,
            date: dateStr,
            status: mode,
          } as any);
      }
    }

    toast.success(`${selectedDates.length} date(s) updated!`);
    setSelectedDates([]);
    await fetchEntries();
    setSaving(false);
  };

  const today = startOfDay(new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-2">
        <CalendarCheck className="w-5 h-5 text-primary" />
        {t("guideDashboard.availability", "Manage Availability")}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {t("guideDashboard.availabilityHint", "Click dates to select them, then mark as available or blocked. Travelers will see your availability on your profile.")}
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={mode === "available" ? "default" : "outline"}
          onClick={() => setMode("available")}
          className={mode === "available" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
          <Check className="w-3 h-3 mr-1" />
          Mark Available
        </Button>
        <Button
          size="sm"
          variant={mode === "blocked" ? "default" : "outline"}
          onClick={() => setMode("blocked")}
          className={mode === "blocked" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}
        >
          <X className="w-3 h-3 mr-1" />
          Mark Blocked
        </Button>
      </div>

      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={(dates) => setSelectedDates(dates || [])}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={1}
          disabled={(date) => isBefore(date, today)}
          className={cn("p-3 pointer-events-auto")}
          modifiers={{
            available: entries
              .filter((e) => e.status === "available")
              .map((e) => new Date(e.date + "T00:00:00")),
            blocked: entries
              .filter((e) => e.status === "blocked")
              .map((e) => new Date(e.date + "T00:00:00")),
          }}
          modifiersClassNames={{
            available: "!bg-green-500/20 !text-green-700 font-bold border border-green-500/40",
            blocked: "!bg-destructive/20 !text-destructive font-bold border border-destructive/40",
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/40" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
          Blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary" />
          Selected
        </span>
      </div>

      {/* Save button */}
      {selectedDates.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary">
            {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected
          </Badge>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDates([])}
            >
              Clear
            </Button>
            <Button
              size="sm"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Apply {mode === "available" ? "Available" : "Blocked"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AvailabilityManager;

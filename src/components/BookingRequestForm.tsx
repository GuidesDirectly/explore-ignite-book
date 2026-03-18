import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  CalendarIcon,
  Loader2,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const bookingSchema = z.object({
  traveler_name: z.string().trim().min(1, "Name is required").max(100),
  traveler_email: z.string().trim().email("Valid email required").max(255),
  date: z.date({ required_error: "Date is required" }),
  time: z.string().min(1, "Time is required"),
  tour_type: z.string().min(1, "Tour type is required"),
  group_size: z.number().int().min(1).max(50),
  location: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Props {
  guideUserId: string;
  guideName: string;
  tourTypes: string[];
  serviceAreas: string[];
  availableDates?: Date[];
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00",
];

const BookingRequestForm = ({ guideUserId, guideName, tourTypes, serviceAreas, availableDates }: Props) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const [form, setForm] = useState({
    traveler_name: "",
    traveler_email: "",
    date: undefined as Date | undefined,
    time: "",
    tour_type: "",
    group_size: 1,
    location: serviceAreas[0] || "",
    notes: "",
  });

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = bookingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const data = result.data;

    // Attach traveler_user_id when logged in; null for guest checkout
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("bookings").insert({
      guide_user_id: guideUserId,
      traveler_name: data.traveler_name,
      traveler_email: data.traveler_email,
      traveler_user_id: session?.user?.id ?? null,
      date: format(data.date, "yyyy-MM-dd"),
      time: data.time,
      tour_type: data.tour_type,
      group_size: data.group_size,
      location: data.location || null,
      notes: data.notes || null,
      status: "pending",
    } as any);

    if (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking request. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Booking request sent!");

      // Send confirmation email to traveler
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "booking_request",
            data: {
              travelerName: data.traveler_name,
              travelerEmail: data.traveler_email,
              guideName,
              tourType: data.tour_type,
              date: format(data.date, "PPP"),
              time: data.time,
              location: data.location || null,
              groupSize: data.group_size,
            },
          },
        });
      } catch (e) {
        console.error("Failed to send confirmation email:", e);
      }
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <section id="booking-section" className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="text-center py-8 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h2 className="font-display text-xl font-bold text-foreground">
            {t("booking.submitted", "Booking Request Sent!")}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t(
              "booking.submittedMessage",
              `Your booking request has been sent to ${guideName}. They'll review it and get back to you via email.`
            )}
          </p>
          <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ traveler_name: "", traveler_email: "", date: undefined, time: "", tour_type: "", group_size: 1, location: serviceAreas[0] || "", notes: "" }); }}>
            {t("booking.sendAnother", "Send Another Request")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="booking-section" className="bg-card rounded-2xl border border-border/50 p-6">
      <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-primary" />
        {t("booking.title", "Request a Booking")}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t("booking.subtitle", `Send a booking request to ${guideName}. They'll confirm or suggest alternatives.`)}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="bk-name">{t("booking.name", "Your Name")} *</Label>
            <Input
              id="bk-name"
              value={form.traveler_name}
              onChange={(e) => update("traveler_name", e.target.value)}
              placeholder="John Doe"
              maxLength={100}
            />
            {errors.traveler_name && <p className="text-xs text-destructive">{errors.traveler_name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="bk-email">{t("booking.email", "Your Email")} *</Label>
            <Input
              id="bk-email"
              type="email"
              value={form.traveler_email}
              onChange={(e) => update("traveler_email", e.target.value)}
              placeholder="john@example.com"
              maxLength={255}
            />
            {errors.traveler_email && <p className="text-xs text-destructive">{errors.traveler_email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-1.5">
            <Label>{t("booking.date", "Preferred Date")} *</Label>
            {availableDates && availableDates.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-green-500/40 border border-green-500/60" />
                {t("booking.onlyAvailableDates", "Only dates marked available on the calendar above can be selected.")}
              </p>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.date ? format(form.date, "PPP") : t("booking.pickDate", "Pick a date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.date}
                  onSelect={(d) => update("date", d)}
                  disabled={(date) => {
                    if (date < new Date()) return true;
                    if (availableDates && availableDates.length > 0) {
                      const dateStr = format(date, "yyyy-MM-dd");
                      return !availableDates.some(d => format(d, "yyyy-MM-dd") === dateStr);
                    }
                    return false;
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <Label>{t("booking.time", "Preferred Time")} *</Label>
            <Select value={form.time} onValueChange={(v) => update("time", v)}>
              <SelectTrigger>
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder={t("booking.selectTime", "Select time")} />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tour type */}
          <div className="space-y-1.5">
            <Label>{t("booking.tourType", "Tour Type")} *</Label>
            <Select value={form.tour_type} onValueChange={(v) => update("tour_type", v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("booking.selectTour", "Select tour type")} />
              </SelectTrigger>
              <SelectContent>
                {tourTypes.length > 0 ? (
                  tourTypes.map((tt) => (
                    <SelectItem key={tt} value={tt}>{tt}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Walking Tour">Walking Tour</SelectItem>
                    <SelectItem value="City Tour">City Tour</SelectItem>
                    <SelectItem value="Food Tour">Food Tour</SelectItem>
                    <SelectItem value="Custom Tour">Custom Tour</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {errors.tour_type && <p className="text-xs text-destructive">{errors.tour_type}</p>}
          </div>

          {/* Group size */}
          <div className="space-y-1.5">
            <Label htmlFor="bk-size">
              <Users className="w-4 h-4 inline mr-1" />
              {t("booking.groupSize", "Group Size")} *
            </Label>
            <Input
              id="bk-size"
              type="number"
              min={1}
              max={50}
              value={form.group_size}
              onChange={(e) => update("group_size", parseInt(e.target.value) || 1)}
            />
            {errors.group_size && <p className="text-xs text-destructive">{errors.group_size}</p>}
          </div>
        </div>

        {/* Location */}
        {serviceAreas.length > 0 && (
          <div className="space-y-1.5">
            <Label>
              <MapPin className="w-4 h-4 inline mr-1" />
              {t("booking.location", "Meeting Location")}
            </Label>
            <Select value={form.location} onValueChange={(v) => update("location", v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("booking.selectLocation", "Select location")} />
              </SelectTrigger>
              <SelectContent>
                {serviceAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="bk-notes">{t("booking.notes", "Additional Notes")}</Label>
          <Textarea
            id="bk-notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder={t("booking.notesPlaceholder", "Any special requests, accessibility needs, interests...")}
            maxLength={1000}
            rows={3}
          />
        </div>

        <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t("booking.sending", "Sending...")}
            </>
          ) : (
            <>
              <CalendarCheck className="w-4 h-4 mr-2" />
              {t("booking.submit", "Send Booking Request")}
            </>
          )}
        </Button>
      </form>
    </section>
  );
};

export default BookingRequestForm;

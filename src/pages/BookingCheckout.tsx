import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import {
  CalendarIcon,
  CalendarCheck,
  Users,
  Clock,
  MapPin,
  User,
  Mail,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00",
];

const STEPS = [
  { label: "Tour Details", icon: MapPin },
  { label: "Date & Group", icon: CalendarCheck },
  { label: "Your Info", icon: User },
  { label: "Confirmation", icon: CheckCircle2 },
];

const bookingSchema = z.object({
  tour_type: z.string().min(1, "Tour type is required"),
  location: z.string().min(1, "Location is required"),
  date: z.date({ required_error: "Date is required" }),
  time: z.string().min(1, "Time is required"),
  group_size: z.number().int().min(1).max(50),
  traveler_name: z.string().trim().min(1, "Name is required").max(100),
  traveler_email: z.string().trim().email("Valid email required").max(255),
  notes: z.string().trim().max(1000).optional(),
});

const BookingCheckout = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "";
  const initialCity = searchParams.get("city") || "";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guideName, setGuideName] = useState("");
  const [tourTypes, setTourTypes] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    tour_type: initialType,
    location: initialCity,
    date: undefined as Date | undefined,
    time: "",
    group_size: 2,
    traveler_name: "",
    traveler_email: "",
    notes: "",
  });

  // Handle payment success/cancel return from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      setSubmitted(true);
      toast.success("Payment successful! Your booking is confirmed.");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment cancelled. Your booking is saved as pending.");
    }
  }, [searchParams]);

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    const fetchGuide = async () => {
      if (!guideId) return;

      const { data } = await (supabase
        .from("guide_profiles_public" as any)
        .select("form_data, service_areas")
        .eq("user_id", guideId)
        .maybeSingle() as any);

      if (data) {
        const fd = data.form_data || {};
        setGuideName(`${fd.firstName || "Guide"} ${fd.lastName || ""}`.trim());
        setTourTypes(fd.tourTypes || ["Walking Tour", "City Tour", "Food Tour", "Custom Tour"]);
        setServiceAreas(data.service_areas || ["Washington DC"]);
        if (!form.location && data.service_areas?.length > 0) {
          update("location", data.service_areas[0]);
        }
      }

      // Fetch availability
      const { data: avail } = await supabase
        .from("guide_availability")
        .select("date")
        .eq("guide_user_id", guideId)
        .eq("status", "available");

      if (avail) {
        setAvailableDates(avail.map((a: any) => new Date(a.date)));
      }
    };
    fetchGuide();
  }, [guideId]);

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 0) {
      if (!form.tour_type) newErrors.tour_type = "Tour type is required";
      if (!form.location) newErrors.location = "Location is required";
    } else if (s === 1) {
      if (!form.date) newErrors.date = "Date is required";
      if (!form.time) newErrors.time = "Time is required";
      if (form.group_size < 1) newErrors.group_size = "At least 1 person required";
    } else if (s === 2) {
      if (!form.traveler_name.trim()) newErrors.traveler_name = "Name is required";
      if (!form.traveler_email.trim()) newErrors.traveler_email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.traveler_email)) newErrors.traveler_email = "Valid email required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const goBack = () => setStep(Math.max(0, step - 1));

  const [tourPrice, setTourPrice] = useState<number>(0);

  // Fetch tour price when tour_type changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (!guideId || !form.tour_type) return;
      const { data } = await supabase
        .from("tours")
        .select("price_per_person")
        .eq("guide_user_id", guideId)
        .eq("title", form.tour_type)
        .eq("status", "published")
        .maybeSingle();
      if (data) setTourPrice(Number(data.price_per_person) || 0);
    };
    fetchPrice();
  }, [guideId, form.tour_type]);

  const totalPrice = tourPrice * form.group_size;

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    if (!guideId || !form.date) return;

    setSubmitting(true);

    // Attach traveler_user_id when logged in; null for guest checkout
    const { data: { session } } = await supabase.auth.getSession();

    // Create booking first
    const { data: bookingData, error } = await supabase.from("bookings").insert({
      guide_user_id: guideId,
      traveler_name: form.traveler_name,
      traveler_email: form.traveler_email,
      traveler_user_id: session?.user?.id ?? null,
      date: format(form.date, "yyyy-MM-dd"),
      time: form.time,
      tour_type: form.tour_type,
      group_size: form.group_size,
      location: form.location || null,
      notes: form.notes || null,
      price: totalPrice,
      status: "pending",
    } as any).select("id").single();

    if (error) {
      toast.error("Failed to submit booking. Please try again.");
      console.error("Booking error:", error);
      setSubmitting(false);
      return;
    }

    // If there's a price, redirect to Stripe checkout
    if (totalPrice > 0) {
      try {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          "create-checkout-session",
          {
            body: {
              booking_id: bookingData?.id,
              guide_user_id: guideId,
              traveler_name: form.traveler_name,
              traveler_email: form.traveler_email,
              tour_type: form.tour_type,
              amount_cents: Math.round(totalPrice * 100),
              date: format(form.date, "yyyy-MM-dd"),
              time: form.time,
              location: form.location || null,
              group_size: form.group_size,
              success_url: `${window.location.origin}/book/${guideId}?payment=success&booking=${bookingData?.id}`,
              cancel_url: `${window.location.origin}/book/${guideId}?payment=cancelled`,
            },
          }
        );

        if (checkoutError) throw checkoutError;
        if (checkoutData?.url) {
          window.location.href = checkoutData.url;
          return;
        }
      } catch (e) {
        console.error("Stripe checkout failed:", e);
        toast.error("Payment setup failed. Booking saved as pending.");
      }
    }

    // Free tour or Stripe fallback — show confirmation
    setSubmitted(true);
    toast.success("Booking request submitted!");
    trackEvent("booking_completed", {
      guide_id: guideId,
      tour_type: form.tour_type,
      city: form.location,
      group_size: form.group_size,
    });

    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "booking_request",
          data: {
            travelerName: form.traveler_name,
            travelerEmail: form.traveler_email,
            guideName,
            guideUserId: guideId,
            tourType: form.tour_type,
            date: format(form.date, "PPP"),
            time: form.time,
            location: form.location || null,
            groupSize: form.group_size,
          },
        },
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center py-20 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your booking request has been sent to <strong>{guideName}</strong>. They'll review it and confirm via email at <strong>{form.traveler_email}</strong>.
            </p>
            <div className="bg-card rounded-xl border border-border/50 p-5 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tour</span>
                <span className="font-medium text-foreground">{form.tour_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">{form.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{form.date ? format(form.date, "PPP") : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{form.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Group Size</span>
                <span className="font-medium text-foreground">{form.group_size}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button asChild>
                <Link to="/tours">Browse More Tours</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/home">Back to Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Book Your Tour
            </h1>
            <p className="text-muted-foreground">
              {guideName ? `with ${guideName}` : "Complete the steps below to send your booking request."}
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-10 px-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step || submitted;
              return (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary/10 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      "text-xs mt-1.5 font-medium hidden sm:block",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-8 sm:w-16 mx-1 sm:mx-2 transition-colors",
                      i < step ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-card">
            <AnimatePresence mode="wait">
              {/* Step 0: Tour Details */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Select Your Tour
                  </h2>

                  <div className="space-y-1.5">
                    <Label>Tour Type *</Label>
                    <Select value={form.tour_type} onValueChange={(v) => update("tour_type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tour type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tourTypes.map((tt) => (
                          <SelectItem key={tt} value={tt}>{tt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tour_type && <p className="text-xs text-destructive">{errors.tour_type}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Location *</Label>
                    <Select value={form.location} onValueChange={(v) => update("location", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose location" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceAreas.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Date & Group */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-primary" />
                    Choose Date & Group Size
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.date ? format(form.date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.date}
                            onSelect={(d) => update("date", d)}
                            disabled={(date) => {
                              if (date < new Date()) return true;
                              if (availableDates.length > 0) {
                                const dateStr = format(date, "yyyy-MM-dd");
                                return !availableDates.some((d) => format(d, "yyyy-MM-dd") === dateStr);
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

                    <div className="space-y-1.5">
                      <Label>Preferred Time *</Label>
                      <Select value={form.time} onValueChange={(v) => update("time", v)}>
                        <SelectTrigger>
                          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select time" />
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

                  <div className="space-y-1.5">
                    <Label>
                      <Users className="w-4 h-4 inline mr-1" /> Group Size *
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={form.group_size}
                      onChange={(e) => update("group_size", parseInt(e.target.value) || 1)}
                    />
                    {errors.group_size && <p className="text-xs text-destructive">{errors.group_size}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Your Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-name">Full Name *</Label>
                      <Input
                        id="bk-name"
                        value={form.traveler_name}
                        onChange={(e) => update("traveler_name", e.target.value)}
                        placeholder="John Doe"
                        maxLength={100}
                      />
                      {errors.traveler_name && <p className="text-xs text-destructive">{errors.traveler_name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-email">Email *</Label>
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

                  <div className="space-y-1.5">
                    <Label htmlFor="bk-notes">
                      <FileText className="w-4 h-4 inline mr-1" /> Additional Notes
                    </Label>
                    <Textarea
                      id="bk-notes"
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Any special requests, accessibility needs, interests..."
                      maxLength={1000}
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Review Your Booking
                  </h2>

                  <div className="bg-background rounded-xl border border-border/50 p-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tour</span>
                      <span className="font-medium text-foreground">{form.tour_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium text-foreground">{form.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">{form.date ? format(form.date, "PPP") : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-foreground">{form.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Group Size</span>
                      <span className="font-medium text-foreground">{form.group_size}</span>
                    </div>
                    {totalPrice > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price per Person</span>
                          <span className="font-medium text-foreground">${tourPrice.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-border/50 pt-2 flex justify-between">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="font-bold text-primary text-lg">${totalPrice.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t border-border/50 pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium text-foreground">{form.traveler_name}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground">{form.traveler_email}</span>
                    </div>
                    {form.notes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Notes</span>
                        <span className="font-medium text-foreground text-right max-w-[60%]">{form.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg p-3">
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      {totalPrice > 0
                        ? "Secure payment via Stripe. Your guide receives 85% directly. Transparent pricing."
                        : "Your booking request goes directly to the guide. No hidden fees."}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-5 border-t border-border/50">
              {step > 0 ? (
                <Button variant="outline" onClick={goBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button onClick={goNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button variant="hero" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...
                    </>
                  ) : totalPrice > 0 ? (
                    <>
                      Pay ${totalPrice.toFixed(2)} <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Confirm Booking <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingCheckout;

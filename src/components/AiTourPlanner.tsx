import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Star,
  MessageCircle,
  Loader2,
  RefreshCw,
  User,
  Briefcase,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AI_TOUR_PLANNER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plan-tour`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GENERIC_PLANNER_ERROR = "Unable to generate itinerary. Please try again.";

interface Activity {
  time: string;
  title: string;
  description: string;
  durationMinutes: number;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

interface PlannerResponse {
  status: "success";
  itinerary: ItineraryDay[];
}

interface GuideCard {
  id: string;
  name: string;
  language: string;
  price: string;
  userId: string;
}

const INTEREST_OPTIONS = [
  "History & Heritage",
  "Food & Cuisine",
  "Art & Culture",
  "Nature & Parks",
  "Architecture",
  "Nightlife",
  "Shopping",
  "Photography",
  "Adventure",
  "Family-Friendly",
  "Romantic",
  "Local Experiences",
];

const TRAVEL_STYLES = [
  { value: "balanced", label: "Balanced" },
  { value: "relaxed", label: "Relaxed & Easy" },
  { value: "packed", label: "Action-Packed" },
  { value: "luxury", label: "Luxury" },
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget ($50–100/day)" },
  { value: "moderate", label: "Moderate ($100–250/day)" },
  { value: "premium", label: "Premium ($250–500/day)" },
  { value: "luxury", label: "Luxury ($500+/day)" },
];

const isValidActivity = (activity: unknown): activity is Activity => {
  if (!activity || typeof activity !== "object") return false;

  const candidate = activity as Record<string, unknown>;
  return (
    typeof candidate.time === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.durationMinutes === "number"
  );
};

const isValidItineraryResponse = (value: unknown): value is PlannerResponse => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  if (candidate.status !== "success" || !Array.isArray(candidate.itinerary)) return false;

  return candidate.itinerary.every((day) => {
    if (!day || typeof day !== "object") return false;

    const itineraryDay = day as Record<string, unknown>;
    return (
      typeof itineraryDay.day === "number" &&
      typeof itineraryDay.title === "string" &&
      Array.isArray(itineraryDay.activities) &&
      itineraryDay.activities.every(isValidActivity)
    );
  });
};

const formatGuidePrice = (price?: number | null, currency?: string | null) => {
  if (typeof price !== "number") return "Price on request";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency || "USD"} ${price}`;
  }
};

const AiTourPlanner = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"traveler" | "guide">("traveler");

  // Traveler fields
  const [destination, setDestination] = useState("");
  const [tripDays, setTripDays] = useState("3");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [budget, setBudget] = useState("moderate");
  const [languages, setLanguages] = useState("English");

  // Guide fields
  const [guideName, setGuideName] = useState("");
  const [guideCity, setGuideCity] = useState("");
  const [guideSpecialty, setGuideSpecialty] = useState("");
  const [tourDuration, setTourDuration] = useState("4");

  // State
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [error, setError] = useState("");
  const [matchedGuides, setMatchedGuides] = useState<GuideCard[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 5
          ? [...prev, interest]
          : prev,
    );
  };

  const buildTravelerPrompt = () => {
    return [
      `Destination: ${destination}`,
      `Trip length: ${tripDays} days`,
      `Group: ${adults} adults${parseInt(children) > 0 ? `, ${children} children` : ""}`,
      `Travel style: ${travelStyle}`,
      `Budget: ${BUDGET_OPTIONS.find((b) => b.value === budget)?.label || budget}`,
      selectedInterests.length > 0 ? `Interests: ${selectedInterests.join(", ")}` : "",
      languages !== "English" ? `Languages: ${languages}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const buildGuidePrompt = () => {
    return [
      `Guide Name: ${guideName}`,
      `Base City: ${guideCity}`,
      guideSpecialty ? `Specialty: ${guideSpecialty}` : "",
      `Tour Duration: ${tourDuration} hours`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const fetchMatchedGuides = async () => {
    try {
      const [{ data: guideData }, { data: tourData }] = await Promise.all([
        (supabase
          .from("guide_profiles_public" as any)
          .select("id, user_id, form_data, service_areas, status")
          .eq("status", "approved")
          .limit(12) as any),
        (supabase
          .from("tours")
          .select("guide_user_id, price_per_person, currency")
          .eq("status", "published")
          .limit(100) as any),
      ]);

      if (!guideData?.length) {
        setMatchedGuides([]);
        return;
      }

      const lowestPriceByGuide = new Map<string, { price: number; currency: string | null }>();

      for (const tour of tourData || []) {
        const current = lowestPriceByGuide.get(tour.guide_user_id);
        if (!current || tour.price_per_person < current.price) {
          lowestPriceByGuide.set(tour.guide_user_id, {
            price: tour.price_per_person,
            currency: tour.currency,
          });
        }
      }

      const normalizedDestination = destination.trim().toLowerCase();
      const destinationMatched = guideData.filter((guide: any) => {
        const areas = Array.isArray(guide.service_areas) ? guide.service_areas : [];
        if (!normalizedDestination) return true;
        return areas.some((area: string) => area.toLowerCase().includes(normalizedDestination) || normalizedDestination.includes(area.toLowerCase()));
      });

      const selectedGuides = (destinationMatched.length > 0 ? destinationMatched : guideData).slice(0, 5);

      const cards: GuideCard[] = selectedGuides.map((guide: any) => {
        const formData = guide.form_data || {};
        const guidePrice = lowestPriceByGuide.get(guide.user_id);
        const name = [formData.firstName, formData.lastName].filter(Boolean).join(" ") || formData.name || "Local Guide";
        const language = Array.isArray(formData.languages)
          ? formData.languages.join(", ")
          : formData.languages || "English";

        return {
          id: guide.id,
          name,
          language,
          price: formatGuidePrice(guidePrice?.price, guidePrice?.currency),
          userId: guide.user_id,
        };
      });

      setMatchedGuides(cards);
    } catch {
      setMatchedGuides([]);
    }
  };

  const handleGenerate = async () => {
    if (mode === "traveler" && !destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (mode === "guide" && (!guideName.trim() || !guideCity.trim())) {
      setError("Please fill in your name and city.");
      return;
    }

    if (!emailCaptured && mode === "traveler") {
      setShowEmailGate(true);
      return;
    }

    await generateItinerary();
  };

  const generateItinerary = async () => {
    const description = mode === "traveler" ? buildTravelerPrompt() : buildGuidePrompt();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    setError("");
    setLoading(true);
    setItinerary([]);
    setMatchedGuides([]);

    try {
      const resp = await fetch(AI_TOUR_PLANNER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ description, mode }),
        signal: controller.signal,
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error((data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) || GENERIC_PLANNER_ERROR);
      }

      if (!isValidItineraryResponse(data)) {
        throw new Error(GENERIC_PLANNER_ERROR);
      }

      setItinerary(data.itinerary);

      if (mode === "traveler") {
        await fetchMatchedGuides();
      }

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err: any) {
      const msg = err?.message || GENERIC_PLANNER_ERROR;
      console.error("Itinerary generation error:", msg);
      setError(msg);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !email.includes("@")) return;

    setError("");
    setEmailCaptured(true);
    setShowEmailGate(false);

    try {
      await supabase.from("inquiries").insert({
        name: "AI Planner Lead",
        email: email.trim(),
        destination: destination || guideCity || "AI Tour Planner",
        message: `Generated via AI Tour Planner (${mode} mode)`,
      });
    } catch {
      // Intentionally silent: lead capture should not block itinerary generation
    }

    await generateItinerary();
  };

  const handleSkipEmail = async () => {
    setEmailCaptured(true);
    setShowEmailGate(false);
    await generateItinerary();
  };

  const handleBookGuide = (guideId?: string) => {
    if (guideId) {
      navigate(`/guide/${guideId}`);
      return;
    }

    navigate("/explore", { state: { destination } });
  };

  return (
    <section id="ai-planner" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Badge variant="secondary" className="mb-4 text-sm font-medium px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            Plan Your Perfect Tour
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Powered by AI. Personalized for you. Get a complete itinerary in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-lg border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-accent/50 p-4 border-b border-border/50">
                <Tabs value={mode} onValueChange={(value) => setMode(value as "traveler" | "guide")}>
                  <TabsList className="w-full max-w-sm mx-auto grid grid-cols-2">
                    <TabsTrigger value="traveler" className="gap-2 text-sm">
                      <User className="w-4 h-4" />
                      I&apos;m a Traveler
                    </TabsTrigger>
                    <TabsTrigger value="guide" className="gap-2 text-sm">
                      <Briefcase className="w-4 h-4" />
                      I&apos;m a Tour Guide
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-5 md:p-8 space-y-6">
                <AnimatePresence mode="wait">
                  {mode === "traveler" ? (
                    <TravelerForm
                      key="traveler"
                      destination={destination}
                      setDestination={setDestination}
                      tripDays={tripDays}
                      setTripDays={setTripDays}
                      adults={adults}
                      setAdults={setAdults}
                      children_={children}
                      setChildren={setChildren}
                      selectedInterests={selectedInterests}
                      toggleInterest={toggleInterest}
                      travelStyle={travelStyle}
                      setTravelStyle={setTravelStyle}
                      budget={budget}
                      setBudget={setBudget}
                      languages={languages}
                      setLanguages={setLanguages}
                    />
                  ) : (
                    <GuideForm
                      key="guide"
                      guideName={guideName}
                      setGuideName={setGuideName}
                      guideCity={guideCity}
                      setGuideCity={setGuideCity}
                      guideSpecialty={guideSpecialty}
                      setGuideSpecialty={setGuideSpecialty}
                      tourDuration={tourDuration}
                      setTourDuration={setTourDuration}
                    />
                  )}
                </AnimatePresence>

                {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full gap-2 text-base py-6 rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating your itinerary…
                    </>
                  ) : mode === "traveler" ? (
                    <>
                      <Compass className="w-5 h-5" />
                      Generate My Tour
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Itinerary Template
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  No account required • Free to try • Results in seconds
                </p>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {showEmailGate && !emailCaptured && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
              >
                <Card className="max-w-md w-full shadow-xl">
                  <CardContent className="p-6 space-y-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Unlock Your Personalized Itinerary
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email to get your custom tour plan and be matched with expert local guides.
                    </p>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-center"
                      onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleEmailSubmit} className="flex-1 gap-2">
                        <Lock className="w-4 h-4" />
                        Generate & Unlock
                      </Button>
                      <Button variant="ghost" onClick={handleSkipEmail} className="text-muted-foreground">
                        Skip
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">No spam. We respect your privacy.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {itinerary.length > 0 && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <Card className="shadow-lg border-border/50">
                <CardContent className="p-5 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                      {mode === "traveler" ? "Your Personalized Itinerary" : "Itinerary Template"}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmailCaptured(true);
                        void generateItinerary();
                      }}
                      disabled={loading}
                      className="gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {itinerary.map((day) => (
                      <div key={day.day} className="border border-border/50 rounded-xl overflow-hidden">
                        <div className="bg-accent/50 px-5 py-3 border-b border-border/50">
                          <h4 className="font-display text-lg font-semibold text-foreground">
                            Day {day.day}: {day.title}
                          </h4>
                        </div>
                        <div className="divide-y divide-border/30">
                          {day.activities.map((act, index) => (
                            <div key={index} className="px-5 py-3 flex gap-4 items-start">
                              <div className="flex-shrink-0 text-center">
                                <span className="text-sm font-semibold text-primary">{act.time}</span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {act.durationMinutes}m
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm">{act.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 h-8 px-3 text-xs"
                                  onClick={() => {}}
                                >
                                  Swap this activity
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {mode === "traveler" && matchedGuides.length > 0 && (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="p-5 md:p-8">
                    <h3 className="font-display text-xl font-bold text-foreground mb-4">
                      Available Local Guides
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matchedGuides.map((guide) => (
                        <div key={guide.id} className="border border-border/50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{guide.name}</p>
                              <p className="text-xs text-muted-foreground">Language: {guide.language}</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-foreground">Price: {guide.price}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={() => handleBookGuide(guide.id)}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Contact Guide
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => handleBookGuide(guide.id)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {mode === "traveler" && (
                <Card className="shadow-lg border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-5 md:p-8">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center mx-auto">
                        <Star className="w-6 h-6 text-secondary" />
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                        Book This Experience
                      </h3>
                      <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                        Love your itinerary? Our vetted local guides can bring it to life.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Button variant="hero" size="lg" onClick={() => handleBookGuide()} className="gap-2">
                          <Users className="w-5 h-5" />
                          Find Available Guides
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/chat")}
                          className="gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Customize with AI
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/50 mt-4">
                        <UpsellCard
                          icon={<Star className="w-4 h-4" />}
                          title="Upgrade to Private Guide"
                          description="Skip the crowds. Get a personal expert."
                          onClick={() => navigate("/explore")}
                        />
                        <UpsellCard
                          icon={<Compass className="w-4 h-4" />}
                          title="Customize with Expert"
                          description="Tweak every detail with a local."
                          onClick={() => navigate("/chat")}
                        />
                        <UpsellCard
                          icon={<ArrowRight className="w-4 h-4" />}
                          title="Book This Exact Tour"
                          description="Skip planning — just go."
                          onClick={() => handleBookGuide()}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mode === "guide" && (
                <Card className="shadow-lg border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-5 md:p-8 text-center space-y-4">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Ready to List Your Tours?
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                      Use this template as a starting point. Join Guides Directly to list your tours, manage bookings, and grow your business.
                    </p>
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={() => navigate("/apply-city-pilot")}
                      className="gap-2"
                    >
                      <Briefcase className="w-5 h-5" />
                      Apply as a Guide
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

function TravelerForm({
  destination,
  setDestination,
  tripDays,
  setTripDays,
  adults,
  setAdults,
  children_,
  setChildren,
  selectedInterests,
  toggleInterest,
  travelStyle,
  setTravelStyle,
  budget,
  setBudget,
  languages,
  setLanguages,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField icon={<MapPin className="w-4 h-4" />} label="Destination">
          <Input placeholder="e.g. Washington DC, Paris, Tokyo" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </FormField>
        <FormField icon={<Calendar className="w-4 h-4" />} label="Trip Length (days)">
          <Input type="number" min="1" max="30" value={tripDays} onChange={(e) => setTripDays(e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField icon={<Users className="w-4 h-4" />} label="Adults">
          <Input type="number" min="1" max="20" value={adults} onChange={(e) => setAdults(e.target.value)} />
        </FormField>
        <FormField icon={<Users className="w-4 h-4" />} label="Children">
          <Input type="number" min="0" max="10" value={children_} onChange={(e) => setChildren(e.target.value)} />
        </FormField>
        <FormField icon={<Globe className="w-4 h-4" />} label="Language">
          <Input placeholder="English" value={languages} onChange={(e) => setLanguages(e.target.value)} />
        </FormField>
      </div>

      <FormField icon={<Compass className="w-4 h-4" />} label="Travel Style">
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setTravelStyle(style.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                travelStyle === style.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField icon={<DollarSign className="w-4 h-4" />} label="Budget">
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((budgetOption) => (
            <button
              key={budgetOption.value}
              type="button"
              onClick={() => setBudget(budgetOption.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                budget === budgetOption.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {budgetOption.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField icon={<Sparkles className="w-4 h-4" />} label="Interests (select up to 5)">
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedInterests.includes(interest)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {selectedInterests.includes(interest) && "✓ "}
              {interest}
            </button>
          ))}
        </div>
      </FormField>
    </motion.div>
  );
}

function GuideForm({
  guideName,
  setGuideName,
  guideCity,
  setGuideCity,
  guideSpecialty,
  setGuideSpecialty,
  tourDuration,
  setTourDuration,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField icon={<User className="w-4 h-4" />} label="Your Name">
          <Input placeholder="e.g. John Smith" value={guideName} onChange={(e) => setGuideName(e.target.value)} />
        </FormField>
        <FormField icon={<MapPin className="w-4 h-4" />} label="Your City">
          <Input placeholder="e.g. Washington DC" value={guideCity} onChange={(e) => setGuideCity(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField icon={<Compass className="w-4 h-4" />} label="Specialty (optional)">
          <Input placeholder="e.g. Historical Walking Tours" value={guideSpecialty} onChange={(e) => setGuideSpecialty(e.target.value)} />
        </FormField>
        <FormField icon={<Calendar className="w-4 h-4" />} label="Tour Duration (hours)">
          <Input type="number" min="1" max="12" value={tourDuration} onChange={(e) => setTourDuration(e.target.value)} />
        </FormField>
      </div>
      <p className="text-sm text-muted-foreground bg-accent/50 rounded-lg p-3">
        💡 Generate a professional itinerary template you can use as a starting point for your tours.
      </p>
    </motion.div>
  );
}

function FormField({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function UpsellCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

export default AiTourPlanner;

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Users, MapPin, Calendar, DollarSign, Globe, Sparkles,
  ArrowRight, Mail, Lock, ChevronDown, X, Star, MessageCircle,
  Loader2, RefreshCw, User, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const INTEREST_OPTIONS = [
  "History & Heritage", "Food & Cuisine", "Art & Culture", "Nature & Parks",
  "Architecture", "Nightlife", "Shopping", "Photography", "Adventure",
  "Family-Friendly", "Romantic", "Local Experiences"
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
  const [result, setResult] = useState("");
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 5
        ? [...prev, interest]
        : prev
    );
  };

  const buildTravelerPrompt = () => {
    const parts = [
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
    return parts;
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

  const handleGenerate = async () => {
    if (mode === "traveler" && !destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    if (mode === "guide" && (!guideName.trim() || !guideCity.trim())) {
      setError("Please fill in your name and city.");
      return;
    }

    setError("");
    setLoading(true);
    setResult("");

    const url = `${SUPABASE_URL}/functions/v1/plan-tour`;
    const description =
      mode === "traveler" ? buildTravelerPrompt() : buildGuidePrompt();

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ description, mode }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResult(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // After generation, show email gate if not already captured
      if (!emailCaptured && accumulated.length > 200) {
        setShowEmailGate(true);
      }

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setEmailCaptured(true);
    setShowEmailGate(false);

    // Store lead in inquiries table
    try {
      await supabase.from("inquiries").insert({
        name: "AI Planner Lead",
        email: email.trim(),
        destination: destination || guideCity || "AI Tour Planner",
        message: `Generated via AI Tour Planner (${mode} mode)`,
      });
    } catch { /* silent */ }
  };

  const handleBookGuide = () => {
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
              {/* Mode Toggle */}
              <div className="bg-accent/50 p-4 border-b border-border/50">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "traveler" | "guide")}>
                  <TabsList className="w-full max-w-sm mx-auto grid grid-cols-2">
                    <TabsTrigger value="traveler" className="gap-2 text-sm">
                      <User className="w-4 h-4" />
                      I'm a Traveler
                    </TabsTrigger>
                    <TabsTrigger value="guide" className="gap-2 text-sm">
                      <Briefcase className="w-4 h-4" />
                      I'm a Tour Guide
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

                {error && (
                  <p className="text-destructive text-sm font-medium">{error}</p>
                )}

                {/* CTA Button */}
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

          {/* Results Section */}
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Email Gate Overlay */}
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
                          Unlock Your Full Itinerary
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your email to save your personalized tour plan and get matched with local expert guides.
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
                            Unlock Itinerary
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setShowEmailGate(false)}
                            className="text-muted-foreground"
                          >
                            Skip
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No spam. We respect your privacy.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Itinerary Card */}
              <Card className="shadow-lg border-border/50">
                <CardContent className="p-5 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                      {mode === "traveler" ? "Your Personalized Itinerary" : "Itinerary Template"}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={loading}
                      className="gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none text-foreground [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_a]:text-primary">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Section — Book a Guide */}
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
                        Get a private, expert-led experience tailored just for you.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Button
                          variant="hero"
                          size="lg"
                          onClick={handleBookGuide}
                          className="gap-2"
                        >
                          <Users className="w-5 h-5" />
                          Find Available Guides
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/chat", {
                            state: { initialPrompt: `I just generated this tour plan and want to customize it further:\n\n${result.slice(0, 500)}` }
                          })}
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
                          onClick={handleBookGuide}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Guide mode CTA */}
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

/* ─── Traveler Form ─── */
function TravelerForm({
  destination, setDestination, tripDays, setTripDays,
  adults, setAdults, children_, setChildren,
  selectedInterests, toggleInterest,
  travelStyle, setTravelStyle, budget, setBudget,
  languages, setLanguages,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-5"
    >
      {/* Row 1: Destination + Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField icon={<MapPin className="w-4 h-4" />} label="Destination">
          <Input
            placeholder="e.g. Washington DC, Paris, Tokyo"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </FormField>
        <FormField icon={<Calendar className="w-4 h-4" />} label="Trip Length (days)">
          <Input
            type="number"
            min="1"
            max="30"
            value={tripDays}
            onChange={(e) => setTripDays(e.target.value)}
          />
        </FormField>
      </div>

      {/* Row 2: Group + Budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField icon={<Users className="w-4 h-4" />} label="Adults">
          <Input
            type="number"
            min="1"
            max="20"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
          />
        </FormField>
        <FormField icon={<Users className="w-4 h-4" />} label="Children">
          <Input
            type="number"
            min="0"
            max="10"
            value={children_}
            onChange={(e) => setChildren(e.target.value)}
          />
        </FormField>
        <FormField icon={<Globe className="w-4 h-4" />} label="Language">
          <Input
            placeholder="English"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />
        </FormField>
      </div>

      {/* Travel Style */}
      <FormField icon={<Compass className="w-4 h-4" />} label="Travel Style">
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setTravelStyle(s.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                travelStyle === s.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </FormField>

      {/* Budget */}
      <FormField icon={<DollarSign className="w-4 h-4" />} label="Budget">
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBudget(b.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                budget === b.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </FormField>

      {/* Interests */}
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

/* ─── Guide Form ─── */
function GuideForm({
  guideName, setGuideName, guideCity, setGuideCity,
  guideSpecialty, setGuideSpecialty, tourDuration, setTourDuration,
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
          <Input
            placeholder="e.g. John Smith"
            value={guideName}
            onChange={(e) => setGuideName(e.target.value)}
          />
        </FormField>
        <FormField icon={<MapPin className="w-4 h-4" />} label="Your City">
          <Input
            placeholder="e.g. Washington DC"
            value={guideCity}
            onChange={(e) => setGuideCity(e.target.value)}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField icon={<Compass className="w-4 h-4" />} label="Specialty (optional)">
          <Input
            placeholder="e.g. Historical Walking Tours"
            value={guideSpecialty}
            onChange={(e) => setGuideSpecialty(e.target.value)}
          />
        </FormField>
        <FormField icon={<Calendar className="w-4 h-4" />} label="Tour Duration (hours)">
          <Input
            type="number"
            min="1"
            max="12"
            value={tourDuration}
            onChange={(e) => setTourDuration(e.target.value)}
          />
        </FormField>
      </div>
      <p className="text-sm text-muted-foreground bg-accent/50 rounded-lg p-3">
        💡 Generate a professional itinerary template you can use as a starting point for your tours. Customize it to match your expertise and local knowledge.
      </p>
    </motion.div>
  );
}

/* ─── Shared Components ─── */
function FormField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
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

function UpsellCard({ icon, title, description, onClick }: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void;
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

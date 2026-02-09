import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, ArrowRight, ArrowLeft, RotateCcw, MapPin, Clock, DollarSign, Heart, User } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const PLAN_URL = `https://oegfwomloaihzwomwypx.supabase.co/functions/v1/plan-tour`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ2Z3b21sb2FpaHp3b213eXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM4NTAsImV4cCI6MjA4NjA3OTg1MH0.ZRn_9BDZZM5uTdqAxaeBcwckzjqXe7HQXUN8OZSbLNM";

const DESTINATIONS = [
  "Washington DC", "New York City", "Niagara Falls", "Toronto", "Boston", "Chicago", "Other"
];

const BUDGET_RANGES = [
  "Under $500", "$500 – $1,000", "$1,000 – $2,500", "$2,500 – $5,000", "$5,000+", "Flexible / No limit"
];

const EXPERIENCE_OPTIONS = [
  "Historical & Heritage", "Food & Culinary", "Art & Museums", "Architecture",
  "Nature & Adventure", "Night Life & Entertainment", "Shopping & Fashion",
  "Photography", "Family-Friendly", "Romantic / Couples", "VIP / Luxury", "Wine & Vineyard"
];

interface StepConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const STEPS: StepConfig[] = [
  { icon: <MapPin className="w-5 h-5" />, title: "Where do you want to go?", subtitle: "Select your dream destination" },
  { icon: <Clock className="w-5 h-5" />, title: "How long is your trip?", subtitle: "Tell us about your schedule" },
  { icon: <DollarSign className="w-5 h-5" />, title: "What's your budget range?", subtitle: "Help us tailor the perfect plan" },
  { icon: <Heart className="w-5 h-5" />, title: "What experiences are you looking for?", subtitle: "Select all that interest you" },
  { icon: <User className="w-5 h-5" />, title: "What makes your ideal tour guide?", subtitle: "Describe the perfect guide for you" },
];

const TourPlannerSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [destination, setDestination] = useState("");
  const [otherDestination, setOtherDestination] = useState("");
  const [days, setDays] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [budget, setBudget] = useState("");
  const [experiences, setExperiences] = useState<string[]>([]);
  const [guideDescription, setGuideDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const toggleExperience = (exp: string) => {
    setExperiences(prev =>
      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return destination !== "" && (destination !== "Other" || otherDestination.trim().length > 0);
      case 1: return days.trim().length > 0;
      case 2: return budget !== "";
      case 3: return experiences.length > 0;
      case 4: return guideDescription.trim().length > 5;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      setError("");
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError("");
    }
  };

  const buildDescription = () => {
    const dest = destination === "Other" ? otherDestination : destination;
    return `I want to visit ${dest} for ${days} days, spending about ${hoursPerDay || "flexible"} hours per day touring. My budget is ${budget}. I'm interested in: ${experiences.join(", ")}. For my ideal guide: ${guideDescription}`;
  };

  const handleGenerate = async () => {
    setError("");
    setPlan("");
    setIsGenerating(true);

    try {
      const resp = await fetch(PLAN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ description: buildDescription() }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${resp.status})`);
      }

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
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setPlan(accumulated);
              resultRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPlan("");
    setCurrentStep(0);
    setDestination("");
    setOtherDestination("");
    setDays("");
    setHoursPerDay("");
    setBudget("");
    setExperiences([]);
    setGuideDescription("");
    setError("");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DESTINATIONS.map(dest => (
              <button
                key={dest}
                type="button"
                onClick={() => setDestination(dest)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                  destination === dest
                    ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                    : "border-primary/10 bg-secondary/20 hover:border-primary/30"
                }`}
                style={{ color: destination === dest ? undefined : "hsl(40, 33%, 80%)" }}
              >
                <MapPin className={`w-4 h-4 mb-1 ${destination === dest ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold block">{dest}</span>
              </button>
            ))}
            {destination === "Other" && (
              <div className="col-span-2 sm:col-span-3 mt-2">
                <Input
                  placeholder="Where would you like to go?"
                  className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground"
                  value={otherDestination}
                  onChange={(e) => setOtherDestination(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>
                How many days?
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                placeholder="e.g. 3"
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground text-lg"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "hsl(40, 33%, 85%)" }}>
                Hours per day (optional)
              </label>
              <Input
                type="number"
                min="1"
                max="16"
                placeholder="e.g. 6"
                className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground text-lg"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "hsl(40, 33%, 60%)" }}>Leave blank for a flexible schedule</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-2 gap-3">
            {BUDGET_RANGES.map(range => (
              <button
                key={range}
                type="button"
                onClick={() => setBudget(range)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:scale-[1.02] ${
                  budget === range
                    ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                    : "border-primary/10 bg-secondary/20 hover:border-primary/30"
                }`}
                style={{ color: budget === range ? undefined : "hsl(40, 33%, 80%)" }}
              >
                <span className="text-sm font-semibold">{range}</span>
              </button>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EXPERIENCE_OPTIONS.map(exp => (
              <button
                key={exp}
                type="button"
                onClick={() => toggleExperience(exp)}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 hover:scale-[1.02] ${
                  experiences.includes(exp)
                    ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                    : "border-primary/10 bg-secondary/20 hover:border-primary/30"
                }`}
                style={{ color: experiences.includes(exp) ? undefined : "hsl(40, 33%, 80%)" }}
              >
                <span className="text-xs sm:text-sm font-semibold">{exp}</span>
              </button>
            ))}
            <p className="col-span-2 sm:col-span-3 text-xs text-center mt-1" style={{ color: "hsl(40, 33%, 60%)" }}>
              Select as many as you like
            </p>
          </div>
        );

      case 4:
        return (
          <div>
            <Textarea
              placeholder="e.g. Someone energetic and fun, great with kids, knows hidden gems, speaks Spanish..."
              rows={5}
              className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground/60 resize-none text-base leading-relaxed"
              value={guideDescription}
              onChange={(e) => setGuideDescription(e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="tour-planner" className="py-24 bg-gradient-navy relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-semibold">AI-Powered Planning</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "hsl(40, 33%, 97%)" }}>
            Plan Your{" "}
            <span className="text-gradient-gold">Dream Tour</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "hsl(40, 33%, 80%)" }}>
            Answer 5 quick questions and our AI will craft a personalized tour plan and match you with the perfect guide.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!plan && !isGenerating ? (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-8">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          i <= currentStep ? "bg-primary" : "bg-primary/15"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {currentStep + 1} of {STEPS.length}
                    </span>
                  </div>

                  {/* Step header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {STEPS[currentStep].icon}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold" style={{ color: "hsl(40, 33%, 97%)" }}>
                        {STEPS[currentStep].title}
                      </h3>
                      <p className="text-sm" style={{ color: "hsl(40, 33%, 65%)" }}>
                        {STEPS[currentStep].subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="mt-6 mb-8">
                    {renderStepContent()}
                  </div>

                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                  {/* Navigation */}
                  <div className="flex gap-3">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    )}
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1 text-base py-6"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      {currentStep < 4 ? (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate My Tour Plan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                ref={resultRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {isGenerating && !plan && (
                  <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-lg" style={{ color: "hsl(40, 33%, 80%)" }}>
                      Crafting your personalized tour plan...
                    </p>
                  </div>
                )}

                {plan && (
                  <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                    {isGenerating && (
                      <div className="flex items-center gap-2 mb-4 text-primary text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Still generating...</span>
                      </div>
                    )}
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-headings:font-display prose-strong:text-primary/90 prose-li:text-[hsl(40,33%,80%)]" style={{ color: "hsl(40, 33%, 80%)" }}>
                      <ReactMarkdown>{plan}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {!isGenerating && plan && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Link
                      to="/chat"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-secondary font-bold text-base hover:opacity-90 transition-opacity"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Refine This Plan in Chat
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </motion.div>
                )}

                {error && (
                  <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button variant="outline" onClick={handleReset} className="border-primary/30 text-primary">
                      Try Again
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TourPlannerSection;

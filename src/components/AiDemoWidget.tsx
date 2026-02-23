import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const AiDemoWidget = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState("");
  const [dates, setDates] = useState("");

  const handleGenerate = () => {
    // Navigate to chat with pre-filled context
    const prompt = [
      interests && `Interests: ${interests}`,
      budget && `Budget: ${budget}`,
      dates && `Dates: ${dates}`,
    ]
      .filter(Boolean)
      .join(". ");

    navigate("/chat", { state: { initialPrompt: prompt || undefined } });
  };

  return (
    <section className="py-20 bg-gradient-navy">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mx-auto mb-5">
            <Bot className="w-6 h-6 text-secondary" />
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-3" style={{ color: "hsl(40, 33%, 97%)" }}>
            Try Our AI Tour Planner
          </h2>
          <p className="text-base md:text-lg mb-8 max-w-xl mx-auto" style={{ color: "hsl(40, 33%, 80%)" }}>
            Enter your interests, budget, and travel dates — our AI instantly generates a complete, personalized tour itinerary. Preview, swap activities, and see how easy planning can be.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="text-left">
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(45, 80%, 65%)" }}>
                Interests
              </label>
              <Input
                placeholder="e.g. History, Food, Art"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="bg-background/10 border-border/30 text-foreground placeholder:text-muted-foreground/60"
                style={{ color: "hsl(40, 33%, 95%)", borderColor: "hsla(45, 80%, 65%, 0.3)" }}
              />
            </div>
            <div className="text-left">
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(45, 80%, 65%)" }}>
                Budget
              </label>
              <Input
                placeholder="e.g. $500, Moderate"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-background/10 border-border/30"
                style={{ color: "hsl(40, 33%, 95%)", borderColor: "hsla(45, 80%, 65%, 0.3)" }}
              />
            </div>
            <div className="text-left">
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(45, 80%, 65%)" }}>
                Travel Dates
              </label>
              <Input
                placeholder="e.g. June 15–20"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                className="bg-background/10 border-border/30"
                style={{ color: "hsl(40, 33%, 95%)", borderColor: "hsla(45, 80%, 65%, 0.3)" }}
              />
            </div>
          </div>

          <Button
            variant="hero"
            size="lg"
            onClick={handleGenerate}
            className="gap-2 text-base px-10 py-6"
            title="See a full AI-generated itinerary instantly — no account needed to try."
          >
            Generate My Tour
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-xs mt-4" style={{ color: "hsl(40, 33%, 60%)" }}>
            <Sparkles className="w-3 h-3 inline mr-1" />
            No account needed to try
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AiDemoWidget;

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const PLAN_URL = `https://oegfwomloaihzwomwypx.supabase.co/functions/v1/plan-tour`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ2Z3b21sb2FpaHp3b213eXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM4NTAsImV4cCI6MjA4NjA3OTg1MH0.ZRn_9BDZZM5uTdqAxaeBcwckzjqXe7HQXUN8OZSbLNM";

const EXAMPLE_PROMPTS = [
  "A 3-day family trip to Washington DC with kids aged 8 and 12. Budget around $2000. We love history and want a guide who's great with children.",
  "Romantic weekend in NYC for our anniversary. We want hidden gems, rooftop dining, and a fun, energetic guide. Budget is flexible.",
  "Group of 6 friends doing Niagara Falls + Toronto over 4 days. We're adventurous, love food tours, and prefer a young, fun guide.",
];

const TourPlannerSection = () => {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (description.trim().length < 10) {
      setError("Please describe your dream tour in more detail.");
      return;
    }
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
        body: JSON.stringify({ description: description.trim() }),
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
    setDescription("");
    setError("");
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
            Describe your ideal trip — the destination, vibe, budget, and what kind of guide you'd love.
            Our AI will craft a personalized tour plan and match you with the perfect guide.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!plan && !isGenerating ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Prompt area */}
                <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                  <label className="block text-sm font-medium mb-3" style={{ color: "hsl(40, 33%, 85%)" }}>
                    ✨ Describe your dream tour
                  </label>
                  <Textarea
                    placeholder="Tell us everything! Where do you want to go? How many days? What's your budget? What kind of experience are you looking for? What makes your ideal tour guide?"
                    rows={6}
                    className="bg-secondary/50 border-primary/20 text-primary-foreground placeholder:text-muted-foreground/60 resize-none text-base leading-relaxed"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setError("");
                    }}
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full text-base py-6 mt-4"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Tour Plan
                  </Button>
                </div>

                {/* Example prompts */}
                <div>
                  <p className="text-sm mb-3 text-center" style={{ color: "hsl(40, 33%, 60%)" }}>
                    Need inspiration? Try one of these:
                  </p>
                  <div className="grid gap-3">
                    {EXAMPLE_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setDescription(prompt)}
                        className="text-left text-sm p-4 rounded-xl border border-primary/10 bg-card/5 hover:bg-card/15 transition-colors"
                        style={{ color: "hsl(40, 33%, 75%)" }}
                      >
                        "{prompt}"
                      </button>
                    ))}
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
                {/* Generating indicator */}
                {isGenerating && !plan && (
                  <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-lg" style={{ color: "hsl(40, 33%, 80%)" }}>
                      Crafting your personalized tour plan...
                    </p>
                  </div>
                )}

                {/* Tour plan output */}
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

                {/* Actions after generation */}
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

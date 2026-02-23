import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TravelerAiCta = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-card p-8 md:p-10 text-center relative overflow-hidden"
        >
          {/* Decorative sparkle */}
          <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/20" />

          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
            <Bot className="w-7 h-7 text-primary" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Plan Your Perfect Tour Instantly!
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8">
            Tell our AI your interests, budget, and dates — it will create a personalized tour itinerary just for you. Swap activities, adjust pacing, and explore your dream trip with ease.
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/chat")}
            className="gap-2 text-base px-8 py-6"
            title="Start planning now — no account needed to try the AI demo."
          >
            Build My Tour
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default TravelerAiCta;

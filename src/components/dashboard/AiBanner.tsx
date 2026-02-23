import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DISMISSED_KEY = "guide-ai-banner-dismissed";

const AiBanner = () => {
  const [visible, setVisible] = useState(() => !localStorage.getItem(DISMISSED_KEY));
  const navigate = useNavigate();

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, height: 0 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8 overflow-hidden"
        >
          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Icon */}
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary" />
            </div>

            {/* Copy */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl font-bold text-foreground mb-1">
                Boost Your Tours with AI!
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Our AI Assistant helps you create personalized itineraries, suggest competitive pricing, and match travelers with the tours they'll love. Take your tours to the next level — smarter, faster, easier.
              </p>
            </div>

            {/* CTA */}
            <Button
              onClick={() => navigate("/chat")}
              className="shrink-0 gap-2"
              title="Click to see personalized itinerary and pricing suggestions for your tours."
            >
              Explore AI Tour Assistant
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiBanner;

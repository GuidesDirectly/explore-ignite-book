import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Loader2, X, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SWAP_URL = `${SUPABASE_URL}/functions/v1/swap-itinerary`;

interface ItinerarySwapProps {
  currentPlan: string;
  tourPlanId?: string | null;
  userEmail?: string;
}

const ItinerarySwap = ({ currentPlan, tourPlanId, userEmail }: ItinerarySwapProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [originalActivity, setOriginalActivity] = useState("");
  const [swapRequest, setSwapRequest] = useState("");
  const [dayNumber, setDayNumber] = useState("");
  const [swapResult, setSwapResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSwap = async () => {
    if (!originalActivity.trim() || !swapRequest.trim()) {
      toast.error("Please fill in both fields.");
      return;
    }

    setSwapResult("");
    setIsLoading(true);

    try {
      const resp = await fetch(SWAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          currentPlan,
          originalActivity: originalActivity.trim(),
          swapRequest: swapRequest.trim(),
          dayNumber: dayNumber ? parseInt(dayNumber) : undefined,
          tourPlanId,
          userEmail,
        }),
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
              setSwapResult(accumulated);
              resultRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Swap failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalActivity("");
    setSwapRequest("");
    setDayNumber("");
    setSwapResult("");
  };

  return (
    <div className="mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
      >
        <ArrowRightLeft className="w-4 h-4" />
        Swap an Activity
        <Sparkles className="w-3 h-3" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl border border-primary/20 bg-card/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-primary" />
                  Dynamic Activity Swap
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Tell us which activity you'd like to replace and what you'd prefer instead. Our AI will suggest alternatives that fit your itinerary.
              </p>

              <div className="grid gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    Activity to Replace
                  </label>
                  <Input
                    placeholder="e.g. Visit the Smithsonian Museum"
                    value={originalActivity}
                    onChange={(e) => setOriginalActivity(e.target.value)}
                    className="text-sm"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                      Replace With
                    </label>
                    <Input
                      placeholder="e.g. A cooking class or food tour"
                      value={swapRequest}
                      onChange={(e) => setSwapRequest(e.target.value)}
                      className="text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                      Day #
                    </label>
                    <Input
                      placeholder="e.g. 2"
                      value={dayNumber}
                      onChange={(e) => setDayNumber(e.target.value)}
                      type="number"
                      min="1"
                      className="text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSwap}
                    disabled={isLoading || !originalActivity.trim() || !swapRequest.trim()}
                    size="sm"
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isLoading ? "Generating..." : "Generate Swap"}
                  </Button>
                  {swapResult && (
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Swap Result */}
              {swapResult && (
                <motion.div
                  ref={resultRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-primary/10 bg-background p-4 mt-4"
                >
                  <h5 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Swap Suggestion
                  </h5>
                  <div className="prose prose-sm max-w-none text-foreground [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
                    <ReactMarkdown>{swapResult}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItinerarySwap;

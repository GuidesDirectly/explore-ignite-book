import { motion } from "framer-motion";
import { Sparkles, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  { icon: Sparkles, text: "Personalized to your travel style" },
  { icon: MapPin, text: "Built around real local knowledge" },
  { icon: Clock, text: "Ready in under 60 seconds" },
];

const TravelerAiCta = () => {
  const navigate = useNavigate();

  return (
    <section
      className="py-20"
      style={{
        background: "linear-gradient(135deg, #0A1628 0%, #122040 50%, #0A1628 100%)",
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Eyebrow + Pill */}
          <div className="mb-5 flex items-center justify-center flex-wrap gap-2.5">
            <span
              className="text-[11px] font-bold uppercase"
              style={{ color: "#C9A84C", letterSpacing: "0.15em" }}
            >
              AI TRIP ARCHITECT
            </span>
            <span
              className="inline-block rounded-[20px] px-3 py-[3px] text-[11px]"
              style={{
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#C9A84C",
              }}
            >
              Powered by Claude AI
            </span>
          </div>

          {/* Heading */}
          <h2
            className="font-serif text-[30px] md:text-[44px] font-bold leading-[1.2] mb-5"
            style={{ color: "#F5F0E8" }}
          >
            Plan with AI. Travel with humans.
          </h2>

          {/* Subheading */}
          <p
            className="text-lg leading-[1.8] mx-auto mb-10 max-w-[600px]"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Tell our AI Trip Architect your dates, interests, and budget. It builds a realistic
            itinerary around your chosen guide — including opening hours, transit, meals, and hidden
            gems no guidebook contains.
          </p>

          {/* Benefit Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {benefits.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 rounded-[20px] px-4 py-2 text-[13px]"
                style={{
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                <Icon size={16} style={{ color: "#C9A84C" }} />
                {text}
              </span>
            ))}
          </div>

          {/* Mock Conversation */}
          <div
            className="mx-auto mb-10 max-w-[560px] rounded-2xl p-6 md:px-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            {/* User bubble */}
            <div className="flex justify-end mb-4">
              <div
                className="text-sm text-left max-w-[80%] px-4 py-2.5"
                style={{
                  background: "#C9A84C",
                  color: "#0A1628",
                  borderRadius: "12px 12px 0 12px",
                }}
              >
                Plan a half-day history tour in Washington DC for two adults who love architecture
              </div>
            </div>

            {/* AI bubble */}
            <div className="flex justify-start mb-2">
              <div
                className="text-sm text-left max-w-[90%] px-4 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.85)",
                  borderRadius: "12px 12px 12px 0",
                }}
              >
                Here is your personalized DC morning: 8:30AM Capitol Building (architectural
                briefing with your guide), 10AM Library of Congress (hidden reading rooms), 11:30AM
                Supreme Court exterior and constitutional history, 12:30PM lunch at Bistro Cacao —
                your guide's local recommendation. Total: 4 hours, 2.1 miles walking. Shall I adjust
                the pace or add the National Building Museum?
              </div>
            </div>

            {/* Confirmation */}
            <div className="text-left mt-2">
              <span className="text-xs" style={{ color: "#2D6A4F" }}>
                ✓ Itinerary built in 8 seconds
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 rounded-lg px-10 py-4 text-base font-bold transition-colors"
            style={{ background: "#C9A84C", color: "#0A1628" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#B8924A")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A84C")}
          >
            <Sparkles size={18} />
            Start Planning Your Trip →
          </button>

          {/* Reassurance */}
          <p
            className="text-xs mt-4"
            style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}
          >
            Free for all travelers · No account required · Powered by Claude AI
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TravelerAiCta;

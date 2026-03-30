import { Check, X } from "lucide-react";

const otherPlatformItems = [
  "Guide keeps only 70% of what you pay",
  "Platform fee added at checkout",
  "Guide treats you as a booking, not a guest",
  "Your money funds the middleman",
  "Guide has no incentive to go above and beyond",
  "Your relationship ends when the tour ends",
];

const guidesDirectlyItems = [
  "Guide keeps 100% of every dollar you pay",
  "Zero platform fees, always",
  "Guide is personally invested in your day",
  "Every dollar goes to the local economy",
  "Guide has every reason to exceed expectations",
  "Build a real relationship — book them again",
];

const WhyDirectSection = () => {
  return (
    <section id="why-book-direct" style={{ background: "#0A1628" }} className="py-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center max-w-[600px] mx-auto">
          <p style={{ color: "#C9A84C", fontSize: 11, letterSpacing: "0.12em" }} className="uppercase font-semibold mb-3">
            WHY BOOK DIRECT
          </p>
          <h2 style={{ color: "#F5F0E8" }} className="font-display text-[26px] md:text-[36px] font-semibold leading-tight">
            The difference is more than the price.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, maxWidth: 480, marginTop: 12 }} className="mx-auto">
            When your guide keeps everything they earn, everything about the experience changes.
          </p>
        </div>

        {/* Two-column comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[860px] mx-auto mt-12">
          {/* Other Platforms */}
          <div>
            <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "12px 12px 0 0", padding: "16px 24px" }}>
              <span style={{ color: "#C0392B", fontSize: 15, fontWeight: 600 }}>Other Platforms</span>
            </div>
            <div style={{ background: "rgba(192,57,43,0.04)", borderLeft: "1px solid rgba(192,57,43,0.2)", borderRight: "1px solid rgba(192,57,43,0.2)", borderBottom: "1px solid rgba(192,57,43,0.2)", borderRadius: "0 0 12px 12px" }} className="p-6 space-y-4">
              {otherPlatformItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X style={{ color: "#C0392B" }} className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guides Directly */}
          <div>
            <div style={{ background: "rgba(45,106,79,0.12)", border: "1px solid rgba(45,106,79,0.4)", borderRadius: "12px 12px 0 0", padding: "16px 24px" }}>
              <span style={{ color: "#2D6A4F", fontSize: 15, fontWeight: 600 }}>Guides Directly</span>
            </div>
            <div style={{ background: "rgba(45,106,79,0.04)", borderLeft: "1px solid rgba(45,106,79,0.2)", borderRight: "1px solid rgba(45,106,79,0.2)", borderBottom: "1px solid rgba(45,106,79,0.2)", borderRadius: "0 0 12px 12px" }} className="p-6 space-y-4">
              {guidesDirectlyItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check style={{ color: "#2D6A4F" }} className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing statement */}
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, fontStyle: "italic", maxWidth: 500, marginTop: 32 }} className="text-center mx-auto">
          Guides Directly is the only platform where the guide you meet is the guide who keeps everything you paid.
        </p>
      </div>
    </section>
  );
};

export default WhyDirectSection;

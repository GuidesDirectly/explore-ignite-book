import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe, MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const expansionCities = [
  { name: "New York City", abbr: "NYC", silhouette: "M10,60 L10,30 L15,30 L15,20 L20,20 L20,15 L25,15 L25,20 L30,20 L30,10 L35,10 L35,20 L40,20 L40,25 L45,25 L45,30 L50,30 L50,60 Z", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", accent: "#e94560" },
  { name: "Philadelphia", abbr: "PHL", silhouette: "M10,60 L10,35 L18,35 L18,28 L22,28 L22,22 L26,22 L26,18 L30,18 L30,22 L34,22 L34,28 L38,28 L38,35 L46,35 L46,60 Z", gradient: "linear-gradient(135deg, #1b2838 0%, #2d4a22 50%, #1b4332 100%)", accent: "#52b788" },
  { name: "Chicago", abbr: "CHI", silhouette: "M8,60 L8,32 L14,32 L14,22 L19,22 L19,16 L24,16 L24,12 L29,12 L29,16 L34,16 L34,22 L39,22 L39,32 L45,32 L45,60 Z", gradient: "linear-gradient(135deg, #0d1b2a 0%, #1b4f72 50%, #154360 100%)", accent: "#5dade2" },
  { name: "Boston", abbr: "BOS", silhouette: "M10,60 L10,38 L16,38 L16,30 L20,30 L20,24 L25,24 L25,28 L30,28 L30,22 L35,22 L35,28 L40,28 L40,38 L45,38 L45,60 Z", gradient: "linear-gradient(135deg, #2c0e0e 0%, #7b1d1d 50%, #922b21 100%)", accent: "#f1948a" },
  { name: "Phoenix", abbr: "PHX", silhouette: "M8,60 L8,42 L16,42 L16,36 L22,36 L22,30 L28,30 L28,36 L34,36 L34,30 L40,30 L40,36 L46,36 L46,42 L52,42 L52,60 Z", gradient: "linear-gradient(135deg, #3d1a00 0%, #a04000 50%, #c0392b 100%)", accent: "#f39c12" },
  { name: "Los Angeles", abbr: "LAX", silhouette: "M6,60 L6,40 L12,40 L12,34 L18,34 L18,28 L24,28 L24,22 L30,22 L30,28 L36,28 L36,22 L42,22 L42,28 L48,28 L48,34 L54,34 L54,60 Z", gradient: "linear-gradient(135deg, #1a0a2e 0%, #6a0572 50%, #c0392b 100%)", accent: "#ff6b9d" },
  { name: "San Francisco", abbr: "SFO", silhouette: "M10,60 L10,44 L15,44 L15,36 L20,36 L20,28 L25,28 L25,20 L30,20 L30,14 L35,14 L35,20 L40,20 L40,28 L45,28 L45,36 L50,36 L50,44 L55,44 L55,60 Z", gradient: "linear-gradient(135deg, #0a1628 0%, #c0392b 50%, #e67e22 100%)", accent: "#f39c12" },
  { name: "San Diego", abbr: "SAN", silhouette: "M10,60 L10,40 L16,40 L16,34 L22,34 L22,26 L28,26 L28,34 L34,34 L34,26 L40,26 L40,34 L46,34 L46,40 L52,40 L52,60 Z", gradient: "linear-gradient(135deg, #003366 0%, #0077b6 50%, #00b4d8 100%)", accent: "#90e0ef" },
  { name: "Denver", abbr: "DEN", silhouette: "M8,60 L8,38 L14,38 L14,30 L20,30 L20,22 L26,22 L26,18 L30,18 L30,22 L36,22 L36,30 L42,30 L42,38 L48,38 L48,60 Z", gradient: "linear-gradient(135deg, #1a2f1a 0%, #2e7d32 50%, #558b2f 100%)", accent: "#a5d6a7" },
  { name: "Las Vegas", abbr: "LAS", silhouette: "M10,60 L10,36 L16,36 L16,26 L20,26 L20,20 L24,20 L24,14 L28,14 L28,10 L32,10 L32,14 L36,14 L36,20 L40,20 L40,26 L44,26 L44,36 L50,36 L50,60 Z", gradient: "linear-gradient(135deg, #1a0033 0%, #4a0080 50%, #7b00d4 100%)", accent: "#ffd700" },
  { name: "Houston", abbr: "HOU", silhouette: "M8,60 L8,44 L16,44 L16,36 L22,36 L22,30 L30,30 L30,36 L38,36 L38,30 L46,30 L46,36 L52,36 L52,44 L60,44 L60,60 Z", gradient: "linear-gradient(135deg, #1c1000 0%, #6d4c00 50%, #b8860b 100%)", accent: "#ffd966" },
  { name: "San Antonio", abbr: "SAT", silhouette: "M10,60 L10,42 L16,42 L16,34 L22,34 L22,28 L28,28 L28,22 L34,22 L34,28 L40,28 L40,34 L46,34 L46,42 L52,42 L52,60 Z", gradient: "linear-gradient(135deg, #1a0a00 0%, #7b3f00 50%, #a04000 100%)", accent: "#e8a87c" },
  { name: "Miami", abbr: "MIA", silhouette: "M12,60 L12,42 L18,42 L18,34 L22,34 L22,26 L28,26 L28,20 L34,20 L34,26 L40,26 L40,34 L44,34 L44,42 L50,42 L50,60 Z", gradient: "linear-gradient(135deg, #003333 0%, #00796b 50%, #00bcd4 100%)", accent: "#80deea" },
  { name: "Toronto", abbr: "YYZ", silhouette: "M8,60 L8,36 L14,36 L14,28 L20,28 L20,20 L26,20 L26,14 L30,14 L30,10 L34,10 L34,14 L38,14 L38,20 L44,20 L44,28 L50,28 L50,36 L56,36 L56,60 Z", gradient: "linear-gradient(135deg, #1a0000 0%, #8b0000 50%, #c0392b 100%)", accent: "#ff8a80" },
  { name: "Montreal", abbr: "YUL", silhouette: "M10,60 L10,38 L16,38 L16,30 L22,30 L22,22 L28,22 L28,16 L34,16 L34,22 L40,22 L40,30 L46,30 L46,38 L52,38 L52,60 Z", gradient: "linear-gradient(135deg, #0d0d2b 0%, #1a237e 50%, #283593 100%)", accent: "#7986cb" },
];

const pulsePoints = [
  { top: "28%", left: "48%", label: "London" },
  { top: "32%", left: "52%", label: "Paris" },
  { top: "35%", left: "56%", label: "Rome" },
  { top: "22%", left: "58%", label: "Berlin" },
  { top: "45%", left: "72%", label: "Dubai" },
  { top: "55%", left: "78%", label: "Bangkok" },
  { top: "52%", left: "82%", label: "Tokyo" },
  { top: "62%", left: "50%", label: "Cape Town" },
  { top: "60%", left: "30%", label: "São Paulo" },
  { top: "52%", left: "28%", label: "Bogotá" },
];

const DestinationsSection = () => {
  return (
    <section id="destinations" className="bg-background overflow-hidden">

      {/* ── Section 1: Origin Story ── */}
      <div className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-8">
              <MapPin className="w-3.5 h-3.5" />
              Where We Started
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground mb-6 leading-tight">
              From the USA Capital<br />
              <span className="text-primary italic">to the Continent.</span>
            </h2>

            <p className="text-secondary-foreground/70 text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
              We are working hard to perfect our <span className="text-primary font-semibold">"Direct Connection"</span> model through our rigorous pilot launch in Washington D.C. Through testing every variable in the U.S. capital, we are developing the{" "}
              <span className="text-primary font-semibold">Launch-City Playbook</span>—a blueprint for transparent, commission-free travel.
            </p>

            {/* Blockquote */}
            <motion.blockquote
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative border-l-4 border-primary pl-6 py-4 text-left max-w-2xl mx-auto mt-10"
            >
              <div className="font-display text-3xl text-primary/30 absolute -top-2 -left-1">"</div>
              <p className="font-display text-lg md:text-xl italic text-secondary-foreground/80 leading-relaxed">
                D.C. isn't just our first city; it is our laboratory in which we'll prove that travelers prefer direct access — and guides deserve 100% of their earnings.
              </p>
            </motion.blockquote>

            {/* DC Stats */}
            <div className="grid grid-cols-3 gap-6 mt-14 max-w-xl mx-auto">
              {[
                { value: "25+", label: "Verified Guides" },
                { value: "100%", label: "Direct Earnings" },
                { value: "$0", label: "Commission Taken" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-secondary-foreground/60 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Section 2: Expansion Grid ── */}
      <div className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-6">
              <Zap className="w-3.5 h-3.5" />
              Scaling Excellence
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              City After City.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              After achieving a full success of our D.C. pilot, we'll begin systematically deploying our playbook across North America's most iconic destinations.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {expansionCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group relative rounded-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                style={{ background: city.gradient }}
              >
                {/* Glow blob */}
                <div
                  className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-30 blur-xl group-hover:opacity-60 transition-opacity duration-300"
                  style={{ background: city.accent }}
                />

                <div className="relative z-10 p-4">
                  {/* Silhouette SVG */}
                  <div className="flex justify-center mb-3">
                    <svg viewBox="0 0 70 65" className="w-12 h-10 transition-transform duration-300 group-hover:scale-110" style={{ fill: city.accent, opacity: 0.7 }}>
                      <path d={city.silhouette} />
                    </svg>
                  </div>

                  <p className="font-display font-bold text-white text-sm text-center leading-tight">
                    {city.name}
                  </p>
                  <p className="text-xs text-center mt-0.5 font-mono opacity-60" style={{ color: city.accent }}>{city.abbr}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" style={{ background: `${city.gradient}ee` }}>
                  <p className="font-display text-white font-bold text-xs text-center mb-2 leading-tight">
                    Guides Directly<br />Playbook
                  </p>
                  <div className="space-y-1">
                    {["Verified Guides", "Zero Commissions"].map((item) => (
                      <div key={item} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: city.accent }} />
                        <span className="text-[10px] font-semibold" style={{ color: city.accent }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Global Horizon ── */}
      <div className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-6">
              <Globe className="w-3.5 h-3.5" />
              The Global Horizon
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
              The World is Next.
            </h2>
            <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
              Our infrastructure is built for every border. We are currently identifying local leaders to adapt our Launch-City Playbook for international markets.
            </p>
          </motion.div>

          {/* Stylized World Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Map background */}
            <div className="relative rounded-2xl border border-primary/20 overflow-hidden bg-secondary/60" style={{ paddingTop: "50%" }}>
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(8)].map((_, i) => (
                  <div key={`h${i}`} className="absolute w-full border-t border-primary/50" style={{ top: `${(i + 1) * 11}%` }} />
                ))}
                {[...Array(12)].map((_, i) => (
                  <div key={`v${i}`} className="absolute h-full border-l border-primary/50" style={{ left: `${(i + 1) * 7.7}%` }} />
                ))}
              </div>

              {/* Continents simplified shapes */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
                {/* North America */}
                <ellipse cx="160" cy="160" rx="100" ry="80" fill="hsl(var(--primary))" opacity="0.6" />
                {/* South America */}
                <ellipse cx="220" cy="280" rx="55" ry="80" fill="hsl(var(--primary))" opacity="0.5" />
                {/* Europe */}
                <ellipse cx="415" cy="130" rx="55" ry="45" fill="hsl(var(--primary))" opacity="0.6" />
                {/* Africa */}
                <ellipse cx="430" cy="250" rx="65" ry="90" fill="hsl(var(--primary))" opacity="0.5" />
                {/* Asia */}
                <ellipse cx="590" cy="155" rx="130" ry="85" fill="hsl(var(--primary))" opacity="0.55" />
                {/* Australia */}
                <ellipse cx="660" cy="290" rx="55" ry="40" fill="hsl(var(--primary))" opacity="0.5" />
              </svg>

              {/* "Proven" marker — North America */}
              <div className="absolute" style={{ top: "38%", left: "18%" }}>
                <div className="relative flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40 border-2 border-secondary-foreground" />
                  <div className="bg-primary text-secondary font-display font-bold text-[10px] px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                    ✓ Proven
                  </div>
                </div>
              </div>

              {/* Pulsing expansion points */}
              {pulsePoints.map((point, i) => (
                <motion.div
                  key={point.label}
                  className="absolute"
                  style={{ top: point.top, left: point.left }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      className="absolute w-6 h-6 rounded-full bg-primary/30"
                      animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25 }}
                    />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary border border-primary/60" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-secondary-foreground/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-secondary-foreground" />
                <span>Active Market</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/70" />
                <span>Expansion Underway</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <a
              href="#inquiry"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity duration-200 text-base"
            >
              View Our Global Expansion Roadmap
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* ── Section 4: Dual CTA ── */}
      <div className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Column A — For Guides */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-secondary text-secondary-foreground rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div>
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">For Professionals</div>
                <h3 className="font-display text-3xl font-bold text-secondary-foreground mb-4">
                  Own Your Business.
                </h3>
                <p className="text-secondary-foreground/70 leading-relaxed mb-8">
                  Are you a local expert in a city we haven't reached yet? We provide the platform and the playbook; you provide the expertise. Join the world's only commission-free professional network.
                </p>
                <div className="space-y-2 mb-8">
                  {["Zero commissions — ever", "Your price, your rules", "Direct traveler relationships"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-secondary-foreground/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/guide-register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-200 w-full text-center"
              >
                Apply to Pilot Your City
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Column B — For Travelers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-border rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div>
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">For Explorers</div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-4">
                  Travel Without<br />the Middleman.
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Stop paying 20–30% markups to booking platforms. Connect directly with the people who know the city best. Worldwide expansion is underway — see where we're landing next.
                </p>
                <div className="space-y-2 mb-8">
                  {["No booking fees", "Real local experts", "Custom flexible tours"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="#inquiry"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-200 w-full text-center"
              >
                Explore Commission-Free Tours
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Value Ribbon ── */}
      <div className="bg-primary py-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-primary-foreground text-center">
            <div>
              <span className="font-display text-xs uppercase tracking-[0.25em] opacity-70 block">The Guides Directly Promise</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-primary-foreground/30" />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 items-center font-semibold text-sm">
              <span>$0 Booking Fees</span>
              <span className="hidden sm:inline opacity-40">·</span>
              <span>100% Direct to Guides</span>
              <span className="hidden sm:inline opacity-40">·</span>
              <span>100% Authentic for Travelers</span>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default DestinationsSection;

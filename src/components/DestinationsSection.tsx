import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe, MapPin, Zap } from "lucide-react";
import WorldMap from "@/components/WorldMap";

import nycImg from "@/assets/city-cards/nyc.jpg";
import phillyImg from "@/assets/city-cards/philadelphia.jpg";
import chicagoImg from "@/assets/city-cards/chicago.jpg";
import bostonImg from "@/assets/city-cards/boston.jpg";
import phoenixImg from "@/assets/city-cards/phoenix.jpg";
import laImg from "@/assets/city-cards/los-angeles.jpg";
import sfImg from "@/assets/city-cards/san-francisco.jpg";
import sanDiegoImg from "@/assets/city-cards/san-diego.jpg";
import denverImg from "@/assets/city-cards/denver.jpg";
import vegasImg from "@/assets/city-cards/las-vegas.jpg";
import houstonImg from "@/assets/city-cards/houston.jpg";
import sanAntonioImg from "@/assets/city-cards/san-antonio.jpg";
import miamiImg from "@/assets/city-cards/miami.jpg";
import torontoImg from "@/assets/city-cards/toronto.jpg";
import montrealImg from "@/assets/city-cards/montreal.jpg";

const expansionCities = [
  { name: "New York City",  abbr: "NYC", photo: nycImg,        accent: "#e94560" },
  { name: "Philadelphia",   abbr: "PHL", photo: phillyImg,     accent: "#52b788" },
  { name: "Chicago",        abbr: "CHI", photo: chicagoImg,    accent: "#5dade2" },
  { name: "Boston",         abbr: "BOS", photo: bostonImg,     accent: "#f1948a" },
  { name: "Phoenix",        abbr: "PHX", photo: phoenixImg,    accent: "#f39c12" },
  { name: "Los Angeles",    abbr: "LAX", photo: laImg,         accent: "#ff6b9d" },
  { name: "San Francisco",  abbr: "SFO", photo: sfImg,         accent: "#f39c12" },
  { name: "San Diego",      abbr: "SAN", photo: sanDiegoImg,   accent: "#90e0ef" },
  { name: "Denver",         abbr: "DEN", photo: denverImg,     accent: "#a5d6a7" },
  { name: "Las Vegas",      abbr: "LAS", photo: vegasImg,      accent: "#ffd700" },
  { name: "Houston",        abbr: "HOU", photo: houstonImg,    accent: "#ffd966" },
  { name: "San Antonio",    abbr: "SAT", photo: sanAntonioImg, accent: "#e8a87c" },
  { name: "Miami",          abbr: "MIA", photo: miamiImg,      accent: "#80deea" },
  { name: "Toronto",        abbr: "YYZ", photo: torontoImg,    accent: "#ff8a80" },
  { name: "Montreal",       abbr: "YUL", photo: montrealImg,   accent: "#7986cb" },
];

const DestinationsSection = () => {
  return (
    <section id="destinations" className="bg-background overflow-hidden">

      {/* ── Section 1: Origin Story ── */}
      <div className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
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

            <div className="grid grid-cols-3 gap-6 mt-14 max-w-xl mx-auto">
              {[
                { value: "25+",  label: "Verified Guides" },
                { value: "100%", label: "Direct Earnings" },
                { value: "$0",   label: "Commission Taken" },
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
                className="group relative rounded-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden aspect-square"
              >
                <img
                  src={city.photo}
                  alt={city.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <p className="font-display font-bold text-white text-xs leading-tight text-center drop-shadow-lg">
                    {city.name}
                  </p>
                  <p className="text-[10px] text-center mt-0.5 font-mono opacity-70" style={{ color: city.accent }}>{city.abbr}</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl bg-black/75 backdrop-blur-sm z-20">
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

      {/* ── Section 3: Global Horizon with Real Map ── */}
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

          {/* Real World Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            <WorldMap />

            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-secondary-foreground/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-primary" />
                <span>Washington D.C. — Launch City</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/80" />
                <span>Expansion Horizon</span>
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
            <p className="text-secondary-foreground/60 text-sm max-w-xl mx-auto mb-6">
              Our infrastructure is built for every border. We are currently identifying local leaders to adapt our Launch-City Playbook for international markets.
            </p>
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
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* Guide CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-secondary border border-border rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div>
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">For Professionals</div>
                <h3 className="font-display text-3xl font-bold text-secondary-foreground mb-4">
                  Own Your<br />Business.
                </h3>
                <p className="text-secondary-foreground/70 leading-relaxed mb-8">
                  Are you a local expert in a city we haven't reached yet? We provide the platform and the playbook; you provide the expertise. Join the world's only commission-free professional network.
                </p>
                <div className="space-y-2 mb-8">
                  {["Zero commissions — ever", "Global traveler audience", "Direct traveler relationships"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-secondary-foreground/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="#guide-register"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold px-6 py-3.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 w-full text-center"
              >
                Apply to Pilot Your City
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Traveler CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
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

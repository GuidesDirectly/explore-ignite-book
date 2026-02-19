import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe, MapPin, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
  const { t } = useTranslation();
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
              {t("dest.whereWeStarted")}
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground mb-6 leading-tight">
              {t("dest.originTitle")}<br />
              <span className="text-primary italic">{t("dest.originTitleGold")}</span>
            </h2>

            <p className="text-secondary-foreground/70 text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
              {t("dest.originDesc1")} <span className="text-primary font-semibold">"{t("dest.directConnection")}"</span> {t("dest.originDesc2")}{" "}
              <span className="text-primary font-semibold">{t("dest.launchCityPlaybook")}</span>{t("dest.originDesc3")}
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
                {t("dest.quote")}
              </p>
            </motion.blockquote>

            <div className="grid grid-cols-3 gap-6 mt-14 max-w-xl mx-auto">
              {[
                { value: "25+",  label: t("dest.stat1") },
                { value: "100%", label: t("dest.stat2") },
                { value: "$0",   label: t("dest.stat3") },
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
              {t("dest.scalingLabel")}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("dest.scalingTitle")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("dest.scalingDesc")}
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
                    Guides Directly<br />{t("dest.playbook")}
                  </p>
                  <div className="space-y-1">
                    {[t("dest.verifiedGuides"), t("dest.zeroCommissions")].map((item) => (
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
              {t("dest.globalLabel")}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
              {t("dest.globalTitle")}
            </h2>
            <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
              {t("dest.globalDesc")}
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
                <span>{t("dest.launchCity")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/80" />
                <span>{t("dest.expansionHorizon")}</span>
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
              {t("dest.globalDesc")}
            </p>
            <a
              href="#launch-roadmap"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity duration-200 text-base"
            >
              {t("dest.globalCta")}
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
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">{t("dest.forProfessionals")}</div>
                <h3 className="font-display text-3xl font-bold text-secondary-foreground mb-4">
                  {t("dest.guideCTATitle")}
                </h3>
                <p className="text-secondary-foreground/70 leading-relaxed mb-8">
                  {t("dest.guideCTADesc")}
                </p>
                <div className="space-y-2 mb-8">
                  {[t("dest.feat1"), t("dest.feat2"), t("dest.feat3")].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-secondary-foreground/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/apply-city-pilot"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold px-6 py-3.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 w-full text-center"
              >
                {t("dest.guideCTA")}
                <ArrowRight className="w-4 h-4" />
              </Link>
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
                <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">{t("dest.forExplorers")}</div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-4">
                  {t("dest.travelerCTATitle")}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {t("dest.travelerCTADesc")}
                </p>
                <div className="space-y-2 mb-8">
                  {[t("dest.tfeat1"), t("dest.tfeat2"), t("dest.tfeat3")].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-200 w-full text-center"
              >
                {t("dest.travelerCTA")}
                <ArrowRight className="w-4 h-4" />
              </Link>
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
              <span className="font-display text-xs uppercase tracking-[0.25em] opacity-70 block">{t("dest.ribbonLabel")}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-primary-foreground/30" />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 items-center font-semibold text-sm">
              <span>{t("dest.ribbon1")}</span>
              <span className="hidden sm:inline opacity-40">·</span>
              <span>{t("dest.ribbon2")}</span>
              <span className="hidden sm:inline opacity-40">·</span>
              <span>{t("dest.ribbon3")}</span>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default DestinationsSection;

import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import timelineImg from "@/assets/timeline-growth.png";

const LaunchStripSection = () => {
  const { t } = useTranslation();

  const phases = [
    { label: t("launch.phase1Label"), desc: t("launch.phase1Desc"), active: true },
    { label: t("launch.phase2Label"), desc: t("launch.phase2Desc"), active: false },
    { label: t("launch.phase3Label"), desc: t("launch.phase3Desc"), active: false },
  ];

  return (
    <section className="py-16 bg-secondary border-b border-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t("launch.badge")}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
            {t("launch.title")}
          </h2>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            {t("launch.desc")}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-10 max-w-6xl mx-auto">
          {/* Phases */}
          <div className="flex flex-col md:flex-row lg:flex-col items-stretch gap-4 flex-1 w-full">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex-1 flex flex-col items-center text-center p-6 rounded-2xl border relative ${
                  phase.active
                    ? "border-primary bg-primary/10"
                    : "border-primary/10 bg-secondary/50"
                }`}
              >
                {phase.active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {t("launch.now")}
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${phase.active ? "bg-primary" : "bg-primary/20"}`}>
                  <MapPin className={`w-5 h-5 ${phase.active ? "text-primary-foreground" : "text-primary/50"}`} />
                </div>
                <p className={`font-display font-bold text-base mb-1 ${phase.active ? "text-primary" : "text-primary-foreground/50"}`}>
                  {phase.label}
                </p>
                <p className={`text-sm leading-relaxed ${phase.active ? "text-primary-foreground/70" : "text-primary-foreground/40"}`}>
                  {phase.desc}
                </p>
                {i < phases.length - 1 && (
                  <ArrowRight className="hidden md:block lg:hidden absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/30 z-10" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Timeline Growth Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-shrink-0 w-full lg:w-auto lg:max-w-sm"
          >
            <img
              src={timelineImg}
              alt="Guides Directly Expansion Roadmap — Phase 1: Washington D.C. Pilot, Phase 2: North America Expansion, Phase 3: Global Expansion"
              className="w-full h-auto rounded-2xl shadow-xl border border-primary/10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LaunchStripSection;

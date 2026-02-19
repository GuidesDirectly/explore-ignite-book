import { motion } from "framer-motion";
import { Building2, Leaf, Globe, Compass, Mountain, Map } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhatIsPlatformSection = () => {
  const { t } = useTranslation();

  const experienceTypes = [
    { icon: Building2, label: t("platform.expCity") },
    { icon: Leaf, label: t("platform.expEco") },
    { icon: Globe, label: t("platform.expCultural") },
    { icon: Mountain, label: t("platform.expNature") },
    { icon: Compass, label: t("platform.expAdventure") },
    { icon: Map, label: t("platform.expCustom") },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            {t("platform.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("platform.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            {t("platform.desc")}
          </p>
        </motion.div>

        {/* Relationship model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8 mb-12 text-center"
        >
          <p className="text-muted-foreground text-sm mb-4 uppercase tracking-widest font-semibold">{t("platform.relationshipLabel")}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-4">
              <p className="font-display font-bold text-foreground text-lg">{t("platform.traveler")}</p>
              <p className="text-muted-foreground text-xs">{t("platform.travelerDesc")}</p>
            </div>
            <div className="text-center">
              <div className="text-primary font-bold text-2xl">⇄</div>
              <p className="text-xs text-muted-foreground mt-1">{t("platform.directLabel")}</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-4">
              <p className="font-display font-bold text-foreground text-lg">{t("platform.guide")}</p>
              <p className="text-muted-foreground text-xs">{t("platform.guideDesc")}</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-6 italic">
            {t("platform.platformRole")}
          </p>
        </motion.div>

        {/* Experience types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-center text-muted-foreground text-sm uppercase tracking-widest font-semibold mb-6">
            {t("platform.expLabel")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {experienceTypes.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <exp.icon className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-xs font-medium text-foreground leading-tight">{exp.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsPlatformSection;

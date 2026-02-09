import { motion } from "framer-motion";
import { Award, Clock, MapPin, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

const AboutSection = () => {
  const { t } = useTranslation();

  const highlights = [
    { icon: Clock, label: t("about.experience") },
    { icon: MapPin, label: t("about.cities") },
    { icon: Heart, label: t("about.personalized") },
    { icon: Award, label: t("about.professional") },
  ];

  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
              {t("about.label")}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t("about.title")}
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>{t("about.p1")}</p>
              <p>{t("about.p2")}</p>
              <p>{t("about.p3")}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border shadow-card text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <p className="font-display font-semibold text-foreground text-sm">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DollarSign, Globe, Users, Star, Shield, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

const ForGuidesSection = () => {
  const { t } = useTranslation();

  const earlyBenefits = [
    { icon: Star, text: t("forGuides.section.early1") },
    { icon: Users, text: t("forGuides.section.early2") },
    { icon: Shield, text: t("forGuides.section.early3") },
  ];


  return (
    <section id="for-guides" className="py-24 bg-gradient-navy">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "hsl(45, 80%, 65%)" }}>
            {t("forGuides.section.label")}
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4" style={{ color: "hsl(40, 33%, 97%)" }}>
            {t("forGuides.section.title")}
          </h2>
          <p className="text-xl mb-4 max-w-2xl mx-auto" style={{ color: "hsl(40, 33%, 80%)" }}>
            {t("forGuides.section.subtitle")}
          </p>
          <p className="text-base mb-12 max-w-2xl mx-auto font-semibold" style={{ color: "hsl(45, 80%, 70%)" }}>
            {t("forGuides.section.costNote")}
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {[
              { icon: DollarSign, text: t("forGuides.section.feat1") },
              { icon: Globe, text: t("forGuides.section.feat2") },
              { icon: Users, text: t("forGuides.section.feat3") },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border"
                style={{ borderColor: "hsla(45, 80%, 65%, 0.2)", background: "hsla(220, 30%, 10%, 0.4)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
                  <Icon className="w-6 h-6 text-secondary" />
                </div>
                <p className="font-medium" style={{ color: "hsl(40, 33%, 90%)" }}>{text}</p>
              </motion.div>
            ))}
          </div>

          <p className="flex items-center justify-center gap-2 text-sm mb-8" style={{ color: "hsl(40, 33%, 75%)" }}>
            <Bot className="w-4 h-4 text-primary" />
            {t("forGuides.section.aiToolsNote")}
          </p>

          {/* Why join early */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl border p-6 mb-10 max-w-2xl mx-auto"
            style={{ borderColor: "hsla(45, 80%, 65%, 0.2)", background: "hsla(220, 30%, 10%, 0.4)" }}
          >
            <p className="font-semibold mb-4" style={{ color: "hsl(45, 80%, 70%)" }}>{t("forGuides.section.whyEarlyTitle")}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {earlyBenefits.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: "hsl(45, 80%, 65%)" }} />
                  <span className="text-sm text-center" style={{ color: "hsl(40, 33%, 80%)" }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <Button variant="hero" size="lg" className="text-base px-10 py-6" asChild>
            <a href="/guide-register">{t("forGuides.section.cta")}</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ForGuidesSection;

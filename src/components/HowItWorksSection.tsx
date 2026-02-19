import { motion } from "framer-motion";
import { Search, MessageCircle, CreditCard, UserCheck, Globe, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const travelerSteps = [
    { icon: Search, number: "01", title: t("howItWorks.tStep1Title"), desc: t("howItWorks.tStep1Desc") },
    { icon: MessageCircle, number: "02", title: t("howItWorks.tStep2Title"), desc: t("howItWorks.tStep2Desc") },
    { icon: UserCheck, number: "03", title: t("howItWorks.tStep3Title"), desc: t("howItWorks.tStep3Desc") },
    { icon: CreditCard, number: "04", title: t("howItWorks.tStep4Title"), desc: t("howItWorks.tStep4Desc") },
  ];

  const guideSteps = [
    { icon: Briefcase, number: "01", title: t("howItWorks.gStep1Title"), desc: t("howItWorks.gStep1Desc") },
    { icon: UserCheck, number: "02", title: t("howItWorks.gStep2Title"), desc: t("howItWorks.gStep2Desc") },
    { icon: Globe, number: "03", title: t("howItWorks.gStep3Title"), desc: t("howItWorks.gStep3Desc") },
    { icon: CreditCard, number: "04", title: t("howItWorks.gStep4Title"), desc: t("howItWorks.gStep4Desc") },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            {t("howItWorks.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("howItWorks.philosophy")}
          </p>
        </motion.div>

        {/* Platform principle note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-16 bg-primary/5 border border-primary/20 rounded-xl px-6 py-4 text-center"
        >
          <p className="text-foreground/70 text-sm leading-relaxed">
            {t("howItWorks.platformNote")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Travelers */}
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-secondary text-sm font-bold">✈</span>
              {t("howItWorks.forTravelers")}
            </h3>
            <div className="space-y-6">
              {travelerSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-warm">
                    <step.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary font-semibold tracking-widest">{step.number}</span>
                      <h4 className="font-display font-bold text-foreground">{step.title}</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Guides */}
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary text-sm font-bold">★</span>
              {t("howItWorks.forGuides")}
            </h3>
            <div className="space-y-6">
              {guideSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary font-semibold tracking-widest">{step.number}</span>
                      <h4 className="font-display font-bold text-foreground">{step.title}</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Alignment statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="inline-block bg-primary text-primary-foreground font-display font-bold text-lg px-8 py-4 rounded-full shadow-warm">
            {t("howItWorks.alignmentStatement")}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

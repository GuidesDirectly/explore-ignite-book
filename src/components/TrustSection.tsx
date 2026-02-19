import { motion } from "framer-motion";
import { ShieldCheck, Eye, MessageCircle, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

const TrustSection = () => {
  const { t } = useTranslation();

  const items = [
    { icon: ShieldCheck, title: t("trust.item1Title"), desc: t("trust.item1Desc") },
    { icon: Eye, title: t("trust.item2Title"), desc: t("trust.item2Desc") },
    { icon: MessageCircle, title: t("trust.item3Title"), desc: t("trust.item3Desc") },
    { icon: DollarSign, title: t("trust.item4Title"), desc: t("trust.item4Desc") },
  ];

  const coreStatement = t("trust.coreStatement");
  const alignmentLine = t("trust.alignmentLine");

  return (
    <section id="trust" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            {t("trust.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("trust.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {coreStatement}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Alignment statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-block bg-primary/10 border border-primary/20 rounded-full px-8 py-3">
            <p className="text-primary font-display font-bold text-lg">{alignmentLine}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;

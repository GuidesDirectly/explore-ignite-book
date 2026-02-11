import { motion } from "framer-motion";
import { DollarSign, MessageCircle, Compass, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const ValuePropositionSection = () => {
  const { t } = useTranslation();

  const cards = [
    {
      icon: DollarSign,
      title: t("valueProp.card1Title"),
      description: t("valueProp.card1Desc"),
    },
    {
      icon: MessageCircle,
      title: t("valueProp.card2Title"),
      description: t("valueProp.card2Desc"),
    },
    {
      icon: Compass,
      title: t("valueProp.card3Title"),
      description: t("valueProp.card3Desc"),
    },
  ];

  const comparison = [
    {
      feature: t("valueProp.commission"),
      us: t("valueProp.commissionUs"),
      ota: t("valueProp.commissionOta"),
      usGood: true,
    },
    {
      feature: t("valueProp.directChat"),
      us: t("valueProp.directChatUs"),
      ota: t("valueProp.directChatOta"),
      usGood: true,
    },
    {
      feature: t("valueProp.transparentPricing"),
      us: t("valueProp.transparentPricingUs"),
      ota: t("valueProp.transparentPricingOta"),
      usGood: true,
    },
    {
      feature: t("valueProp.guidesKeepEarnings"),
      us: t("valueProp.guidesKeepEarningsUs"),
      ota: t("valueProp.guidesKeepEarningsOta"),
      usGood: true,
    },
  ];

  return (
    <section id="why-commission-free" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            {t("valueProp.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("valueProp.title")}
          </h2>
        </motion.div>

        {/* 3 Value Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-8 rounded-2xl bg-card shadow-card border border-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-6">
                <card.icon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {card.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h3 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            {t("valueProp.compareTitle")}
          </h3>
          <div className="rounded-2xl overflow-hidden border border-border shadow-card">
            {/* Header */}
            <div className="grid grid-cols-3 bg-secondary text-primary-foreground text-sm font-semibold">
              <div className="p-4">{t("valueProp.feature")}</div>
              <div className="p-4 text-center text-primary">{t("valueProp.guidesDirect")}</div>
              <div className="p-4 text-center">{t("valueProp.typicalOta")}</div>
            </div>
            {/* Rows */}
            {comparison.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
              >
                <div className="p-4 text-foreground font-medium">{row.feature}</div>
                <div className="p-4 text-center flex items-center justify-center gap-1.5 text-primary font-semibold">
                  <Check className="w-4 h-4" />
                  {row.us}
                </div>
                <div className="p-4 text-center flex items-center justify-center gap-1.5 text-muted-foreground">
                  <X className="w-4 h-4" />
                  {row.ota}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;

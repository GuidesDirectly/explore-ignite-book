import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhyDirectSection = () => {
  const { t } = useTranslation();

  const travelerItems = [
    t("whyDirect.tItem1"),
    t("whyDirect.tItem2"),
    t("whyDirect.tItem3"),
    t("whyDirect.tItem4"),
    t("whyDirect.tItem5"),
    t("whyDirect.tItem6"),
  ];

  const guideItems = [
    t("whyDirect.gItem1"),
    t("whyDirect.gItem2"),
    t("whyDirect.gItem3"),
    t("whyDirect.gItem4"),
    t("whyDirect.gItem5"),
  ];

  const comparison = [
    { feature: t("valueProp.commission"), us: t("valueProp.commissionUs"), ota: t("valueProp.commissionOta") },
    { feature: t("valueProp.directChat"), us: t("valueProp.directChatUs"), ota: t("valueProp.directChatOta") },
    { feature: t("valueProp.transparentPricing"), us: t("valueProp.transparentPricingUs"), ota: t("valueProp.transparentPricingOta") },
    { feature: t("valueProp.guidesKeepEarnings"), us: t("valueProp.guidesKeepEarningsUs"), ota: t("valueProp.guidesKeepEarningsOta") },
    { feature: t("valueProp.algorithmRanking"), us: t("valueProp.algorithmRankingUs"), ota: t("valueProp.algorithmRankingOta") },
  ];

  return (
    <section id="why-book-direct" className="py-24 bg-card">
      <div className="container mx-auto px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            {t("whyDirect.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("whyDirect.title")}
          </h2>
        </motion.div>

        {/* Two-column benefit lists */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Travelers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-background rounded-2xl p-8 border border-border shadow-card"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-6">{t("whyDirect.travelerTitle")}</h3>
            <div className="space-y-4">
              {travelerItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <p className="text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Guides */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-background rounded-2xl p-8 border border-border shadow-card"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-6">{t("whyDirect.guideTitle")}</h3>
            <div className="space-y-4">
              {guideItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-2xl overflow-hidden border border-border shadow-card">
            <div className="grid grid-cols-3 bg-secondary text-sm font-semibold">
              <div className="p-4 text-primary-foreground/70">{t("valueProp.feature")}</div>
              <div className="p-4 text-center text-primary">{t("valueProp.guidesDirect")}</div>
              <div className="p-4 text-center text-primary-foreground/70">{t("valueProp.typicalOta")}</div>
            </div>
            {comparison.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}>
                <div className="p-4 text-foreground font-medium">{row.feature}</div>
                <div className="p-4 text-center flex items-center justify-center gap-1.5 text-primary font-semibold">
                  <Check className="w-4 h-4" /> {row.us}
                </div>
                <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-destructive/60" /> {row.ota}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyDirectSection;

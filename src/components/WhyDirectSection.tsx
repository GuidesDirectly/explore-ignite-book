import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhyDirectSection = () => {
  const { t } = useTranslation();

  const items = [
    t("whyDirect.item1"),
    t("whyDirect.item2"),
    t("whyDirect.item3"),
    t("whyDirect.item4"),
    t("whyDirect.item5"),
  ];

  const comparison = [
    { feature: t("valueProp.commission"), us: t("valueProp.commissionUs"), ota: t("valueProp.commissionOta") },
    { feature: t("valueProp.directChat"), us: t("valueProp.directChatUs"), ota: t("valueProp.directChatOta") },
    { feature: t("valueProp.transparentPricing"), us: t("valueProp.transparentPricingUs"), ota: t("valueProp.transparentPricingOta") },
    { feature: t("valueProp.guidesKeepEarnings"), us: t("valueProp.guidesKeepEarningsUs"), ota: t("valueProp.guidesKeepEarningsOta") },
  ];

  return (
    <section id="why-book-direct" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left: benefits list */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
              {t("whyDirect.label")}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-10">
              {t("whyDirect.title")}
            </h2>
            <div className="space-y-5">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-foreground text-lg leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: comparison table */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
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
                  <div className="p-4 text-center text-muted-foreground">{row.ota}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyDirectSection;

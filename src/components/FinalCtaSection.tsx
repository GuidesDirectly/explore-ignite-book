import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const FinalCtaSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-gradient-navy">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4" style={{ color: "hsl(40, 33%, 97%)" }}>
            {t("finalCta.title")}
          </h2>
          <p className="text-xl mb-10" style={{ color: "hsl(40, 33%, 78%)" }}>
            {t("finalCta.subtitle")}
          </p>
          <Button variant="hero" size="lg" className="text-base px-12 py-6" asChild>
            <a href="#guides">{t("finalCta.cta")}</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCtaSection;

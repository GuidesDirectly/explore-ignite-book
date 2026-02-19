import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, Leaf, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroBg from "@/assets/hero-dc.jpg";
import logo from "@/assets/logo.jpg";

const HeroSection = () => {
  const { t } = useTranslation();

  const trustItems = [
    { icon: ShieldCheck, label: t("hero.trust1") },
    { icon: MessageCircle, label: t("hero.trust2") },
    { icon: Leaf, label: t("hero.trust3") },
    { icon: DollarSign, label: t("hero.trust4") },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Washington DC at golden hour" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
      </div>

      {/* Logo in top right */}
      <motion.img
        src={logo}
        alt="iGuide Tours"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="absolute top-20 right-4 w-20 sm:w-28 md:w-44 h-auto object-contain drop-shadow-2xl z-10"
      />

      <div className="relative container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-sm font-semibold uppercase tracking-[0.2em] mb-4"
            style={{ color: "hsl(45, 80%, 70%)" }}
          >
            {t("hero.poweredBy")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ color: "hsl(40, 33%, 97%)" }}
          >
            {t("hero.headline")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl md:text-2xl leading-relaxed mb-4 max-w-2xl"
            style={{ color: "hsl(40, 33%, 88%)" }}
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base leading-relaxed mb-8 max-w-xl"
            style={{ color: "hsl(40, 33%, 72%)" }}
          >
            {t("hero.noMiddlemen")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button variant="hero" size="lg" className="text-base px-8 py-6" asChild>
              <a href="#guides">{t("hero.cta1")}</a>
            </Button>
            <Button variant="heroOutline" size="lg" className="text-base px-8 py-6" asChild>
              <a href="/guide-register">{t("hero.cta2")}</a>
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(45, 80%, 65%)" }} />
                <span className="text-sm font-medium" style={{ color: "hsl(40, 33%, 85%)" }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

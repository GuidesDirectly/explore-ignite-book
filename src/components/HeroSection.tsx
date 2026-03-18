import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, Leaf, DollarSign, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-dc.jpg";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  const trustItems = [
    { icon: ShieldCheck, label: t("hero.trust1") },
    { icon: MessageCircle, label: t("hero.trust2") },
    { icon: Leaf, label: t("hero.trust3") },
    { icon: DollarSign, label: t("hero.trust4") },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={heroBg} alt="Washington DC at golden hour" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
      </div>

      <div className="relative container mx-auto px-4 pt-24 pb-20 text-center pointer-events-auto">
        <div className="max-w-3xl mx-auto">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 text-white"
          >
            {t("hero.headline")}
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ color: "hsl(40, 33%, 88%)" }}
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Glassmorphism search bar */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative mx-auto w-full max-w-xl h-14 flex items-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 focus-within:border-white/60 transition-colors duration-300 shadow-xl mb-12"
          >
            <Search className="absolute left-5 w-5 h-5 text-white pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("hero.searchPlaceholder")}
              className="w-full h-full bg-transparent rounded-full pl-13 pr-5 text-base text-white placeholder:text-white/70 border-none outline-none focus:outline-none focus:ring-0"
            />
          </motion.form>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-3"
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

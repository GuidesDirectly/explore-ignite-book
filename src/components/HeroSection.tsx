import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, Leaf, DollarSign, MapPin, Calendar, Users, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-dc.jpg";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [guests, setGuests] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (where.trim()) params.set("q", where.trim());
    if (when.trim()) params.set("date", when.trim());
    if (guests.trim()) params.set("guests", guests.trim());
    const qs = params.toString();
    navigate(qs ? `/explore?${qs}` : "/explore");
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

          {/* 3-segment glassmorphism search bar */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative mx-auto w-full max-w-2xl flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-12 overflow-hidden"
          >
            {/* Where */}
            <div className="flex-1 flex items-center gap-2 px-5 py-3">
              <MapPin className="w-4 h-4 text-white/70 flex-shrink-0" />
              <input
                type="text"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder={t("hero.searchPlaceholder", "Where to?")}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/60 border-none outline-none focus:outline-none focus:ring-0"
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-white/20 flex-shrink-0" />
            <div className="sm:hidden h-px w-full bg-white/20" />

            {/* When */}
            <div className="flex-1 flex items-center gap-2 px-5 py-3">
              <Calendar className="w-4 h-4 text-white/70 flex-shrink-0" />
              <input
                type="text"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="When?"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/60 border-none outline-none focus:outline-none focus:ring-0"
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-white/20 flex-shrink-0" />
            <div className="sm:hidden h-px w-full bg-white/20" />

            {/* Who */}
            <div className="flex items-center gap-2 px-5 py-3 sm:flex-1">
              <Users className="w-4 h-4 text-white/70 flex-shrink-0" />
              <input
                type="text"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder="Who?"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/60 border-none outline-none focus:outline-none focus:ring-0"
              />
              {/* Search button */}
              <button
                type="submit"
                className="ml-1 w-10 h-10 rounded-full bg-cta-book hover:bg-cta-book-hover text-cta-book-foreground flex items-center justify-center flex-shrink-0 transition-colors shadow-md"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
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

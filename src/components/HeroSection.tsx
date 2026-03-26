import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, Leaf, DollarSign, MapPin, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-dc.jpg";
import logo from "@/assets/logo.jpg";

const LANGUAGES = [
  "", "English", "Russian", "Spanish", "French", "German", "Hebrew",
  "Arabic", "Chinese", "Japanese", "Portuguese", "Italian", "Korean",
  "Hindi", "Polish", "Vietnamese", "Indonesian", "Dutch", "Thai",
  "Turkish", "Swedish", "Ukrainian",
];

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (language) params.set("language", language);
    const qs = params.toString();
    navigate(qs ? `/guides?${qs}` : "/guides");
  };

  const trustItems = [
    { icon: ShieldCheck, label: t("hero.trust1") },
    { icon: MessageCircle, label: t("hero.trust2") },
    { icon: Leaf, label: t("hero.trust3") },
    { icon: DollarSign, label: t("hero.trust4") },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-visible">
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={heroBg} alt="Washington DC at golden hour" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsla(220, 30%, 8%, 0.6) 0%, transparent 50%)" }} />
      </div>

      <div className="relative container mx-auto px-4 pt-24 pb-20 text-center pointer-events-auto">
        <div className="max-w-3xl mx-auto">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-xs md:text-sm uppercase tracking-[0.15em] text-white/60 mb-4"
          >
            {t("hero.poweredBy")}
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          >
            {t("hero.headline")}
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto"
            style={{ color: "hsl(40, 33%, 88%)" }}
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/guides">Find a Guide</Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/guide-register">I'm a Guide — Join Free</Link>
            </Button>
          </motion.div>

          {/* Guide finder search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mx-auto w-full max-w-2xl mb-12"
          >
            <p className="text-[13px] text-white/85 text-center mb-3">
              Find your guide — search by city and language
            </p>
            <form
              onSubmit={handleSubmit}
              id="hero-search"
              className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
            >
              {/* City field — 60% */}
              <div className="flex-[3] flex items-center gap-2 px-5 py-3">
                <MapPin className="w-4 h-4 text-white/70 flex-shrink-0" />
                <input
                  type="text"
                  name="city_search"
                  autoComplete="off"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Which city are you visiting?"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/60 border-none outline-none focus:outline-none focus:ring-0"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-white/20 flex-shrink-0" />
              <div className="sm:hidden h-px w-full bg-white/20" />

              {/* Language field — 40% */}
              <div className="flex items-center gap-2 px-5 py-3 flex-[2]">
                <MessageCircle className="w-4 h-4 text-white/70 flex-shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-transparent text-sm text-white border-none outline-none focus:outline-none focus:ring-0 appearance-none cursor-pointer"
                  style={{ WebkitAppearance: "none" }}
                >
                  <option value="" className="bg-[hsl(220,30%,8%)] text-white">Any Language</option>
                  {LANGUAGES.filter(Boolean).map((lang) => (
                    <option key={lang} value={lang} className="bg-[hsl(220,30%,8%)] text-white">
                      {lang}
                    </option>
                  ))}
                </select>
                {/* Search button */}
                <button
                  type="submit"
                  className="ml-1 w-10 h-10 rounded-full bg-[#C9A84C] hover:bg-[#b8963f] flex items-center justify-center flex-shrink-0 transition-colors shadow-md"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px] text-[#0A1628]" />
                </button>
              </div>
            </form>
          </motion.div>

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

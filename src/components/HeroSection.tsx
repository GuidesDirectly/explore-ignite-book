import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, Star, Users } from "lucide-react";
import heroBg from "@/assets/hero-dc.jpg";
import logo from "@/assets/logo.jpg";

const languages = [
  { flag: "🇷🇺" },
  { flag: "🇬🇧" },
  { flag: "🇵🇱" },
  { flag: "🇩🇪" },
  { flag: "🇫🇷" },
  { flag: "🇪🇸" },
  { flag: "🇨🇳" },
  { flag: "🇯🇵" },
];

const stats = [
  { icon: Star, value: "4.9★", label: "Average Rating" },
  { icon: Users, value: "10,000+", label: "Happy Travelers" },
  { icon: MapPin, value: "50+", label: "Cities Covered" },
];

const HeroSection = () => {
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
        className="absolute top-24 right-6 md:right-12 w-28 h-28 md:w-40 md:h-40 rounded-full object-cover shadow-2xl border-2 border-primary/30 z-10"
      />

      <div className="relative container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center gap-3 mb-4"
          >
            {languages.map(({ flag }, i) => (
              <span key={i} className="text-2xl md:text-3xl">
                {flag}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ color: "hsl(40, 33%, 97%)" }}
          >
            Discover America
            <br />
            <span className="text-gradient-gold">Like a Local</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
            style={{ color: "hsl(40, 33%, 90%)" }}
          >
            Premium private tour guides across the USA & Canada. 
            Custom VIP experiences crafted just for you — from historic landmarks to hidden gems.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Button variant="hero" size="lg" className="text-base px-8 py-6" asChild>
              <a href="#inquiry">Plan Your Tour</a>
            </Button>
            <Button variant="heroOutline" size="lg" className="text-base px-8 py-6" asChild>
              <a href="#services">Explore Services</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-8"
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold" style={{ color: "hsl(40, 33%, 97%)" }}>{value}</p>
                  <p className="text-xs" style={{ color: "hsl(40, 33%, 75%)" }}>{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

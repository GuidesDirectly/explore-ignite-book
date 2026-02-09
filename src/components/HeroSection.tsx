import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, Star, Users } from "lucide-react";
import heroBg from "@/assets/hero-dc.jpg";
import logo from "@/assets/logo.jpg";

const languages = [
  { code: "ru", name: "Russian" },
  { code: "gb", name: "English" },
  { code: "pl", name: "Polish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "cn", name: "Mandarin" },
  { code: "jp", name: "Japanese" },
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
        className="absolute top-24 right-6 md:right-12 w-36 md:w-52 h-auto object-contain drop-shadow-2xl z-10"
      />

      <div className="relative container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center gap-3 mb-4"
          >
            {languages.map(({ code, name }) => (
              <img
                key={code}
                src={`https://flagcdn.com/w80/${code}.png`}
                alt={name}
                title={name}
                className="w-10 h-7 md:w-12 md:h-8 rounded-sm object-cover shadow-md"
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mb-6"
          >
            <h1
              className="font-display text-5xl md:text-7xl font-bold leading-tight"
              style={{ color: "hsl(40, 33%, 97%)" }}
            >
              Discover America
            </h1>

            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
              <h1
                className="font-display text-5xl md:text-7xl font-bold leading-tight"
                style={{ color: "hsl(40, 33%, 97%)" }}
              >
                <span className="text-gradient-gold">Like a Local</span>
              </h1>

              {/* Passport stamp */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 200 }}
                className="inline-flex flex-shrink-0"
              >
                <div
                  className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-[4px] border-double flex items-center justify-center text-center font-extrabold text-[10px] md:text-sm uppercase tracking-wider overflow-hidden"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    color: "hsl(210, 100%, 75%)",
                    borderColor: "hsl(210, 100%, 75%)",
                    textShadow: "0 0 8px hsl(210 100% 75% / 0.6), 0 1px 2px rgba(0,0,0,0.5)",
                    boxShadow: "inset 0 0 15px hsl(210 100% 75% / 0.25), 0 0 25px hsl(210 100% 75% / 0.2)",
                    maskImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    WebkitMaskImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                  }}
                >
                  <div className="absolute inset-2 border-2 rounded-full pointer-events-none" style={{ borderColor: "hsl(210, 100%, 75%, 0.5)" }} />
                  <span className="relative z-10 leading-tight px-3">IN YOUR<br />OWN<br />LANGUAGE</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

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

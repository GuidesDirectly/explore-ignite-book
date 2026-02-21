import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n/config";
import logo from "@/assets/logo.jpg";
import heroBg from "@/assets/hero-dc.jpg";

interface LanguageSelectScreenProps {
  onLanguageSelected: () => void;
}

const LanguageSelectScreen = ({ onLanguageSelected }: LanguageSelectScreenProps) => {
  const { i18n } = useTranslation();

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("languageSelected", "true");
    onLanguageSelected();
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-secondary/85 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-3xl w-full">
        {/* Logo */}
        <motion.img
          src={logo}
          alt="iGuide Tours"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-36 md:w-48 h-auto drop-shadow-2xl rounded-lg"
        />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-1">
            Guides Directly
          </h1>
          <p className="text-primary/80 text-sm md:text-base font-medium mb-2">Powered by iGuide Tours</p>
          <p className="text-secondary text-sm md:text-base tracking-wide bg-primary px-4 py-2 rounded-lg inline-block">
            Select your language
          </p>
        </motion.div>

        {/* Language Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
        >
          {languages.map(({ code, name, flag }, i) => (
            <motion.button
              key={code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
              onClick={() => handleSelect(code)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/10 border border-primary-foreground/15 hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 group cursor-pointer"
            >
              <img
                src={`https://flagcdn.com/w80/${flag}.png`}
                alt={name}
                className="w-8 h-6 rounded-sm object-cover shadow-sm"
              />
              <span className="text-primary-foreground font-medium text-sm md:text-base group-hover:text-primary transition-colors">
                {name}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSelectScreen;

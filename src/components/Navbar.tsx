import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Facebook, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.forTravelers"), href: "#meet-guides" },
    { label: t("nav.destinations"), href: "#destinations" },
    { label: t("nav.services"), href: "#how-it-works" },
    { label: t("nav.forGuides"), href: "#for-guides" },
    { label: t("nav.contact"), href: "#about" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== "/home") {
      e.preventDefault();
      navigate(`/home${href}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#home" className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-bold text-primary-foreground tracking-tight">Guides<span className="text-gradient-gold">Directly</span></span>
          <span className="text-[10px] text-primary-foreground/50 font-medium hidden sm:inline">by iGuide Tours</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-primary-foreground/70 hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="https://www.facebook.com/Toursiguide/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-primary transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="https://www.instagram.com/iguide_tours" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-primary transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
          <LanguageSwitcher />
          <a href="tel:+12022438336" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
            (202) 243-8336
          </a>
          <Button variant="outline" size="sm" asChild className="border-primary/30 text-primary hover:bg-primary/10">
            <a href="/guide-register">{t("nav.becomeGuide")}</a>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <a href="#meet-guides" onClick={(e) => handleNavClick(e, "#meet-guides")}>{t("nav.forTravelers")}</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-primary-foreground/70 hover:text-primary transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-secondary/98 border-t border-primary/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { handleNavClick(e, link.href); setIsOpen(false); }}
                  className="text-sm font-medium text-primary-foreground/70 hover:text-primary transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-4 py-2">
                <a href="https://www.facebook.com/Toursiguide/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/iguide_tours" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" asChild>
                <a href="/guide-register" onClick={() => setIsOpen(false)}>{t("nav.becomeGuide")}</a>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <a href="#meet-guides" onClick={(e) => { handleNavClick(e, "#meet-guides"); setIsOpen(false); }}>{t("nav.findGuide")}</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

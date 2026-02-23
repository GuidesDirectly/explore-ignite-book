import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
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
    { label: t("nav.contact"), href: "#about" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== "/home") {
      e.preventDefault();
      navigate(`/home${href}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <a href="#home" onClick={(e) => handleNavClick(e, "#home")} className="flex items-baseline gap-1.5 shrink-0">
          <span className="font-display text-2xl font-bold tracking-tight">
            <span className="text-foreground">Guides</span>
            <span className="text-primary">Directly</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">by iGuide Tours</span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6 ml-8">
          {navLinks.map((link) => {
            const isFind = link.href === "#meet-guides";
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={
                  isFind
                    ? "text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-sm hover:bg-primary/85 transition-all duration-200"
                    : "text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200"
                }
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop right section: CTAs + utility */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <Button
            variant="hero"
            size="sm"
            asChild
          >
            <a href="/guide-register">{t("nav.becomeGuide_action", "Become a Guide")}</a>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a href="#meet-guides" onClick={(e) => handleNavClick(e, "#meet-guides")}>{t("nav.becomeGuide", "Join Free")}</a>
          </Button>
          <LanguageSwitcher />
          <a
            href="tel:+12022438336"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">(202) 243-8336</span>
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground/70 hover:text-primary transition-colors p-1"
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
            className="lg:hidden bg-white border-t border-border/40 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { handleNavClick(e, link.href); setIsOpen(false); }}
                  className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-2.5 border-b border-border/20 last:border-0"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <Button variant="hero" size="sm" asChild>
                  <a href="/guide-register" onClick={() => setIsOpen(false)}>
                    {t("nav.becomeGuide_action", "Become a Guide")}
                  </a>
                </Button>
                <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="#meet-guides" onClick={(e) => { handleNavClick(e, "#meet-guides"); setIsOpen(false); }}>
                    {t("nav.becomeGuide", "Join Free")}
                  </a>
                </Button>
              </div>
              <a
                href="tel:+12022438336"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors pt-2"
              >
                <Phone className="w-4 h-4" />
                (202) 243-8336
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

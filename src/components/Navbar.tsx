import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ChevronDown, Heart, Sparkles, Search, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import DestinationsModal from "./DestinationsModal";
import TravelerProfileForm from "./TravelerProfileForm";
import NavbarUserMenu from "./NavbarUserMenu";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const destBtnRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? undefined);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? undefined);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = location.pathname === "/" || location.pathname === "/home";

  const navLinks = [
    { label: "Destinations", href: "#destinations", isDestinations: true },
    { label: "Guides", href: "#meet-guides" },
    { label: "Browse Tours", href: "/tours", isRoute: true },
    { label: t("nav.services", "How it Works"), href: "#how-it-works" },
    { label: t("nav.contact", "About"), href: "#about" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    if (location.pathname !== "/home" && location.pathname !== "/") {
      e.preventDefault();
      navigate(`/home${href}`);
    }
  };

  const headerBg = scrolled
    ? "bg-header shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
    : isHome
      ? "bg-transparent"
      : "bg-header/95 backdrop-blur-md";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${headerBg}`}>
      <div className="container mx-auto flex items-center justify-between h-[72px] px-4 lg:px-10">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex items-baseline gap-1.5 shrink-0"
        >
          <span className="font-display text-2xl font-bold tracking-tight">
            <span className="text-header-foreground">Guides</span>
            <span className="text-cta-book">Directly</span>
          </span>
          <span className="text-[10px] text-header-muted font-medium hidden sm:inline">
            by iGuide Tours
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-7 ml-8">
          {navLinks.map((link) => {
            const isDest = (link as any).isDestinations;

            if (isDest) {
              return (
                <div key={link.href} ref={destBtnRef} className="relative">
                  <button
                    onClick={() => setDestOpen(true)}
                    className="text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-colors duration-200 inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            if ((link as any).isRoute) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); navigate(link.href); }}
                  className="text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-colors duration-200"
                >
                  {link.label}
                </a>
              );
            }

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-colors duration-200"
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop right section */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          {isLoggedIn && (
            <>
              <button
                onClick={() => setProfileOpen(true)}
                className="relative p-2 rounded-full text-header-muted hover:text-cta-book hover:bg-white/10 transition-colors"
                aria-label="Travel Preferences"
                title="My Travel Preferences"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/saved-guides")}
                className="relative p-2 rounded-full text-header-muted hover:text-red-400 hover:bg-white/10 transition-colors"
                aria-label="Saved Guides"
              >
                <Heart className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="w-px h-6 bg-[hsl(var(--header-divider))] mx-1" />

          {/* Login or Avatar */}
          {!isLoggedIn ? (
            <Button
              size="sm"
              variant="outline"
              className="border-header-foreground/30 text-header-foreground/90 hover:text-header-foreground hover:bg-white/10 font-medium gap-1.5"
              onClick={() => navigate("/login")}
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Button>
          ) : (
            <NavbarUserMenu email={userEmail} />
          )}

          <div className="w-px h-6 bg-[hsl(var(--header-divider))] mx-1" />

          {/* CTA Group: Find a Guide + Book a Guide */}
          <Button
            size="sm"
            className="bg-cta-find text-cta-find-foreground hover:bg-cta-find-hover font-semibold shadow-md border border-cta-find-foreground/10"
            onClick={() => {
              if (isHome) {
                document.querySelector("#meet-guides")?.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/home#meet-guides");
              }
            }}
          >
            <Search className="w-3.5 h-3.5 mr-1" />
            Find a Guide
          </Button>
          <Button
            size="sm"
            className="bg-cta-book text-cta-book-foreground hover:bg-cta-book-hover font-semibold shadow-md animate-cta-pulse"
            onClick={() => navigate("/explore")}
          >
            Book a Guide
          </Button>

          {/* Join as Guide */}
          <Button
            size="sm"
            variant="outline"
            className="border-cta-join text-cta-join bg-transparent hover:bg-white/10 hover:border-header-foreground/70 font-semibold"
            onClick={() => navigate("/guide-register")}
          >
            Join as Guide
          </Button>

          {/* Phone + Language on far right */}
          <div className="w-px h-6 bg-[hsl(var(--header-divider))] mx-1" />

          <a
            href="tel:+12022438336"
            className="flex items-center gap-1.5 text-sm text-header-muted hover:text-header-foreground transition-colors"
          >
            <span className="text-base">🇺🇸</span>
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">(202) 243-8336</span>
          </a>

          <LanguageSwitcher />
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-header-foreground/80 hover:text-header-foreground transition-colors p-1"
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
            className="lg:hidden bg-header border-t border-[hsl(var(--header-divider))] overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isDest = (link as any).isDestinations;

                if (isDest) {
                  return (
                    <button
                      key={link.href}
                      onClick={() => { setIsOpen(false); navigate("/explore"); }}
                      className="text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-colors py-2.5 border-b border-[hsl(var(--header-divider))] text-left"
                    >
                      {link.label} →
                    </button>
                  );
                }

                if ((link as any).isRoute) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); navigate(link.href); setIsOpen(false); }}
                      className="text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-colors py-2.5 border-b border-[hsl(var(--header-divider))]"
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => { handleNavClick(e, link.href); setIsOpen(false); }}
                    className="text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-colors py-2.5 border-b border-[hsl(var(--header-divider))]"
                  >
                    {link.label}
                  </a>
                );
              })}

              {isLoggedIn && (
                <a
                  href="/saved-guides"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-header-foreground/80 hover:text-red-400 transition-colors py-2.5 border-b border-[hsl(var(--header-divider))] flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Saved Guides
                </a>
              )}

              {!isLoggedIn ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-header-foreground/80 hover:text-header-foreground hover:bg-white/10 font-medium w-full justify-start gap-2"
                  onClick={() => { setIsOpen(false); navigate("/guide-register"); }}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-header-foreground/80 hover:text-header-foreground hover:bg-white/10 font-medium w-full justify-start gap-2"
                  onClick={() => { setIsOpen(false); navigate("/guide-dashboard"); }}
                >
                  Dashboard
                </Button>
              )}

              <div className="flex flex-col gap-2 pt-3">
                <Button
                  size="sm"
                  className="bg-cta-find text-cta-find-foreground hover:bg-cta-find-hover font-semibold w-full"
                  onClick={() => {
                    setIsOpen(false);
                    if (isHome) {
                      document.querySelector("#meet-guides")?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      navigate("/home#meet-guides");
                    }
                  }}
                >
                  <Search className="w-4 h-4 mr-1" />
                  Find a Guide
                </Button>
                <Button
                  size="sm"
                  className="bg-cta-book text-cta-book-foreground hover:bg-cta-book-hover font-semibold w-full"
                  onClick={() => { setIsOpen(false); navigate("/explore"); }}
                >
                  Book a Guide
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cta-join text-cta-join bg-transparent hover:bg-white/10 font-semibold w-full"
                  onClick={() => { setIsOpen(false); navigate("/guide-register"); }}
                >
                  Join as Guide
                </Button>
              </div>
              <a
                href="tel:+12022438336"
                className="flex items-center gap-2 text-sm text-header-muted hover:text-header-foreground transition-colors pt-2"
              >
                <span>🇺🇸</span>
                <Phone className="w-4 h-4" />
                (202) 243-8336
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cta-book/30 to-transparent" />

      <DestinationsModal
        open={destOpen}
        onClose={() => setDestOpen(false)}
        onDone={(cities) => {
          setDestOpen(false);
          navigate(`/home#meet-guides?cities=${encodeURIComponent(cities.join(","))}`);
        }}
      />
      <TravelerProfileForm open={profileOpen} onClose={() => setProfileOpen(false)} />
    </nav>
  );
};

export default Navbar;

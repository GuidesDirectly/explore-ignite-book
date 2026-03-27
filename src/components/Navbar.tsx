import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Heart, Sparkles, LogIn, Phone } from "lucide-react";
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
    { label: "Guides", href: "/guides", isRoute: true },
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
    ? "bg-[hsla(220,30%,8%,0.95)] shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
    : isHome
      ? "bg-[hsla(220,30%,8%,0.8)]"
      : "bg-[hsla(220,30%,8%,0.95)] backdrop-blur-md";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${headerBg}`}>
      <div className="container mx-auto flex h-[72px] items-center justify-between px-4 lg:px-8">
        {/* LEFT: Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex items-center gap-2 shrink-0"
        >
          
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap">
              <span className="text-white">Guides</span>
              <span className="text-cta-book">Directly</span>
            </span>
            <span className="text-[10px] text-white/50 font-medium hidden sm:inline whitespace-nowrap">
              by iGuide Tours
            </span>
          </span>
        </a>

        {/* CENTER: Nav links (desktop) */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          {navLinks.map((link) => {
            if ((link as any).isDestinations) {
              return (
                <div key={link.href} ref={destBtnRef} className="relative">
                  <button
                    onClick={() => setDestOpen(true)}
                    className="text-xs xl:text-sm font-medium text-white/80 hover:text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap"
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
                  className="text-xs xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
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
                className="text-xs xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* RIGHT: Actions + Phone (desktop) */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
          {isLoggedIn && (
            <>
              <button
                onClick={() => setProfileOpen(true)}
                className="relative p-2 rounded-full text-white/60 hover:text-cta-book hover:bg-white/10 transition-colors"
                aria-label="Travel Preferences"
                title="My Travel Preferences"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/saved-guides")}
                className="relative p-2 rounded-full text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
                aria-label="Saved Guides"
              >
                <Heart className="w-4 h-4" />
              </button>
            </>
          )}

          <a
            href="tel:+12022438336"
            className="hidden lg:inline-flex items-center gap-1.5 text-[13px] text-white/80 hover:text-cta-book transition-colors whitespace-nowrap"
          >
            <Phone className="w-4 h-4" />
            +1 (202) 243-8336
          </a>

          <div className="w-px h-6 bg-white/20 mx-1" />

          {!isLoggedIn ? (
            <button
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-cta-book transition-colors"
              onClick={() => navigate("/login")}
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>
          ) : (
            <NavbarUserMenu email={userEmail} />
          )}

          <Button
            size="sm"
            variant="outline"
            className="border-cta-book text-cta-book hover:bg-cta-book hover:text-cta-book-foreground font-semibold whitespace-nowrap"
            onClick={() => navigate("/tours")}
          >
            Find a Guide
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-[1.5px] border-[#C9A84C] text-[#C9A84C] bg-transparent hover:bg-[rgba(201,168,76,0.12)] hover:text-[#C9A84C] font-semibold whitespace-nowrap rounded-lg px-5 py-2.5 transition-[background] duration-150 ease-in"
            onClick={() => navigate("/guide-register")}
          >
            Join as Guide
          </Button>

          <div className="w-px h-6 bg-white/20 mx-1" />
          <LanguageSwitcher />
        </div>

        {/* Mobile: Phone + Language + Menu */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white/80 hover:text-white transition-colors p-1 shrink-0"
            aria-label={isOpen ? "Close menu" : "Open menu"}
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
            className="lg:hidden bg-[hsla(220,30%,8%,0.95)] border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                if ((link as any).isDestinations) {
                  return (
                    <button
                      key={link.href}
                      onClick={() => { setIsOpen(false); navigate("/explore"); }}
                      className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2.5 border-b border-white/10 text-left"
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
                      className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2.5 border-b border-white/10"
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
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2.5 border-b border-white/10"
                  >
                    {link.label}
                  </a>
                );
              })}

              {isLoggedIn && (
                <a
                  href="/saved-guides"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors py-2.5 border-b border-white/10 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Saved Guides
                </a>
              )}

              {!isLoggedIn ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white/90 hover:text-white hover:bg-white/10 font-medium w-full justify-start gap-2"
                  onClick={() => { setIsOpen(false); navigate("/login"); }}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 font-medium w-full justify-start gap-2"
                  onClick={() => { setIsOpen(false); navigate("/guide-dashboard"); }}
                >
                  Dashboard
                </Button>
              )}

              <div className="flex flex-col gap-2 pt-3">
                <Button
                  size="sm"
                  className="bg-cta-join text-white hover:bg-cta-join/90 font-semibold w-full"
                  onClick={() => { setIsOpen(false); navigate("/guide-register"); }}
                >
                  Join as Guide
                </Button>
              </div>
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

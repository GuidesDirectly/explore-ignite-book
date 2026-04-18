import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Heart, Sparkles, LogIn, Phone, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import DestinationsModal from "./DestinationsModal";
import TravelerProfileForm from "./TravelerProfileForm";
import NavbarUserMenu from "./NavbarUserMenu";
import { supabase } from "@/integrations/supabase/client";

type RoleKey = "admin" | "guide" | "traveler";

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
  const [roleKey, setRoleKey] = useState<RoleKey>("traveler");

  const resolveRole = async (userId: string): Promise<RoleKey> => {
    const [{ data: roles }, { data: guideProfile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("guide_profiles").select("id").eq("user_id", userId).maybeSingle(),
    ]);
    const set = new Set((roles || []).map((r: any) => r.role));
    if (set.has("admin")) return "admin";
    if (set.has("guide") || guideProfile) return "guide";
    return "traveler";
  };

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setIsLoggedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? undefined);
      if (session?.user) {
        const r = await resolveRole(session.user.id);
        if (!cancelled) setRoleKey(r);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? undefined);
      if (session?.user) {
        const r = await resolveRole(session.user.id);
        setRoleKey(r);
      } else {
        setRoleKey("traveler");
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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

  const dashboardConfig = (() => {
    if (roleKey === "admin") return { label: "Admin Panel", path: "/admin" };
    if (roleKey === "guide") return { label: "My Dashboard", path: "/guide-dashboard" };
    return { label: "My Dashboard", path: "/traveler/dashboard" };
  })();

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

        {/* RIGHT: Actions (desktop) */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
          <a
            href="tel:+12022438336"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/80 hover:text-cta-book transition-colors whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" />
            +1 (202) 243-8336
          </a>

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

          {/* Auth buttons OR contextual dashboard link */}
          {!isLoggedIn ? (
            <>
              <Button
                size="sm"
                className="bg-white text-[#0A1628] border border-white hover:bg-white/90 font-semibold whitespace-nowrap"
                onClick={() => navigate("/login")}
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-transparent border border-cta-book/70 text-cta-book hover:bg-cta-book/10 hover:border-cta-book font-semibold whitespace-nowrap"
                onClick={() => navigate("/login?tab=signup")}
              >
                Join Free as Traveler
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-white text-[#0A1628] border border-white hover:bg-white/90 font-semibold whitespace-nowrap"
              onClick={() => navigate(dashboardConfig.path)}
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
              {dashboardConfig.label}
            </Button>
          )}

          {/* Find a Guide — primary gold CTA (solid, largest) */}
          <Button
            className="bg-cta-book text-cta-book-foreground border border-cta-book hover:bg-cta-book/90 font-semibold whitespace-nowrap"
            onClick={() => navigate("/guides")}
          >
            Find a Guide
          </Button>

          {/* For Guides — subtle text link */}
          <a
            href="/for-guides"
            onClick={(e) => { e.preventDefault(); navigate("/for-guides"); }}
            className="text-xs text-white/55 hover:text-white/80 transition-colors whitespace-nowrap"
          >
            For Guides
          </a>

          {isLoggedIn && <NavbarUserMenu email={userEmail} />}

          <LanguageSwitcher />
        </div>

        {/* Mobile: Language + Menu */}
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

              <div className="flex flex-col gap-2 pt-3">
                {!isLoggedIn ? (
                  <>
                    <Button
                      size="sm"
                      className="bg-white text-[#0A1628] border border-white hover:bg-white/90 font-semibold w-full justify-start gap-2"
                      onClick={() => { setIsOpen(false); navigate("/login"); }}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      className="bg-transparent border border-cta-book/70 text-white hover:bg-cta-book/10 hover:border-cta-book font-semibold w-full"
                      onClick={() => { setIsOpen(false); navigate("/login?tab=signup"); }}
                    >
                      Join Free as Traveler
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="bg-white text-[#0A1628] border border-white hover:bg-white/90 font-semibold w-full justify-start gap-2"
                    onClick={() => { setIsOpen(false); navigate(dashboardConfig.path); }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {dashboardConfig.label}
                  </Button>
                )}

                <Button
                  size="sm"
                  className="bg-cta-book text-cta-book-foreground border border-cta-book hover:bg-cta-book/90 font-semibold w-full"
                  onClick={() => { setIsOpen(false); navigate("/guides"); }}
                >
                  Find a Guide
                </Button>

                <a
                  href="/for-guides"
                  onClick={(e) => { e.preventDefault(); navigate("/for-guides"); setIsOpen(false); }}
                  className="text-xs text-white/55 hover:text-white/80 transition-colors py-2 text-center"
                >
                  For Guides
                </a>

                <a
                  href="tel:+12022438336"
                  className="inline-flex items-center justify-center gap-1.5 text-[13px] text-white/80 hover:text-cta-book transition-colors whitespace-nowrap py-2"
                >
                  <Phone className="w-4 h-4" />
                  +1 (202) 243-8336
                </a>
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

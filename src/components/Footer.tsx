import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.services"), href: "#services" },
    { label: t("nav.destinations"), href: "#destinations" },
    { label: t("nav.testimonials"), href: "#testimonials" },
    { label: t("nav.contact"), href: "#contact" },
    { label: t("nav.becomeGuide"), href: "/guide-register" },
  ];

  return (
    <footer id="contact" className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-1">
              Guides<span className="text-gradient-gold">Directly</span>
            </h3>
            <p className="text-xs text-primary-foreground/40 mb-4">{t("footer.poweredBy")}</p>
            <p className="text-primary-foreground/60 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-primary-foreground mb-4">{t("footer.quickLinks")}</h4>
            <div className="space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-primary-foreground/60 hover:text-primary transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-primary-foreground mb-4">{t("footer.contactUs")}</h4>
            <div className="space-y-3 text-sm text-primary-foreground/60">
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                +1 (202) 243-8336
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                michael@iguidetours.net
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                6100 Cheshire Dr, Bethesda, MD 20814
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://www.facebook.com/Toursiguide/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/iguide_tours" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

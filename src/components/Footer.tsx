import { MapPin, Phone, Mail, Facebook, Instagram, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const platformLinks = [
    { label: t("footer.findGuide"), href: "/home#meet-guides" },
    { label: t("footer.joinGuide"), href: "/guide-register" },
    { label: t("footer.howItWorks"), href: "/home#how-it-works" },
  ];
  const resourceLinks = [
    { label: t("footer.faq"), href: "/home#faq" },
    { label: t("footer.safety"), href: "/home#trust" },
  ];
  const companyLinks = [
    { label: t("footer.about"), href: "#about" },
    { label: t("footer.contact"), href: "#contact" },
  ];

  return (
    <footer id="contact" className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-1">
              Guides<span className="text-gradient-gold">Directly</span>
            </h3>
            <p className="text-xs text-primary-foreground/40 mb-4">{t("footer.poweredBy")}</p>
            <p className="text-primary-foreground/60 leading-relaxed text-sm mb-4">
              {t("footer.description")}
            </p>
            <p className="text-primary font-semibold text-sm italic">{t("footer.tagline")}</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display text-sm font-semibold text-primary-foreground/80 uppercase tracking-widest mb-4">{t("footer.platform")}</h4>
            <div className="space-y-3">
              {platformLinks.map((link) => (
                <a key={link.href} href={link.href} className="block text-primary-foreground/60 hover:text-primary transition-colors text-sm">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-sm font-semibold text-primary-foreground/80 uppercase tracking-widest mb-4">{t("footer.resources")}</h4>
            <div className="space-y-3">
              {resourceLinks.map((link) => (
                <a key={link.href} href={link.href} className="block text-primary-foreground/60 hover:text-primary transition-colors text-sm">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold text-primary-foreground/80 uppercase tracking-widest mb-4">{t("footer.contactUs")}</h4>
            <div className="space-y-3 text-sm text-primary-foreground/60">
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                +1 (202) 243-8336
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                michael@iguidetours.net
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                Bethesda, MD
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

        {/* Security & Trust */}
        <div className="border-t border-primary-foreground/10 pt-8 mb-8">
          <div className="flex items-start gap-3 max-w-2xl mx-auto text-center sm:text-left">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 hidden sm:block" />
            <p className="text-xs text-primary-foreground/50 leading-relaxed">
              <span className="font-semibold text-primary-foreground/70">{t("footer.securityTitle", "Security & Trust")}</span>{" — "}
              {t("footer.securityNote", "We prioritize your data. Guides Directly utilizes real-time breach monitoring and encrypted connections to ensure that your business and travel details remain private.")}
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6 text-xs text-primary-foreground/40">
            <a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a>
            <a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

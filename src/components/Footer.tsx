import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-4">
              iGuide<span className="text-gradient-gold">Tours</span>
            </h3>
            <p className="text-primary-foreground/60 leading-relaxed">
              Premium local tour guides across the United States and Canada. Russian, English, Polish, German, French, Spanish, Mandarin & Japanese speaking.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <div className="space-y-3">
              {["Home", "Services", "Destinations", "Testimonials", "Contact"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-primary-foreground/60 hover:text-primary transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-primary-foreground mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-primary-foreground/60">
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                (202) 243-8336
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                michael@iguidetours.net
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                6100 Cheshire Dr, Bethesda, MD 20814
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} iGuide Tours. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

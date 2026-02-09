import { motion } from "framer-motion";
import { Crown, Users, Compass, Globe } from "lucide-react";

const services = [
  {
    icon: Crown,
    title: "VIP Private Tours",
    description: "Exclusive one-on-one experiences tailored to your interests. Our guides design a perfect itinerary just for you.",
  },
  {
    icon: Users,
    title: "Group Tours",
    description: "Join like-minded travelers on curated group experiences. Perfect for social adventurers seeking shared discoveries.",
  },
  {
    icon: Compass,
    title: "Custom Itineraries",
    description: "Tell us your time and interests — we'll craft a unique route covering hidden gems and iconic landmarks alike.",
  },
  {
    icon: Globe,
    title: "Multilingual Guides",
    description: "Our guides speak Russian, Hebrew, and English fluently. Experience every destination in your preferred language.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            What We Offer
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tour Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From VIP private tours to group adventures, we create unforgettable travel experiences across North America.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

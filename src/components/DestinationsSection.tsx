import { motion } from "framer-motion";
import cityDC from "@/assets/city-dc.jpg";
import cityNYC from "@/assets/city-nyc.jpg";
import cityNiagara from "@/assets/city-niagara.jpg";
import cityToronto from "@/assets/city-toronto.jpg";

const destinations = [
  { name: "Washington DC", image: cityDC, tours: "25+ tours" },
  { name: "New York City", image: cityNYC, tours: "30+ tours" },
  { name: "Niagara Falls", image: cityNiagara, tours: "10+ tours" },
  { name: "Toronto", image: cityToronto, tours: "15+ tours" },
];

const DestinationsSection = () => {
  return (
    <section id="destinations" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            Popular Destinations
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Where We Guide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Local guides in most major cities across the United States and Canada.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, i) => (
            <motion.a
              key={dest.name}
              href="#inquiry"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                  {dest.tours}
                </p>
                <h3 className="font-display text-2xl font-bold" style={{ color: "hsl(40, 33%, 97%)" }}>
                  {dest.name}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;

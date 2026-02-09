import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Anna K.",
    location: "Moscow, Russia",
    text: "Our guide made Washington DC come alive! Speaking Russian was a huge plus — we understood every detail of American history like never before.",
    rating: 5,
  },
  {
    name: "David L.",
    location: "Tel Aviv, Israel",
    text: "The VIP tour of New York was incredible. Our Hebrew-speaking guide took us to spots we never would have found on our own. Worth every penny!",
    rating: 5,
  },
  {
    name: "Sarah M.",
    location: "London, UK",
    text: "We booked a custom family tour across three cities. The attention to detail and personalized itinerary was beyond our expectations.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm uppercase tracking-[0.2em] font-semibold mb-3">
            Testimonials
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Travelers Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-8 rounded-2xl bg-card shadow-card border border-border relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div>
                <p className="font-display font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  translations: Record<string, Record<string, string>> | null;
}

const TestimonialsSection = ({ showAll = false }: { showAll?: boolean }) => {
  const { t, i18n } = useTranslation();
  const [dbReviews, setDbReviews] = useState<Review[]>([]);

  // Hardcoded fallback testimonials
  const fallbackTestimonials = [
    { name: "Anna K.", location: "Moscow, Russia", text: t("testimonials.t1"), rating: 5 },
    { name: "David L.", location: "Tel Aviv, Israel", text: t("testimonials.t2"), rating: 5 },
    { name: "Sarah M.", location: "London, UK", text: t("testimonials.t3"), rating: 5 },
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await (supabase
        .from("reviews")
        .select("id, reviewer_name, rating, comment, created_at, translations")
        .eq("hidden", false) as any)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setDbReviews(data);
    };
    fetchReviews();
  }, []);

  // Combine: show DB reviews first, then fallbacks
  const currentLang = i18n.language?.split("-")[0] || "en";
  const allReviews = [
    ...dbReviews.map((r) => {
      const translated = r.translations?.[currentLang];
      return {
        name: translated?.reviewer_name || r.reviewer_name,
        location: "",
        text: translated?.comment || r.comment || "",
        rating: r.rating,
        fromDb: true,
      };
    }),
    ...fallbackTestimonials.map((f) => ({ ...f, fromDb: false })),
  ].filter((r) => r.text); // only show reviews with text

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
            {t("testimonials.label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("testimonials.title")}
          </h2>
          {dbReviews.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => {
                  const avg = dbReviews.reduce((a, r) => a + r.rating, 0) / dbReviews.length;
                  return (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${s <= Math.round(avg) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                    />
                  );
                })}
              </div>
              <span className="text-muted-foreground text-sm">
                {(dbReviews.reduce((a, r) => a + r.rating, 0) / dbReviews.length).toFixed(1)} ({dbReviews.length} reviews)
              </span>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {(showAll ? allReviews : allReviews.slice(0, 3)).map((item, i) => (
            <motion.div
              key={`${item.name}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-8 rounded-2xl bg-card shadow-card border border-border relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6 italic">
                "{item.text}"
              </p>
              <div>
                <p className="font-display font-semibold text-foreground">{item.name}</p>
                {item.location && (
                  <p className="text-sm text-muted-foreground">{item.location}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!showAll && allReviews.length > 3 && (
          <div className="text-center mt-12">
            <Link
              to="/testimonials"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {t("testimonials.viewAll", "View All Reviews")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;

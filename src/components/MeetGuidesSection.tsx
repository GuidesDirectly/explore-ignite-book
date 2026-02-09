import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Globe, Star, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GuideProfile {
  id: string;
  user_id: string;
  form_data: {
    firstName: string;
    lastName: string;
    biography: string;
    languages: string[];
    specializations: string[];
    tourTypes: string[];
    targetAudience: string[];
  };
}

const MeetGuidesSection = () => {
  const { t } = useTranslation();
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      const { data, error } = await supabase
        .from("guide_profiles")
        .select("id, user_id, form_data")
        .eq("status", "approved")
        .limit(6);

      if (!error && data) {
        setGuides(data as unknown as GuideProfile[]);
      }
      setLoading(false);
    };
    fetchGuides();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (guides.length === 0) return null;

  return (
    <section id="meet-guides" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-semibold">{t("guides.badge")}</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("guides.title")}{" "}
            <span className="text-gradient-gold">{t("guides.titleGold")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("guides.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, index) => {
            const fd = guide.form_data;
            const initials = `${fd.firstName?.[0] || ""}${fd.lastName?.[0] || ""}`;
            const shortBio = fd.biography?.length > 120
              ? fd.biography.slice(0, 120) + "…"
              : fd.biography;

            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Header with initials avatar */}
                <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-xl bg-primary text-secondary font-display font-bold text-xl flex items-center justify-center ring-4 ring-card shadow-lg">
                      {initials}
                    </div>
                  </div>
                </div>

                <div className="pt-12 px-6 pb-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">
                    {fd.firstName} {fd.lastName}
                  </h3>

                  {/* Languages */}
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                    <Globe className="w-3.5 h-3.5 text-primary/70" />
                    <span>{fd.languages?.join(", ")}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {shortBio}
                  </p>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1.5">
                    {fd.specializations?.slice(0, 3).map((spec) => (
                      <Badge
                        key={spec}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MeetGuidesSection;

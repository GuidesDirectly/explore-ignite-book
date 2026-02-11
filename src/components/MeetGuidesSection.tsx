import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Globe, Star, Filter, X, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GuideProfile {
  id: string;
  user_id: string;
  service_areas: string[];
  form_data: {
    firstName: string;
    lastName: string;
    biography: string;
    languages: string[];
    specializations: string[];
    tourTypes: string[];
    targetAudience: string[];
    insuranceCompanyName?: string;
    licenseNumber?: string;
    licensingAuthority?: string;
    certifications?: string[];
  };
  translations: Record<string, Record<string, string>> | null;
  reviewCount: number;
  avgRating: number;
  photoUrl: string | null;
}

interface ReviewStats {
  guide_user_id: string;
  count: number;
  avg: number;
}

const AREA_OPTIONS = ["Washington DC", "New York City", "Niagara Falls", "Toronto", "Boston", "Chicago"];

const MeetGuidesSection = () => {
  const { t, i18n } = useTranslation();
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterArea, setFilterArea] = useState<string>("");
  const [filterLanguage, setFilterLanguage] = useState<string>("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("");
  const [filterMinReviews, setFilterMinReviews] = useState<string>("");
  const [filterMinRating, setFilterMinRating] = useState<string>("");

  useEffect(() => {
    const fetchGuides = async () => {
      const { data: guideData, error } = await supabase
        .from("guide_profiles")
        .select("id, user_id, form_data, service_areas, translations")
        .eq("status", "approved");

      if (error || !guideData) {
        setLoading(false);
        return;
      }

      // Fetch review stats
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("guide_user_id, rating")
        .eq("hidden", false);

      const statsMap = new Map<string, { count: number; total: number }>();
      if (reviewData) {
        reviewData.forEach((r) => {
          const existing = statsMap.get(r.guide_user_id) || { count: 0, total: 0 };
          existing.count += 1;
          existing.total += r.rating;
          statsMap.set(r.guide_user_id, existing);
        });
      }

      const enriched: GuideProfile[] = guideData.map((g: any) => {
        const stats = statsMap.get(g.user_id);
        const { data: photoData } = supabase.storage
          .from("guide-photos")
          .getPublicUrl(`${g.user_id}/profile.jpg`);
        return {
          ...g,
          service_areas: g.service_areas || [],
          reviewCount: stats?.count || 0,
          avgRating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
          photoUrl: photoData?.publicUrl || null,
        };
      });

      setGuides(enriched);
      setLoading(false);
    };
    fetchGuides();
  }, []);

  // Derive unique filter options
  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    guides.forEach(g => g.form_data.languages?.forEach(l => langs.add(l)));
    return Array.from(langs).sort();
  }, [guides]);

  const allSpecialties = useMemo(() => {
    const specs = new Set<string>();
    guides.forEach(g => g.form_data.specializations?.forEach(s => specs.add(s)));
    return Array.from(specs).sort();
  }, [guides]);

  // Filtered guides
  const filteredGuides = useMemo(() => {
    return guides.filter(g => {
      if (filterArea && !g.service_areas?.includes(filterArea)) return false;
      if (filterLanguage && !g.form_data.languages?.includes(filterLanguage)) return false;
      if (filterSpecialty && !g.form_data.specializations?.includes(filterSpecialty)) return false;
      if (filterMinReviews && g.reviewCount < parseInt(filterMinReviews)) return false;
      if (filterMinRating && g.avgRating < parseFloat(filterMinRating)) return false;
      return true;
    });
  }, [guides, filterArea, filterLanguage, filterSpecialty, filterMinReviews, filterMinRating]);

  const activeFilterCount = [filterArea, filterLanguage, filterSpecialty, filterMinReviews, filterMinRating].filter(Boolean).length;

  const clearFilters = () => {
    setFilterArea("");
    setFilterLanguage("");
    setFilterSpecialty("");
    setFilterMinReviews("");
    setFilterMinRating("");
  };

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
          className="text-center mb-12"
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

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          {/* Toggle button for mobile */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/20 text-foreground hover:bg-primary/5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("guides.filters")}
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-primary text-secondary text-xs px-1.5 py-0">{activeFilterCount}</Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                <X className="w-3 h-3 mr-1" />
                {t("guides.clearFilters")}
              </Button>
            )}
          </div>

          {/* Filter controls */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Area filter */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {t("guides.filterArea")}
                  </label>
                  <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t("guides.allAreas")}</option>
                    {AREA_OPTIONS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* Language filter */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {t("guides.filterLanguage")}
                  </label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t("guides.allLanguages")}</option>
                    {allLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Specialty filter */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {t("guides.filterSpecialty")}
                  </label>
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t("guides.allSpecialties")}</option>
                    {allSpecialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Min reviews filter */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {t("guides.filterMinReviews")}
                  </label>
                  <select
                    value={filterMinReviews}
                    onChange={(e) => setFilterMinReviews(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t("guides.any")}</option>
                    <option value="1">1+</option>
                    <option value="3">3+</option>
                    <option value="5">5+</option>
                    <option value="10">10+</option>
                  </select>
                </div>

                {/* Min rating filter */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {t("guides.filterMinRating")}
                  </label>
                  <select
                    value={filterMinRating}
                    onChange={(e) => setFilterMinRating(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t("guides.any")}</option>
                    <option value="3">3+ ★</option>
                    <option value="3.5">3.5+ ★</option>
                    <option value="4">4+ ★</option>
                    <option value="4.5">4.5+ ★</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results count */}
        {activeFilterCount > 0 && (
          <p className="text-sm text-muted-foreground mb-6">
            {t("guides.showing", { count: filteredGuides.length, total: guides.length })}
          </p>
        )}

        {/* Guide cards */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">{t("guides.noResults")}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              {t("guides.clearFilters")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, index) => {
              const fd = guide.form_data;
              const currentLang = i18n.language?.split("-")[0] || "en";
              const translatedBio = guide.translations?.[currentLang]?.["form_data.biography"] || fd.biography;
              const initials = `${fd.firstName?.[0] || ""}${fd.lastName?.[0] || ""}`;
              const shortBio = translatedBio?.length > 120
                ? translatedBio.slice(0, 120) + "…"
                : translatedBio;

              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Header with photo or initials avatar */}
                  <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                    <div className="absolute -bottom-8 left-6">
                      {guide.photoUrl ? (
                        <img
                          src={guide.photoUrl}
                          alt={`${fd.firstName} ${fd.lastName}`}
                          className="w-16 h-16 rounded-xl object-cover ring-4 ring-card shadow-lg"
                          onError={(e) => {
                            // Fallback to initials on load error
                            const target = e.currentTarget;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 rounded-xl bg-primary text-secondary font-display font-bold text-xl flex items-center justify-center ring-4 ring-card shadow-lg ${guide.photoUrl ? "hidden" : ""}`}>
                        {initials}
                      </div>
                    </div>
                    {/* Area badge */}
                    {guide.service_areas?.length > 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm border-border/50">
                          <MapPin className="w-3 h-3 mr-1" />
                          {guide.service_areas[0]}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="pt-12 px-6 pb-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">
                      {fd.firstName} {fd.lastName}
                    </h3>

                    {/* Review stats */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Globe className="w-3.5 h-3.5 text-primary/70" />
                        <span>{fd.languages?.join(", ")}</span>
                      </div>
                    </div>

                    {/* Rating & reviews */}
                    {guide.reviewCount > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span className="text-sm font-semibold text-foreground">{guide.avgRating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({guide.reviewCount} {guide.reviewCount === 1 ? t("guides.review") : t("guides.reviews")})
                        </span>
                      </div>
                    )}

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

                    {/* Credentials badges */}
                    {(fd.insuranceCompanyName || fd.licenseNumber) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
                        {fd.insuranceCompanyName && (
                          <Badge variant="outline" className="text-xs gap-1 border-green-500/30 text-green-400 bg-green-500/10">
                            <ShieldCheck className="w-3 h-3" /> {t("guides.insured")}
                          </Badge>
                        )}
                        {fd.licenseNumber && (
                          <Badge variant="outline" className="text-xs gap-1 border-blue-500/30 text-blue-400 bg-blue-500/10">
                            <CheckCircle2 className="w-3 h-3" /> {t("guides.licensed")}
                          </Badge>
                        )}
                        {fd.certifications && fd.certifications.length > 0 && (
                          <Badge variant="outline" className="text-xs gap-1 border-purple-500/30 text-purple-400 bg-purple-500/10">
                            {t(fd.certifications.length > 1 ? "guides.certs_plural" : "guides.certs", { count: fd.certifications.length })}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MeetGuidesSection;

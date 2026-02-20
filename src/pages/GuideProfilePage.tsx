import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { translateOption, translateOptions } from "@/lib/translationHelpers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Globe, Star, ShieldCheck, CheckCircle2,
  ArrowLeft, Mail, Clock, Users, Camera, Mountain
} from "lucide-react";
import { motion } from "framer-motion";

interface GuideData {
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
}

interface ReviewData {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  translations: Record<string, Record<string, string>> | null;
}

const GuideProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;

      const { data, error } = await (supabase
        .from("guide_profiles_public" as any)
        .select("id, user_id, form_data, service_areas, translations")
        .eq("id", id)
        .single() as any);

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setGuide(data);

      // Photo
      const { data: photoData } = supabase.storage
        .from("guide-photos")
        .getPublicUrl(`${data.user_id}/profile.jpg`);
      setPhotoUrl(photoData?.publicUrl || null);

      // Reviews
      const { data: reviewData } = await (supabase
        .from("reviews_public" as any)
        .select("id, reviewer_name, rating, comment, created_at, translations")
        .eq("guide_user_id", data.user_id)
        .eq("hidden", false)
        .order("created_at", { ascending: false }) as any);

      setReviews(reviewData || []);
      setLoading(false);
    };

    fetchGuide();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            {t("guideProfile.notFound", "Guide not found")}
          </h1>
          <Button variant="outline" asChild>
            <Link to="/home#meet-guides">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("guideProfile.backToGuides", "Back to Guides")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const fd = guide.form_data;
  const currentLang = i18n.language?.split("-")[0] || "en";
  const translatedBio = guide.translations?.[currentLang]?.["form_data.biography"] || fd.biography;
  const initials = `${fd.firstName?.[0] || ""}${fd.lastName?.[0] || ""}`;
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/home#meet-guides"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("guideProfile.backToGuides", "Back to Guides")}
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column — Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden sticky top-24">
              {/* Header gradient */}
              <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                <div className="absolute -bottom-10 left-6">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={`${fd.firstName} ${fd.lastName}`}
                      className="w-20 h-20 rounded-xl object-cover ring-4 ring-card shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`w-20 h-20 rounded-xl bg-primary text-secondary font-display font-bold text-2xl flex items-center justify-center ring-4 ring-card shadow-lg ${photoUrl ? "hidden" : ""}`}>
                    {initials}
                  </div>
                </div>
              </div>

              <div className="pt-14 px-6 pb-6 space-y-4">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {fd.firstName} {fd.lastName}
                </h1>

                {/* Rating */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="font-semibold text-foreground">{avgRating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({reviews.length} {reviews.length === 1 ? t("guides.review") : t("guides.reviews")})
                    </span>
                  </div>
                )}

                {/* Service areas */}
                {guide.service_areas?.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
                    <span>{guide.service_areas.map(a => translateOption(t, a)).join(", ")}</span>
                  </div>
                )}

                {/* Languages */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4 text-primary/70 flex-shrink-0" />
                  <span>{translateOptions(t, fd.languages || []).join(", ")}</span>
                </div>

                {/* Credentials */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                  {fd.insuranceCompanyName && (
                    <Badge variant="outline" className="text-xs gap-1 border-green-500/30 text-green-600 bg-green-500/10">
                      <ShieldCheck className="w-3 h-3" /> {t("guides.insured")}
                    </Badge>
                  )}
                  {fd.licenseNumber && (
                    <Badge variant="outline" className="text-xs gap-1 border-blue-500/30 text-blue-600 bg-blue-500/10">
                      <CheckCircle2 className="w-3 h-3" /> {t("guides.licensed")}
                    </Badge>
                  )}
                  {fd.certifications && fd.certifications.length > 0 && (
                    <Badge variant="outline" className="text-xs gap-1 border-purple-500/30 text-purple-600 bg-purple-500/10">
                      {t(fd.certifications.length > 1 ? "guides.certs_plural" : "guides.certs", { count: fd.certifications.length })}
                    </Badge>
                  )}
                </div>

                {/* CTA */}
                <Button variant="hero" className="w-full" asChild>
                  <a href="#contact-section">
                    <Mail className="w-4 h-4 mr-2" />
                    {t("guideProfile.requestTour", "Request a Tour")}
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Right column — Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Bio */}
            <section className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                {t("guideProfile.about", "About")}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {translatedBio}
              </p>
            </section>

            {/* Specializations */}
            {fd.specializations?.length > 0 && (
              <section className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  <Mountain className="w-5 h-5 inline mr-2 text-primary" />
                  {t("guideProfile.specializations", "Specializations")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {fd.specializations.map((spec) => (
                    <Badge key={spec} className="bg-primary/10 text-primary border-primary/20 text-sm py-1 px-3">
                      {translateOption(t, spec)}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Tour types */}
            {fd.tourTypes?.length > 0 && (
              <section className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  <Camera className="w-5 h-5 inline mr-2 text-primary" />
                  {t("guideProfile.tourTypes", "Tour Types")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {fd.tourTypes.map((tt) => (
                    <Badge key={tt} variant="secondary" className="text-sm py-1 px-3">
                      {translateOption(t, tt)}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Target audience */}
            {fd.targetAudience?.length > 0 && (
              <section className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  <Users className="w-5 h-5 inline mr-2 text-primary" />
                  {t("guideProfile.idealFor", "Ideal For")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {fd.targetAudience.map((aud) => (
                    <Badge key={aud} variant="outline" className="text-sm py-1 px-3">
                      {aud}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                <Star className="w-5 h-5 inline mr-2 text-primary" />
                {t("guideProfile.reviews", "Reviews")}
                {reviews.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({reviews.length})
                  </span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("guideProfile.noReviews", "No reviews yet.")}
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const translatedComment = review.translations?.[currentLang]?.["comment"] || review.comment;
                    return (
                      <div key={review.id} className="border-b border-border/30 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? "text-primary fill-primary" : "text-muted/30"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-foreground">{review.reviewer_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {translatedComment && (
                          <p className="text-sm text-muted-foreground">{translatedComment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Leave a review link */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/review?guide=${guide.user_id}`}>
                    {t("guideProfile.leaveReview", "Leave a Review")}
                  </Link>
                </Button>
              </div>
            </section>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GuideProfilePage;

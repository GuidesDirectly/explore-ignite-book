import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { generateGuideSlug, isUUID } from "@/lib/utils";
import { translateOption, translateOptions } from "@/lib/translationHelpers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuideContactForm from "@/components/GuideContactForm";
import BookingRequestForm from "@/components/BookingRequestForm";
import GuideGallery from "@/components/GuideGallery";
import GuideAvailabilityCalendar from "@/components/GuideAvailabilityCalendar";
import { Badge } from "@/components/ui/badge";
import GuideBadge, { getHighestBadge, type BadgeType } from "@/components/GuideBadge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Globe, Star, ShieldCheck, CheckCircle2,
  ArrowLeft, Users, Camera, Mountain,
  MessageCircle, Share2, PlayCircle, Link as LinkIcon
} from "lucide-react";
import SaveGuideButton from "@/components/SaveGuideButton";
import { useSavedGuides } from "@/hooks/useSavedGuides";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
    videoUrl?: string;
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
  const { toast } = useToast();
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const { savedIds, toggleSave, loading: saveLoading } = useSavedGuides();
  const [bioExpanded, setBioExpanded] = useState(false);

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

      const { data: photoFiles } = await supabase.storage
        .from("guide-photos")
        .list(data.user_id, { limit: 10 });
      const profileFile = photoFiles?.find(f => f.name.startsWith("profile"));
      if (profileFile) {
        const { data: photoData } = supabase.storage
          .from("guide-photos")
          .getPublicUrl(`${data.user_id}/${profileFile.name}`);
        setPhotoUrl(photoData?.publicUrl || null);
      }

      const { data: reviewData } = await (supabase
        .from("reviews_public" as any)
        .select("id, reviewer_name, rating, comment, created_at, translations")
        .eq("guide_user_id", data.user_id)
        .eq("hidden", false)
        .order("created_at", { ascending: false }) as any);

      setReviews(reviewData || []);

      const { data: badgeData } = await supabase
        .from("guide_badges" as any)
        .select("badge_type")
        .eq("guide_user_id", data.user_id);
      setBadges((badgeData as any[] || []).map((b: any) => b.badge_type as BadgeType));

      const { data: availData } = await supabase
        .from("guide_availability" as any)
        .select("date, status")
        .eq("guide_user_id", data.user_id)
        .eq("status", "available")
        .gte("date", format(new Date(), "yyyy-MM-dd"));

      setAvailableDates(
        (availData as any[] || []).map((e: any) => new Date(e.date + "T00:00:00"))
      );

      setLoading(false);
    };

    fetchGuide();
  }, [id]);

  // Dynamic SEO meta tags & JSON-LD
  useEffect(() => {
    if (!guide) return;
    const fd = guide.form_data;
    const name = `${fd.firstName} ${fd.lastName}`;
    const areas = (guide.service_areas || []).join(", ");
    const specs = (fd.specializations || []).join(", ");
    const bio = fd.biography || "";
    const shortBio = bio.length > 150 ? bio.slice(0, 147) + "…" : bio;

    const title = `${name} — Local Guide in ${areas || "Your City"} | Guides Directly`;
    const description = shortBio || `Book ${name} for private tours in ${areas}. ${specs ? `Specializes in ${specs}.` : ""} Zero commissions, direct booking.`;
    const pageUrl = `https://explore-ignite-book.lovable.app/guide/${guide.id}`;
    const imageUrl = photoUrl || "https://explore-ignite-book.lovable.app/og-image.jpg";

    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "profile");
    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);

    const jsonLdId = "guide-profile-jsonld";
    let script = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = jsonLdId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TouristGuide",
      "name": name,
      "description": shortBio,
      "url": pageUrl,
      "image": imageUrl,
      "knowsLanguage": fd.languages || [],
      "areaServed": (guide.service_areas || []).map(a => ({ "@type": "City", "name": a })),
      ...(reviews.length > 0 && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10,
          "reviewCount": reviews.length,
          "bestRating": 5,
          "worstRating": 1
        }
      })
    });

    return () => {
      document.title = "iGuide Tours — Premium Local Tour Guides in USA & Canada";
      const ldScript = document.getElementById(jsonLdId);
      if (ldScript) ldScript.remove();
    };
  }, [guide, photoUrl, reviews]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${guide?.form_data.firstName} — Guides Directly`,
          text: "I found an amazing local guide on Guides Directly — no commission, direct contact.",
          url: window.location.href
        });
      } catch {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#0A1628" }}>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-48" style={{ background: "#1A2F50" }} />
            <div className="h-64 rounded-2xl" style={{ background: "#1A2F50" }} />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !guide) {
    return (
      <div className="min-h-screen" style={{ background: "#0A1628" }}>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-3xl font-display font-bold mb-4" style={{ color: "#F5F0E8" }}>
            {t("guideProfile.notFound", "Guide not found")}
          </h1>
          <Button variant="outline" asChild>
            <Link to="/guides">
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

  const credentialLine = fd.firstName === "Michael"
    ? "Founder & President, iGuide Tours"
    : fd.firstName === "Mike"
      ? "President, Chicago Tour-Guide Professionals Association (CTPA)"
      : null;

  return (
    <div className="min-h-screen" style={{ background: "#0A1628" }}>
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-sm transition-colors mb-8"
            style={{ color: "rgba(255,255,255,0.65)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#F5F0E8")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
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
            <div
              className="rounded-xl overflow-hidden sticky top-24"
              style={{
                background: "#1A2F50",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            >
              {/* Header gradient */}
              <div className="relative h-32" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(26,47,80,0.8))" }}>
                {guide && (
                  <div className="absolute top-3 right-3 z-10">
                    <SaveGuideButton
                      isSaved={savedIds.has(guide.id)}
                      onToggle={() => toggleSave(guide.id)}
                      loading={saveLoading}
                      size="md"
                    />
                  </div>
                )}
                <div className="absolute -bottom-10 left-6">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={`${fd.firstName} ${fd.lastName}`}
                      className="w-20 h-20 rounded-xl object-cover shadow-lg"
                      style={{ boxShadow: "0 0 0 4px #1A2F50, 0 4px 12px rgba(0,0,0,0.3)" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-20 h-20 rounded-xl font-display font-bold text-2xl flex items-center justify-center shadow-lg ${photoUrl ? "hidden" : ""}`}
                    style={{
                      background: "#C9A84C",
                      color: "#0A1628",
                      boxShadow: "0 0 0 4px #1A2F50, 0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    {initials}
                  </div>
                </div>
              </div>

              <div className="pt-14 px-6 pb-6 space-y-4">
                <h1 className="font-display text-2xl font-bold" style={{ color: "#F5F0E8" }}>
                  {fd.firstName} {fd.lastName}
                </h1>

                {/* Credential line */}
                {credentialLine && (
                  <p style={{ fontSize: "13px", color: "#C9A84C", margin: "4px 0" }}>
                    {credentialLine}
                  </p>
                )}

                {/* Verification badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <GuideBadge type={getHighestBadge(badges)!} size="md" />
                    {badges
                      .filter((b) => b !== getHighestBadge(badges))
                      .map((b) => (
                        <GuideBadge key={b} type={b} size="sm" />
                      ))}
                  </div>
                )}

                {/* Rating */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" style={{ color: "#C9A84C", fill: "#C9A84C" }} />
                    <span className="font-semibold" style={{ color: "#F5F0E8" }}>{avgRating}</span>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                      ({reviews.length} {reviews.length === 1 ? t("guides.review") : t("guides.reviews")})
                    </span>
                  </div>
                )}

                {/* Service areas */}
                {guide.service_areas?.length > 0 && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(201,168,76,0.7)" }} />
                    <span>{guide.service_areas.map(a => translateOption(t, a)).join(", ")}</span>
                  </div>
                )}

                {/* Languages */}
                <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                  <Globe className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(201,168,76,0.7)" }} />
                  <span>{translateOptions(t, fd.languages || []).join(", ")}</span>
                </div>

                {/* Credentials */}
                <div className="flex flex-wrap gap-1.5 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                  {fd.insuranceCompanyName && (
                    <Badge variant="outline" className="text-xs gap-1" style={{ borderColor: "rgba(45,106,79,0.4)", color: "#52b788", background: "rgba(45,106,79,0.15)" }}>
                      <ShieldCheck className="w-3 h-3" /> {t("guides.insured")}
                    </Badge>
                  )}
                  {fd.licenseNumber && (
                    <Badge variant="outline" className="text-xs gap-1" style={{ borderColor: "rgba(59,130,246,0.4)", color: "#60a5fa", background: "rgba(59,130,246,0.15)" }}>
                      <CheckCircle2 className="w-3 h-3" /> {t("guides.licensed")}
                    </Badge>
                  )}
                  {fd.certifications && fd.certifications.length > 0 && (
                    <Badge variant="outline" className="text-xs gap-1" style={{ borderColor: "rgba(168,85,247,0.4)", color: "#c084fc", background: "rgba(168,85,247,0.15)" }}>
                      {t(fd.certifications.length > 1 ? "guides.certs_plural" : "guides.certs", { count: fd.certifications.length })}
                    </Badge>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={() => document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "#C9A84C",
                      color: "#0A1628",
                      fontSize: "15px",
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message {fd.firstName}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "transparent",
                      color: "#C9A84C",
                      border: "1.5px solid #C9A84C",
                      fontSize: "15px",
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share This Guide
                  </button>
                </div>
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
            <section
              className="rounded-xl p-6"
              style={{ background: "#1A2F50", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <h2 className="font-display text-xl font-bold mb-4" style={{ color: "#F5F0E8" }}>
                {t("guideProfile.about", "About")}
              </h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.65)" }}>
                {translatedBio.length > 200 && !bioExpanded
                  ? translatedBio.slice(0, 200) + "..."
                  : translatedBio}
              </p>
              {translatedBio.length > 200 && (
                <span
                  onClick={() => setBioExpanded(!bioExpanded)}
                  style={{ color: "#C9A84C", fontSize: "13px", cursor: "pointer" }}
                  className="inline-block mt-2 hover:underline"
                >
                  {bioExpanded ? "Show less" : "Read more"}
                </span>
              )}
            </section>

            {/* Watch & Learn — Video section */}
            <section
              className="rounded-xl p-6"
              style={{ background: "#1A2F50", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F0E8" }}>
                <PlayCircle className="w-5 h-5" style={{ color: "#C9A84C" }} />
                Watch &amp; Learn
              </h2>
              {fd.videoUrl ? (
                <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                  <iframe
                    src={fd.videoUrl}
                    className="absolute inset-0 w-full h-full rounded-xl"
                    style={{ border: "none" }}
                    allowFullScreen
                    title={`${fd.firstName}'s introduction video`}
                  />
                </div>
              ) : (
                <div
                  className="w-full flex flex-col items-center justify-center rounded-xl"
                  style={{
                    height: "200px",
                    background: "#0A1628",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                >
                  <PlayCircle className="mb-3" style={{ width: 48, height: 48, color: "rgba(201,168,76,0.4)" }} />
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Video coming soon</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                    Check back to see {fd.firstName}'s introduction video
                  </p>
                </div>
              )}
            </section>

            {/* Specializations */}
            {fd.specializations?.length > 0 && (
              <section
                className="rounded-xl p-6"
                style={{ background: "#1A2F50", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F0E8" }}>
                  <Mountain className="w-5 h-5" style={{ color: "#C9A84C" }} />
                  {t("guideProfile.specializations", "Specializations")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {fd.specializations.map((spec) => (
                    <Badge
                      key={spec}
                      className="text-sm py-1 px-3"
                      style={{
                        background: "rgba(201,168,76,0.1)",
                        color: "#C9A84C",
                        borderColor: "rgba(201,168,76,0.2)",
                      }}
                    >
                      {translateOption(t, spec)}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Tour types */}
            {fd.tourTypes?.length > 0 && (
              <section
                className="rounded-xl p-6"
                style={{ background: "#1A2F50", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F0E8" }}>
                  <Camera className="w-5 h-5" style={{ color: "#C9A84C" }} />
                  {t("guideProfile.tourTypes", "Tour Types")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {fd.tourTypes.map((tt) => (
                    <Badge
                      key={tt}
                      variant="secondary"
                      className="text-sm py-1 px-3"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.75)",
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      {translateOption(t, tt)}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Target audience */}
            {fd.targetAudience?.length > 0 && (
              <section
                className="rounded-xl p-6"
                style={{ background: "#1A2F50", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F0E8" }}>
                  <Users className="w-5 h-5" style={{ color: "#C9A84C" }} />
                  {t("guideProfile.idealFor", "Ideal For")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {fd.targetAudience.map((aud) => (
                    <Badge
                      key={aud}
                      variant="outline"
                      className="text-sm py-1 px-3"
                      style={{
                        borderColor: "rgba(201,168,76,0.2)",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {aud}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Availability calendar */}
            <GuideAvailabilityCalendar guideUserId={guide.user_id} />

            {/* Photo gallery */}
            <GuideGallery guideUserId={guide.user_id} />

            {/* Reviews */}
            <section
              className="rounded-xl p-6"
              style={{ background: "#1A2F50", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F0E8" }}>
                <Star className="w-5 h-5" style={{ color: "#C9A84C" }} />
                {t("guideProfile.reviews", "Reviews")}
                {reviews.length > 0 && (
                  <span className="text-sm font-normal ml-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    ({reviews.length})
                  </span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {t("guideProfile.noReviews", "No reviews yet.")}
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const translatedComment = review.translations?.[currentLang]?.["comment"] || review.comment;
                    return (
                      <div
                        key={review.id}
                        className="last:border-0 pb-4 last:pb-0"
                        style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5"
                                style={{
                                  color: i < review.rating ? "#C9A84C" : "rgba(255,255,255,0.15)",
                                  fill: i < review.rating ? "#C9A84C" : "none",
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: "#F5F0E8" }}>{review.reviewer_name}</span>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {translatedComment && (
                          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{translatedComment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Leave a review link */}
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/review?guide=${guide.user_id}`}>
                    {t("guideProfile.leaveReview", "Leave a Review")}
                  </Link>
                </Button>
              </div>
            </section>

            {/* Booking request form */}
            <BookingRequestForm
              guideUserId={guide.user_id}
              guideName={`${fd.firstName} ${fd.lastName}`}
              tourTypes={fd.tourTypes || []}
              serviceAreas={guide.service_areas || []}
              availableDates={availableDates}
            />

            {/* Social sharing strip */}
            <div
              className="flex items-center gap-3 flex-wrap rounded-xl"
              style={{
                background: "rgba(201,168,76,0.04)",
                border: "1px solid rgba(201,168,76,0.1)",
                padding: "16px 20px",
              }}
            >
              <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
                Share {fd.firstName}'s profile:
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this amazing local guide on Guides Directly: ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  background: "rgba(37,211,102,0.1)",
                  border: "1px solid rgba(37,211,102,0.3)",
                  color: "#25D366",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  background: "rgba(24,119,242,0.1)",
                  border: "1px solid rgba(24,119,242,0.3)",
                  color: "#1877F2",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <Share2 className="w-4 h-4" />
                Facebook
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#C9A84C",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <LinkIcon className="w-4 h-4" />
                Copy Link
              </button>
            </div>

            {/* Contact form */}
            <div id="contact-section">
              <h2 className="font-display text-xl font-bold mb-4" style={{ color: "#F5F0E8" }}>
                Send {fd.firstName} a Message
              </h2>
              <GuideContactForm
                guideName={`${fd.firstName} ${fd.lastName}`}
                guideUserId={guide.user_id}
                serviceAreas={guide.service_areas || []}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GuideProfilePage;

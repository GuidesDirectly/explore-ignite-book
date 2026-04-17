import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Globe,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  MessageCircle,
  Camera,
  CheckCircle2,
  Share2,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import SaveGuideButton from "@/components/SaveGuideButton";
import FoundingGuideBadge from "@/components/FoundingGuideBadge";
import SpotlightBanner from "@/components/SpotlightBanner";
import { useFoundingProgram } from "@/hooks/useFoundingProgram";

interface GuideData {
  id: string;
  user_id: string;
  form_data: any;
  service_areas: string[];
  translations: any;
  is_spotlight?: boolean | null;
  subscription_plan_id?: string | null;
}

interface TourData {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  country: string | null;
  category: string | null;
  duration_value: number;
  duration_unit: string;
  min_group_size: number;
  max_group_size: number;
  meeting_point: string | null;
  detailed_itinerary: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  what_to_bring: string[];
  photos: string[];
  cover_image_url: string | null;
  languages: string[];
  price_per_person: number;
  currency: string;
  guide_user_id: string;
  difficulty_level: number;
  cancellation_policy: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const TourDetail = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const [searchParams] = useSearchParams();

  const [tour, setTour] = useState<TourData | null>(null);
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const { data: foundingProgram } = useFoundingProgram();
  const isFounding =
    !!guide?.subscription_plan_id &&
    !!foundingProgram?.foundingPlanId &&
    guide.subscription_plan_id === foundingProgram.foundingPlanId;

  useEffect(() => {
    const fetchData = async () => {
      if (!guideId) return;
      setLoading(true);

      // Try as a tour ID first
      const { data: tourRow } = await supabase
        .from("tours")
        .select("*")
        .eq("id", guideId)
        .eq("status", "published")
        .maybeSingle();

      let resolvedGuideUserId = guideId;
      let resolvedTour: TourData | null = null;

      if (tourRow) {
        resolvedTour = tourRow as any as TourData;
        resolvedGuideUserId = tourRow.guide_user_id;
        setTour(resolvedTour);
        // fire-and-forget atomic view increment
        supabase.rpc("increment_tour_view", { _tour_id: tourRow.id });
      }

      // Fetch guide profile via public view
      const { data: guideData } = await supabase
        .from("guide_profiles_public")
        .select("*")
        .eq("user_id", resolvedGuideUserId)
        .maybeSingle();

      if (!guideData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setGuide(guideData as any);

      // Photos: prefer the tour's photos[]; fallback to storage listing
      if (resolvedTour?.photos && resolvedTour.photos.length > 0) {
        setPhotos(resolvedTour.photos);
      } else if (resolvedTour?.cover_image_url) {
        setPhotos([resolvedTour.cover_image_url]);
      } else {
        const { data: files } = await supabase.storage
          .from("guide-photos")
          .list(resolvedGuideUserId, { limit: 20 });
        if (files && files.length > 0) {
          const urls = files
            .map((f) => {
              const { data } = supabase.storage
                .from("guide-photos")
                .getPublicUrl(`${resolvedGuideUserId}/${f.name}`);
              return data?.publicUrl || "";
            })
            .filter(Boolean);
          setPhotos(urls);
        }
      }

      // Reviews
      const { data: reviewData } = await supabase
        .from("reviews_public")
        .select("id, reviewer_name, rating, comment, created_at")
        .eq("guide_user_id", resolvedGuideUserId)
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (reviewData) setReviews(reviewData as any);

      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideId]);

  const fd = guide?.form_data || {};
  const guideName = `${fd.firstName || "Guide"} ${fd.lastName || ""}`.trim();
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const displayTitle =
    tour?.title ||
    `${searchParams.get("type") || "Walking Tour"} in ${tour?.city || guide?.service_areas?.[0] || searchParams.get("city") || "Washington DC"}`;
  const displayCity = tour?.city || guide?.service_areas?.[0] || searchParams.get("city") || "";
  const tourLanguages =
    (tour?.languages && tour.languages.length > 0 ? tour.languages : fd.languages) || ["English"];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: displayTitle, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleContactClick = () => {
    if (tour?.id) {
      supabase.rpc("increment_tour_inquiry", { _tour_id: tour.id });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 h-96 rounded-2xl bg-muted animate-pulse" />
            <div className="h-96 rounded-2xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Tour Not Found</h1>
          <p className="text-muted-foreground mb-6">This tour may no longer be available.</p>
          <Button asChild>
            <Link to="/guides">Browse All Guides</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const nextPhoto = () =>
    setSelectedPhoto((p) => (photos.length ? (p + 1) % photos.length : 0));
  const prevPhoto = () =>
    setSelectedPhoto((p) => (photos.length ? (p - 1 + photos.length) % photos.length : 0));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/guides" className="hover:text-primary transition-colors">Guides</Link>
            <ChevronRight className="w-3 h-3" />
            {displayCity && (
              <>
                <span className="text-foreground">{displayCity}</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-foreground font-medium line-clamp-1">{displayTitle}</span>
          </nav>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Gallery & Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery (swipeable on mobile via simple prev/next) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[16/9]">
                  {photos.length > 0 ? (
                    <>
                      <img
                        src={photos[selectedPhoto]}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                      />
                      {photos.length > 1 && (
                        <>
                          <button
                            onClick={prevPhoto}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur"
                            aria-label="Previous photo"
                          >
                            <ChevronLeftIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={nextPhoto}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur"
                            aria-label="Next photo"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded-full">
                            {selectedPhoto + 1} / {photos.length}
                          </div>
                        </>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {isFounding && <FoundingGuideBadge size="sm" />}
                        {guide.is_spotlight && <SpotlightBanner size="sm" />}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Camera className="w-16 h-16 text-primary/20" />
                    </div>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {photos.slice(0, 8).map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto(i)}
                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedPhoto === i ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Title + meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    {tour?.category && (
                      <Badge variant="secondary" className="mb-2 capitalize">
                        {tour.category} Tour
                      </Badge>
                    )}
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                      {displayTitle}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <SaveGuideButton guideProfileId={guide.id} variant="ghost" size="sm" />
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-1" /> Share
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mb-6 mt-3">
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">{avgRating}</span>
                      <span className="text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                  )}
                  {displayCity && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {displayCity}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="w-4 h-4" /> {tourLanguages.join(", ")}
                  </span>
                  {tour && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" /> {tour.duration_value} {tour.duration_unit}
                    </span>
                  )}
                  {tour && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-4 h-4" /> {tour.min_group_size}–{tour.max_group_size} guests
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="space-y-4"
              >
                <h2 className="font-display text-xl font-bold text-foreground">About This Tour</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tour?.description ||
                    fd.biography ||
                    "Experience the best of the city with a knowledgeable, licensed local guide."}
                </p>

                {tour?.highlights && tour.highlights.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                      Highlights
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tour.highlights.map((h) => (
                        <Badge key={h} variant="secondary" className="text-sm">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Itinerary */}
              {tour?.detailed_itinerary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-3">Itinerary</h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {tour.detailed_itinerary}
                  </p>
                </motion.div>
              )}

              {/* Inclusions / Exclusions */}
              {tour && (tour.inclusions?.length > 0 || tour.exclusions?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.inclusions?.length > 0 && (
                    <div className="bg-card rounded-xl border border-border/50 p-5">
                      <h3 className="font-semibold mb-3 text-foreground">What's Included</h3>
                      <ul className="space-y-2">
                        {tour.inclusions.map((i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.exclusions?.length > 0 && (
                    <div className="bg-card rounded-xl border border-border/50 p-5">
                      <h3 className="font-semibold mb-3 text-foreground">Not Included</h3>
                      <ul className="space-y-2">
                        {tour.exclusions.map((e) => (
                          <li key={e} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground">×</span>
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* What to bring */}
              {tour?.what_to_bring && tour.what_to_bring.length > 0 && (
                <div className="bg-card rounded-xl border border-border/50 p-5">
                  <h3 className="font-semibold mb-3 text-foreground">What to Bring</h3>
                  <div className="flex flex-wrap gap-2">
                    {tour.what_to_bring.map((b) => (
                      <Badge key={b} variant="outline">{b}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting point */}
              {tour?.meeting_point && (
                <div className="bg-card rounded-xl border border-border/50 p-5">
                  <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Meeting Point
                  </h3>
                  <p className="text-muted-foreground text-sm">{tour.meeting_point}</p>
                </div>
              )}

              {/* Guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-card rounded-2xl border border-border/50 p-6"
              >
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Your Guide</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">
                    {(fd.firstName || "G").charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                      {guideName}
                      {isFounding && <FoundingGuideBadge size="sm" />}
                      {guide.is_spotlight && <SpotlightBanner size="sm" />}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tourLanguages.join(" · ")} • {displayCity}
                    </p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Licensed & Verified Guide</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link to={`/guide/${guide.id}`}>View Full Profile</Link>
                </Button>
              </motion.div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Reviews ({reviews.length})
                  </h2>
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="bg-card rounded-xl border border-border/50 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground text-sm">{review.reviewer_name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.round(review.rating / 2)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="sticky top-24"
              >
                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-card space-y-5">
                  {/* Pricing — intentionally "Contact for pricing" */}
                  <div className="pb-2 border-b border-border/50">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Pricing
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      Contact for pricing
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No middlemen, no markups — direct from your guide.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground line-clamp-2">
                      {displayTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      with {guideName}
                    </p>
                  </div>

                  {avgRating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{avgRating}</span>
                      <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    {tour && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          Duration: {tour.duration_value} {tour.duration_unit}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>
                        {tour
                          ? `Group size ${tour.min_group_size}–${tour.max_group_size}`
                          : "Private & group tours available"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>{tourLanguages.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Licensed & Insured</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <Button variant="hero" size="lg" className="w-full" asChild>
                      <Link
                        to={`/guide/${guide.id}`}
                        onClick={handleContactClick}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact for Pricing
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Direct contact — no middleman</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Verified & insured guide</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Custom itinerary on request</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default TourDetail;

import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Globe,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  MessageCircle,
  CalendarCheck,
  Camera,
  CheckCircle2,
} from "lucide-react";

interface GuideData {
  id: string;
  user_id: string;
  form_data: any;
  service_areas: string[];
  translations: any;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const SAMPLE_ITINERARY = [
  { time: "Meeting Point", description: "Meet at the designated location. Your guide will have a sign with your name." },
  { time: "First Stop", description: "Begin with the most iconic landmarks and hidden gems of the area." },
  { time: "Mid-Tour", description: "Explore local culture, history, and architecture with expert commentary." },
  { time: "Break", description: "Optional stop for refreshments at a local favorite spot." },
  { time: "Final Stops", description: "Visit remaining highlights and enjoy photo opportunities." },
  { time: "Wrap Up", description: "Return to starting point. Get personalized recommendations for the rest of your stay." },
];

const TourDetail = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const [searchParams] = useSearchParams();
  const tourType = searchParams.get("type") || "Walking Tour";
  const city = searchParams.get("city") || "Washington DC";

  const [guide, setGuide] = useState<GuideData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [tourPrice, setTourPrice] = useState<number | null>(null);
  const [tourCurrency, setTourCurrency] = useState("USD");

  useEffect(() => {
    const fetchData = async () => {
      if (!guideId) return;

      // Fetch guide profile
      const { data: guideData } = await (supabase
        .from("guide_profiles_public" as any)
        .select("*")
        .eq("user_id", guideId)
        .maybeSingle() as any);

      if (guideData) setGuide(guideData);

      // Fetch reviews
      const { data: reviewData } = await (supabase
        .from("reviews_public" as any)
        .select("id, reviewer_name, rating, comment, created_at")
        .eq("guide_user_id", guideId)
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(10) as any);

      if (reviewData) setReviews(reviewData);

      // Fetch tour price
      const { data: priceData } = await supabase
        .from("tours")
        .select("price_per_person, currency")
        .eq("guide_user_id", guideId)
        .eq("status", "published")
        .limit(1)
        .maybeSingle();

      if (priceData) {
        setTourPrice(Number(priceData.price_per_person) || null);
        setTourCurrency(priceData.currency || "USD");
      }

      // Fetch guide photos
      const { data: files } = await supabase.storage
        .from("guide-photos")
        .list(guideId, { limit: 20 });

      if (files && files.length > 0) {
        const urls = files.map((f) => {
          const { data } = supabase.storage
            .from("guide-photos")
            .getPublicUrl(`${guideId}/${f.name}`);
          return data?.publicUrl || "";
        }).filter(Boolean);
        setPhotos(urls);
      }

      setLoading(false);
    };
    fetchData();
  }, [guideId]);

  const fd = guide?.form_data || {};
  const guideName = `${fd.firstName || "Guide"} ${fd.lastName || ""}`.trim();
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

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

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Tour Not Found</h1>
          <p className="text-muted-foreground mb-6">This tour may no longer be available.</p>
          <Button asChild>
            <Link to="/tours">Browse All Tours</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/tours" className="hover:text-primary transition-colors">Tours</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/tours?city=${encodeURIComponent(city)}`} className="hover:text-primary transition-colors">{city}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{tourType}</span>
          </nav>
        </div>

        {/* Gallery + Booking Panel */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Gallery & Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[16/9]">
                  {photos.length > 0 ? (
                    <img
                      src={photos[selectedPhoto]}
                      alt={`${tourType} in ${city}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Camera className="w-16 h-16 text-primary/20" />
                    </div>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {photos.slice(0, 6).map((url, i) => (
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

              {/* Title & Meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {tourType} in {city}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">{avgRating}</span>
                      <span className="text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {city}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="w-4 h-4" /> {(fd.languages || ["English"]).join(", ")}
                  </span>
                </div>
              </motion.div>

              {/* Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="space-y-4"
              >
                <h2 className="font-display text-xl font-bold text-foreground">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {fd.biography || "Experience the best of the city with a knowledgeable, licensed local guide. This tour is designed to give you an authentic, memorable experience tailored to your interests."}
                </p>

                {/* Highlights */}
                {fd.specializations && fd.specializations.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {fd.specializations.map((spec: string) => (
                        <Badge key={spec} variant="secondary" className="text-sm">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Itinerary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="font-display text-xl font-bold text-foreground">What to Expect</h2>
                <div className="space-y-4">
                  {SAMPLE_ITINERARY.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                          {i + 1}
                        </div>
                        {i < SAMPLE_ITINERARY.length - 1 && (
                          <div className="w-px h-full bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold text-foreground text-sm">{item.time}</p>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-card rounded-2xl border border-border/50 p-6"
              >
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Your Guide</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {photos[0] ? (
                      <img src={photos[0]} alt={guideName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                        {(fd.firstName || "G").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{guideName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {(fd.languages || ["English"]).join(" · ")} • {city}
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

            {/* Right: Booking Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="sticky top-24"
              >
                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-card space-y-5">
                  {/* Price — visually dominant */}
                  {tourPrice != null && tourPrice > 0 && (
                    <div className="pb-2">
                      <span className="text-2xl font-bold text-foreground">
                        From ${tourPrice}
                      </span>
                      <span className="text-sm text-muted-foreground"> / person</span>
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">{tourType}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{city} • with {guideName}</p>
                  </div>

                  {avgRating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{avgRating}</span>
                      <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Duration: Flexible (typically 2–4 hours)</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Private & group tours available</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>{(fd.languages || ["English"]).join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Licensed & Insured</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <Button variant="hero" size="lg" className="w-full" asChild>
                      <Link to={`/book/${guideId}?type=${encodeURIComponent(tourType)}&city=${encodeURIComponent(city)}`}>
                        <CalendarCheck className="w-4 h-4 mr-2" />
                        Book This Tour
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/guide/${guide.id}`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Guide
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Free cancellation • No hidden fees • Book directly</span>
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

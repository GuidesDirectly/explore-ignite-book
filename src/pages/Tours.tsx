import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Compass } from "lucide-react";
import TourCard from "@/components/TourCard";

export interface TourListing {
  id: string;
  guideUserId: string;
  guideName: string;
  tourTypes: string[];
  city: string;
  languages: string[];
  specializations: string[];
  rating: number;
  reviewCount: number;
  photoUrl: string | null;
  description: string;
  price: number | null;
  currency: string;
  createdAt: string | null;
  isSpotlight?: boolean;
  // New fields for the published-tour-aware listing model
  tourId?: string | null;
  tourTitle?: string | null;
  coverImage?: string | null;
  noToursNote?: boolean;
}

const CATEGORY_TO_LABEL: Record<string, string> = {
  walking: "Walking Tour",
  driving: "Driving Tour",
  private: "Private Tour",
  group: "Group Tour",
  historical: "Historical Tour",
  food: "Food Tour",
  cultural: "Cultural Tour",
  "multi-day": "Multi-Day Tour",
  custom: "Custom Tour",
};

const Tours = () => {
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState<TourListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filterCity, setFilterCity] = useState(searchParams.get("city") || "");
  const [filterType, setFilterType] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    const fetchTours = async () => {
      const { data: guideData } = await supabase
        .from("guide_profiles_public")
        .select("id, user_id, form_data, service_areas, translations, created_at, is_spotlight");

      if (!guideData) {
        setLoading(false);
        return;
      }

      // Review stats
      const { data: reviewData } = await supabase
        .from("reviews_public")
        .select("guide_user_id, rating")
        .eq("hidden", false);

      const statsMap = new Map<string, { count: number; total: number }>();
      if (reviewData) {
        reviewData.forEach((r: any) => {
          if (!r.guide_user_id) return;
          const existing = statsMap.get(r.guide_user_id) || { count: 0, total: 0 };
          existing.count += 1;
          existing.total += r.rating;
          statsMap.set(r.guide_user_id, existing);
        });
      }

      // All published tours
      const { data: tourData } = await supabase
        .from("tours")
        .select("id, guide_user_id, title, description, city, country, category, price_per_person, currency, photos, cover_image_url, languages, created_at")
        .eq("status", "published");

      // Group by guide_user_id
      const toursByGuide = new Map<string, any[]>();
      (tourData || []).forEach((t: any) => {
        const arr = toursByGuide.get(t.guide_user_id) || [];
        arr.push(t);
        toursByGuide.set(t.guide_user_id, arr);
      });

      const listings: TourListing[] = [];
      const guideMap = new Map<string, any>();
      guideData.forEach((g: any) => guideMap.set(g.user_id, g));

      // 1. One card per published tour
      (tourData || []).forEach((t: any) => {
        const g = guideMap.get(t.guide_user_id);
        if (!g) return;
        const fd = g.form_data || {};
        const stats = statsMap.get(t.guide_user_id);
        const cover = (t.photos && t.photos[0]) || t.cover_image_url || null;
        const price = Number(t.price_per_person);
        const tourLangs: string[] =
          Array.isArray(t.languages) && t.languages.length > 0
            ? t.languages
            : fd.languages || ["English"];
        const categoryLabel = CATEGORY_TO_LABEL[t.category] || "Walking Tour";

        listings.push({
          id: `tour-${t.id}`,
          tourId: t.id,
          tourTitle: t.title,
          coverImage: cover,
          guideUserId: t.guide_user_id,
          guideName: `${fd.firstName || "Guide"} ${(fd.lastName || "").charAt(0)}.`,
          tourTypes: [categoryLabel],
          city: t.city || (g.service_areas?.[0] ?? "Washington DC"),
          languages: tourLangs,
          specializations: fd.specializations || [],
          rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
          reviewCount: stats?.count || 0,
          photoUrl: cover,
          description:
            t.description?.substring(0, 140) +
              (t.description && t.description.length > 140 ? "…" : "") ||
            fd.biography?.substring(0, 140) ||
            "Experience the best of the city with a licensed local guide.",
          price: !isNaN(price) && price > 0 ? price : null,
          currency: t.currency || "USD",
          createdAt: t.created_at ?? null,
          isSpotlight: !!g.is_spotlight,
        });
      });

      // 2. Guides with no published tours → fallback guide-level card with empty-state note
      guideData.forEach((g: any) => {
        if (toursByGuide.has(g.user_id)) return;
        const fd = g.form_data || {};
        const stats = statsMap.get(g.user_id);
        const cities: string[] =
          g.service_areas && g.service_areas.length > 0 ? g.service_areas : ["Washington DC"];
        const tourTypes: string[] =
          fd.tourTypes && fd.tourTypes.length > 0 ? fd.tourTypes : ["Walking Tour"];

        listings.push({
          id: `guide-${g.id}`,
          tourId: null,
          tourTitle: null,
          coverImage: null,
          guideUserId: g.user_id,
          guideName: `${fd.firstName || "Guide"} ${(fd.lastName || "").charAt(0)}.`,
          tourTypes,
          city: cities[0],
          languages: fd.languages || ["English"],
          specializations: fd.specializations || [],
          rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
          reviewCount: stats?.count || 0,
          photoUrl: null,
          description: fd.biography
            ? fd.biography.substring(0, 120) + (fd.biography.length > 120 ? "…" : "")
            : "Experience the best of the city with a licensed local guide.",
          price: null,
          currency: "USD",
          createdAt: g.created_at ?? null,
          isSpotlight: !!g.is_spotlight,
          noToursNote: true,
        });
      });

      setTours(listings);
      setLoading(false);
    };
    fetchTours();
  }, []);

  // Derive filter options
  const allCities = useMemo(() => [...new Set(tours.map((t) => t.city))].sort(), [tours]);
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    tours.forEach((t) => t.tourTypes.forEach((tt) => types.add(tt)));
    return [...types].sort();
  }, [tours]);
  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    tours.forEach((t) => t.languages.forEach((l) => langs.add(l)));
    return [...langs].sort();
  }, [tours]);

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      if (filterCity && filterCity !== "all" && t.city !== filterCity) return false;
      if (filterType && filterType !== "all" && !t.tourTypes.includes(filterType)) return false;
      if (filterLanguage && filterLanguage !== "all" && !t.languages.includes(filterLanguage))
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = `${t.guideName} ${t.tourTitle || ""} ${t.tourTypes.join(" ")} ${
          t.city
        } ${t.specializations.join(" ")} ${t.description}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [tours, filterCity, filterType, filterLanguage, searchQuery]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "price-low":
        arr.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price-high":
        arr.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
        break;
      case "rating":
        arr.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        arr.sort((a, b) => {
          if (!b.createdAt && !a.createdAt) return 0;
          if (!b.createdAt) return -1;
          if (!a.createdAt) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }
    // Spotlight first; published tours next; empty-state guides last
    arr.sort((a, b) => {
      const spotDiff = (b.isSpotlight ? 1 : 0) - (a.isSpotlight ? 1 : 0);
      if (spotDiff !== 0) return spotDiff;
      const tourDiff = (a.noToursNote ? 1 : 0) - (b.noToursNote ? 1 : 0);
      return tourDiff;
    });
    return arr;
  }, [filtered, sortBy]);

  const activeFilterCount = [filterCity, filterType, filterLanguage].filter(
    (v) => v && v !== "all"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/10">
              <Compass className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-semibold">Browse All Experiences</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
              Discover Unforgettable <span className="text-gradient-gold">Tours</span>
            </h1>
            <p className="text-secondary-foreground/70 text-lg mb-8">
              Browse curated experiences led by licensed local guides. No middlemen, no markups.
            </p>

            <div className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tours, cities, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/90 border-border/50 h-12"
                />
              </div>
              <Button
                variant="outline"
                className="h-12 border-border/50 bg-background/90"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground text-xs px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters bar */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-b border-border/50 bg-card"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  City
                </label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {allCities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Tour Type
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {allTypes.map((tt) => (
                      <SelectItem key={tt} value={tt}>{tt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Language
                </label>
                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {allLanguages.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterCity("");
                    setFilterType("");
                    setFilterLanguage("");
                  }}
                >
                  <X className="w-3 h-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${sorted.length} result${sorted.length !== 1 ? "s" : ""}`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price (Lowest First)</SelectItem>
                <SelectItem value="price-high">Price (Highest First)</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No tours found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((tour, i) => (
                <TourCard key={tour.id} tour={tour} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tours;

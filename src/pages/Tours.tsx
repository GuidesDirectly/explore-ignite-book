import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import {
  Search,
  MapPin,
  Star,
  Globe,
  Filter,
  X,
  Compass,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import TourCard from "@/components/TourCard";

export interface TourListing {
  id: string;
  guideUserId: string;
  guideName: string;
  tourType: string;
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
}

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
      const { data: guideData } = await (supabase
        .from("guide_profiles_public" as any)
        .select("id, user_id, form_data, service_areas, translations, created_at") as any);

      if (!guideData) {
        setLoading(false);
        return;
      }

      // Fetch review stats
      const { data: reviewData } = await (supabase
        .from("reviews_public" as any)
        .select("guide_user_id, rating")
        .eq("hidden", false) as any);

      const statsMap = new Map<string, { count: number; total: number }>();
      if (reviewData) {
        reviewData.forEach((r: any) => {
          const existing = statsMap.get(r.guide_user_id) || { count: 0, total: 0 };
          existing.count += 1;
          existing.total += r.rating;
          statsMap.set(r.guide_user_id, existing);
        });
      }

      // Fetch published tour prices
      const { data: tourPriceData } = await supabase
        .from("tours")
        .select("guide_user_id, title, price_per_person, currency")
        .eq("status", "published");

      const priceMap = new Map<string, { price: number; currency: string }>();
      if (tourPriceData) {
        tourPriceData.forEach((t: any) => {
          const key = `${t.guide_user_id}__${t.title}`;
          priceMap.set(key, { price: Number(t.price_per_person), currency: t.currency || "USD" });
        });
      }

      // Fetch profile photos
      const photoUrls = new Map<string, string>();
      for (const g of guideData) {
        const { data: files } = await supabase.storage
          .from("guide-photos")
          .list(g.user_id, { limit: 10 });
        const profileFile = files?.find((f: any) => f.name.startsWith("profile"));
        if (profileFile) {
          const { data: photoData } = supabase.storage
            .from("guide-photos")
            .getPublicUrl(`${g.user_id}/${profileFile.name}`);
          if (photoData?.publicUrl) {
            photoUrls.set(g.user_id, photoData.publicUrl);
          }
        }
      }

      // Flatten: each guide × each tour type = one listing
      const listings: TourListing[] = [];
      guideData.forEach((g: any) => {
        const fd = g.form_data || {};
        const tourTypes = fd.tourTypes || ["Walking Tour"];
        const stats = statsMap.get(g.user_id);
        const cities = g.service_areas || ["Washington DC"];

        cities.forEach((city: string) => {
          tourTypes.forEach((tt: string) => {
            const priceInfo = priceMap.get(`${g.user_id}__${tt}`);
            listings.push({
              id: `${g.id}-${city}-${tt}`,
              guideUserId: g.user_id,
              guideName: `${fd.firstName || "Guide"} ${(fd.lastName || "").charAt(0)}.`,
              tourType: tt,
              city,
              languages: fd.languages || ["English"],
              specializations: fd.specializations || [],
              rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
              reviewCount: stats?.count || 0,
              photoUrl: photoUrls.get(g.user_id) || null,
              description: fd.biography
                ? fd.biography.substring(0, 120) + (fd.biography.length > 120 ? "…" : "")
                : "Experience the best of the city with a licensed local guide.",
              price: priceInfo?.price ?? null,
              currency: priceInfo?.currency || "USD",
              createdAt: g.created_at ?? null,
            });
          });
        });
      });

      setTours(listings);
      setLoading(false);
    };
    fetchTours();
  }, []);

  // Derive filter options
  const allCities = useMemo(() => [...new Set(tours.map((t) => t.city))].sort(), [tours]);
  const allTypes = useMemo(() => [...new Set(tours.map((t) => t.tourType))].sort(), [tours]);
  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    tours.forEach((t) => t.languages.forEach((l) => langs.add(l)));
    return [...langs].sort();
  }, [tours]);

  // Filter
  const filtered = useMemo(() => {
    return tours.filter((t) => {
      if (filterCity && filterCity !== "all" && t.city !== filterCity) return false;
      if (filterType && filterType !== "all" && t.tourType !== filterType) return false;
      if (filterLanguage && filterLanguage !== "all" && !t.languages.includes(filterLanguage)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = `${t.guideName} ${t.tourType} ${t.city} ${t.specializations.join(" ")} ${t.description}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [tours, filterCity, filterType, filterLanguage, searchQuery]);

  const activeFilterCount = [filterCity, filterType, filterLanguage].filter(v => v && v !== "all").length;

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
              Discover Unforgettable{" "}
              <span className="text-gradient-gold">Tours</span>
            </h1>
            <p className="text-secondary-foreground/70 text-lg mb-8">
              Browse curated experiences led by licensed local guides. No middlemen, no markups.
            </p>

            {/* Search bar */}
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
                  <Badge className="ml-2 bg-primary text-primary-foreground text-xs px-1.5">{activeFilterCount}</Badge>
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

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filtered.length} tour${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No tours found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tour, i) => (
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

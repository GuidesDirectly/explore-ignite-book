import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Globe,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { TourListing } from "@/pages/Tours";

const TOUR_TYPE_ICONS: Record<string, string> = {
  "Walking Tour": "🚶",
  "City Tour": "🏙️",
  "Food Tour": "🍽️",
  "Custom Tour": "✨",
  "Private Tour": "🔒",
  "Group Tour": "👥",
  "History Tour": "📜",
  "Art Tour": "🎨",
  "Driving Tour": "🚗",
};

const UNSPLASH_PARAMS = "?w=800&q=80&auto=format&fit=crop";

const getCityImage = (city: string): string => {
  const c = city.toLowerCase();
  if (c.includes("washington") || c.includes("dc")) {
    return `https://images.unsplash.com/photo-1617581629397-a72507c3de9e${UNSPLASH_PARAMS}`;
  }
  if (c.includes("los angeles") || c.includes("hollywood") || c === "la") {
    return `https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3${UNSPLASH_PARAMS}`;
  }
  if (c.includes("chicago")) {
    return `https://images.unsplash.com/photo-1494522855154-9297ac14b55f${UNSPLASH_PARAMS}`;
  }
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828${UNSPLASH_PARAMS}`;
};

interface TourCardProps {
  tour: TourListing;
  index: number;
}

const TourCard = ({ tour, index }: TourCardProps) => {
  const imageUrl = getCityImage(tour.city);
  const visibleTypes = tour.tourTypes.slice(0, 4);
  const extraTypeCount = Math.max(0, tour.tourTypes.length - visibleTypes.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/tour/${tour.guideUserId}?city=${encodeURIComponent(tour.city)}`}
        className="group block"
      >
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
          {/* Image — destination, not guide face */}
          <div className="relative h-48 bg-muted overflow-hidden">
            <img
              src={imageUrl}
              alt={`${tour.city} destination`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Tours badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-background/90 text-foreground text-xs font-medium backdrop-blur-sm border-0">
                🗺️ Tours
              </Badge>
            </div>
            {/* Rating or New badge */}
            <div className="absolute top-3 right-3">
              {tour.rating > 0 ? (
                <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-semibold text-foreground">{tour.rating}</span>
                  <span className="text-xs text-muted-foreground">({tour.reviewCount})</span>
                </div>
              ) : (
                <Badge className="bg-accent text-accent-foreground text-xs border-0 backdrop-blur-sm">
                  New
                </Badge>
              )}
            </div>
            {/* Verified badge */}
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Verified</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              Tours with {tour.guideName}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {tour.city}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> {tour.languages.slice(0, 2).join(", ")}
              </span>
            </div>

            {/* Tour-type chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleTypes.map((tt) => (
                <Badge key={tt} variant="secondary" className="text-xs font-medium">
                  {TOUR_TYPE_ICONS[tt] || "🗺️"} {tt}
                </Badge>
              ))}
              {extraTypeCount > 0 && (
                <Badge variant="secondary" className="text-xs font-medium">
                  +{extraTypeCount} more
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {tour.description}
            </p>

            {/* Price */}
            <div className="mb-4">
              {tour.price != null && tour.price > 0 ? (
                <span className="text-xl font-bold text-foreground">
                  From ${tour.price}
                  <span className="text-sm font-normal text-muted-foreground"> / person</span>
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">Contact for pricing</span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                with {tour.guideName}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                View Tours <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TourCard;

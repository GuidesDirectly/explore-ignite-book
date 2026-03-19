import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Globe,
  Compass,
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
};

interface TourCardProps {
  tour: TourListing;
  index: number;
}

const TourCard = ({ tour, index }: TourCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/tour/${tour.guideUserId}?type=${encodeURIComponent(tour.tourType)}&city=${encodeURIComponent(tour.city)}`}
        className="group block"
      >
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
          {/* Image */}
          <div className="relative h-48 bg-muted overflow-hidden">
            {tour.photoUrl ? (
              <img
                src={tour.photoUrl}
                alt={`${tour.tourType} in ${tour.city}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <Compass className="w-10 h-10 text-primary/30" />
              </div>
            )}
            {/* Tour type badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-background/90 text-foreground text-xs font-medium backdrop-blur-sm border-0">
                {TOUR_TYPE_ICONS[tour.tourType] || "🗺️"} {tour.tourType}
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
              {tour.tourType} in {tour.city}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {tour.city}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> {tour.languages.slice(0, 2).join(", ")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {tour.description}
            </p>

            {/* Price — visually dominant */}
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

            {/* Footer: guide name + CTA */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                with {tour.guideName}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                View Tour <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TourCard;

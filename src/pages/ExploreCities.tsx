import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Globe, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import DestinationsModal from "@/components/DestinationsModal";

import nycImg from "@/assets/city-cards/nyc.jpg";
import phillyImg from "@/assets/city-cards/philadelphia.jpg";
import chicagoImg from "@/assets/city-cards/chicago.jpg";
import bostonImg from "@/assets/city-cards/boston.jpg";
import phoenixImg from "@/assets/city-cards/phoenix.jpg";
import laImg from "@/assets/city-cards/los-angeles.jpg";
import sfImg from "@/assets/city-cards/san-francisco.jpg";
import sanDiegoImg from "@/assets/city-cards/san-diego.jpg";
import denverImg from "@/assets/city-cards/denver.jpg";
import vegasImg from "@/assets/city-cards/las-vegas.jpg";
import houstonImg from "@/assets/city-cards/houston.jpg";
import sanAntonioImg from "@/assets/city-cards/san-antonio.jpg";
import miamiImg from "@/assets/city-cards/miami.jpg";
import torontoImg from "@/assets/city-cards/toronto.jpg";
import montrealImg from "@/assets/city-cards/montreal.jpg";
import dcImg from "@/assets/city-dc.jpg";

type CityStatus = "active" | "coming-soon";

interface City {
  name: string;
  country: string;
  photo: string;
  status: CityStatus;
  guidesCount?: number;
  languages?: string[];
}

const ACTIVE_CITIES: City[] = [
  { name: "Washington D.C.", country: "USA", photo: dcImg, status: "active", guidesCount: 25, languages: ["English", "Russian", "Spanish", "French"] },
];

const EXPANSION_CITIES: City[] = [
  { name: "New York City", country: "USA", photo: nycImg, status: "coming-soon" },
  { name: "Philadelphia", country: "USA", photo: phillyImg, status: "coming-soon" },
  { name: "Chicago", country: "USA", photo: chicagoImg, status: "coming-soon" },
  { name: "Boston", country: "USA", photo: bostonImg, status: "coming-soon" },
  { name: "Phoenix", country: "USA", photo: phoenixImg, status: "coming-soon" },
  { name: "Los Angeles", country: "USA", photo: laImg, status: "coming-soon" },
  { name: "San Francisco", country: "USA", photo: sfImg, status: "coming-soon" },
  { name: "San Diego", country: "USA", photo: sanDiegoImg, status: "coming-soon" },
  { name: "Denver", country: "USA", photo: denverImg, status: "coming-soon" },
  { name: "Las Vegas", country: "USA", photo: vegasImg, status: "coming-soon" },
  { name: "Houston", country: "USA", photo: houstonImg, status: "coming-soon" },
  { name: "San Antonio", country: "USA", photo: sanAntonioImg, status: "coming-soon" },
  { name: "Miami", country: "USA", photo: miamiImg, status: "coming-soon" },
  { name: "Toronto", country: "Canada", photo: torontoImg, status: "coming-soon" },
  { name: "Montreal", country: "Canada", photo: montrealImg, status: "coming-soon" },
];

const INTERNATIONAL_COMING = [
  "Rome", "Paris", "London", "Barcelona", "Tokyo", "Berlin", "Prague", "Istanbul", "Buenos Aires", "Bangkok"
];

const CityCard = ({ city, index }: { city: City; index: number }) => {
  const navigate = useNavigate();
  const isActive = city.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={isActive ? () => navigate("/home#guides") : undefined}
      className={`group relative rounded-2xl overflow-hidden aspect-[4/3] ${isActive ? "cursor-pointer ring-2 ring-primary" : "opacity-85"}`}
    >
      <img src={city.photo} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Status badge */}
      <div className="absolute top-3 left-3 z-10">
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
            Available Now
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-semibold backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            Coming Soon
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="font-display text-xl font-bold text-white mb-1">{city.name}</h3>
        <p className="text-white/60 text-xs font-medium">{city.country}</p>
        {isActive && city.guidesCount && (
          <div className="flex items-center gap-4 mt-2 text-white/80 text-xs">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {city.guidesCount}+ guides</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {city.languages?.length} languages</span>
          </div>
        )}
      </div>

      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 backdrop-blur-[2px] z-20">
          <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm">
            Browse Guides <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      )}
    </motion.div>
  );
};

const ExploreCities = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Cities & Destinations — Private Tour Guides Worldwide | GuidesDirectly"
        description="Discover guides in 150+ destinations across the globe. Book directly, zero commission, zero booking fees."
        canonical="https://iguidetours.net/explore"
      />
      {/* Header */}
      <header className="bg-secondary border-b border-border px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/home" className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold text-primary-foreground tracking-tight">
              Guides<span className="text-gradient-gold">Directly</span>
            </span>
          </a>
          <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={() => navigate("/home")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Home
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-8">
              <MapPin className="w-3.5 h-3.5" />
              Explore Destinations
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground mb-6 leading-tight">
              Commission-Free Tours<br />
              <span className="text-primary italic">Worldwide</span>
            </h1>
            <p className="text-secondary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto">
              Choose your destination and connect directly with verified local guides. No middlemen, no markups — just authentic travel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Active Cities */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <h2 className="font-display text-2xl font-bold text-foreground">Available Now</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
            {ACTIVE_CITIES.map((city, i) => (
              <CityCard key={city.name} city={city} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Expansion Cities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-display text-2xl font-bold text-foreground">Coming Soon — North America</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-8 ml-8">
            Guides are being onboarded in these cities. Want to be notified when they launch?{" "}
            <a href="/apply-city-pilot" className="text-primary hover:underline font-medium">Become a guide partner →</a>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {EXPANSION_CITIES.map((city, i) => (
              <CityCard key={city.name} city={city} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* International Teaser */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Globe className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary-foreground mb-4">International Expansion</h2>
          <p className="text-secondary-foreground/70 mb-8 max-w-xl mx-auto">
            We're identifying local leaders in cities worldwide to bring the commission-free model globally.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-10">
            {INTERNATIONAL_COMING.map(city => (
              <span key={city} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-secondary-foreground/80 text-sm font-medium">
                {city}
              </span>
            ))}
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              + many more →
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <a href="/apply-city-pilot">
                Become a Guide Partner <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
            <Button variant="heroOutline" size="lg" onClick={() => navigate("/home#inquiry")}>
              Request a Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="py-4" style={{ background: '#0A1628', borderTop: '1px solid rgba(201,168,76,0.2)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-semibold text-center" style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '0.1em' }}>
          <span>$0 Booking Fees</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span>100% Direct to Guides</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span>100% Authentic for Travelers</span>
        </div>
      </div>
      <DestinationsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDone={(cities) => {
          navigate(`/home#guides?cities=${encodeURIComponent(cities.join(","))}`);
        }}
      />
    </div>
  );
};

export default ExploreCities;

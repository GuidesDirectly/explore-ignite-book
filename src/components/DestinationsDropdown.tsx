import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Check, X, ArrowRight, MapPin, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Destination {
  name: string;
  region: string;
  status: "active" | "coming-soon" | "international";
}

const ALL_DESTINATIONS: Destination[] = [
  // Active
  { name: "Washington D.C.", region: "USA", status: "active" },
  // North America — Coming Soon
  { name: "New York City", region: "USA", status: "coming-soon" },
  { name: "Boston", region: "USA", status: "coming-soon" },
  { name: "Chicago", region: "USA", status: "coming-soon" },
  { name: "Los Angeles", region: "USA", status: "coming-soon" },
  { name: "San Francisco", region: "USA", status: "coming-soon" },
  { name: "Miami", region: "USA", status: "coming-soon" },
  { name: "Philadelphia", region: "USA", status: "coming-soon" },
  { name: "Phoenix", region: "USA", status: "coming-soon" },
  { name: "San Diego", region: "USA", status: "coming-soon" },
  { name: "Denver", region: "USA", status: "coming-soon" },
  { name: "Las Vegas", region: "USA", status: "coming-soon" },
  { name: "Houston", region: "USA", status: "coming-soon" },
  { name: "San Antonio", region: "USA", status: "coming-soon" },
  { name: "Toronto", region: "Canada", status: "coming-soon" },
  { name: "Montreal", region: "Canada", status: "coming-soon" },
  // International
  { name: "Paris", region: "France", status: "international" },
  { name: "London", region: "UK", status: "international" },
  { name: "Tokyo", region: "Japan", status: "international" },
  { name: "Rome", region: "Italy", status: "international" },
  { name: "Barcelona", region: "Spain", status: "international" },
  { name: "Berlin", region: "Germany", status: "international" },
  { name: "Prague", region: "Czech Republic", status: "international" },
  { name: "Istanbul", region: "Turkey", status: "international" },
  { name: "Buenos Aires", region: "Argentina", status: "international" },
  { name: "Bangkok", region: "Thailand", status: "international" },
];

interface DestinationsDropdownProps {
  open: boolean;
  onClose: () => void;
}

const DestinationsDropdown = ({ open, onClose }: DestinationsDropdownProps) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [customDestinations, setCustomDestinations] = useState<Destination[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const allDests = useMemo(() => [...ALL_DESTINATIONS, ...customDestinations], [customDestinations]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allDests;
    const q = query.toLowerCase();
    return allDests.filter(
      (d) => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q)
    );
  }, [query, allDests]);

  const toggleSelect = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const addCustomDestination = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const exists = allDests.some((d) => d.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    setCustomDestinations((prev) => [...prev, { name: trimmed, region: "Custom", status: "international" }]);
    setSelected((prev) => [...prev, trimmed]);
    setQuery("");
  };

  const queryHasNoExactMatch = useMemo(() => {
    if (!query.trim()) return false;
    return !allDests.some((d) => d.name.toLowerCase() === query.trim().toLowerCase());
  }, [query, allDests]);

  const removeChip = (name: string) => {
    setSelected((prev) => prev.filter((n) => n !== name));
  };

  const activeFiltered = filtered.filter((d) => d.status === "active");
  const comingSoonFiltered = filtered.filter((d) => d.status === "coming-soon");
  const internationalFiltered = filtered.filter((d) => d.status === "international");

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-2 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
    >
      {/* Search input */}
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && queryHasNoExactMatch && query.trim()) {
                e.preventDefault();
                addCustomDestination();
              }
            }}
            placeholder={t("nav.searchDestination", "Search or type your own destination...")}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-full"
            >
              <Check className="w-3 h-3" />
              {name}
              <button
                onClick={() => removeChip(name)}
                className="ml-0.5 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Scrollable list */}
      <div className="max-h-64 overflow-y-auto overscroll-contain">
        {/* Active */}
        {activeFiltered.length > 0 && (
          <div>
            <div className="px-3 pt-3 pb-1 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {t("nav.availableNow", "Available Now")}
            </div>
            {activeFiltered.map((d) => (
              <DestinationRow
                key={d.name}
                destination={d}
                isSelected={selected.includes(d.name)}
                onToggle={() => toggleSelect(d.name)}
              />
            ))}
          </div>
        )}

        {/* Coming Soon */}
        {comingSoonFiltered.length > 0 && (
          <div>
            <div className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("nav.moreDestinations", "More Destinations")}
            </div>
            {comingSoonFiltered.map((d) => (
              <DestinationRow
                key={d.name}
                destination={d}
                isSelected={selected.includes(d.name)}
                onToggle={() => toggleSelect(d.name)}
              />
            ))}
          </div>
        )}

        {/* International */}
        {internationalFiltered.length > 0 && (
          <div>
            <div className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              {t("nav.international", "International")}
            </div>
            {internationalFiltered.map((d) => (
              <DestinationRow
                key={d.name}
                destination={d}
                isSelected={selected.includes(d.name)}
                onToggle={() => toggleSelect(d.name)}
              />
            ))}
          </div>
        )}

        {/* Add custom destination */}
        {queryHasNoExactMatch && query.trim() && (
          <div className="px-3 py-2">
            <button
              onClick={addCustomDestination}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-foreground"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Add "<strong>{query.trim()}</strong>"</span>
            </button>
          </div>
        )}

        {filtered.length === 0 && !query.trim() && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t("nav.noResults", "No destinations found")}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-3 space-y-2">
        {selected.length > 0 && (
          <button
            onClick={() => {
              onClose();
              navigate(`/home#meet-guides?cities=${encodeURIComponent(selected.join(","))}`);
            }}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors"
          >
            Search Guides in {selected.length} {selected.length === 1 ? "city" : "cities"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => {
            onClose();
            navigate("/explore");
          }}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors py-1"
        >
          {t("nav.moreDestinationsLink", "More Destinations")}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const DestinationRow = ({
  destination,
  isSelected,
  onToggle,
}: {
  destination: Destination;
  isSelected: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-primary/5 ${
      isSelected ? "bg-primary/10 text-foreground font-medium" : "text-foreground/80"
    }`}
  >
    <span>{destination.name}</span>
    {isSelected && <Check className="w-4 h-4 text-primary" />}
    {destination.status === "active" && !isSelected && (
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
    )}
  </button>
);

export default DestinationsDropdown;

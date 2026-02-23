import { useState, useMemo, useEffect, useRef } from "react";
import { X, Search, Check, MapPin, Globe, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Destination {
  name: string;
  region: string;
  status: "active" | "coming-soon" | "international";
}

const ALL_DESTINATIONS: Destination[] = [
  { name: "Washington D.C.", region: "USA", status: "active" },
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
  { name: "Dubai", region: "UAE", status: "international" },
  { name: "Sydney", region: "Australia", status: "international" },
  { name: "Amsterdam", region: "Netherlands", status: "international" },
  { name: "Lisbon", region: "Portugal", status: "international" },
  { name: "Seoul", region: "South Korea", status: "international" },
  { name: "Mexico City", region: "Mexico", status: "international" },
  { name: "Cairo", region: "Egypt", status: "international" },
  { name: "Athens", region: "Greece", status: "international" },
  { name: "Vienna", region: "Austria", status: "international" },
  { name: "Marrakech", region: "Morocco", status: "international" },
];

interface DestinationsModalProps {
  open: boolean;
  onClose: () => void;
  onDone?: (selected: string[]) => void;
}

const statusConfig = {
  active: { label: "Available Now", icon: MapPin, color: "text-primary" },
  "coming-soon": { label: "Coming Soon — North America", icon: Clock, color: "text-muted-foreground" },
  international: { label: "International", icon: Globe, color: "text-muted-foreground" },
} as const;

const DestinationsModal = ({ open, onClose, onDone }: DestinationsModalProps) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [customDestinations, setCustomDestinations] = useState<Destination[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
    else { setQuery(""); }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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
    const newDest: Destination = { name: trimmed, region: "Custom", status: "international" };
    setCustomDestinations((prev) => [...prev, newDest]);
    setSelected((prev) => [...prev, trimmed]);
    setQuery("");
  };

  // Check if query matches no existing destinations (for showing "add custom" prompt)
  const queryHasNoExactMatch = useMemo(() => {
    if (!query.trim()) return false;
    return !allDests.some((d) => d.name.toLowerCase() === query.trim().toLowerCase());
  }, [query, allDests]);

  const grouped = useMemo(() => {
    const groups: Record<string, Destination[]> = { active: [], "coming-soon": [], international: [] };
    filtered.forEach((d) => groups[d.status]?.push(d));
    return groups;
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-display text-lg font-bold text-foreground">All Destinations</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
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
                  placeholder="Search or type your own destination..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="px-5 pb-2 flex flex-wrap gap-1.5">
                {selected.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <Check className="w-3 h-3" />
                    {name}
                    <button
                      onClick={() => toggleSelect(name)}
                      className="ml-0.5 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-2">
              {(["active", "coming-soon", "international"] as const).map((status) => {
                const items = grouped[status];
                if (!items || items.length === 0) return null;
                const config = statusConfig[status];
                const Icon = config.icon;
                return (
                  <div key={status} className="mb-2">
                    <div className={`px-3 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </div>
                    {items.map((d) => {
                      const isSel = selected.includes(d.name);
                      return (
                        <button
                          key={d.name}
                          onClick={() => {
                            if (d.status === "active") {
                              onClose();
                              navigate("/home#guides");
                            } else {
                              toggleSelect(d.name);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-primary/5 ${
                            isSel ? "bg-primary/10 text-foreground font-medium" : "text-foreground/80"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {d.name}
                            <span className="text-muted-foreground text-xs">{d.region}</span>
                          </span>
                          {isSel && <Check className="w-4 h-4 text-primary" />}
                          {d.status === "active" && !isSel && (
                            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                              Browse Guides <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* Add custom destination prompt */}
              {queryHasNoExactMatch && query.trim() && (
                <div className="px-3 py-3">
                  <button
                    onClick={addCustomDestination}
                    className="w-full flex items-center gap-2 px-3 py-3 text-sm rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-foreground"
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>
                      Add <strong>"{query.trim()}"</strong> as your destination
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">Press Enter</span>
                  </button>
                </div>
              )}

              {filtered.length === 0 && !query.trim() && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No destinations found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {allDests.length} destinations · {selected.length} selected
              </span>
              <button
                onClick={() => {
                  if (onDone && selected.length > 0) {
                    onDone(selected);
                  }
                  onClose();
                }}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DestinationsModal;

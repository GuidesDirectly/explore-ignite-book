import { useMemo } from "react";
import { Globe, TrendingUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Inquiry {
  id: string;
  destination: string;
  name: string;
  email: string;
  created_at: string;
}

interface Props {
  inquiries: Inquiry[];
}

const UnservedDestinationsWidget = ({ inquiries }: Props) => {
  const unservedData = useMemo(() => {
    const unserved = inquiries.filter((i) => i.destination.startsWith("other:"));
    const cityMap = new Map<string, { count: number; latest: string; travelers: string[] }>();

    unserved.forEach((inq) => {
      const city = inq.destination.replace("other:", "").trim();
      const key = city.toLowerCase();
      const existing = cityMap.get(key);
      if (existing) {
        existing.count++;
        if (inq.created_at > existing.latest) existing.latest = inq.created_at;
        if (!existing.travelers.includes(inq.email)) existing.travelers.push(inq.email);
      } else {
        cityMap.set(key, { count: 1, latest: inq.created_at, travelers: [inq.email] });
      }
    });

    const sorted = Array.from(cityMap.entries())
      .map(([key, val]) => ({
        city: key.charAt(0).toUpperCase() + key.slice(1),
        ...val,
      }))
      .sort((a, b) => b.count - a.count);

    return { total: unserved.length, cities: sorted };
  }, [inquiries]);

  if (unservedData.total === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2.5 rounded-lg">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Expansion Opportunities</h3>
          <p className="text-xs text-muted-foreground">
            {unservedData.total} request{unservedData.total !== 1 ? "s" : ""} for unserved destinations
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {unservedData.cities.slice(0, 10).map((item, i) => (
          <div
            key={item.city}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-primary w-6 text-center">
                {i + 1}
              </span>
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground text-sm">{item.city}</p>
                <p className="text-xs text-muted-foreground">
                  {item.travelers.length} unique traveler{item.travelers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {item.count}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(item.latest).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {unservedData.cities.length > 10 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          +{unservedData.cities.length - 10} more destinations
        </p>
      )}
    </div>
  );
};

export default UnservedDestinationsWidget;

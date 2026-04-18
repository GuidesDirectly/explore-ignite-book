import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Calendar,
  MessageSquare,
  Sparkles,
  Clock,
  Shuffle,
  MousePointer,
  Map,
  Activity,
  MapPin,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Metrics {
  totalUsers: number;
  approvedGuides: number;
  totalBookings: number;
  totalInquiries: number;
  foundingClaimed: number;
  foundingLimit: number;
  daysUntilFoundingEnds: number;
}

interface PipelineCounts {
  applications: number;
  approved: number;
  active: number;
  withTours: number;
}

interface ActivityEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

interface CityCount {
  city: string;
  count: number;
}

interface MRR {
  pro: number;
  featured: number;
  spotlight: number;
  total: number;
}

const FOUNDING_END_DATE = new Date("2026-12-31T23:59:59Z");

const eventIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  swap_request: Shuffle,
  swap_completed: Shuffle,
  cta_click: MousePointer,
  ai_demo_submit: Sparkles,
  tour_plan_generated: Map,
  tour_plan_refined: Map,
  guide_matched: Users,
  feedback_insights_viewed: TrendingUp,
};

const humanize = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [pipeline, setPipeline] = useState<PipelineCounts | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [cities, setCities] = useState<CityCount[]>([]);
  const [mrr, setMrr] = useState<MRR | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [
          rolesRes,
          approvedRes,
          bookingsRes,
          inquiriesRes,
          settingsRes,
          allGuidesRes,
          activeGuidesRes,
          publishedToursRes,
          eventsRes,
          activeApprovedRes,
          subProfilesRes,
        ] = await Promise.all([
          supabase.from("user_roles").select("user_id"),
          supabase.from("guide_profiles").select("id", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("bookings").select("id", { count: "exact", head: true }),
          supabase.from("inquiries").select("id", { count: "exact", head: true }),
          supabase
            .from("app_settings")
            .select("key, value")
            .in("key", ["founding_guide_current_count", "founding_guide_limit"]),
          supabase.from("guide_profiles").select("id", { count: "exact", head: true }),
          supabase
            .from("guide_profiles")
            .select("id", { count: "exact", head: true })
            .eq("activation_status", "active"),
          supabase.from("tours").select("guide_user_id").eq("status", "published"),
          supabase
            .from("analytics_events")
            .select("id, event_type, event_data, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("guide_profiles")
            .select("service_areas")
            .eq("status", "approved")
            .eq("activation_status", "active"),
          supabase
            .from("guide_profiles")
            .select("subscription_tier, is_spotlight")
            .eq("subscription_status", "active"),
        ]);

        // 1. Metrics
        const uniqueUserIds = new Set((rolesRes.data || []).map((r: any) => r.user_id));
        const settingsMap: Record<string, any> = {};
        (settingsRes.data || []).forEach((row: any) => {
          settingsMap[row.key] = row.value;
        });
        const parseNum = (v: any, fb: number) => {
          if (v === null || v === undefined) return fb;
          if (typeof v === "number") return v;
          const n = Number(typeof v === "string" ? v : JSON.stringify(v).replace(/"/g, ""));
          return Number.isFinite(n) ? n : fb;
        };
        const now = new Date();
        const daysUntilFoundingEnds = Math.max(
          0,
          Math.ceil((FOUNDING_END_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        );
        setMetrics({
          totalUsers: uniqueUserIds.size,
          approvedGuides: approvedRes.count || 0,
          totalBookings: bookingsRes.count || 0,
          totalInquiries: inquiriesRes.count || 0,
          foundingClaimed: parseNum(settingsMap["founding_guide_current_count"], 0),
          foundingLimit: parseNum(settingsMap["founding_guide_limit"], 50),
          daysUntilFoundingEnds,
        });

        // 2. Pipeline
        const guidesWithTours = new Set((publishedToursRes.data || []).map((t: any) => t.guide_user_id));
        setPipeline({
          applications: allGuidesRes.count || 0,
          approved: approvedRes.count || 0,
          active: activeGuidesRes.count || 0,
          withTours: guidesWithTours.size,
        });

        // 3. Activity
        setActivity((eventsRes.data || []) as ActivityEvent[]);

        // 4. Geographic coverage
        const cityCounts: Record<string, number> = {};
        (activeApprovedRes.data || []).forEach((g: any) => {
          (g.service_areas || []).forEach((c: string) => {
            const key = (c || "").trim();
            if (!key) return;
            cityCounts[key] = (cityCounts[key] || 0) + 1;
          });
        });
        const cityList = Object.entries(cityCounts)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count);
        setCities(cityList);

        // 5. MRR
        let pro = 0;
        let featured = 0;
        let spotlight = 0;
        (subProfilesRes.data || []).forEach((p: any) => {
          if (p.is_spotlight) spotlight += 1;
          if (p.subscription_tier === "pro") pro += 1;
          else if (p.subscription_tier === "featured") featured += 1;
        });
        setMrr({
          pro: pro * 29,
          featured: featured * 59,
          spotlight: spotlight * 49,
          total: pro * 29 + featured * 59 + spotlight * 49,
        });
      } catch (e) {
        console.error("Analytics fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const pipelineMax = Math.max(pipeline?.applications || 1, 1);

  const metricCards = [
    { label: "Total Users", value: metrics?.totalUsers ?? 0, icon: Users },
    { label: "Approved Guides", value: metrics?.approvedGuides ?? 0, icon: UserCheck },
    { label: "Total Bookings", value: metrics?.totalBookings ?? 0, icon: Calendar },
    { label: "Total Inquiries", value: metrics?.totalInquiries ?? 0, icon: MessageSquare },
    {
      label: "Founding Spots",
      value: `${metrics?.foundingClaimed ?? 0} / ${metrics?.foundingLimit ?? 50}`,
      icon: Sparkles,
    },
    { label: "Days to Founding End", value: metrics?.daysUntilFoundingEnds ?? 0, icon: Clock },
  ];

  const pipelineRows = [
    { label: "Applications", value: pipeline?.applications ?? 0 },
    { label: "Approved", value: pipeline?.approved ?? 0 },
    { label: "Active", value: pipeline?.active ?? 0 },
    { label: "With Published Tours", value: pipeline?.withTours ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 5. MRR (prominent, gold accent) */}
      {mrr && (
        <Card className="bg-card border-2 border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
              <DollarSign className="w-5 h-5 text-primary" />
              Estimated Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-display font-bold text-primary mb-3">
              ${mrr.total.toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Pro: <span className="text-foreground font-medium">${mrr.pro}</span></span>
              <span>Featured: <span className="text-foreground font-medium">${mrr.featured}</span></span>
              <span>Spotlight: <span className="text-foreground font-medium">${mrr.spotlight}</span></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Pipeline funnel */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCheck className="w-5 h-5 text-primary" />
            Guide Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pipelineRows.map((row) => {
            const pct = (row.value / pipelineMax) * 100;
            return (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{row.label}</span>
                  <span className="font-mono font-bold text-primary">{row.value}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 3 + 4 — two-column on lg */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 3. Recent activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent events.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((ev) => {
                  const Icon = eventIconMap[ev.event_type] || Activity;
                  const dataPreview =
                    ev.event_data && Object.keys(ev.event_data).length > 0
                      ? JSON.stringify(ev.event_data).slice(0, 80)
                      : null;
                  return (
                    <li key={ev.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {humanize(ev.event_type)}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {dataPreview && (
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {dataPreview}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 4. Geographic coverage */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-primary" />
              Geographic Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active guides yet.</p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {cities.map(({ city, count }) => (
                  <li
                    key={city}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-foreground">{city}</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {count} guide{count !== 1 ? "s" : ""}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

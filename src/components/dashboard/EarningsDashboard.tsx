import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, CalendarCheck, Clock, BarChart3 } from "lucide-react";

interface BookingEarnings {
  id: string;
  date: string;
  price: number;
  status: string;
  tour_type: string;
  traveler_name: string;
  group_size: number;
}

interface EarningsStats {
  totalEarned: number;
  pendingEarnings: number;
  completedBookings: number;
  avgPerBooking: number;
  monthlyEarnings: { month: string; total: number }[];
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  accent = false,
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  accent?: boolean;
}) => (
  <div className="bg-card rounded-xl border border-border/50 p-5 flex flex-col gap-2">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className={`w-4 h-4 ${accent ? "text-primary" : ""}`} />
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className={`font-display text-3xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>
      {value}
    </p>
    {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
  </div>
);

const EarningsDashboard = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<EarningsStats>({
    totalEarned: 0,
    pendingEarnings: 0,
    completedBookings: 0,
    avgPerBooking: 0,
    monthlyEarnings: [],
  });
  const [recentBookings, setRecentBookings] = useState<BookingEarnings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, date, price, status, tour_type, traveler_name, group_size")
        .eq("guide_user_id", userId)
        .order("date", { ascending: false });

      if (!bookings) {
        setLoading(false);
        return;
      }

      const completed = bookings.filter(b => b.status === "completed");
      const confirmed = bookings.filter(b => b.status === "confirmed");
      const totalEarned = completed.reduce((s, b) => s + (b.price || 0), 0);
      const pendingEarnings = confirmed.reduce((s, b) => s + (b.price || 0), 0);
      const avgPerBooking = completed.length > 0 ? totalEarned / completed.length : 0;

      // Monthly breakdown (last 6 months)
      const monthlyMap = new Map<string, number>();
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlyMap.set(key, 0);
      }

      completed.forEach(b => {
        const d = new Date(b.date);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + (b.price || 0));
        }
      });

      setStats({
        totalEarned,
        pendingEarnings,
        completedBookings: completed.length,
        avgPerBooking,
        monthlyEarnings: Array.from(monthlyMap, ([month, total]) => ({ month, total })),
      });

      setRecentBookings(bookings.slice(0, 8));
      setLoading(false);
    };

    fetchEarnings();
  }, [userId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...stats.monthlyEarnings.map(m => m.total), 1);

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Earnings Overview
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Earned"
          value={formatCurrency(stats.totalEarned)}
          subValue={`${stats.completedBookings} completed tours`}
          accent
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={formatCurrency(stats.pendingEarnings)}
          subValue="Confirmed bookings"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg / Booking"
          value={formatCurrency(stats.avgPerBooking)}
        />
        <StatCard
          icon={CalendarCheck}
          label="Completed"
          value={String(stats.completedBookings)}
          subValue="Total tours"
        />
      </div>

      {/* Monthly chart (simple bar chart) */}
      {stats.monthlyEarnings.some(m => m.total > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Monthly Earnings (Last 6 Months)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {stats.monthlyEarnings.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {m.total > 0 ? formatCurrency(m.total) : ""}
                </span>
                <div
                  className="w-full bg-primary/20 rounded-t-md relative overflow-hidden transition-all"
                  style={{ height: `${Math.max((m.total / maxMonthly) * 100, 4)}%` }}
                >
                  <div
                    className="absolute inset-0 bg-primary rounded-t-md"
                    style={{ height: `${(m.total / maxMonthly) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent Bookings
          </h3>
          <div className="divide-y divide-border/30">
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.traveler_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.tour_type} · {new Date(b.date).toLocaleDateString()} · {b.group_size} guest{b.group_size !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(b.price)}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    b.status === "completed" ? "bg-green-100 text-green-700" :
                    b.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                    b.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalEarned === 0 && recentBookings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
          <p>No earnings yet. Complete bookings to see your revenue here.</p>
        </div>
      )}
    </section>
  );
};

export default EarningsDashboard;

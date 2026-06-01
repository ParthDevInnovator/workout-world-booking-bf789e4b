import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarRange, IndianRupee, Star, Crown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LIME = "#c8f04b";
const YELLOW = "#f59e0b";
const RED = "#ef4444";

type Booking = {
  id: string;
  gym_id: string;
  total_price: number;
  status: string;
  created_at: string;
};

const StatCard = ({
  Icon,
  label,
  value,
}: {
  Icon: typeof Building2;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:border-[#c8f04b]/40 hover:shadow-[0_0_30px_-10px_rgba(200,240,75,0.4)]">
    <Icon className="h-6 w-6 text-[#c8f04b]" />
    <p className="mt-4 font-display text-4xl tracking-wide text-white">{value}</p>
    <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{label}</p>
  </div>
);

const ChartTooltip = ({ active, payload, label, prefix = "₹", suffix = "" }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-white shadow-xl">
      <span className="font-semibold text-[#c8f04b]">
        {prefix}
        {Number(v).toLocaleString("en-IN")}
      </span>{" "}
      {suffix || `in ${label}`}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ gyms: 0, bookings: 0, revenue: 0, rating: 0 });
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topGym, setTopGym] = useState<{ name: string; count: number; revenue: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: gyms } = await supabase.from("gyms").select("id, name").eq("owner_id", user.id);
      const gymIds = (gyms ?? []).map((g) => g.id);
      const gymMap = new Map((gyms ?? []).map((g) => [g.id, g.name]));

      let bookings: Booking[] = [];
      if (gymIds.length) {
        const { data } = await supabase
          .from("bookings")
          .select("id, gym_id, total_price, status, created_at")
          .in("gym_id", gymIds);
        bookings = (data as Booking[]) ?? [];
      }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const revenueThisMonth = bookings
        .filter((b) => b.status === "confirmed" && new Date(b.created_at) >= monthStart)
        .reduce((s, b) => s + Number(b.total_price || 0), 0);

      // Avg rating
      let rating = 0;
      if (gymIds.length) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .in("gym_id", gymIds);
        if (reviews?.length) {
          rating = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
        }
      }

      setStats({
        gyms: gyms?.length ?? 0,
        bookings: bookings.length,
        revenue: revenueThisMonth,
        rating: Math.round(rating * 10) / 10,
      });

      // Revenue by month (last 6)
      const months: { key: string; label: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          label: d.toLocaleString("en-US", { month: "short" }),
          revenue: 0,
        });
      }
      bookings
        .filter((b) => b.status === "confirmed")
        .forEach((b) => {
          const d = new Date(b.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const slot = months.find((m) => m.key === key);
          if (slot) slot.revenue += Number(b.total_price || 0);
        });
      setRevenueData(months.map((m) => ({ month: m.label, revenue: m.revenue })));

      // Status breakdown
      const counts = { confirmed: 0, pending: 0, cancelled: 0 } as Record<string, number>;
      bookings.forEach((b) => {
        const s = (b.status || "").toLowerCase();
        if (s in counts) counts[s]++;
      });
      setStatusData([
        { name: "Confirmed", value: counts.confirmed, color: LIME },
        { name: "Pending", value: counts.pending, color: YELLOW },
        { name: "Cancelled", value: counts.cancelled, color: RED },
      ]);

      // Top gym this month
      const monthBookings = bookings.filter((b) => new Date(b.created_at) >= monthStart);
      const byGym = new Map<string, { count: number; revenue: number }>();
      monthBookings.forEach((b) => {
        const cur = byGym.get(b.gym_id) ?? { count: 0, revenue: 0 };
        cur.count += 1;
        if (b.status === "confirmed") cur.revenue += Number(b.total_price || 0);
        byGym.set(b.gym_id, cur);
      });
      let topId: string | null = null;
      let topVal = 0;
      byGym.forEach((v, k) => {
        if (v.count > topVal) {
          topVal = v.count;
          topId = k;
        }
      });
      if (topId) {
        const v = byGym.get(topId)!;
        setTopGym({ name: gymMap.get(topId) ?? "—", count: v.count, revenue: v.revenue });
      } else {
        setTopGym(null);
      }

      setLoading(false);
    })();
  }, [user]);

  const totalBookings = useMemo(
    () => statusData.reduce((s, d) => s + d.value, 0),
    [statusData]
  );
  const hasRevenue = revenueData.some((d) => d.revenue > 0);

  const cards = [
    { label: "Total Gyms", value: String(stats.gyms), Icon: Building2 },
    { label: "Total Bookings", value: String(stats.bookings), Icon: CalendarRange },
    {
      label: "This Month Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      Icon: IndianRupee,
    },
    { label: "Avg Rating", value: stats.rating ? stats.rating.toFixed(1) : "—", Icon: Star },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Real-time analytics for your gyms</p>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#111]" />
            ))
          : cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue bar */}
        <section className="rounded-2xl border border-white/10 bg-[#111] p-5 lg:col-span-2">
          <h2 className="font-display text-xl tracking-wide text-white">REVENUE OVERVIEW</h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-white/40">Last 6 months</p>
          <div className="mt-5 h-72">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />
            ) : !hasRevenue ? (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                No revenue yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(200,240,75,0.08)" }}
                    content={<ChartTooltip />}
                  />
                  <Bar dataKey="revenue" fill={LIME} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Status donut */}
        <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <h2 className="font-display text-xl tracking-wide text-white">BOOKINGS BY STATUS</h2>
          <div className="relative mt-5 h-56">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />
            ) : totalBookings === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                No bookings yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      stroke="none"
                      paddingAngle={2}
                    >
                      {statusData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) =>
                        active && payload?.length ? (
                          <div className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-white">
                            <span style={{ color: payload[0].payload.color }}>
                              {payload[0].name}
                            </span>
                            : {payload[0].value}
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl tracking-wide text-white">
                    {totalBookings}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/50">
                    Total
                  </span>
                </div>
              </>
            )}
          </div>
          {!loading && totalBookings > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-white/70">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top gym */}
      {!loading && topGym && (
        <section className="rounded-2xl border border-[#c8f04b]/40 bg-[#111] p-6 shadow-[0_0_40px_-15px_rgba(200,240,75,0.5)]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c8f04b]">
            <Crown className="h-4 w-4" /> Top Gym This Month
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-3xl tracking-wide text-white">{topGym.name}</h3>
            <div className="flex gap-6">
              <div>
                <p className="font-display text-2xl text-white">{topGym.count}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/50">Bookings</p>
              </div>
              <div>
                <p className="font-display text-2xl text-[#c8f04b]">
                  ₹{topGym.revenue.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/50">Revenue</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;

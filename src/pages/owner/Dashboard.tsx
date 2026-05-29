import { useEffect, useState } from "react";
import { Building2, CalendarRange, IndianRupee, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/owner/ui";

type Stat = { label: string; value: string; Icon: typeof Building2 };
type Row = {
  id: string;
  user_name: string;
  gym_name: string;
  duration_type: string;
  total_price: number;
  status: string;
  created_at: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ gyms: 0, bookings: 0, revenue: 0, rating: 0 });
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: gyms } = await supabase.from("gyms").select("id, name").eq("owner_id", user.id);
      const gymIds = (gyms ?? []).map((g) => g.id);
      const gymMap = new Map((gyms ?? []).map((g) => [g.id, g.name]));

      let bookings: any[] = [];
      if (gymIds.length) {
        const { data } = await supabase
          .from("bookings")
          .select("id, user_id, gym_id, duration_type, total_price, status, created_at")
          .in("gym_id", gymIds)
          .order("created_at", { ascending: false });
        bookings = data ?? [];
      }

      // Revenue this month (confirmed)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const revenue = bookings
        .filter((b) => b.status === "confirmed" && new Date(b.created_at) >= monthStart)
        .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

      let rating = 0;
      if (gymIds.length) {
        const { data: reviews } = await supabase.from("reviews").select("rating").in("gym_id", gymIds);
        if (reviews && reviews.length) {
          rating = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
        }
      }

      // Resolve user names
      const userIds = [...new Set(bookings.slice(0, 8).map((b) => b.user_id))];
      const nameMap = new Map<string, string>();
      if (userIds.length) {
        const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", userIds);
        (profiles ?? []).forEach((p) => nameMap.set(p.id, p.name));
      }

      setStats({
        gyms: gyms?.length ?? 0,
        bookings: bookings.length,
        revenue,
        rating: Math.round(rating * 10) / 10,
      });
      setRows(
        bookings.slice(0, 8).map((b) => ({
          id: b.id,
          user_name: nameMap.get(b.user_id) ?? "—",
          gym_name: gymMap.get(b.gym_id) ?? "—",
          duration_type: b.duration_type,
          total_price: Number(b.total_price),
          status: b.status,
          created_at: b.created_at,
        }))
      );
      setLoading(false);
    })();
  }, [user]);

  const cards: Stat[] = [
    { label: "Total Gyms", value: String(stats.gyms), Icon: Building2 },
    { label: "Total Bookings", value: String(stats.bookings), Icon: CalendarRange },
    { label: "This Month Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, Icon: IndianRupee },
    { label: "Avg Rating", value: stats.rating ? stats.rating.toFixed(1) : "—", Icon: Star },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Overview of your gym business</p>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#111]" />
            ))
          : cards.map((c) => (
              <div
                key={c.label}
                className="group rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:border-[#c8f04b]/40 hover:shadow-[0_0_30px_-10px_rgba(200,240,75,0.4)]"
              >
                <c.Icon className="h-6 w-6 text-[#c8f04b]" />
                <p className="mt-4 font-display text-4xl tracking-wide text-white">{c.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{c.label}</p>
              </div>
            ))}
      </div>

      {/* Recent bookings */}
      <section className="rounded-2xl border border-white/10 bg-[#111]">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-xl tracking-wide text-white">Recent Bookings</h2>
        </header>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-white/50">No bookings yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Gym</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={`border-t border-white/5 transition hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <td className="px-5 py-3 text-white">{r.user_name}</td>
                    <td className="px-5 py-3 text-white/80">{r.gym_name}</td>
                    <td className="px-5 py-3 capitalize text-white/70">{r.duration_type}</td>
                    <td className="px-5 py-3 text-white">₹{r.total_price.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-white/60">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

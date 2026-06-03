import { useEffect, useState } from "react";
import { Building2, Users, CalendarRange, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ gyms: 0, users: 0, bookings: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ count: gyms }, { count: users }, { count: bookings }, { data: confirmed }] =
        await Promise.all([
          supabase.from("gyms").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("bookings").select("*", { count: "exact", head: true }),
          supabase.from("bookings").select("total_price").eq("status", "confirmed"),
        ]);
      const revenue = (confirmed ?? []).reduce((s, b) => s + Number(b.total_price || 0), 0);
      setStats({
        gyms: gyms ?? 0,
        users: users ?? 0,
        bookings: bookings ?? 0,
        revenue,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Total Gyms", value: String(stats.gyms), Icon: Building2 },
    { label: "Total Users", value: String(stats.users), Icon: Users },
    { label: "Total Bookings", value: String(stats.bookings), Icon: CalendarRange },
    {
      label: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      Icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Admin Overview</h1>
        <p className="mt-1 text-sm text-white/60">Platform-wide statistics</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#111]" />
            ))
          : cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FieldInput, GhostButton, LimeButton, StatusBadge } from "@/components/owner/ui";

type Row = {
  id: string;
  user_name: string;
  user_email: string;
  gym_name: string;
  gym_city: string;
  start_date: string;
  end_date: string;
  duration_type: string;
  total_price: number;
  status: string;
};

const TABS = ["all", "pending", "confirmed", "cancelled"] as const;

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const DurationBadge = ({ type }: { type: string }) => (
  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
    {type}
  </span>
);

const Bookings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [q, setQ] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);

    // Step 1: owner gyms
    const { data: ownerGyms } = await supabase
      .from("gyms")
      .select("id, name, city")
      .eq("owner_id", user.id);
    const gyms = ownerGyms ?? [];
    const ownerGymIds = gyms.map((g) => g.id);

    if (!ownerGymIds.length) {
      setRows([]);
      setLoading(false);
      return;
    }

    // Step 2: bookings (no FK joins)
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .in("gym_id", ownerGymIds)
      .order("created_at", { ascending: false });
    const bookings = bookingsData ?? [];

    // Step 3: unique user ids
    const userIds = [...new Set(bookings.map((b) => b.user_id))];

    // Step 4: profiles
    let profiles: { id: string; name: string | null; email: string | null }[] = [];
    if (userIds.length) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);
      profiles = profilesData ?? [];
    }

    // Step 5: merge in JS
    const enriched: Row[] = bookings.map((b) => {
      const profile = profiles.find((p) => p.id === b.user_id);
      const gym = gyms.find((g) => g.id === b.gym_id);
      return {
        id: b.id,
        user_name: profile?.name?.trim() || "Unknown User",
        user_email: profile?.email || "",
        gym_name: gym?.name || "Unknown Gym",
        gym_city: gym?.city || "",
        start_date: b.start_date,
        end_date: b.end_date,
        duration_type: b.duration_type,
        total_price: Number(b.total_price),
        status: b.status,
      };
    });
    setRows(enriched);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Booking ${status}`);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (q && !`${r.user_name} ${r.gym_name} ${r.user_email}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, tab, q]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Bookings</h1>
        <p className="mt-1 text-sm text-white/60">Manage member bookings for your gyms</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-[#111] p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                tab === t ? "bg-[#c8f04b] text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <FieldInput placeholder="Search user or gym..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111]">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-white/50">No bookings found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Gym</th>
                <th className="px-5 py-3">Start</th>
                <th className="px-5 py-3">End</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={`border-t border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="text-white">{r.user_name}</div>
                    {r.user_email && (
                      <div className="text-xs text-white/40">{r.user_email}</div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-white/80">{r.gym_name}</div>
                    {r.gym_city && (
                      <div className="text-xs text-white/40">{r.gym_city}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-white/60">{fmtDate(r.start_date)}</td>
                  <td className="px-5 py-3 text-white/60">{fmtDate(r.end_date)}</td>
                  <td className="px-5 py-3 capitalize text-white/70"><DurationBadge type={r.duration_type} /></td>
                  <td className="px-5 py-3 font-semibold text-[#c8f04b]">₹{r.total_price.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3">
                    {r.status === "pending" && (
                      <LimeButton className="px-3 py-1.5 text-xs" onClick={() => updateStatus(r.id, "confirmed")}>Confirm</LimeButton>
                    )}
                    {r.status === "confirmed" && (
                      <GhostButton className="px-3 py-1.5 text-xs" onClick={() => updateStatus(r.id, "cancelled")}>Cancel</GhostButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Bookings;

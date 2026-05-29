import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FieldInput, GhostButton, LimeButton, StatusBadge } from "@/components/owner/ui";

type Row = {
  id: string;
  user_name: string;
  gym_name: string;
  start_date: string;
  end_date: string;
  duration_type: string;
  total_price: number;
  status: string;
};

const TABS = ["all", "pending", "confirmed", "cancelled"] as const;

const Bookings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [q, setQ] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: gyms } = await supabase.from("gyms").select("id, name").eq("owner_id", user.id);
    const ids = (gyms ?? []).map((g) => g.id);
    const gymMap = new Map((gyms ?? []).map((g) => [g.id, g.name]));
    if (!ids.length) { setRows([]); setLoading(false); return; }
    const { data: b } = await supabase
      .from("bookings")
      .select("id, user_id, gym_id, start_date, end_date, duration_type, total_price, status")
      .in("gym_id", ids)
      .order("created_at", { ascending: false });
    const userIds = [...new Set((b ?? []).map((x) => x.user_id))];
    const nameMap = new Map<string, string>();
    if (userIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", userIds);
      (profiles ?? []).forEach((p) => nameMap.set(p.id, p.name));
    }
    setRows(
      (b ?? []).map((x) => ({
        id: x.id,
        user_name: nameMap.get(x.user_id) ?? "—",
        gym_name: gymMap.get(x.gym_id) ?? "—",
        start_date: x.start_date,
        end_date: x.end_date,
        duration_type: x.duration_type,
        total_price: Number(x.total_price),
        status: x.status,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booking ${status}`);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (q && !`${r.user_name} ${r.gym_name}`.toLowerCase().includes(q.toLowerCase())) return false;
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
                  <td className="px-5 py-3 text-white">{r.user_name}</td>
                  <td className="px-5 py-3 text-white/80">{r.gym_name}</td>
                  <td className="px-5 py-3 text-white/60">{new Date(r.start_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-white/60">{new Date(r.end_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 capitalize text-white/70">{r.duration_type}</td>
                  <td className="px-5 py-3 text-white">₹{r.total_price.toLocaleString("en-IN")}</td>
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

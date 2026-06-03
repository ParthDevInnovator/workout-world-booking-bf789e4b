import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Gym = {
  id: string;
  name: string;
  city: string;
  price_per_day: number;
  is_verified: boolean;
  owner_id: string;
};

type Row = Gym & { ownerName: string };

const ManageGyms = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    setLoading(true);
    const { data: gyms } = await supabase
      .from("gyms")
      .select("id, name, city, price_per_day, is_verified, owner_id")
      .order("created_at", { ascending: false });
    const list = (gyms ?? []) as Gym[];
    const ownerIds = [...new Set(list.map((g) => g.owner_id))];
    let profiles: { id: string; name: string | null }[] = [];
    if (ownerIds.length) {
      const { data } = await supabase.from("profiles").select("id, name").in("id", ownerIds);
      profiles = data ?? [];
    }
    setRows(
      list.map((g) => ({
        ...g,
        ownerName: profiles.find((p) => p.id === g.owner_id)?.name?.trim() || "Unknown Owner",
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from("gyms").update({ is_verified: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Gym approved ✅");
    setRows((r) => r.map((x) => (x.id === id ? { ...x, is_verified: true } : x)));
  };

  const reject = async (id: string) => {
    if (!confirm("Delete this gym permanently?")) return;
    const { error } = await supabase.from("gyms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Gym removed");
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Manage Gyms</h1>
        <p className="mt-1 text-sm text-white/60">Approve or remove gyms across the platform</p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111]">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-white/50">No gyms found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                <th className="px-5 py-3">Gym Name</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Price / Day</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g, i) => (
                <tr key={g.id} className={`border-t border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                  <td className="px-5 py-3 text-white">{g.name}</td>
                  <td className="px-5 py-3 text-white/70">{g.ownerName}</td>
                  <td className="px-5 py-3 text-white/60">{g.city}</td>
                  <td className="px-5 py-3 font-semibold text-[#c8f04b]">
                    ₹{Number(g.price_per_day).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    {g.is_verified ? (
                      <span className="inline-flex rounded-full bg-[#c8f04b]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c8f04b]">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {!g.is_verified && (
                        <button
                          onClick={() => approve(g.id)}
                          className="rounded-lg bg-[#c8f04b] px-3 py-1.5 text-xs font-semibold text-black transition active:scale-95 hover:brightness-110"
                        >
                          Approve ✅
                        </button>
                      )}
                      <button
                        onClick={() => reject(g.id)}
                        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                      >
                        Reject ❌
                      </button>
                    </div>
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

export default ManageGyms;

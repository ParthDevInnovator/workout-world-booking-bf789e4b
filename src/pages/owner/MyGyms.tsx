import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GhostButton, LimeButton } from "@/components/owner/ui";

type Gym = {
  id: string;
  name: string;
  city: string;
  address: string;
  price_per_day: number;
  is_verified: boolean;
  primary_image?: string;
};

const MyGyms = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("gyms")
        .select("id, name, city, address, price_per_day, is_verified")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      const ids = (data ?? []).map((g) => g.id);
      const imageMap = new Map<string, string>();
      if (ids.length) {
        const { data: imgs } = await supabase
          .from("gym_images")
          .select("gym_id, url, is_primary")
          .in("gym_id", ids);
        (imgs ?? []).forEach((i) => {
          if (i.is_primary || !imageMap.has(i.gym_id)) imageMap.set(i.gym_id, i.url);
        });
      }
      setGyms(
        (data ?? []).map((g) => ({
          ...g,
          price_per_day: Number(g.price_per_day),
          primary_image: imageMap.get(g.id),
        }))
      );
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-white">My Gyms</h1>
          <p className="mt-1 text-sm text-white/60">Manage your listings</p>
        </div>
        <Link to="/owner/add-gym"><LimeButton>+ Add Gym</LimeButton></Link>
      </header>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-[#111]" />)}
        </div>
      ) : gyms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#111] py-20 text-center">
          <Building2 className="h-16 w-16 text-[#c8f04b]" />
          <h2 className="mt-4 font-display text-2xl text-white">No gyms yet</h2>
          <p className="mt-1 text-sm text-white/50">Start listing your first gym</p>
          <Link to="/owner/add-gym" className="mt-6"><LimeButton>Add Your First Gym</LimeButton></Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gyms.map((g) => (
            <article key={g.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition hover:border-[#c8f04b]/40">
              <div className="relative aspect-video w-full bg-white/5">
                {g.primary_image ? (
                  <img src={g.primary_image} alt={g.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30"><Building2 className="h-12 w-12" /></div>
                )}
                <span className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  g.is_verified
                    ? "border-[#c8f04b]/40 bg-[#c8f04b]/15 text-[#c8f04b]"
                    : "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"
                }`}>
                  {g.is_verified ? "Verified ✅" : "Pending ⏳"}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl tracking-wide text-white">{g.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
                  <MapPin className="h-3 w-3" /> {g.city} · {g.address}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-[#c8f04b]/15 px-3 py-1 text-xs font-semibold text-[#c8f04b]">
                  ₹{g.price_per_day.toLocaleString("en-IN")}/day
                </span>
                <div className="mt-5 flex gap-2">
                  <GhostButton className="flex-1 py-2 text-sm">Edit</GhostButton>
                  <Link to="/owner/bookings" className="flex-1">
                    <LimeButton className="w-full py-2 text-sm">View Bookings</LimeButton>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGyms;

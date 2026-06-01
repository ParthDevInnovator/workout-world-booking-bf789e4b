import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, Phone } from "lucide-react";
import GymReviews from "@/components/GymReviews";

type Gym = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  open_time: string;
  close_time: string;
  price_per_day: number;
  price_per_month: number;
  price_per_year: number;
};

type GymImage = { id: string; url: string; is_primary: boolean };

type Plan = "day" | "month" | "year";

const AMENITIES = [
  { icon: "🏋️", label: "Weights" },
  { icon: "🧘", label: "Yoga" },
  { icon: "🚿", label: "Shower" },
  { icon: "🅿️", label: "Parking" },
];

export default function GymDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gym, setGym] = useState<Gym | null>(null);
  const [images, setImages] = useState<GymImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [{ data: g }, { data: imgs }] = await Promise.all([
        supabase.from("gyms").select("*").eq("id", id).maybeSingle(),
        supabase.from("gym_images").select("*").eq("gym_id", id),
      ]);
      setGym(g as Gym | null);
      setImages((imgs as GymImage[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  const primaryImage = useMemo(() => {
    const p = images.find((i) => i.is_primary) ?? images[0];
    return p?.url ?? null;
  }, [images]);

  const totalPrice = useMemo(() => {
    if (!gym || !startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const ms = e.getTime() - s.getTime();
    if (ms < 0) return 0;
    if (plan === "day") {
      const days = Math.max(1, Math.ceil(ms / 86400000) || 1);
      return Number(gym.price_per_day) * days;
    }
    if (plan === "month") {
      const months = Math.max(1, Math.ceil(ms / (86400000 * 30)) || 1);
      return Number(gym.price_per_month) * months;
    }
    return Number(gym.price_per_year);
  }, [gym, plan, startDate, endDate]);

  const handleBook = async () => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    if (!gym || !startDate || !endDate) {
      toast.error("Pick start and end dates");
      return;
    }
    setBooking(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      gym_id: gym.id,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      duration_type: plan,
      total_price: totalPrice,
      status: "pending",
    });
    setBooking(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Booking confirmed! 🎉");
    navigate("/user/bookings");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6 max-w-6xl mx-auto">
        <Skeleton className="h-[420px] w-full rounded-2xl bg-white/5" />
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-2/3 bg-white/5" />
            <Skeleton className="h-4 w-1/2 bg-white/5" />
            <Skeleton className="h-32 w-full bg-white/5" />
          </div>
          <Skeleton className="h-96 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">Gym not found</p>
        <Link to="/gyms"><Button variant="ghost" className="text-[#c8f04b]">← Back to Gyms</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/gyms">
          <Button variant="ghost" className="text-white/70 hover:text-[#c8f04b] mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gyms
          </Button>
        </Link>

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          {primaryImage ? (
            <img src={primaryImage} alt={gym.name} className="w-full h-[420px] object-cover" />
          ) : (
            <div className="w-full h-[420px] flex items-center justify-center text-6xl">🏋️</div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-6">
            <h1 className="font-['Bebas_Neue'] text-5xl md:text-6xl tracking-wide text-[#c8f04b]">{gym.name}</h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/70 text-sm">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#c8f04b]" /> {gym.address}, {gym.city}, {gym.state} {gym.pincode}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#c8f04b]" /> {gym.open_time} – {gym.close_time}</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#c8f04b]" /> {gym.phone}</span>
            </div>

            <div>
              <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white mb-2">ABOUT THIS GYM</h2>
              <p className="text-white/70 leading-relaxed">{gym.description}</p>
            </div>

            <div>
              <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white mb-3">AMENITIES</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AMENITIES.map((a) => (
                  <div key={a.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center hover:border-[#c8f04b]/40 transition">
                    <div className="text-3xl mb-1">{a.icon}</div>
                    <div className="text-sm text-white/80">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="md:sticky md:top-6 self-start rounded-2xl border border-white/10 bg-[#111] p-6 space-y-4">
            <h3 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#c8f04b]">BOOK THIS GYM</h3>

            <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-lg">
              {(["day", "month", "year"] as Plan[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`py-2 text-xs uppercase tracking-wider rounded transition active:scale-[0.97] ${
                    plan === p ? "bg-[#c8f04b] text-black font-semibold" : "text-white/70 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/60">Start date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/60">End date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
              <span className="text-white/60 text-sm">Total</span>
              <span className="font-['Bebas_Neue'] text-3xl text-[#c8f04b]">₹{totalPrice.toLocaleString()}</span>
            </div>

            {user ? (
              <Button
                onClick={handleBook}
                disabled={booking || !startDate || !endDate}
                className="w-full bg-[#c8f04b] hover:bg-[#b3da3e] text-black font-semibold active:scale-[0.97] transition"
              >
                {booking ? "Booking…" : "BOOK NOW →"}
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth/login")}
                className="w-full bg-[#c8f04b] hover:bg-[#b3da3e] text-black font-semibold active:scale-[0.97] transition"
              >
                Login to Book
              </Button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

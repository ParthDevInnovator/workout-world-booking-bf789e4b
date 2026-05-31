import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserLayout } from "@/components/user/UserLayout";
import { CalendarDays, MapPin, ArrowRight, Package } from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "cancelled";

interface Booking {
  id: string;
  gym_id: string;
  start_date: string;
  end_date: string;
  duration_type: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  gym_name?: string;
  gym_city?: string;
  gym_image?: string;
}

const statusStyles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-[#c8f04b]/15", text: "text-[#c8f04b]", label: "CONFIRMED" },
  pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "PENDING" },
  cancelled: { bg: "bg-red-500/15", text: "text-red-400", label: "CANCELLED" },
};

const tabs = ["All", "Upcoming", "Cancelled"] as const;

type Tab = (typeof tabs)[number];

const UserBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [cancelId, setCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `id, gym_id, start_date, end_date, duration_type, total_price, status, created_at, gyms!inner(name, city), gym_images!inner(url, is_primary)`
      )
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("bookings fetch error:", error);
      toast.error("Failed to load bookings");
      setLoading(false);
      return;
    }

    const parsed: Booking[] =
      (data as any[] | null)?.map((row: any) => ({
        id: row.id,
        gym_id: row.gym_id,
        start_date: row.start_date,
        end_date: row.end_date,
        duration_type: row.duration_type,
        total_price: row.total_price,
        status: row.status,
        created_at: row.created_at,
        gym_name: row.gyms?.name ?? "Gym",
        gym_city: row.gyms?.city ?? "",
        gym_image: row.gym_images?.find((img: any) => img.is_primary)?.url || row.gym_images?.[0]?.url,
      })) ?? [];

    setBookings(parsed);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (activeTab === "All") return bookings;
    if (activeTab === "Upcoming")
      return bookings.filter((b) => b.status !== "cancelled" && new Date(b.end_date) >= new Date());
    if (activeTab === "Cancelled") return bookings.filter((b) => b.status === "cancelled");
    return bookings;
  }, [bookings, activeTab]);

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId).eq("user_id", user!.id);
    if (error) {
      toast.error("Failed to cancel booking");
      return;
    }
    toast.success("Booking cancelled");
    setCancelId(null);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)));
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <UserLayout>
      <div className="container py-8 md:py-12 animate-fade-in-up">
        <h1 className="font-display text-5xl tracking-wide text-white">MY BOOKINGS</h1>

        {/* Tabs */}
        <div className="mt-6 flex gap-6 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "text-[#c8f04b] border-b-2 border-[#c8f04b]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-white/5 bg-card p-4 animate-pulse">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/3 rounded bg-white/5" />
                  <div className="h-4 w-1/4 rounded bg-white/5" />
                  <div className="h-4 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <CalendarDays className="h-12 w-12 text-white/20" />
            <p className="mt-4 text-lg text-white/60">No bookings yet</p>
            <Link
              to="/gyms"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-6 py-3 text-sm font-semibold text-black shadow-brand hover:opacity-95 transition"
            >
              Browse Gyms <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Booking Cards */}
        {!loading && filtered.length > 0 && (
          <div className="mt-8 space-y-4">
            {filtered.map((b) => {
              const st = statusStyles[b.status];
              return (
                <div
                  key={b.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-card p-4 transition hover:-translate-y-1 hover:border-[#c8f04b]/20 hover:shadow-card sm:flex-row sm:items-center sm:gap-5"
                >
                  {/* Gym Image */}
                  <div className="shrink-0">
                    {b.gym_image ? (
                      <img
                        src={b.gym_image}
                        alt={b.gym_name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/5">
                        <Package className="h-8 w-8 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{b.gym_name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {b.gym_city}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      {fmtDate(b.start_date)} → {fmtDate(b.end_date)}
                    </p>
                  </div>

                  {/* Badges & Price */}
                  <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${st.bg} ${st.text}`}
                    >
                      {st.label}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80 uppercase">
                      {b.duration_type}
                    </span>
                    <span className="text-lg font-bold text-[#c8f04b]">₹{b.total_price}</span>
                  </div>

                  {/* Cancel Button */}
                  {b.status === "pending" && (
                    <button
                      onClick={() => setCancelId(b.id)}
                      className="shrink-0 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-400/10"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Confirm Dialog */}
        {cancelId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111] p-6 text-center shadow-card">
              <p className="text-white">Are you sure you want to cancel this booking?</p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => setCancelId(null)}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5"
                >
                  Keep it
                </button>
                <button
                  onClick={() => handleCancel(cancelId)}
                  className="rounded-lg bg-red-500/15 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/25"
                >
                  Yes, cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserBookings;

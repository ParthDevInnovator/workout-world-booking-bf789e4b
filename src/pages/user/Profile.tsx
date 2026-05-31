import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserLayout } from "@/components/user/UserLayout";
import { LogOut, Save, Calendar } from "lucide-react";

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [totalBookings, setTotalBookings] = useState(0);
  const [memberSince, setMemberSince] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    // Fetch profile
    const { data: profile } = await supabase.from("profiles").select("name, email, created_at").eq("id", user!.id).single();

    // Fetch booking count
    const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user!.id);

    setName(profile?.name ?? user?.user_metadata?.name ?? "");
    setEmail(profile?.email ?? user?.email ?? "");
    setTotalBookings(count ?? 0);
    setMemberSince(
      profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : ""
    );
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email?.slice(0, 2).toUpperCase() ?? "U";

  if (loading) {
    return (
      <UserLayout>
        <div className="container py-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c8f04b] border-t-transparent" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container py-8 md:py-12 animate-fade-in-up">
        <h1 className="font-display text-5xl tracking-wide text-white">PROFILE</h1>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Left Card */}
          <div className="md:col-span-2 space-y-6">
            {/* Avatar + Name */}
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#c8f04b] bg-[#c8f04b]/10 text-[#c8f04b] font-display text-3xl">
                {initials}
              </div>
              <div>
                <p className="text-sm text-white/50">Member</p>
                <h2 className="font-display text-3xl text-white">{name || "User"}</h2>
              </div>
            </div>

            {/* Edit Form */}
            <div className="rounded-2xl border border-white/5 bg-card p-6 shadow-card space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#c8f04b] focus:outline-none focus:ring-1 focus:ring-[#c8f04b]/30 transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-black shadow-brand hover:opacity-95 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-400/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Right Stats */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-card p-6 shadow-card text-center">
              <p className="font-display text-4xl text-[#c8f04b]">{totalBookings}</p>
              <p className="mt-1 text-sm text-white/50">Total Bookings</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-card p-6 shadow-card text-center">
              <p className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="h-5 w-5 text-[#c8f04b]" />
                <span className="text-sm font-medium">{memberSince || "—"}</span>
              </p>
              <p className="mt-1 text-sm text-white/50">Member Since</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;

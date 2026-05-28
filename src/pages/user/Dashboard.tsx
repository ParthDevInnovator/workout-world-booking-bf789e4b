import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, LogOut } from "lucide-react";

const links = [
  { to: "/user/dashboard", label: "Browse Gyms" },
  { to: "/user/bookings", label: "My Bookings" },
  { to: "/user/profile", label: "Profile" },
];

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.name as string) || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-lg font-bold">GymSpot 🏋️</Link>
          <nav className="hidden gap-1 sm:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-brand text-brand-foreground" : "text-foreground hover:bg-secondary"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="container py-12">
        <div className="rounded-3xl bg-gradient-hero p-8 text-white sm:p-12">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-glow">User dashboard</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {name} 👋</h1>
          <p className="mt-2 text-white/70">Search and book a gym for a day, month, or year.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end className="rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1">
              <Dumbbell className="h-6 w-6 text-brand" />
              <h3 className="mt-3 font-semibold">{l.label}</h3>
              <p className="text-sm text-muted-foreground">Coming soon — your gym discovery hub.</p>
            </NavLink>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;

import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Dumbbell, PlusCircle, CalendarRange, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/gyms", label: "My Gyms", icon: Dumbbell },
  { to: "/owner/gyms/new", label: "Add Gym", icon: PlusCircle },
  { to: "/owner/bookings", label: "Bookings", icon: CalendarRange },
];

const OwnerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.name as string) || user?.email?.split("@")[0] || "Owner";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground sm:flex">
        <div className="p-6">
          <Link to="/" className="text-lg font-bold text-white">GymSpot 🏋️</Link>
          <p className="mt-1 text-xs uppercase tracking-wider text-white/50">Owner Console</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-white/70 hover:bg-sidebar-accent hover:text-white"
                }`
              }
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={async () => { await signOut(); navigate("/"); }} className="m-3 inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <main className="flex-1 p-6 sm:p-10">
        {/* Mobile nav */}
        <nav className="mb-6 flex flex-wrap gap-2 sm:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) => `rounded-lg px-3 py-2 text-xs font-medium ${isActive ? "bg-brand text-brand-foreground" : "bg-secondary text-foreground"}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-3xl bg-gradient-hero p-8 text-white sm:p-12">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-glow">Owner dashboard</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {name} 👋</h1>
          <p className="mt-2 text-white/70">List, manage, and grow your gym business from here.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Total Gyms", v: "0" },
            { t: "Bookings", v: "0" },
            { t: "Pending", v: "0" },
            { t: "Revenue", v: "$0" },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">{s.t}</p>
              <p className="mt-2 text-3xl font-bold">{s.v}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;

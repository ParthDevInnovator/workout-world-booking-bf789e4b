import { ReactNode, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, X, Dumbbell, CalendarDays, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/gyms", label: "Browse Gyms", icon: Dumbbell },
  { to: "/user/bookings", label: "My Bookings", icon: CalendarDays },
  { to: "/user/profile", label: "Profile", icon: User },
];

export const UserLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-wide text-[#c8f04b]">
            GYMSPOT <span aria-hidden>🏋️</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive || (l.to === "/gyms" && location.pathname.startsWith("/gyms"))
                      ? "bg-[#c8f04b]/10 text-[#c8f04b]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="ml-2 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-400/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden rounded-lg p-2 text-white/70 hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#0a0a0a] px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive || (l.to === "/gyms" && location.pathname.startsWith("/gyms"))
                        ? "bg-[#c8f04b]/10 text-[#c8f04b]"
                        : "text-white/70 hover:bg-white/5"
                    }`
                  }
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-400/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
};

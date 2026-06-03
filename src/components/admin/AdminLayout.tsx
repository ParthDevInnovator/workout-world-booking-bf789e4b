import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const nav = [
  { to: "/admin/dashboard", label: "Overview", emoji: "🏠" },
  { to: "/admin/gyms", label: "Manage Gyms", emoji: "🏢" },
  { to: "/admin/users", label: "Users", emoji: "👥" },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.name as string) || user?.email?.split("@")[0] || "Admin";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[260px] flex-col border-r border-white/10 bg-[#111111] z-40">
        <div className="p-6">
          <Link to="/" className="font-display text-3xl tracking-wide text-[#c8f04b]">
            GYMSPOT 🏋️
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all border-l-4 ${
                  isActive
                    ? "border-[#c8f04b] bg-[#c8f04b]/10 text-[#c8f04b]"
                    : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="text-base">{l.emoji}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-white/50">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 transition active:scale-[0.97] hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-[260px] p-4 sm:p-8 pb-24 md:pb-8 w-full max-w-full overflow-x-hidden">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#111111] flex justify-around py-2">
        {nav.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium ${
                isActive ? "text-[#c8f04b]" : "text-white/60"
              }`
            }
          >
            <span className="text-lg">{l.emoji}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

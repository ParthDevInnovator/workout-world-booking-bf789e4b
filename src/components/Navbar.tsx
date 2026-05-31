import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, CalendarDays, User, LogOut } from "lucide-react";

export const Navbar = () => {
  const { user, role, signOut } = useAuth();

  const isUser = user && role === "user";
  const isOwner = user && role === "owner";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-wide text-[#c8f04b]">
          GYMSPOT <span aria-hidden>🏋️</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isUser ? (
            <>
              <Link
                to="/gyms"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <Dumbbell className="h-4 w-4" /> Browse Gyms
              </Link>
              <Link
                to="/user/bookings"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <CalendarDays className="h-4 w-4" /> My Bookings
              </Link>
              <Link
                to="/user/profile"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-400/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : isOwner ? (
            <Link
              to="/owner/dashboard"
              className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-black shadow-brand hover:opacity-95 transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 transition"
              >
                Login
              </Link>
              <Link
                to="/auth/signup"
                className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-black shadow-brand hover:opacity-95 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

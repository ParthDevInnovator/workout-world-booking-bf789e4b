import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { user, role } = useAuth();
  const dashHref = role === "owner" ? "/owner/dashboard" : "/user/dashboard";
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          GymSpot <span aria-hidden>🏋️</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link to={dashHref} className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand hover:opacity-95">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
                Login
              </Link>
              <Link to="/auth/signup" className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand hover:opacity-95">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

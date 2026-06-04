import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Dumbbell, MapPin, Calendar, Shield, Zap, Users, Star, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = { to: string; label: string };

const navItemsForRole = (hasUser: boolean, role: string | null): NavItem[] => {
  if (!hasUser) return [];
  if (role === "admin") return [{ to: "/admin/dashboard", label: "Admin Panel" }];
  if (role === "owner")
    return [
      { to: "/owner/dashboard", label: "Dashboard" },
      { to: "/owner/gyms", label: "My Gyms" },
      { to: "/owner/add-gym", label: "Add Gym" },
      { to: "/owner/bookings", label: "Bookings" },
    ];
  return [
    { to: "/gyms", label: "Browse Gyms" },
    { to: "/user/bookings", label: "My Bookings" },
    { to: "/user/profile", label: "Profile" },
  ];
};

const LandingNavbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 80 && y > lastY);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  const items = navItemsForRole(!!user, role);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="glass">
        <nav className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-3xl tracking-wider text-lime">
            GYMSPOT
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {items.map((i) => (
                  <Link
                    key={i.to}
                    to={i.to}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-white/5 hover:text-foreground"
                  >
                    {i.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="rounded-full px-5 py-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
                  Login
                </Link>
                <Link to="/auth/signup" className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-charcoal hover:opacity-90">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
            <div className="container flex flex-col gap-1 py-4">
              {user ? (
                <>
                  {items.map((i) => (
                    <Link
                      key={i.to}
                      to={i.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-4 py-3 text-base font-semibold text-foreground/90 hover:bg-white/5"
                    >
                      {i.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-base font-semibold text-red-400 hover:bg-red-400/10"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-base font-semibold text-foreground/90 hover:bg-white/5">
                    Login
                  </Link>
                  <Link to="/auth/signup" onClick={() => setOpen(false)} className="rounded-lg bg-lime px-4 py-3 text-center text-base font-semibold text-charcoal hover:opacity-90">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const Index = () => {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/user/dashboard${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-hero pt-16">
        {/* glows */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-lime/30 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[hsl(270_80%_55%)]/40 blur-[140px]" />

        <div className="container relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20">
          <div className="mx-auto max-w-5xl text-center animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-lime">
              <Zap className="h-3.5 w-3.5" /> 5000+ verified gyms
            </span>

            <h1 className="mt-8 font-display text-6xl leading-[0.95] tracking-wide sm:text-7xl md:text-8xl lg:text-9xl">
              <span className="block">FIND YOUR</span>
              <span className="block text-lime">PERFECT GYM</span>
              <span className="block text-outline">IN SECONDS</span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
              Book any gym from 1 day to 1 year. No commitments, no hidden fees, just pure fitness on your terms.
            </p>

            {/* pill search */}
            <form
              onSubmit={onSearch}
              className="mx-auto mt-10 flex w-full max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-card"
            >
              <div className="flex flex-1 items-center gap-2 pl-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city or neighborhood"
                  className="h-12 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-lime px-6 text-sm font-semibold text-charcoal hover:opacity-90"
              >
                <Search className="h-4 w-4" /> Search
              </button>
            </form>

            {/* stat cards */}
            <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
              {[
                { v: "5K+", l: "Verified Gyms" },
                { v: "200K+", l: "Active Members" },
                { v: "4.9★", l: "Average Rating" },
              ].map((s) => (
                <div key={s.l} className="glass rounded-2xl p-5 text-left">
                  <div className="font-display text-4xl text-lime">{s.v}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-5xl tracking-wide sm:text-6xl">HOW IT WORKS</h2>
          <p className="mt-3 text-muted-foreground">Three steps. Zero friction. Pure gains.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "SEARCH", d: "Discover verified gyms near you by city, price, and amenities." },
            { n: "02", t: "CHOOSE", d: "Browse photos, equipment lists, hours, and real member reviews." },
            { n: "03", t: "BOOK", d: "Reserve a day, month, or year — confirmed instantly, walk right in." },
          ].map((s) => (
            <div
              key={s.n}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-2 hover:border-lime"
            >
              <div className="font-display text-8xl text-foreground/5 transition-colors group-hover:text-lime/20">
                {s.n}
              </div>
              <h3 className="mt-2 font-display text-2xl tracking-wide">{s.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENTO FEATURES */}
      <section className="container pb-24 sm:pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-5xl tracking-wide sm:text-6xl">
            WHY <span className="text-lime">GYMSPOT</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Built for the people who lift, run, and don't quit.</p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-6 md:grid-rows-2">
          {/* Big card */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:col-span-4 md:row-span-2">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
            <Dumbbell className="h-10 w-10 text-lime" />
            <h3 className="mt-6 font-display text-4xl tracking-wide sm:text-5xl">
              FLEXIBLE PLANS,<br />ZERO LOCK-IN
            </h3>
            <p className="mt-4 max-w-md text-muted-foreground">
              Pay daily, monthly, or annually. Cancel anytime. Your gym, your rules — no long-term contracts holding you back.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["1 Day", "1 Week", "1 Month", "3 Months", "1 Year"].map((p) => (
                <span key={p} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 md:col-span-2">
            <Shield className="h-8 w-8 text-lime" />
            <h3 className="mt-4 font-display text-2xl tracking-wide">VERIFIED ONLY</h3>
            <p className="mt-2 text-sm text-muted-foreground">Every gym inspected and approved for quality.</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 md:col-span-2">
            <Calendar className="h-8 w-8 text-lime" />
            <h3 className="mt-4 font-display text-2xl tracking-wide">INSTANT BOOKING</h3>
            <p className="mt-2 text-sm text-muted-foreground">Confirmed in under 30 seconds, every time.</p>
          </div>
        </div>
      </section>

      {/* LIME CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-lime px-8 py-16 sm:px-16 sm:py-24">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-5xl leading-[0.95] tracking-wide text-charcoal sm:text-6xl md:text-7xl">
                READY TO<br />SWEAT?
              </h2>
              <p className="mt-4 max-w-md text-charcoal/80">
                Join 200,000+ members who book smarter. Find your gym in 30 seconds.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link
                to="/auth/signup"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-charcoal px-8 text-base font-semibold text-lime hover:opacity-90"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth/signup"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-charcoal px-8 text-base font-semibold text-charcoal hover:bg-charcoal hover:text-lime transition-colors"
              >
                List Your Gym
              </Link>
            </div>
          </div>
          <Users className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 text-charcoal/10" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
          <Link to="/" className="font-display text-2xl tracking-wider text-lime">
            GYMSPOT
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GymSpot. Made with 💪 in India.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-lime text-lime" /> 4.9 from 50,000+ reviews
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

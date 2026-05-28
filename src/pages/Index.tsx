import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, CalendarCheck, Sparkles, ShieldCheck, BadgeDollarSign, MousePointerClick } from "lucide-react";
import heroImg from "@/assets/hero-gym.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SubmitButton } from "@/components/ui/SubmitButton";

const Index = () => {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/user/dashboard${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/70 to-charcoal" />
        <div className="container relative py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-glow" /> OYO-style booking, for gyms
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Find & Book Your <span className="bg-gradient-to-r from-brand-glow to-white bg-clip-text text-transparent">Perfect Gym</span>
            </h1>
            <p className="mt-5 text-lg text-white/70 sm:text-xl">1 day to 1 year — your choice.</p>

            <form onSubmit={onSearch} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  className="h-12 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <SubmitButton type="submit" className="h-12">Search Gyms</SubmitButton>
            </form>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Three steps to your next workout.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Search, t: "Search", d: "Discover gyms near you by city and price." },
            { icon: Eye, t: "View", d: "Browse photos, amenities, hours, and reviews." },
            { icon: CalendarCheck, t: "Book", d: "Reserve a day, month, or full year instantly." },
          ].map((s, i) => (
            <div key={s.t} className="group relative rounded-2xl border border-border bg-card p-7 shadow-card transition hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground shadow-brand">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">Step {i + 1}</div>
              <h3 className="mt-1 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY GYMSPOT */}
      <section className="bg-secondary/60 py-20 sm:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Why GymSpot</h2>
            <p className="mt-3 text-muted-foreground">Built for flexibility, trust, and zero friction.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CalendarCheck, t: "Flexible Plans", d: "Day, month, or year — pay only for what you need." },
              { icon: ShieldCheck, t: "Verified Gyms", d: "Every listing reviewed and approved for quality." },
              { icon: BadgeDollarSign, t: "Best Price", d: "Transparent pricing with no hidden joining fees." },
              { icon: MousePointerClick, t: "Easy Booking", d: "Book in under 30 seconds — confirmed instantly." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <f.icon className="h-7 w-7 text-brand" />
                <h3 className="mt-4 font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

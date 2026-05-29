import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Star } from "lucide-react";

interface Props {
  children: ReactNode;
}

export const AuthShell = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <aside className="relative hidden overflow-hidden border-r border-white/5 bg-[#0a0a0a] p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(74 84% 62% / 0.45), transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.35), transparent 60%)" }}
        />

        <Link to="/" className="relative font-display text-3xl tracking-wide text-[#c8f04b]">
          GYMSPOT
        </Link>

        <div className="relative space-y-10">
          <h2 className="font-display text-5xl leading-[0.95] tracking-wide text-white xl:text-6xl">
            SWEAT TODAY.
            <br />
            <span className="text-[#c8f04b]">SHINE</span> TOMORROW.
          </h2>
          <p className="max-w-md text-base text-[#888]">
            Join thousands of athletes booking the best gyms in their city — flexible plans, zero commitments.
          </p>

          <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-1 text-[#c8f04b]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              "GymSpot let me train in 4 different studios last month without locking into a single membership. Game changer."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8f04b] font-display text-lg text-black">
                A
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Ananya R.</div>
                <div className="text-xs text-[#888]">Member · Bengaluru</div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-[#888]">© {new Date().getFullYear()} GymSpot. Made with 💪 in India.</p>
      </aside>

      {/* Right form panel */}
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
};

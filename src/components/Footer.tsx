export const Footer = () => (
  <footer className="border-t border-border/60 bg-charcoal text-white/70">
    <div className="container flex flex-col items-center justify-between gap-3 py-8 sm:flex-row">
      <p className="text-sm">© {new Date().getFullYear()} GymSpot. All rights reserved.</p>
      <p className="text-xs">Find & book your perfect gym — 1 day to 1 year.</p>
    </div>
  </footer>
);

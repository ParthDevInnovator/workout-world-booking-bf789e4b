import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export const FieldInput = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = "", ...props }, ref) => (
  <label className="block">
    {label && <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">{label}</span>}
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#c8f04b] focus:shadow-[0_0_0_3px_rgba(200,240,75,0.15)] ${className}`}
    />
    {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
  </label>
));
FieldInput.displayName = "FieldInput";

type TAProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };

export const FieldTextarea = forwardRef<HTMLTextAreaElement, TAProps>(({ label, error, className = "", ...props }, ref) => (
  <label className="block">
    {label && <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">{label}</span>}
    <textarea
      ref={ref}
      {...props}
      className={`w-full min-h-[120px] rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#c8f04b] focus:shadow-[0_0_0_3px_rgba(200,240,75,0.15)] ${className}`}
    />
    {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
  </label>
));
FieldTextarea.displayName = "FieldTextarea";

export const LimeButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#c8f04b] px-5 py-3 font-display text-base tracking-wider text-black transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const GhostButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-transparent px-5 py-3 font-medium text-white/80 transition hover:bg-white/5 active:scale-[0.97] ${className}`}
  >
    {children}
  </button>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const s = (status || "").toLowerCase();
  const styles: Record<string, string> = {
    confirmed: "bg-[#c8f04b]/15 text-[#c8f04b] border-[#c8f04b]/40",
    pending: "bg-yellow-400/10 text-yellow-300 border-yellow-400/40",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/40",
    completed: "bg-blue-400/10 text-blue-300 border-blue-400/40",
  };
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[s] ?? "bg-white/5 text-white/70 border-white/10"}`}>
      {status}
    </span>
  );
};

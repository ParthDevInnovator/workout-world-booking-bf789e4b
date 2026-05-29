import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const AuthSubmit = ({ loading, className, children, disabled, ...rest }: Props) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={cn(
      "group relative inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#c8f04b] font-display text-xl tracking-wider text-black transition-transform duration-200 ease-out",
      "hover:scale-[1.03] active:scale-[0.97]",
      "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100",
      "shadow-[0_10px_40px_-10px_hsl(74_84%_62%/0.6)]",
      className
    )}
  >
    {loading && <Loader2 className="h-5 w-5 animate-spin" />}
    {children}
  </button>
);

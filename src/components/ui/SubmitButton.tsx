import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "brand" | "outline";
}

export const SubmitButton = ({ loading, variant = "brand", className, children, disabled, ...rest }: Props) => {
  const base = "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = variant === "brand"
    ? "bg-gradient-brand text-brand-foreground shadow-brand hover:opacity-95"
    : "border border-border bg-background text-foreground hover:bg-secondary";
  return (
    <button {...rest} disabled={disabled || loading} className={cn(base, styles, className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

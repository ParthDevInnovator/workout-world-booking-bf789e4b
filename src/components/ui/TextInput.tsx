import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const TextInput = forwardRef<HTMLInputElement, Props>(({ label, className, id, ...rest }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>}
    <input
      ref={ref}
      id={id}
      className={cn(
        "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...rest}
    />
  </div>
));
TextInput.displayName = "TextInput";

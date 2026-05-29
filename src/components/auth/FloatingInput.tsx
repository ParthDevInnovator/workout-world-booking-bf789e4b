import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, Props>(
  ({ label, type = "text", className, id, value, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (show ? "text" : "password") : type;
    const hasValue = value !== undefined && value !== "";
    const floating = focused || hasValue;

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={actualType}
          value={value}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            "peer h-14 w-full rounded-xl border border-white/20 bg-transparent px-4 pt-5 pb-1.5 text-sm text-white outline-none transition-all",
            "placeholder-transparent",
            "focus:border-[#c8f04b] focus:shadow-[0_0_0_4px_hsl(74_84%_62%/0.15),0_0_30px_-5px_hsl(74_84%_62%/0.5)]",
            isPassword && "pr-12",
            className
          )}
          placeholder={label}
          {...rest}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 transition-all duration-200",
            floating
              ? "top-1.5 text-[10px] font-medium uppercase tracking-wider text-[#c8f04b]"
              : "top-1/2 -translate-y-1/2 text-sm text-white/50"
          )}
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-[#c8f04b]"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

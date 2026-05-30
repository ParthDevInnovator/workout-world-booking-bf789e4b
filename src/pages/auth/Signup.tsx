import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { AuthSubmit } from "@/components/auth/AuthSubmit";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  role: z.enum(["user", "owner"]),
});

const ROLES = [
  { v: "user" as const, emoji: "🏃", title: "I'm a User", desc: "Browse and book gyms" },
  { v: "owner" as const, emoji: "🏢", title: "I'm a Gym Owner", desc: "List and manage gyms" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" as "user" | "owner" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const email = form.email.toLowerCase().trim();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name: form.name.trim(), role: form.role },
      },
    });
    if (signUpError) {
      setLoading(false);
      return toast.error(signUpError.message);
    }
    // Auto sign in right after signup (email confirmation disabled)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    });
    setLoading(false);
    if (signInError) return toast.error(signInError.message);
    toast.success("Account created!");
    navigate(form.role === "owner" ? "/owner/dashboard" : "/gyms");
  };

  return (
    <AuthShell>
      <div className="space-y-2">
        <Link to="/" className="font-display text-2xl tracking-wide text-[#c8f04b] lg:hidden">
          GYMSPOT
        </Link>
        <h1 className="font-display text-5xl tracking-wide text-white">CREATE ACCOUNT</h1>
        <p className="text-sm text-[#888]">Start booking or listing gyms in seconds.</p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <FloatingInput id="name" label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <FloatingInput id="email" type="email" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <FloatingInput id="pw" type="password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        <div className="pt-2">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888]">Choose your role</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((o) => {
              const active = form.role === o.v;
              return (
                <button
                  type="button"
                  key={o.v}
                  onClick={() => setForm({ ...form, role: o.v })}
                  className={cn(
                    "rounded-xl border bg-white/[0.02] p-4 text-left transition-all duration-200",
                    "active:scale-[0.97]",
                    active
                      ? "border-[#c8f04b] bg-[#c8f04b]/5 shadow-[0_0_0_3px_hsl(74_84%_62%/0.15)]"
                      : "border-white/20 hover:border-white/40"
                  )}
                >
                  <div className="text-2xl">{o.emoji}</div>
                  <div className={cn("mt-2 font-semibold", active ? "text-[#c8f04b]" : "text-white")}>{o.title}</div>
                  <div className="mt-0.5 text-xs text-[#888]">{o.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <AuthSubmit type="submit" loading={loading}>CREATE ACCOUNT</AuthSubmit>
      </form>

      <p className="mt-8 text-center text-sm text-[#888]">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-semibold text-[#c8f04b] hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Signup;

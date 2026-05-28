import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { TextInput } from "@/components/ui/TextInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { User, Building2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  role: z.enum(["user", "owner"]),
});

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" as "user" | "owner" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name: form.name, role: form.role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate(form.role === "owner" ? "/owner/dashboard" : "/user/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start booking or listing gyms in seconds.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <TextInput id="name" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextInput id="email" type="email" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextInput id="pw" type="password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

            <div>
              <p className="mb-2 text-sm font-medium">I am a…</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { v: "user", icon: User, t: "User", d: "Book gyms" },
                  { v: "owner", icon: Building2, t: "Gym Owner", d: "List gyms" },
                ] as const).map((o) => (
                  <button
                    type="button"
                    key={o.v}
                    onClick={() => setForm({ ...form, role: o.v })}
                    className={`rounded-xl border p-4 text-left transition ${form.role === o.v ? "border-brand bg-brand/5 ring-2 ring-brand" : "border-border hover:border-foreground/30"}`}
                  >
                    <o.icon className={`h-5 w-5 ${form.role === o.v ? "text-brand" : "text-muted-foreground"}`} />
                    <div className="mt-2 font-semibold">{o.t}</div>
                    <div className="text-xs text-muted-foreground">{o.d}</div>
                  </button>
                ))}
              </div>
            </div>

            <SubmitButton type="submit" loading={loading} className="w-full">Create Account</SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/auth/login" className="font-semibold text-brand hover:underline">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;

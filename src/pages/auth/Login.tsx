import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { AuthSubmit } from "@/components/auth/AuthSubmit";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });
    console.log("login result:", data, error);
    if (error || !data.user) {
      setLoading(false);
      if ((error as any)?.code === "email_not_confirmed") {
        return toast.error("Please sign up again — click Sign Up button");
      }
      return toast.error(error?.message ?? "Login failed");
    }
    const { data: rd, error: rErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();
    console.log("role result:", rd, rErr);
    setLoading(false);
    toast.success("Welcome back!");
    navigate(rd?.role === "owner" ? "/owner/dashboard" : "/gyms");
  };

  return (
    <AuthShell>
      <div className="space-y-2">
        <Link to="/" className="font-display text-2xl tracking-wide text-[#c8f04b] lg:hidden">
          GYMSPOT
        </Link>
        <h1 className="font-display text-5xl tracking-wide text-white">WELCOME BACK</h1>
        <p className="text-sm text-[#888]">Log in to manage bookings or your gyms.</p>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <FloatingInput id="email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FloatingInput id="pw" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <AuthSubmit type="submit" loading={loading}>LOGIN</AuthSubmit>
      </form>

      <p className="mt-8 text-center text-sm text-[#888]">
        New here?{" "}
        <Link to="/auth/signup" className="font-semibold text-[#c8f04b] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;

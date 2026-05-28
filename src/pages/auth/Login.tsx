import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { TextInput } from "@/components/ui/TextInput";
import { SubmitButton } from "@/components/ui/SubmitButton";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    const { data: rd } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
    setLoading(false);
    toast.success("Welcome back!");
    navigate(rd?.role === "owner" ? "/owner/dashboard" : "/user/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to manage bookings or your gyms.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <TextInput id="email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextInput id="pw" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <SubmitButton type="submit" loading={loading} className="w-full">Login</SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/auth/signup" className="font-semibold text-brand hover:underline">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;

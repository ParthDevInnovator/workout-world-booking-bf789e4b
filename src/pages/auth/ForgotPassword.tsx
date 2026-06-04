import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { AuthSubmit } from "@/components/auth/AuthSubmit";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin + "/auth/reset-password",
    });
    setLoading(false);
    if (error) {
      return toast.error(error.message);
    }
    toast.success("Reset link sent! Check your email ✅");
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="animate-fade-in-up flex flex-col items-center space-y-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#c8f04b]/10">
            <CheckCircle2 className="h-10 w-10 text-[#c8f04b]" />
          </div>
          <h1 className="font-display text-5xl tracking-wide text-[#c8f04b]">
            CHECK YOUR INBOX
          </h1>
          <p className="max-w-xs text-sm text-[#888]">
            We sent a reset link to <span className="text-white">{email}</span>
          </p>
          <Link
            to="/auth/login"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-white/20 px-8 font-display text-xl tracking-wider text-white transition hover:border-[#c8f04b]/50 hover:text-[#c8f04b]"
          >
            Back to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="space-y-2">
        <h1 className="font-display text-5xl tracking-wide text-[#c8f04b]">
          FORGOT PASSWORD
        </h1>
        <p className="text-sm text-[#888]">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <FloatingInput
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthSubmit type="submit" loading={loading}>
          Send Reset Link →
        </AuthSubmit>
      </form>

      <p className="mt-8 text-center text-sm text-[#888]">
        Remember your password?{" "}
        <Link to="/auth/login" className="font-semibold text-[#c8f04b] hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPassword;

import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { AuthSubmit } from "@/components/auth/AuthSubmit";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchError, setMatchError] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      return;
    }
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // session is set, allow password update
      }
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMatchError(false);

    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    if (password !== confirm) {
      setMatchError(true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      return toast.error(error.message);
    }
    toast.success("Password updated! ✅");
    setTimeout(() => navigate("/auth/login"), 2000);
  };

  return (
    <AuthShell>
      <div className="space-y-2">
        <h1 className="font-display text-5xl tracking-wide text-[#c8f04b]">
          SET NEW PASSWORD
        </h1>
        <p className="text-sm text-[#888]">Choose a strong new password</p>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <FloatingInput
          id="password"
          type="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FloatingInput
          id="confirm"
          type="password"
          label="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {matchError && (
          <p className="text-sm font-medium text-red-500">Passwords do not match</p>
        )}
        <AuthSubmit type="submit" loading={loading}>
          Update Password →
        </AuthSubmit>
      </form>

      <p className="mt-8 text-center text-sm text-[#888]">
        <Link to="/auth/login" className="font-semibold text-[#c8f04b] hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthShell>
  );
};

export default ResetPassword;

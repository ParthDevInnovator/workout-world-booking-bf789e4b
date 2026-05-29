import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FieldInput, LimeButton } from "@/components/owner/ui";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("name, email").eq("id", user.id).maybeSingle();
      setName(data?.name ?? "");
      setEmail(data?.email ?? user.email ?? "");
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Profile</h1>
        <p className="mt-1 text-sm text-white/60">Manage your account info</p>
      </header>
      <div className="space-y-5 rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-8">
        <FieldInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <FieldInput label="Email" value={email} disabled />
        <LimeButton onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</LimeButton>
      </div>
    </div>
  );
};

export default Profile;

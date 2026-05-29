import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FieldInput, FieldTextarea, GhostButton, LimeButton } from "@/components/owner/ui";

type FormData = {
  name: string;
  description: string;
  phone: string;
  open_time: string;
  close_time: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  price_per_day: string;
  price_per_month: string;
  price_per_year: string;
};

const empty: FormData = {
  name: "", description: "", phone: "", open_time: "06:00", close_time: "22:00",
  address: "", city: "", state: "", pincode: "",
  price_per_day: "", price_per_month: "", price_per_year: "",
};

const AddGym = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "price_per_day" && v) {
        const d = Number(v);
        if (!isNaN(d)) {
          if (!f.price_per_month) next.price_per_month = String(d * 25);
          if (!f.price_per_year) next.price_per_year = String(d * 280);
        }
      }
      return next;
    });
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateStep = (): boolean => {
    const err: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (!form.name.trim()) err.name = "Gym name is required";
      if (form.description.trim().length < 50) err.description = "Description must be at least 50 characters";
      if (!form.phone.trim()) err.phone = "Phone is required";
    }
    if (step === 2) {
      if (!form.address.trim()) err.address = "Address is required";
      if (!form.city.trim()) err.city = "City is required";
      if (!form.state.trim()) err.state = "State is required";
      if (!/^\d{4,6}$/.test(form.pincode)) err.pincode = "Valid pincode required";
    }
    if (step === 3) {
      if (!form.price_per_day || Number(form.price_per_day) <= 0) err.price_per_day = "Required";
      if (!form.price_per_month || Number(form.price_per_month) <= 0) err.price_per_month = "Required";
      if (!form.price_per_year || Number(form.price_per_year) <= 0) err.price_per_year = "Required";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onPickFiles = (selected: FileList | null) => {
    if (!selected) return;
    const accepted = Array.from(selected).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    const tooBig = accepted.filter((f) => f.size > 5 * 1024 * 1024);
    if (tooBig.length) { toast.error("Each photo must be under 5MB"); return; }
    const combined = [...files, ...accepted].slice(0, 5);
    if (files.length + accepted.length > 5) toast.error("Max 5 photos");
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (i: number) => {
    const next = files.filter((_, x) => x !== i);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onPickFiles(e.dataTransfer.files);
  };

  const submit = async () => {
    if (!validateStep() || !user) return;
    setSubmitting(true);
    try {
      const { data: gym, error: gymErr } = await supabase
        .from("gyms")
        .insert({
          owner_id: user.id,
          name: form.name.trim(),
          description: form.description.trim(),
          phone: form.phone.trim(),
          open_time: form.open_time,
          close_time: form.close_time,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          price_per_day: Number(form.price_per_day),
          price_per_month: Number(form.price_per_month),
          price_per_year: Number(form.price_per_year),
        })
        .select("id")
        .single();
      if (gymErr) throw gymErr;

      // upload images
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ext = f.name.split(".").pop();
        const path = `${user.id}/${gym.id}/${Date.now()}_${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from("gym-images").upload(path, f);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("gym-images").getPublicUrl(path);
        await supabase.from("gym_images").insert({
          gym_id: gym.id,
          url: pub.publicUrl,
          is_primary: i === 0,
        });
      }

      toast.success("Gym submitted for review! ✅");
      navigate("/owner/gyms");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit gym");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(3, s + 1)); };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Add Gym</h1>
        <p className="mt-1 text-sm text-white/60">Step {step} of 3</p>
      </header>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-full transition ${n <= step ? "bg-[#c8f04b]" : "bg-white/10"}`} />
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl text-white">Basic Info</h2>
            <FieldInput label="Gym Name" value={form.name} onChange={update("name")} error={errors.name} placeholder="Iron Paradise Gym" />
            <FieldTextarea label="Description (min 50 chars)" value={form.description} onChange={update("description")} error={errors.description} placeholder="Tell members what makes your gym special..." />
            <FieldInput label="Phone Number" value={form.phone} onChange={update("phone")} error={errors.phone} placeholder="+91 98765 43210" />
            <div className="grid grid-cols-2 gap-4">
              <FieldInput label="Open Time" type="time" value={form.open_time} onChange={update("open_time")} />
              <FieldInput label="Close Time" type="time" value={form.close_time} onChange={update("close_time")} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl text-white">Location</h2>
            <FieldInput label="Address" value={form.address} onChange={update("address")} error={errors.address} placeholder="Street, Area, Landmark" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldInput label="City" value={form.city} onChange={update("city")} error={errors.city} />
              <FieldInput label="State" value={form.state} onChange={update("state")} error={errors.state} />
              <FieldInput label="Pincode" value={form.pincode} onChange={update("pincode")} error={errors.pincode} />
            </div>
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/30 text-white/40">
              <MapPin className="mr-2 h-5 w-5" /> Map preview (coming soon)
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-white">Pricing</h2>
              <p className="mt-1 text-xs text-white/50">Hint: Monthly ≈ Daily × 25 · Yearly ≈ Daily × 280</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldInput label="Per Day (₹)" type="number" value={form.price_per_day} onChange={update("price_per_day")} error={errors.price_per_day} />
              <FieldInput label="Per Month (₹)" type="number" value={form.price_per_month} onChange={update("price_per_month")} error={errors.price_per_month} />
              <FieldInput label="Per Year (₹)" type="number" value={form.price_per_year} onChange={update("price_per_year")} error={errors.price_per_year} />
            </div>

            <div>
              <h3 className="font-display text-xl text-white">Photos</h3>
              <p className="mt-1 text-xs text-white/50">JPG, PNG, WEBP · Max 5 photos · First photo is the cover</p>
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c8f04b]/40 bg-black/30 px-6 py-12 text-center transition hover:border-[#c8f04b]"
              >
                <Upload className="h-10 w-10 text-[#c8f04b]" />
                <p className="mt-3 text-sm text-white">Drop gym photos here</p>
                <p className="text-xs text-white/40">or click to browse</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(e) => onPickFiles(e.target.files)}
                />
              </div>
              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {previews.map((src, i) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-[#c8f04b] px-1.5 py-0.5 text-[9px] font-bold text-black">PRIMARY</span>
                      )}
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-500"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          {step > 1 ? <GhostButton onClick={() => setStep((s) => s - 1)}>← Back</GhostButton> : <div />}
          {step < 3 ? (
            <LimeButton onClick={next}>Next →</LimeButton>
          ) : (
            <LimeButton onClick={submit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Gym →"}
            </LimeButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGym;

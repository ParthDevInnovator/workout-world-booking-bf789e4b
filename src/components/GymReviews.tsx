import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
};

const MAX = 300;
const MIN = 20;

export default function GymReviews({ gymId }: { gymId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: rev } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, created_at")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false });

    const list = (rev as Review[]) ?? [];

    // resolve names
    const ids = [...new Set(list.map((r) => r.user_id))];
    const nameMap = new Map<string, string>();
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", ids);
      profiles?.forEach((p) => nameMap.set(p.id, p.name));
    }
    const enriched = list.map((r) => ({ ...r, user_name: nameMap.get(r.user_id) }));
    setReviews(enriched);
    setMyReview(user ? enriched.find((r) => r.user_id === user.id) ?? null : null);

    if (user) {
      const { data: bk } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("gym_id", gymId)
        .eq("status", "confirmed")
        .limit(1);
      setHasConfirmed(!!bk?.length);
    } else {
      setHasConfirmed(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId, user?.id]);

  const submit = async () => {
    if (!user) return;
    if (rating < 1) return toast.error("Pick a star rating");
    const trimmed = comment.trim();
    if (trimmed.length < MIN) return toast.error(`Comment must be at least ${MIN} characters`);
    if (trimmed.length > MAX) return toast.error(`Comment must be under ${MAX} characters`);

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      gym_id: gymId,
      rating,
      comment: trimmed,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Review posted! ⭐");
    setRating(0);
    setComment("");
    await load();
  };

  const Stars = ({
    value,
    interactive = false,
    size = "w-5 h-5",
  }: {
    value: number;
    interactive?: boolean;
    size?: string;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = interactive ? n <= (hover || rating) : n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && setRating(n)}
            className={`${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}`}
          >
            <Star
              className={`${size} ${
                filled ? "fill-[#c8f04b] text-[#c8f04b]" : "text-white/20"
              }`}
            />
          </button>
        );
      })}
    </div>
  );

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-white">REVIEWS</h2>
        <span className="text-sm text-white/50">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        ) : reviews.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
            No reviews yet — be the first to share your experience.
          </p>
        ) : (
          reviews.map((r) => {
            const mine = user && r.user_id === user.id;
            return (
              <div
                key={r.id}
                className={`rounded-xl border p-4 ${
                  mine
                    ? "border-[#c8f04b]/50 bg-[#c8f04b]/[0.04] shadow-[0_0_24px_-12px_rgba(200,240,75,0.5)]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{r.user_name ?? "Member"}</span>
                    <Stars value={r.rating} size="w-4 h-4" />
                  </div>
                  {mine && (
                    <span className="rounded-full border border-[#c8f04b]/50 bg-[#c8f04b]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c8f04b]">
                      Your Review ✅
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{r.comment}</p>
                <p className="mt-2 text-[11px] text-white/40">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Write a review */}
      <div className="mt-8">
        <h3 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white">WRITE A REVIEW</h3>

        {!user ? (
          <p className="mt-3 text-sm text-white/50">Log in to leave a review.</p>
        ) : myReview ? (
          <p className="mt-3 text-sm text-white/50">
            You've already reviewed this gym. Thanks for sharing!
          </p>
        ) : !hasConfirmed ? (
          <p className="mt-3 text-sm text-white/50">
            Book and visit this gym to leave a review.
          </p>
        ) : (
          <div className="mt-4 rounded-xl border border-white/10 bg-[#111] p-5 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
                Your rating
              </label>
              <Stars value={rating} interactive size="w-7 h-7" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
                Your comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX))}
                placeholder="Share your experience..."
                rows={4}
                className="w-full resize-none rounded-lg border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#c8f04b] focus:shadow-[0_0_0_3px_rgba(200,240,75,0.15)]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-white/40">
                <span>Minimum {MIN} characters</span>
                <span>
                  {comment.length}/{MAX}
                </span>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={submitting || rating < 1 || comment.trim().length < MIN}
              className="inline-flex items-center gap-2 rounded-lg bg-[#c8f04b] px-5 py-3 font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Submit Review →"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

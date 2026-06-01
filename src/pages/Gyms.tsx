import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, ArrowRight, Dumbbell, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Gym {
  id: string;
  name: string;
  city: string;
  open_time: string;
  close_time: string;
  price_per_day: number;
  primary_image?: string;
  avg_rating: number;
  review_count: number;
}

type SortKey = "newest" | "rating" | "price";

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/10 bg-card p-3 animate-pulse">
    <div className="aspect-[4/3] w-full rounded-xl bg-white/5" />
    <div className="mt-4 h-5 w-3/4 rounded bg-white/5" />
    <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
    <div className="mt-3 flex items-center justify-between">
      <div className="h-5 w-16 rounded bg-white/5" />
      <div className="h-8 w-24 rounded bg-white/5" />
    </div>
  </div>
);

const RatingPill = ({ rating, count }: { rating: number; count: number }) => {
  if (!count) {
    return <span className="text-xs text-white/40">No reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-white/80">
      <Star className="h-3.5 w-3.5 fill-[#c8f04b] text-[#c8f04b]" />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-white/40">
        ({count} review{count !== 1 ? "s" : ""})
      </span>
    </span>
  );
};

const GymCard = ({ gym }: { gym: Gym }) => (
  <div className="group relative rounded-2xl border border-white/10 bg-card p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c8f04b]/50 hover:shadow-[0_0_24px_-8px_rgba(200,240,75,0.35)]">
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/5">
      {gym.primary_image ? (
        <img
          src={gym.primary_image}
          alt={gym.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Dumbbell className="h-10 w-10 text-white/10" />
        </div>
      )}
    </div>

    <div className="mt-4 px-1">
      <h3 className="font-display text-xl tracking-wide text-foreground truncate">{gym.name}</h3>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{gym.city}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/40">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>
          {gym.open_time} — {gym.close_time}
        </span>
      </div>
      <div className="mt-2">
        <RatingPill rating={gym.avg_rating} count={gym.review_count} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-xl text-[#c8f04b]">
          ₹{gym.price_per_day}
          <span className="ml-1 text-xs font-normal text-white/40">/day</span>
        </span>
        <Link
          to={`/gyms/${gym.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f04b]/10 px-4 py-2 text-sm font-semibold text-[#c8f04b] transition-all hover:bg-[#c8f04b]/20 active:scale-[0.97]"
        >
          View Gym <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  </div>
);

const Gyms = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("gyms")
        .select("id, name, city, open_time, close_time, price_per_day")
        .eq("is_verified", true)
        .order("created_at", { ascending: false });

      if (error || !data) {
        setGyms([]);
        setLoading(false);
        return;
      }

      const gymIds = data.map((g) => g.id);

      const [imgRes, reviewRes] = await Promise.all([
        supabase.from("gym_images").select("gym_id, url").in("gym_id", gymIds).eq("is_primary", true),
        supabase.from("reviews").select("gym_id, rating").in("gym_id", gymIds),
      ]);

      const imageMap = new Map<string, string>();
      imgRes.data?.forEach((img) => imageMap.set(img.gym_id, img.url));

      const ratingMap = new Map<string, { sum: number; count: number }>();
      reviewRes.data?.forEach((r) => {
        const cur = ratingMap.get(r.gym_id) ?? { sum: 0, count: 0 };
        cur.sum += r.rating || 0;
        cur.count += 1;
        ratingMap.set(r.gym_id, cur);
      });

      setGyms(
        data.map((g) => {
          const r = ratingMap.get(g.id);
          return {
            ...g,
            primary_image: imageMap.get(g.id),
            avg_rating: r ? r.sum / r.count : 0,
            review_count: r?.count ?? 0,
          };
        })
      );
      setLoading(false);
    };

    fetchGyms();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = gyms;
    if (q) {
      list = list.filter(
        (g) => g.name.toLowerCase().includes(q) || g.city.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "rating") {
      sorted.sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count);
    } else if (sort === "price") {
      sorted.sort((a, b) => Number(a.price_per_day) - Number(b.price_per_day));
    }
    return sorted;
  }, [gyms, query, sort]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-3xl tracking-wider text-[#c8f04b]">
            GYMSPOT
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/15 bg-transparent px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5 active:scale-[0.97]"
          >
            Back
          </button>
        </div>
      </header>

      <div className="container py-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-5xl tracking-wide sm:text-6xl">
            BROWSE <span className="text-[#c8f04b]">GYMS</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Find verified gyms near you. Book by the day, month, or year.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/15 bg-card px-5 py-3 shadow-card transition focus-within:border-[#c8f04b]/50 focus-within:shadow-[0_0_20px_-6px_rgba(200,240,75,0.25)]">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by gym name or city..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-white/15 bg-card px-5 py-3 text-sm text-foreground outline-none transition focus:border-[#c8f04b]/50"
          >
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {loading
            ? "Loading gyms..."
            : `${filtered.length} gym${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-card">
              <Search className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="mt-6 font-display text-2xl tracking-wide text-foreground">
              No gyms found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {query
                ? `We couldn't find any gyms matching "${query}". Try a different search.`
                : "There are no verified gyms available right now. Check back later!"}
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c8f04b] px-6 py-2.5 font-display text-sm tracking-wider text-black transition-transform hover:scale-[1.02] active:scale-[0.97]"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((gym) => (
              <GymCard key={gym.id} gym={gym} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gyms;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: "user" | "owner" | "admin";
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const roleBadge = (role: Row["role"]) => {
  const map = {
    user: "bg-blue-500/15 text-blue-400",
    owner: "bg-[#c8f04b]/15 text-[#c8f04b]",
    admin: "bg-purple-500/15 text-purple-400",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[role]}`}
    >
      {role}
    </span>
  );
};

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, name, email, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const list = (profiles ?? []).map((p) => ({
        id: p.id,
        name: p.name?.trim() || "—",
        email: p.email ?? "",
        created_at: p.created_at,
        role:
          ((roles ?? []).find((r) => r.user_id === p.id)?.role as Row["role"]) || "user",
      }));
      setRows(list);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-white">Users</h1>
        <p className="mt-1 text-sm text-white/60">All registered accounts</p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111]">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-white/50">No users found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-t border-white/5 hover:bg-white/5 ${
                    i % 2 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="px-5 py-3 text-white">{u.name}</td>
                  <td className="px-5 py-3 text-white/70">{u.email}</td>
                  <td className="px-5 py-3">{roleBadge(u.role)}</td>
                  <td className="px-5 py-3 text-white/60">{fmt(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;

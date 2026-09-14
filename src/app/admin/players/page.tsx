import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import "../quests/quests.css";
import "./players.css";

type Player = {
  _id: string;
  email?: string;
  username?: string;
  display_name?: string;
  realm_id?: string;
  level?: number;
  experience?: number;
  coin?: number;
  status?: "active" | "suspended" | "banned";
  last_login_at?: string;
  createdAt?: string;
};

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value))
  : "—";

export default async function Players({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.slice(0, 100) : "";
  const realm = typeof params.realm === "string" ? params.realm.slice(0, 50) : "";
  const status = ["active", "suspended", "banned"].includes(String(params.status)) ? String(params.status) : "";
  const page = Math.floor(Math.max(1, Math.min(100000, Number(params.page) || 1)));
  const query = new URLSearchParams({ page: String(page), ...(search ? { search } : {}), ...(realm ? { realm } : {}), ...(status ? { status } : {}) });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");

  let result: { data: Player[]; total: number; limit: number } | null = null;
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/players?${query}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (response.status === 401) redirect("/login");
    if (response.ok) result = await response.json();
  } catch {}

  const pageLink = (next: number) => {
    const nextQuery = new URLSearchParams(query);
    nextQuery.set("page", String(next));
    return `/admin/players?${nextQuery}`;
  };

  return (
    <section>
      <p className="eyebrow">PLAYER MANAGEMENT</p>
      <div className="list-heading"><div><h1>Players</h1><p className="muted">View player accounts, progression, realm, and account status.</p></div></div>
      <form className="quest-filters">
        <input name="search" aria-label="Search players" placeholder="Search name, username, or email…" defaultValue={search} />
        <input name="realm" aria-label="Filter by realm" placeholder="Realm" defaultValue={realm} />
        <select name="status" aria-label="Account status" defaultValue={status}>
          <option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
        </select>
        <Button type="submit" variant="outline"><Search />Search</Button>
        <Button type="button" variant="ghost" asChild><Link href="/admin/players"><X />Reset</Link></Button>
      </form>
      {!result ? <p role="alert" className="error">Unable to load players. Check the backend connection and refresh.</p> : (
        <div className="quest-table-wrap">
          <div className="quest-table-scroll"><table className="quest-table">
            <caption className="quest-caption">{result.total} players</caption>
            <thead><tr>{["No", "Player", "Email", "Realm", "Level", "EXP", "Coins", "Status", "Last login", "Joined"].map((name) => <th key={name}>{name}</th>)}</tr></thead>
            <tbody>{result.data.length ? result.data.map((player, index) => (
              <tr key={player._id}>
                <td>{(page - 1) * 20 + index + 1}</td>
                <td className="quest-name"><strong>{player.display_name || player.username || "Unnamed player"}</strong><small>{player._id}</small></td>
                <td>{player.email || "—"}</td><td>{player.realm_id || "Unbound"}</td><td>{player.level ?? 1}</td>
                <td>{(player.experience ?? 0).toLocaleString()}</td><td>{(player.coin ?? 0).toLocaleString()}</td>
                <td><span className={`player-status player-status-${player.status || "active"}`}>{player.status || "active"}</span></td>
                <td>{formatDate(player.last_login_at)}</td><td>{formatDate(player.createdAt)}</td>
              </tr>
            )) : <tr><td colSpan={10} className="quest-empty">{search || realm || status ? "No players match your filters." : "No players registered yet."}</td></tr>}</tbody>
          </table></div>
          <footer className="quest-pagination"><span>Page {page} · {result.total} results</span><div>
            {page > 1 && <Button size="sm" variant="outline" asChild><Link href={pageLink(page - 1)}><ChevronLeft />Previous</Link></Button>}
            {page * 20 < result.total && <Button size="sm" variant="outline" asChild><Link href={pageLink(page + 1)}>Next<ChevronRight /></Link></Button>}
          </div></footer>
        </div>
      )}
    </section>
  );
}

import { unstable_rethrow } from "next/navigation";
import { adminFetch } from "@/lib/admin-session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import "../quests/quests.css";
import "./players.css";
import ResetPlayerButton from "./reset-player-button";

type Player = {
  _id: string;
  email?: string;
  username?: string;
  display_name?: string;
  realm_id?: string;
  level?: number;
  experience?: number;
  crown?: number;
  status?: "active" | "suspended" | "banned";
  last_login_at?: string;
  createdAt?: string;
};

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value))
  : "Not set";

export default async function Players({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.slice(0, 100) : "";
  const realm = typeof params.realm === "string" ? params.realm.slice(0, 50) : "";
  const status = ["active", "suspended", "banned"].includes(String(params.status)) ? String(params.status) : "";
  const page = Math.floor(Math.max(1, Math.min(100000, Number(params.page) || 1)));
  const query = new URLSearchParams({ page: String(page), ...(search ? { search } : {}), ...(realm ? { realm } : {}), ...(status ? { status } : {}) });

  let result: { data: Player[]; total: number; limit: number } | null = null;
  try {
    const response = await adminFetch(`/admin/players?${query}`, {
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (response.ok) result = await response.json();
  } catch (error) { unstable_rethrow(error); }

  const pageLink = (next: number) => {
    const nextQuery = new URLSearchParams(query);
    nextQuery.set("page", String(next));
    return `/admin/players?${nextQuery}`;
  };

  return (
    <section>
      <p className="eyebrow">Player management</p>
      <div className="list-heading"><div><h1>Players</h1><p className="muted">View player accounts, progression, realm, and account status.</p></div></div>
      {params.reset === "1" && <p role="status">Player data reset successfully.</p>}
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
            <thead><tr>{["No", "Player", "Email", "Realm", "Level", "EXP", "Crown", "Status", "Last login", "Joined", "Action"].map((name) => <th key={name}>{name}</th>)}</tr></thead>
            <tbody>{result.data.length ? result.data.map((player, index) => (
              <tr key={player._id}>
                <td>{(page - 1) * 20 + index + 1}</td>
                <td className="quest-name"><strong>{player.display_name || player.username || "Unnamed player"}</strong><small>{player._id}</small></td>
                <td>{player.email || "Not set"}</td><td>{player.realm_id || "Unbound"}</td><td>{player.level ?? 1}</td>
                <td>{(player.experience ?? 0).toLocaleString()}</td><td>{(player.crown ?? 0).toLocaleString()}</td>
                <td><span className={`player-status player-status-${player.status || "active"}`}>{player.status || "active"}</span></td>
                <td>{formatDate(player.last_login_at)}</td><td>{formatDate(player.createdAt)}</td><td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/players/${player._id}`}>View</Link>
                    </Button>
                    <ResetPlayerButton playerId={player._id} playerName={player.username || player.email || player._id} />
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={11} className="quest-empty">{search || realm || status ? "No players match these filters. Reset the filters to view every player." : "No players have registered yet. New accounts will appear here after registration."}</td></tr>}</tbody>
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

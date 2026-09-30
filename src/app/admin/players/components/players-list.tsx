"use client";

import { Input } from "@/components/ui/input";

import { Select } from "@/components/ui/select";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { usePlayers } from "@/hooks/use-players";
import ResetPlayerButton from "./reset-player-button";

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value))
  : "Not set";

export default function PlayersList() {
  const params = useSearchParams();
  const search = (params.get("search") || "").slice(0, 100);
  const realm = (params.get("realm") || "").slice(0, 50);
  const statusParam = params.get("status") || "";
  const status = ["active", "suspended", "banned"].includes(statusParam) ? statusParam : "";
  const page = Math.floor(Math.max(1, Math.min(100000, Number(params.get("page")) || 1)));
  const query = new URLSearchParams({ page: String(page), ...(search ? { search } : {}), ...(realm ? { realm } : {}), ...(status ? { status } : {}) });

  const playersQuery = usePlayers(query.toString());
  const result = playersQuery.data;

  const pageLink = (next: number) => {
    const nextQuery = new URLSearchParams(query);
    nextQuery.set("page", String(next));
    return `/admin/players?${nextQuery}`;
  };

  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground">Player management</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start"><div><h1>Players</h1><p className="text-muted-foreground">View player accounts, progression, realm, and account status.</p></div></div>
      {params.get("reset") === "1" && <p role="status">Player data reset successfully.</p>}
      <form className="my-6 flex flex-wrap items-center gap-3">
        <Input name="search" aria-label="Search players" placeholder="Search name, username, or email…" defaultValue={search} />
        <Input name="realm" aria-label="Filter by realm" placeholder="Realm" defaultValue={realm} />
        <Select name="status" aria-label="Account status" defaultValue={status}>
          <option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
        </Select>
        <Button type="submit" variant="outline"><Search />Search</Button>
        <Button type="button" variant="ghost" asChild><Link href="/admin/players"><X />Reset</Link></Button>
      </form>
      {playersQuery.isPending ? <p>Loading players…</p> : playersQuery.isError || !result ? <p role="alert" className="text-sm text-destructive">Unable to load players. Check the backend connection and refresh.</p> : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <Table>
            <TableCaption className="p-[18px] text-left font-semibold">{result.total} players</TableCaption>
            <TableHeader><TableRow>{["No", "Player", "Email", "Realm", "Level", "EXP", "Crown", "Status", "Last login", "Joined", "Action"].map((name) => <TableHead key={name}>{name}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{result.data.length ? result.data.map((player, index) => (
              <TableRow key={player._id}>
                <TableCell>{(page - 1) * 20 + index + 1}</TableCell>
                <TableCell className="min-w-[230px]"><strong>{player.display_name || player.username || "Unnamed player"}</strong><small>{player._id}</small></TableCell>
                <TableCell>{player.email || "Not set"}</TableCell><TableCell>{player.realm_id || "Unbound"}</TableCell><TableCell>{player.level ?? 1}</TableCell>
                <TableCell>{(player.experience ?? 0).toLocaleString()}</TableCell><TableCell>{(player.crown ?? 0).toLocaleString()}</TableCell>
                <TableCell><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${player.status === "banned" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : player.status === "suspended" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-[var(--primary-soft)] text-[var(--primary-soft-foreground)]"}`}>{player.status || "active"}</span></TableCell>
                <TableCell>{formatDate(player.last_login_at)}</TableCell><TableCell>{formatDate(player.createdAt)}</TableCell><TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/players/${player._id}`}>View</Link>
                    </Button>
                    <ResetPlayerButton playerId={player._id} playerName={player.username || player.email || player._id} />
                  </div>
                </TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={11} className="p-8 text-center text-muted-foreground">{search || realm || status ? "No players match these filters. Reset the filters to view every player." : "No players have registered yet. New accounts will appear here after registration."}</TableCell></TableRow>}</TableBody>
          </Table>
          <footer className="flex justify-between gap-4 p-[18px] text-xs text-muted-foreground"><span>Page {page} · {result.total} results</span><div>
            {page > 1 && <Button size="sm" variant="outline" asChild><Link href={pageLink(page - 1)}><ChevronLeft />Previous</Link></Button>}
            {page * 20 < result.total && <Button size="sm" variant="outline" asChild><Link href={pageLink(page + 1)}>Next<ChevronRight /></Link></Button>}
          </div></footer>
        </div>
      )}
    </section>
  );
}

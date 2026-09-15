import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../quests.css";

type Region = { id: number; region_name: string; show: boolean };
type Quest = { _id: string; id: number; region_id: number; quest_name: string; quest_desc_english?: string; quest_desc_indonesia?: string; get_exp?: number; get_coin?: { min?: number; max?: number }; stamina_cost?: number; progress?: number; is_final?: boolean; total_drop_item?: number; boss_name?: string; boss_image?: string; boss_hp?: number; boss_valor?: number; boss_fortitude?: number; boss_reward?: { type: string; value: number }[]; pre_boss_dialog_english?: string; post_boss_dialog_english?: string; pre_boss_dialog_indonesia?: string; post_boss_dialog_indonesia?: string };

export default async function RegionQuests({ params, searchParams }: { params: Promise<{ regionId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { regionId } = await params;
  if (!/^[1-9]\d*$/.test(regionId)) notFound();
  const queryParams = await searchParams;
  const search = typeof queryParams.search === "string" ? queryParams.search.slice(0, 100) : "";
  const page = Math.floor(Math.max(1, Math.min(100000, Number(queryParams.page) || 1)));
  const query = new URLSearchParams({ page: String(page), limit: "20", region_id: regionId, ...(search ? { search } : {}) });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  const headers = { Authorization: `Bearer ${token}` };
  const [regionResponse, questsResponse] = await Promise.all([
    fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/quests/regions/${regionId}`, { headers, cache: "no-store" }),
    fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/quests?${query}`, { headers, cache: "no-store" }),
  ]);
  if (regionResponse.status === 404) notFound();
  if (regionResponse.status === 401 || questsResponse.status === 401) redirect("/login");
  if (!regionResponse.ok || !questsResponse.ok) throw new Error("Unable to load region quests");
  const region = await regionResponse.json() as Region;
  const result = await questsResponse.json() as { data: Quest[]; total: number };
  const pageLink = (next: number) => { const nextQuery = new URLSearchParams(query); nextQuery.set("page", String(next)); return `/admin/quests/${regionId}?${nextQuery}`; };

  return <section><Button variant="ghost" size="sm" asChild><Link href="/admin/quests"><ArrowLeft />Back to regions</Link></Button><p className="eyebrow">QUEST REGION {region.id}</p><div className="list-heading"><div><h1>{region.region_name}</h1><p className="muted">Quest list for this region · {region.show ? "Visible" : "Hidden"}</p></div></div><form className="quest-filters"><input name="search" aria-label="Search quest name" placeholder="Search quest name…" defaultValue={search}/><Button type="submit" variant="outline"><Search />Search</Button><Button type="button" variant="ghost" asChild><Link href={`/admin/quests/${regionId}`}><X />Reset</Link></Button></form><div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table"><caption className="quest-caption">{result.total} quests</caption><thead><tr>{["ID", "Quest", "EXP", "Coin (min–max)", "Stamina", "Progress", "Final", "Drop items", "Boss details"].map((name) => <th key={name}>{name}</th>)}</tr></thead><tbody>{result.data.length ? result.data.map((q) => <tr key={q._id}><td>{q.id}</td><td className="quest-name"><strong>{q.quest_name}</strong><small>{q.quest_desc_english}</small>{q.quest_desc_indonesia && <small>{q.quest_desc_indonesia}</small>}</td><td>{q.get_exp ?? "—"}</td><td>{q.get_coin?.min ?? "—"}–{q.get_coin?.max ?? "—"}</td><td>{q.stamina_cost ?? "—"}</td><td>{q.progress ?? "—"}</td><td>{q.is_final ? "Yes" : "No"}</td><td>{q.total_drop_item ?? "—"}</td><td>{q.is_final ? <details><summary>{q.boss_name || "Boss"}</summary><dl>{Object.entries({ HP: q.boss_hp, Valor: q.boss_valor, Fortitude: q.boss_fortitude, Image: q.boss_image, Rewards: q.boss_reward?.map((reward) => `${reward.type}: ${reward.value}`).join(", "), "Pre-dialog EN": q.pre_boss_dialog_english, "Post-dialog EN": q.post_boss_dialog_english, "Pre-dialog ID": q.pre_boss_dialog_indonesia, "Post-dialog ID": q.post_boss_dialog_indonesia }).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value ?? "—"}</dd></div>)}</dl></details> : "—"}</td></tr>) : <tr><td colSpan={9} className="quest-empty">{search ? "No quests match your search." : "No quests have been added to this region."}</td></tr>}</tbody></table></div><footer className="quest-pagination"><span>Page {page} · {result.total} results</span><div>{page > 1 && <Button size="sm" variant="outline" asChild><Link href={pageLink(page - 1)}><ChevronLeft />Previous</Link></Button>}{page * 20 < result.total && <Button size="sm" variant="outline" asChild><Link href={pageLink(page + 1)}>Next<ChevronRight /></Link></Button>}</div></footer></div></section>;
}

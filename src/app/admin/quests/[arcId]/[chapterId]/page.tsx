import { adminFetch } from "@/lib/admin-session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../../quests.css";

type Chapter = { _id: string; source_id: string; name_english: string; name_indonesia: string; description_english: string };
type Region = { _id: string; source_id: string; order_number: number; name_english: string; name_indonesia: string; description_english: string; scope: string; realms: string[]; requirement: string; show: boolean; quest_count: number };

export default async function Regions({ params }: { params: Promise<{ arcId: string; chapterId: string }> }) {
  const { arcId, chapterId } = await params;
  if (![arcId, chapterId].every((id) => /^[a-f\d]{24}$/i.test(id))) notFound();
  const [chapterResponse, listResponse] = await Promise.all([
    adminFetch(`/admin/quests/chapters/${chapterId}`, {cache: "no-store" }),
    adminFetch(`/admin/quests/chapters/${chapterId}/regions`, {cache: "no-store" }),
  ]);
  if (chapterResponse.status === 404) notFound();
  if (!chapterResponse.ok || !listResponse.ok) throw new Error("Unable to load regions");
  const chapter = await chapterResponse.json() as Chapter;
  const result = await listResponse.json() as { data: Region[]; total: number };
  return <section><Button variant="ghost" size="sm" asChild><Link href={`/admin/quests/${arcId}`}><ArrowLeft />Back to chapters</Link></Button><div className="hierarchy-heading"><p className="eyebrow">{chapter.source_id}</p><h1>{chapter.name_english}</h1><p className="muted">{chapter.name_indonesia} · {result.total} regions</p></div><div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table"><thead><tr><th>Order</th><th>Region</th><th>Realm access</th><th>Scope</th><th>Type</th><th>Quests</th><th>Action</th></tr></thead><tbody>{result.data.length ? result.data.map((region) => <tr key={region._id}><td>{region.order_number}</td><td className="quest-name"><small>{region.source_id}</small><strong>{region.name_english}</strong><small>{region.name_indonesia}</small><small>{region.description_english}</small></td><td>{region.realms.join(", ")}</td><td><span className="hierarchy-badge">{region.scope}</span></td><td>{region.requirement}</td><td>{region.quest_count}</td><td><div className="region-actions"><Button size="sm" variant="outline" asChild><Link href={`/admin/quests/${arcId}/${chapterId}/${region._id}/edit`}><Pencil />Edit</Link></Button><Button size="sm" asChild><Link href={`/admin/quests/${arcId}/${chapterId}/${region._id}`}>Quests <ArrowRight /></Link></Button></div></td></tr>) : <tr><td colSpan={7} className="quest-empty">No regions yet. Use Add region to continue this chapter.</td></tr>}</tbody></table></div></div></section>;
}

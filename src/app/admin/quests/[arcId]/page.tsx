import { adminFetch } from "@/lib/admin-session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../quests.css";

type Arc = { _id: string; source_id: string; name_english: string; name_indonesia: string };
type Chapter = { _id: string; source_id: string; order_number: number; name_english: string; name_indonesia: string; description_english: string; convergence_stage: string; region_count: number };

export default async function Chapters({ params }: { params: Promise<{ arcId: string }> }) {
  const { arcId } = await params;
  if (!/^[a-f\d]{24}$/i.test(arcId)) notFound();
  const [arcResponse, listResponse] = await Promise.all([
    adminFetch(`/admin/quests/arcs/${arcId}`, {cache: "no-store" }),
    adminFetch(`/admin/quests/arcs/${arcId}/chapters`, {cache: "no-store" }),
  ]);
  if (arcResponse.status === 404) notFound();
  if (!arcResponse.ok || !listResponse.ok) throw new Error("Unable to load chapters");
  const arc = await arcResponse.json() as Arc;
  const result = await listResponse.json() as { data: Chapter[]; total: number };
  return <section><Button variant="ghost" size="sm" asChild><Link href="/admin/quests"><ArrowLeft />Back to arcs</Link></Button><div className="list-heading hierarchy-heading"><div><p className="eyebrow">{arc.source_id}</p><h1>{arc.name_english}</h1><p className="muted">{arc.name_indonesia} · {result.total} chapters</p></div><Button asChild><Link href={`/admin/quests/${arcId}/chapters/new`}><Plus/>Add chapter</Link></Button></div><div className="quest-table-wrap"><table className="quest-table"><thead><tr><th>Order</th><th>Chapter</th><th>Stage</th><th>Regions</th><th>Action</th></tr></thead><tbody>{result.data.length ? result.data.map((chapter) => <tr key={chapter._id}><td>{chapter.order_number}</td><td className="quest-name"><small>{chapter.source_id}</small><strong>{chapter.name_english}</strong><small>{chapter.name_indonesia}</small><small>{chapter.description_english}</small></td><td><span className="hierarchy-badge">{chapter.convergence_stage}</span></td><td>{chapter.region_count}</td><td><div className="region-actions"><Button size="sm" variant="outline" asChild><Link href={`/admin/quests/${arcId}/${chapter._id}/edit`}><Pencil/>Edit</Link></Button><Button size="sm" asChild><Link href={`/admin/quests/${arcId}/${chapter._id}`}>Open chapter <ArrowRight /></Link></Button></div></td></tr>) : <tr><td colSpan={5} className="quest-empty">No chapters yet. Use Add chapter to continue this arc.</td></tr>}</tbody></table></div></section>;
}

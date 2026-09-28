import { adminFetch } from "@/lib/admin-session";
import Link from "next/link";
import { ArrowRight, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./quests.css";

type Arc = { _id: string; source_id: string; order_number: number; name_english: string; name_indonesia: string; description_english: string; chapter_count: number };

export default async function QuestArcs() {
  const response = await adminFetch(`/admin/quests/arcs`, { cache: "no-store" });
  const result = response.ok ? await response.json() as { data: Arc[]; total: number } : null;
  return <section><div className="list-heading"><div><p className="eyebrow">World</p><h1>Quest arcs</h1><p className="muted">Campaign hierarchy: Arc → Chapter → Region → Quest.</p></div><Button asChild><Link href="/admin/quests/new"><Plus/>Add arc</Link></Button></div>{!result ? <p className="error">Unable to load quest arcs.</p> : result.data.length ? <div className="hierarchy-grid">{result.data.map((arc) => <article className="hierarchy-card" key={arc._id}><div className="hierarchy-order">Arc {arc.order_number}</div><small>{arc.source_id}</small><h2>{arc.name_english}</h2><p className="hierarchy-localized">{arc.name_indonesia}</p><p>{arc.description_english}</p><footer><span>{arc.chapter_count} chapters</span><div className="region-actions"><Button size="sm" variant="outline" asChild><Link href={`/admin/quests/${arc._id}/edit`}><Pencil/>Edit</Link></Button><Button size="sm" asChild><Link href={`/admin/quests/${arc._id}`}>Open arc <ArrowRight /></Link></Button></div></footer></article>)}</div> : <div className="empty-panel"><h2>No quest arcs yet</h2><p>Use Add arc to begin the campaign hierarchy.</p></div>}</section>;
}

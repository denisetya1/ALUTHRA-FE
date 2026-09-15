import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../quests/quests.css";
import "../list-heading.css";

type Present = { _id: string; title: string; player_id: { _id: string; username?: string; email?: string }; status: "claimed" | "unclaimed"; items?: unknown[]; cards?: unknown[]; gacha: number; gold: number; aether: number; image?: string };
export default async function Presents({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let result: { data: Present[]; total: number } | null = null;
  try { const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/presents`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }); if (response.status === 401) redirect("/login"); if (response.ok) result = await response.json(); } catch {}
  return <section><p className="eyebrow">PLAYER MANAGEMENT</p><div className="list-heading"><div><h1>Presents</h1><p className="muted">Send and track player reward packages.</p></div><Button asChild><Link href="/admin/presents/new"><Plus />Add present</Link></Button></div>{params.created === "1" && <p role="status">Present saved successfully.</p>}{params.updated === "1" && <p role="status">Present updated successfully.</p>}{!result ? <p className="error">Unable to load presents.</p> : <div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table"><caption className="quest-caption">{result.total} presents</caption><thead><tr>{["No", "Image", "Title", "Player", "Items", "Cards", "Gacha", "Gold", "Aether", "Status", "Action"].map((name) => <th key={name}>{name}</th>)}</tr></thead><tbody>{result.data.length ? result.data.map((present, index) => <tr key={present._id}><td>{index + 1}</td><td>{present.image ? <Image src={present.image} alt="" width={48} height={48} unoptimized/> : "—"}</td><td><strong>{present.title}</strong></td><td className="quest-name"><strong>{present.player_id?.username || present.player_id?.email || "Deleted player"}</strong><small>{present.player_id?.email}</small></td><td>{present.items?.length || 0}</td><td>{present.cards?.length || 0}</td><td>{present.gacha}</td><td>{present.gold}</td><td>{present.aether}</td><td className="capitalize">{present.status}</td><td><Button size="sm" variant="outline" asChild><Link href={`/admin/presents/${present._id}/edit`}><Pencil />Edit</Link></Button></td></tr>) : <tr><td colSpan={11} className="quest-empty">No presents yet.</td></tr>}</tbody></table></div></div>}</section>;
}

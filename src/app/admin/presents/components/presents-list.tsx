"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresents } from "@/hooks/use-presents";

export default function PresentsList() {
  const params = useSearchParams();
  const presentsQuery = usePresents();
  const result = presentsQuery.data;
  return <section><p className="text-xs font-semibold text-muted-foreground">Player management</p><div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start"><div><h1>Presents</h1><p className="text-muted-foreground">Send and track player reward packages.</p></div><Button asChild><Link href="/admin/presents/new"><Plus />Add present</Link></Button></div>{params.get("created") === "1" && <p role="status">Present saved successfully.</p>}{params.get("updated") === "1" && <p role="status">Present updated successfully.</p>}{presentsQuery.isPending ? <p>Loading presents…</p> : presentsQuery.isError || !result ? <p className="text-sm text-destructive">Unable to load presents.</p> : <div className="overflow-hidden rounded-[10px] border border-border bg-background"><div className="overflow-auto"><Table className="w-full border-collapse text-left text-xs [&_th]:whitespace-nowrap [&_th]:bg-muted [&_th]:font-medium [&_th]:text-muted-foreground [&_th]:p-4 [&_td]:border-b [&_td]:border-border [&_td]:p-4 [&_td]:align-top"><TableCaption className="p-[18px] text-left font-semibold">{result.total} presents</TableCaption><TableHeader><TableRow>{["No", "Image", "Title", "Player", "Items", "Cards", "Gacha", "Gold", "Aether", "Status", "Action"].map((name) => <TableHead key={name}>{name}</TableHead>)}</TableRow></TableHeader><TableBody>{result.data.length ? result.data.map((present, index) => <TableRow key={present._id}><TableCell>{index + 1}</TableCell><TableCell>{present.image ? <Image src={present.image} alt="" width={48} height={48} unoptimized/> : "None"}</TableCell><TableCell><strong>{present.title}</strong></TableCell><TableCell className="min-w-[230px]"><strong>{present.player_id?.username || present.player_id?.email || "Deleted player"}</strong><small>{present.player_id?.email}</small></TableCell><TableCell>{present.items?.length || 0}</TableCell><TableCell>{present.cards?.length || 0}</TableCell><TableCell>{present.gacha}</TableCell><TableCell>{present.gold}</TableCell><TableCell>{present.aether}</TableCell><TableCell className="capitalize">{present.status}</TableCell><TableCell><Button size="sm" variant="outline" asChild><Link href={`/admin/presents/${present._id}/edit`}><Pencil />Edit</Link></Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={11} className="p-8 text-center text-muted-foreground">No presents yet. Use Add present to prepare the first player reward.</TableCell></TableRow>}</TableBody></Table></div></div>}</section>;
}

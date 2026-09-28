"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useRarities } from "@/hooks/use-master-data";

export default function RarityList() {
  const { data: result, isLoading, isError } = useRarities();
  return <section>
    <p className="text-xs font-semibold text-muted-foreground">Reference data</p><div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start"><div><h1>Rarity</h1><p className="text-muted-foreground">Rarity tiers available for ALUTHRA cards and rewards.</p></div></div>
    {isLoading ? <p role="status">Loading rarity…</p> : isError || !result ? <p role="alert" className="text-sm text-destructive">Unable to load rarity data. Check the backend connection and refresh.</p> : <div className="overflow-hidden rounded-[10px] border border-border bg-background"><div className="overflow-auto"><Table className="w-full border-collapse text-left text-xs [&_th]:whitespace-nowrap [&_th]:bg-muted [&_th]:font-medium [&_th]:text-muted-foreground [&_th]:p-4 [&_td]:border-b [&_td]:border-border [&_td]:p-4 [&_td]:align-top">
      <TableCaption className="p-[18px] text-left font-semibold">{result.total} rarity tiers</TableCaption><TableHeader><TableRow><TableHead>Tier</TableHead><TableHead>Mongo ID</TableHead><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
      <TableBody>{result.data.length ? result.data.map((rarity) => <TableRow key={rarity._id}><TableCell>{rarity.tier}</TableCell><TableCell>{rarity._id}</TableCell><TableCell>{rarity.code}</TableCell><TableCell><span className="inline-flex rounded-full bg-muted px-2 py-1 text-[11px] font-semibold">{rarity.name}</span></TableCell><TableCell>{rarity.is_active ? "Active" : "Inactive"}</TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="p-8 text-center text-muted-foreground">No rarity tiers are available. Refresh after the backend seed completes.</TableCell></TableRow>}</TableBody>
    </Table></div></div>}
  </section>;
}

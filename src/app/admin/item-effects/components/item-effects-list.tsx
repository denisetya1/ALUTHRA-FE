"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useItemEffects } from "@/hooks/use-master-data";

export default function ItemEffectsList() {
  const { data: result, isLoading, isError } = useItemEffects();

  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground">Reference data</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <h1>Item Effects</h1>
          <p className="text-muted-foreground">Gameplay item effects imported from the Varhara master data.</p>
        </div>
      </div>
      {isLoading ? <p role="status">Loading item effects…</p> : isError || !result ? (
        <p role="alert" className="text-sm text-destructive">Unable to load item effects. Check the backend connection and refresh.</p>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <Table>
              <TableCaption className="p-[18px] text-left font-semibold">{result.total} item effects · Source: {result.source}</TableCaption>
              <TableHeader><TableRow><TableHead>No</TableHead><TableHead>Mongo ID</TableHead><TableHead>Legacy ID</TableHead><TableHead>Effect key</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{result.data.length ? result.data.map((effect, index) => (
                <TableRow key={effect._id}>
                  <TableCell>{index + 1}</TableCell><TableCell>{effect._id}</TableCell><TableCell>{effect.legacy_id}</TableCell>
                  <TableCell className="min-w-[230px]"><strong>{effect.name}</strong></TableCell>
                  <TableCell>{effect.description}</TableCell>
                  <TableCell><span className="inline-flex rounded-full bg-[var(--primary-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--primary-soft-foreground)]">{effect.is_active ? "Active" : "Inactive"}</span></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="p-8 text-center text-muted-foreground">No item effects are available. Refresh after the Varhara import completes.</TableCell></TableRow>}</TableBody>
            </Table>
        </div>
      )}
    </section>
  );
}

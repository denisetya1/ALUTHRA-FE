"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useRealms } from "@/hooks/use-master-data";

export default function RealmsList() {
  const { data: result, isLoading, isError } = useRealms();

  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground">Reference data</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <h1>Realms</h1>
          <p className="text-muted-foreground">The three realms available throughout ALUTHRA.</p>
        </div>
      </div>
      {isLoading ? <p role="status">Loading realms…</p> : isError || !result ? (
        <p role="alert" className="text-sm text-destructive">Unable to load realms. Check the backend connection and refresh.</p>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <div className="overflow-auto">
            <Table className="w-full border-collapse text-left text-xs [&_th]:whitespace-nowrap [&_th]:bg-muted [&_th]:font-medium [&_th]:text-muted-foreground [&_th]:p-4 [&_td]:border-b [&_td]:border-border [&_td]:p-4 [&_td]:align-top">
              <TableCaption className="p-[18px] text-left font-semibold">{result.total} realms</TableCaption>
              <TableHeader><TableRow><TableHead>No</TableHead><TableHead>Mongo ID</TableHead><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {result.data.length ? result.data.map((realm, index) => (
                  <TableRow key={realm._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{realm._id}</TableCell>
                    <TableCell>{realm.code}</TableCell>
                    <TableCell className="min-w-[230px]"><strong>{realm.name}</strong></TableCell>
                    <TableCell><span className="inline-flex rounded-full bg-[var(--primary-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--primary-soft-foreground)]">{realm.is_active ? "Active" : "Inactive"}</span></TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={5} className="p-8 text-center text-muted-foreground">No realms are available. Refresh after the backend seed completes.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  );
}

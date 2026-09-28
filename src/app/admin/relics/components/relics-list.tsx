"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { useRelics } from "@/hooks/use-relics";

export default function RelicsList() {
  const params = useSearchParams();
  const search = (params.get("search") || "").slice(0, 100);
  const page = Math.floor(Math.max(1, Number(params.get("page")) || 1));
  const query = new URLSearchParams({
    page: String(page),
    ...(search ? { search } : {}),
  });
  const relicsQuery = useRelics(query.toString());
  const result = relicsQuery.data;
  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground">World</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <h1>Relics</h1>
          <p className="text-muted-foreground">
            Manage relic powers, prices, and shop availability.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/relics/new">
            <Plus />
            Add relic
          </Link>
        </Button>
      </div>
      <form className="my-6 flex flex-wrap items-center gap-3">
        <input
          name="search"
          placeholder="Search relic name…"
          defaultValue={search}
        />
        <Button variant="outline">Search</Button>
        {search && (
          <Button variant="ghost" asChild>
            <Link href="/admin/relics">Reset</Link>
          </Button>
        )}
      </form>
      {relicsQuery.isPending ? (
        <p>Loading relics…</p>
      ) : relicsQuery.isError || !result ? (
        <p className="text-sm text-destructive">Unable to load relics.</p>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <div className="overflow-auto">
            <Table className="w-full border-collapse text-left text-xs [&_th]:whitespace-nowrap [&_th]:bg-muted [&_th]:font-medium [&_th]:text-muted-foreground [&_th]:p-4 [&_td]:border-b [&_td]:border-border [&_td]:p-4 [&_td]:align-top">
              <TableCaption className="p-[18px] text-left font-semibold">{result.total} relics</TableCaption>
              <TableHeader>
                <TableRow>
                  {[
                    "Mongo ID",
                    "Name",
                    "Image",
                    "Effect",
                    "Amount",
                    "Price",
                    "Discount",
                    "Description",
                    "Shop",
                    "Action",
                  ].map((x) => (
                    <TableHead key={x}>{x}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.length ? (
                  result.data.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{r._id}</TableCell>
                      <TableCell className="min-w-[230px]">
                        <strong>{r.name_english}</strong>
                        {r.name_indonesia && <small>{r.name_indonesia}</small>}
                      </TableCell>
                      <TableCell>{r.image || "None"}</TableCell>
                      <TableCell>{r.effect}</TableCell>
                      <TableCell>{r.effect_amount}</TableCell>
                      <TableCell>{r.price}</TableCell>
                      <TableCell>{r.discount}</TableCell>
                      <TableCell className="min-w-[230px]">{r.desc_english || "Not set"}</TableCell>
                      <TableCell>{r.shop ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/relics/${r._id}/edit`}>
                            <Pencil />
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="p-8 text-center text-muted-foreground">
                      No relics yet. Use Add relic to create the first one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { Input } from "@/components/ui/input";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useItems } from "@/hooks/use-items";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, X } from "lucide-react";

export default function ItemsList() {
  const params = useSearchParams();
  const search = (params.get("search") || "").slice(0, 100);
  const page = Math.floor(
    Math.max(1, Math.min(100000, Number(params.get("page")) || 1)),
  );
  const query = new URLSearchParams({
    page: String(page),
    ...(search ? { search } : {}),
  });
  const { data: result, isLoading, isError } = useItems(query.toString());
  const pageLink = (next: number) => {
    const q = new URLSearchParams(query);
    q.set("page", String(next));
    return `/admin/items?${q}`;
  };
  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground">World</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <h1>Items</h1>
          <p className="text-muted-foreground">
            Browse item definitions and gameplay effects.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/items/new">
            <Plus />
            Add item
          </Link>
        </Button>
      </div>
      {params.get("created") === "1" && <p role="status">Item saved successfully.</p>}
      {params.get("updated") === "1" && (
        <p role="status">Item updated successfully.</p>
      )}
      <form className="my-6 flex flex-wrap items-center gap-3">
        <Input
          name="search"
          aria-label="Search item name"
          placeholder="Search item name…"
          defaultValue={search}
        />
        <Button type="submit" variant="outline">
          <Search />
          Search
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin/items">
            <X />
            Reset
          </Link>
        </Button>
      </form>
      {isLoading ? <p role="status">Loading items…</p> : isError || !result ? (
        <p role="alert" className="text-sm text-destructive">
          Unable to load items. Check the backend connection and refresh.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <Table>
              <TableCaption className="p-[18px] text-left font-semibold">{result.total} items</TableCaption>
              <TableHeader>
                <TableRow>
                  {[
                    "No",
                    "Item ID",
                    "Name",
                    "Image",
                    "Effect",
                    "Amount",
                    "Description",
                    "Action",
                  ].map((name) => (
                    <TableHead key={name} scope="col">
                      {name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-8 text-center text-muted-foreground">
                      {search
                        ? "No items match your filters."
                        : "No items yet. Use Add item to create the first item."}
                    </TableCell>
                  </TableRow>
                ) : (
                  result.data.map((item, index) => (
                    <TableRow key={item._id}>
                      <TableCell>{(page - 1) * 20 + index + 1}</TableCell>
                      <TableCell>{item._id}</TableCell>
                      <TableCell className="min-w-[230px]">
                        <strong>
                          {item.name_english || item.name_indonesia || "Not set"}
                        </strong>
                        {item.name_english && item.name_indonesia && (
                          <small>{item.name_indonesia}</small>
                        )}
                      </TableCell>
                      <TableCell>{item.image || "None"}</TableCell>
                      <TableCell>{item.effect || "Not set"}</TableCell>
                      <TableCell>{item.effect_amount ?? "Not set"}</TableCell>
                      <TableCell className="min-w-[230px]">
                        {item.desc_english || item.desc_indonesia || "Not set"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/items/${item._id}/edit`}>
                            <Pencil />
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          <footer className="flex justify-between gap-4 p-[18px] text-xs text-muted-foreground">
            <span>
              Page {page} · {result.total} results
            </span>
            <div>
              {page > 1 && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={pageLink(page - 1)}>
                    <ChevronLeft />
                    Previous
                  </Link>
                </Button>
              )}
              {page * 20 < result.total && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={pageLink(page + 1)}>
                    Next
                    <ChevronRight />
                  </Link>
                </Button>
              )}
            </div>
          </footer>
        </div>
      )}
    </section>
  );
}

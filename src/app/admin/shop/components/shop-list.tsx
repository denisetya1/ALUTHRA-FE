"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/hooks/use-shop";

export default function ShopList() {
  const params = useSearchParams();
  const shopQuery = useShop();
  const result = shopQuery.data;
  return <section><p className="text-xs font-semibold text-muted-foreground">World</p><div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start"><div><h1>Shop</h1><p className="text-muted-foreground">Manage items sold in the game, their price, and discount.</p></div><Button asChild><Link href="/admin/shop/new"><Plus />Add shop item</Link></Button></div>
    {params.get("created") === "1" && <p role="status">Shop item saved successfully.</p>}{params.get("updated") === "1" && <p role="status">Shop item updated successfully.</p>}
    {shopQuery.isPending ? <p>Loading shop…</p> : shopQuery.isError || !result ? <p role="alert" className="text-sm text-destructive">Unable to load shop.</p> : <Table><TableCaption className="p-[18px] text-left font-semibold">{result.total} shop items</TableCaption><TableHeader><TableRow>{["No", "Title", "Bundle items", "Image", "Description", "Currency", "Price", "Discount", "Final price", "Action"].map((name) => <TableHead key={name}>{name}</TableHead>)}</TableRow></TableHeader><TableBody>{result.data.length ? result.data.map((listing, index) => <TableRow key={listing._id}><TableCell>{index + 1}</TableCell><TableCell className="min-w-[230px]"><strong>{listing.title_english || listing.title_indonesia || "Untitled"}</strong>{listing.title_english && listing.title_indonesia && <small>{listing.title_indonesia}</small>}</TableCell><TableCell className="min-w-[230px]">{listing.items?.map((entry, itemIndex) => <span key={entry.item_id?._id || itemIndex}><strong>{entry.item_id?.name_english || entry.item_id?.name_indonesia || "Deleted item"}</strong><small> × {entry.quantity}</small></span>)}</TableCell><TableCell>{listing.image ? <Image src={listing.image} alt="" width={48} height={48} unoptimized className="object-contain"/> : "None"}</TableCell><TableCell className="min-w-[230px]">{listing.description_english || listing.description_indonesia || "Not set"}</TableCell><TableCell className="capitalize">{listing.currency || "crown"}</TableCell><TableCell>{listing.price.toLocaleString()}</TableCell><TableCell>{listing.discount}%</TableCell><TableCell>{Math.round(listing.price * (100 - listing.discount) / 100).toLocaleString()}</TableCell><TableCell><Button size="sm" variant="outline" asChild><Link href={`/admin/shop/${listing._id}/edit`}><Pencil />Edit</Link></Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={10} className="p-8 text-center text-muted-foreground">The shop has no listings yet. Use Add shop item to create the first offer.</TableCell></TableRow>}</TableBody></Table>}
  </section>;
}

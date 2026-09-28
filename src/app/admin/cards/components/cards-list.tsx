"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, ChevronLeft, ChevronRight, Pencil, Plus, Search, X } from "lucide-react";
import { useCards } from "@/hooks/use-cards";
import { useRealms } from "@/hooks/use-master-data";

const rarityNames: Record<number, string> = { 0: "Common", 1: "Rare", 2: "Epic", 3: "Legendary", 4: "Mythic" };

export default function CardsList() {
  const params = useSearchParams();
  const search = (params.get("search") || "").slice(0, 100);
  const realm = (params.get("realm") || "").slice(0, 50);
  const rarityParam = params.get("rarity") || "";
  const rarity = /^\d+$/.test(rarityParam) ? rarityParam : "";
  const gachaParam = params.get("gacha") || "";
  const gacha = gachaParam === "true" || gachaParam === "false" ? gachaParam : "";
  const page = Math.floor(Math.max(1, Math.min(100000, Number(params.get("page")) || 1)));
  const query = new URLSearchParams({ page: String(page), ...(search ? { search } : {}), ...(realm ? { realm } : {}), ...(rarity ? { rarity } : {}), ...(gacha ? { gacha } : {}) });
  const cardsQuery = useCards(query.toString());
  const realmsQuery = useRealms();
  const result = cardsQuery.data;
  const realms = realmsQuery.data?.data ?? [];

  const pageLink = (next: number) => {
    const nextQuery = new URLSearchParams(query);
    nextQuery.set("page", String(next));
    return `/admin/cards?${nextQuery}`;
  };

  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground">World</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start"><div><h1>Cards</h1><p className="text-muted-foreground">Browse card stats, realms, rarity, evolution, and gacha availability.</p></div><Button asChild><Link href="/admin/cards/new"><Plus />Add card</Link></Button></div>
      {params.get("created") === "1" && <p role="status">Card saved successfully.</p>}
      {params.get("updated") === "1" && <p role="status">Card updated successfully.</p>}
      <form className="my-6 flex flex-wrap items-center gap-3">
        <input name="search" aria-label="Search cards" placeholder="Search name or legacy ID…" defaultValue={search} />
        <select name="realm" aria-label="Filter by realm" defaultValue={realm}>
          <option value="">All realms</option>
          {realms.map((option) => <option key={option._id} value={option.code}>{option.name}</option>)}
        </select>
        <select name="rarity" aria-label="Filter by rarity" defaultValue={rarity}>
          <option value="">All rarities</option><option value="0">Common</option><option value="1">Rare</option><option value="2">Epic</option><option value="3">Legendary</option><option value="4">Mythic</option>
        </select>
        <select name="gacha" aria-label="Filter by gacha availability" defaultValue={gacha}>
          <option value="">All cards</option><option value="true">In gacha</option><option value="false">Not in gacha</option>
        </select>
        <Button type="submit" variant="outline"><Search />Search</Button>
        <Button type="button" variant="ghost" asChild><Link href="/admin/cards"><X />Reset</Link></Button>
      </form>
      {cardsQuery.isPending ? <p>Loading cards…</p> : cardsQuery.isError || !result ? <p role="alert" className="text-sm text-destructive">Unable to load cards. Check the backend connection and refresh.</p> : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background"><div className="overflow-auto"><Table className="w-full border-collapse text-left text-xs [&_th]:whitespace-nowrap [&_th]:bg-muted [&_th]:font-medium [&_th]:text-muted-foreground [&_th]:p-4 [&_td]:border-b [&_td]:border-border [&_td]:p-4 [&_td]:align-top">
          <TableCaption className="p-[18px] text-left font-semibold">{result.total} cards</TableCaption>
          <TableHeader><TableRow>{["No", "Image", "Card", "Realm", "Rarity", "Level", "Cost", "Valor", "Fortitude", "Evolution", "Evolve Crown", "Materials", "Gacha", "Price", "Action"].map((name) => <TableHead key={name}>{name}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{result.data.length ? result.data.map((card, index) => (
            <TableRow key={card._id}>
              <TableCell>{(page - 1) * 20 + index + 1}</TableCell>
              <TableCell>{card.images?.find((image) => image.evolution === (card.evolution ?? 1))?.thumb || card.images?.[0]?.thumb ? <Image className="size-[52px] shrink-0 rounded-lg border border-border bg-muted object-contain" src={card.images?.find((image) => image.evolution === (card.evolution ?? 1))?.thumb || card.images?.[0]?.thumb || ""} alt={`${card.name || "Card"} thumbnail`} width={52} height={52} unoptimized /> : <span className="size-[52px] shrink-0 rounded-lg border border-border bg-muted object-contain grid place-items-center text-muted-foreground">None</span>}</TableCell>
              <TableCell className="min-w-[230px]"><strong>{card.name || "Unnamed card"}</strong><small className="max-w-[150px] overflow-hidden text-ellipsis">{card._id}</small>{card.id !== undefined && <small>Legacy ID: {card.id}</small>}</TableCell>
              <TableCell className="capitalize">{card.realm || "Not set"}</TableCell>
              <TableCell><span className="inline-flex rounded-full bg-muted px-2 py-1 text-[11px] font-semibold">{rarityNames[card.rarity ?? 0] || `Tier ${card.rarity}`}</span></TableCell>
              <TableCell>{card.level ?? 1} / {card.level_max ?? "Not set"}</TableCell><TableCell>{card.cost ?? "Not set"}</TableCell>
              <TableCell>{(card.valor ?? 0).toLocaleString()}<small className="mt-1 block whitespace-nowrap text-muted-foreground">Max {(card.valor_max ?? 0).toLocaleString()}</small></TableCell>
              <TableCell>{(card.fortitude ?? 0).toLocaleString()}<small className="mt-1 block whitespace-nowrap text-muted-foreground">Max {(card.fortitude_max ?? 0).toLocaleString()}</small></TableCell>
              <TableCell>{card.evolution ?? 1} / {card.evolution_max ?? "Not set"}</TableCell><TableCell>{(card.evolve_cost_crown ?? 0).toLocaleString()}</TableCell><TableCell>{card.evolve_materials?.length ?? 0}</TableCell><TableCell>{card.gacha ? "Yes" : "No"}</TableCell><TableCell>{(card.price ?? 0).toLocaleString()}</TableCell><TableCell><div className="flex gap-2 whitespace-nowrap"><Button size="sm" variant="outline" asChild><Link href={`/admin/cards/${card._id}/edit`}><Pencil />Edit</Link></Button><Button size="sm" variant="outline" asChild><Link href={`/admin/cards/${card._id}/duplicate`}><Copy />Duplicate</Link></Button></div></TableCell>
            </TableRow>
          )) : <TableRow><TableCell colSpan={15} className="p-8 text-center text-muted-foreground">{search || realm || rarity || gacha ? "No cards match these filters. Reset the filters to view every card." : "No cards yet. Use Add card to create the first card."}</TableCell></TableRow>}</TableBody>
        </Table></div>
        <footer className="flex justify-between gap-4 p-[18px] text-xs text-muted-foreground"><span>Page {page} · {result.total} results</span><div>
          {page > 1 && <Button size="sm" variant="outline" asChild><Link href={pageLink(page - 1)}><ChevronLeft />Previous</Link></Button>}
          {page * 20 < result.total && <Button size="sm" variant="outline" asChild><Link href={pageLink(page + 1)}>Next<ChevronRight /></Link></Button>}
        </div></footer></div>
      )}
    </section>
  );
}

import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, X } from "lucide-react";
import "../quests/quests.css";
import "./cards.css";

type Card = {
  _id: string;
  id?: number;
  name?: string;
  realm?: string;
  rarity?: number;
  level?: number;
  level_max?: number;
  cost?: number;
  valor?: number;
  valor_max?: number;
  fortitude?: number;
  fortitude_max?: number;
  evolution?: number;
  evolution_max?: number;
  evolve_cost_crown?: number;
  evolve_materials?: { item_id: string; amount: number }[];
  gacha?: boolean;
  high?: boolean;
  price?: number;
  images?: { evolution: number; thumb?: string }[];
};

const rarityNames: Record<number, string> = { 0: "Common", 1: "Rare", 2: "Epic", 3: "Legendary", 4: "Mythic" };

export default async function Cards({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.slice(0, 100) : "";
  const realm = typeof params.realm === "string" ? params.realm.slice(0, 50) : "";
  const rarity = typeof params.rarity === "string" && /^\d+$/.test(params.rarity) ? params.rarity : "";
  const gacha = params.gacha === "true" || params.gacha === "false" ? params.gacha : "";
  const page = Math.floor(Math.max(1, Math.min(100000, Number(params.page) || 1)));
  const query = new URLSearchParams({ page: String(page), ...(search ? { search } : {}), ...(realm ? { realm } : {}), ...(rarity ? { rarity } : {}), ...(gacha ? { gacha } : {}) });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let result: { data: Card[]; total: number } | null = null;
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/cards?${query}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (response.status === 401) redirect("/login");
    if (response.ok) result = await response.json();
  } catch {}

  const pageLink = (next: number) => {
    const nextQuery = new URLSearchParams(query);
    nextQuery.set("page", String(next));
    return `/admin/cards?${nextQuery}`;
  };

  return (
    <section>
      <p className="eyebrow">WORLD MANAGEMENT</p>
      <div className="list-heading"><div><h1>Cards</h1><p className="muted">Browse card stats, realms, rarity, evolution, and gacha availability.</p></div><Button asChild><Link href="/admin/cards/new"><Plus />Add card</Link></Button></div>
      {params.created === "1" && <p role="status">Card saved successfully.</p>}
      {params.updated === "1" && <p role="status">Card updated successfully.</p>}
      <form className="quest-filters card-filters">
        <input name="search" aria-label="Search cards" placeholder="Search name or legacy ID…" defaultValue={search} />
        <input name="realm" aria-label="Filter by realm" placeholder="Realm" defaultValue={realm} />
        <select name="rarity" aria-label="Filter by rarity" defaultValue={rarity}>
          <option value="">All rarities</option><option value="0">Common</option><option value="1">Rare</option><option value="2">Epic</option><option value="3">Legendary</option><option value="4">Mythic</option>
        </select>
        <select name="gacha" aria-label="Filter by gacha availability" defaultValue={gacha}>
          <option value="">All cards</option><option value="true">In gacha</option><option value="false">Not in gacha</option>
        </select>
        <Button type="submit" variant="outline"><Search />Search</Button>
        <Button type="button" variant="ghost" asChild><Link href="/admin/cards"><X />Reset</Link></Button>
      </form>
      {!result ? <p role="alert" className="error">Unable to load cards. Check the backend connection and refresh.</p> : (
        <div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table card-table">
          <caption className="quest-caption">{result.total} cards</caption>
          <thead><tr>{["No", "Image", "Card", "Realm", "Rarity", "Level", "Cost", "Valor", "Fortitude", "Evolution", "Evolve Crown", "Materials", "Gacha", "Price", "Action"].map((name) => <th key={name}>{name}</th>)}</tr></thead>
          <tbody>{result.data.length ? result.data.map((card, index) => (
            <tr key={card._id}>
              <td>{(page - 1) * 20 + index + 1}</td>
              <td>{card.images?.find((image) => image.evolution === (card.evolution ?? 1))?.thumb || card.images?.[0]?.thumb ? <Image className="card-list-thumb" src={card.images?.find((image) => image.evolution === (card.evolution ?? 1))?.thumb || card.images?.[0]?.thumb || ""} alt={`${card.name || "Card"} thumbnail`} width={52} height={52} unoptimized /> : <span className="card-list-thumb card-list-thumb-empty">—</span>}</td>
              <td className="quest-name"><strong>{card.name || "Unnamed card"}</strong><small className="mongo-id">{card._id}</small>{card.id !== undefined && <small>Legacy ID: {card.id}</small>}</td>
              <td className="capitalize">{card.realm || "—"}</td>
              <td><span className={`rarity rarity-${card.rarity ?? 0}`}>{rarityNames[card.rarity ?? 0] || `Tier ${card.rarity}`}</span></td>
              <td>{card.level ?? 1} / {card.level_max ?? "—"}</td><td>{card.cost ?? "—"}</td>
              <td>{(card.valor ?? 0).toLocaleString()}<small className="stat-max">Max {(card.valor_max ?? 0).toLocaleString()}</small></td>
              <td>{(card.fortitude ?? 0).toLocaleString()}<small className="stat-max">Max {(card.fortitude_max ?? 0).toLocaleString()}</small></td>
              <td>{card.evolution ?? 1} / {card.evolution_max ?? "—"}</td><td>{(card.evolve_cost_crown ?? 0).toLocaleString()}</td><td>{card.evolve_materials?.length ?? 0}</td><td>{card.gacha ? "Yes" : "No"}</td><td>{(card.price ?? 0).toLocaleString()}</td><td><Button size="sm" variant="outline" asChild><Link href={`/admin/cards/${card._id}/edit`}><Pencil />Edit</Link></Button></td>
            </tr>
          )) : <tr><td colSpan={15} className="quest-empty">{search || realm || rarity || gacha ? "No cards match your filters." : "No cards yet. Card data has not been imported."}</td></tr>}</tbody>
        </table></div>
        <footer className="quest-pagination"><span>Page {page} · {result.total} results</span><div>
          {page > 1 && <Button size="sm" variant="outline" asChild><Link href={pageLink(page - 1)}><ChevronLeft />Previous</Link></Button>}
          {page * 20 < result.total && <Button size="sm" variant="outline" asChild><Link href={pageLink(page + 1)}>Next<ChevronRight /></Link></Button>}
        </div></footer></div>
      )}
    </section>
  );
}

import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../quests/quests.css";
import "../list-heading.css";

type ListingItem = { item_id: { _id: string; name_english?: string; name_indonesia?: string; image?: string }; quantity: number };
type Listing = { _id: string; title_english?: string; title_indonesia?: string; items: ListingItem[]; currency?: "crown" | "aether"; price: number; discount: number; image?: string; description_english?: string; description_indonesia?: string };

export default async function Shop({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let result: { data: Listing[]; total: number } | null = null;
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/shop`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (response.status === 401) redirect("/login");
    if (response.ok) result = await response.json();
  } catch {}
  return <section><p className="eyebrow">WORLD MANAGEMENT</p><div className="list-heading"><div><h1>Shop</h1><p className="muted">Manage items sold in the game, their price, and discount.</p></div><Button asChild><Link href="/admin/shop/new"><Plus />Add shop item</Link></Button></div>
    {params.created === "1" && <p role="status">Shop item saved successfully.</p>}{params.updated === "1" && <p role="status">Shop item updated successfully.</p>}
    {!result ? <p role="alert" className="error">Unable to load shop.</p> : <div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table"><caption className="quest-caption">{result.total} shop items</caption><thead><tr>{["No", "Title", "Bundle items", "Image", "Description", "Currency", "Price", "Discount", "Final price", "Action"].map((name) => <th key={name}>{name}</th>)}</tr></thead><tbody>{result.data.length ? result.data.map((listing, index) => <tr key={listing._id}><td>{index + 1}</td><td className="quest-name"><strong>{listing.title_english || listing.title_indonesia || "Untitled"}</strong>{listing.title_english && listing.title_indonesia && <small>{listing.title_indonesia}</small>}</td><td className="quest-name">{listing.items?.map((entry, itemIndex) => <span key={entry.item_id?._id || itemIndex}><strong>{entry.item_id?.name_english || entry.item_id?.name_indonesia || "Deleted item"}</strong><small> × {entry.quantity}</small></span>)}</td><td>{listing.image ? <Image src={listing.image} alt="" width={48} height={48} unoptimized style={{ objectFit: "contain" }}/> : "—"}</td><td className="quest-name">{listing.description_english || listing.description_indonesia || "—"}</td><td className="capitalize">{listing.currency || "crown"}</td><td>{listing.price.toLocaleString()}</td><td>{listing.discount}%</td><td>{Math.round(listing.price * (100 - listing.discount) / 100).toLocaleString()}</td><td><Button size="sm" variant="outline" asChild><Link href={`/admin/shop/${listing._id}/edit`}><Pencil />Edit</Link></Button></td></tr>) : <tr><td colSpan={10} className="quest-empty">No items have been added to the shop.</td></tr>}</tbody></table></div></div>}
  </section>;
}

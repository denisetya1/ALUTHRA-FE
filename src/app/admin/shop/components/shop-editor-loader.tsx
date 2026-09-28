"use client";

import { useParams } from "next/navigation";
import { useItemOptions } from "@/hooks/use-admin-options";
import { useShopItem } from "@/hooks/use-shop";
import ShopForm, { type ShopDefaults } from "./shop-form";

export default function ShopEditorLoader({ create = false }: { create?: boolean }) {
  const id = String(useParams<{ id?: string }>().id || ""); const listing = useShopItem(create ? "" : id); const items = useItemOptions();
  if (items.isPending || (!create && listing.isPending)) return <p>Loading shop form…</p>;
  if (items.isError || (!create && (listing.isError || !listing.data))) return <p className="text-sm text-destructive">Unable to load shop item.</p>;
  if (create) return <ShopForm items={items.data?.data ?? []} />;
  const value = listing.data!;
  const initialValues: ShopDefaults = { title_english: value.title_english || "", title_indonesia: value.title_indonesia || "", items: value.items.map((entry) => ({ item_id: entry.item_id?._id, quantity: entry.quantity })), currency: value.currency || "crown", price: value.price, discount: value.discount, image: value.image, description_english: value.description_english || "", description_indonesia: value.description_indonesia || "" };
  return <ShopForm mode="edit" listingId={id} initialValues={initialValues} items={items.data?.data ?? []} />;
}

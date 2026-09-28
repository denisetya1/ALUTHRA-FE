"use client";

import { useParams } from "next/navigation";
import { useItemEffects } from "@/hooks/use-master-data";
import { useItem } from "@/hooks/use-items";
import ItemForm, { type ItemDefaults } from "./item-form";

export function ItemCreateLoader() {
  const effects = useItemEffects();
  if (effects.isPending) return <p>Loading item form…</p>;
  if (effects.isError) return <p className="text-sm text-destructive">Unable to load item effects.</p>;
  return <ItemForm effects={(effects.data?.data ?? []).filter((x) => x.is_active)}/>;
}

export default function ItemEditorLoader() {
  const id = String(useParams<{ id: string }>().id || ""); const item = useItem(id); const effects = useItemEffects();
  if (item.isPending || effects.isPending) return <p>Loading item…</p>;
  if (item.isError || effects.isError || !item.data) return <p className="text-sm text-destructive">Unable to load item.</p>;
  return <ItemForm mode="edit" itemId={id} initialValues={item.data as ItemDefaults} effects={(effects.data?.data ?? []).filter((x) => x.is_active)} />;
}

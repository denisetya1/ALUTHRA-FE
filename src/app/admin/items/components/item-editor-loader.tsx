"use client";

import { useParams } from "next/navigation";
import { useItemEffects } from "@/hooks/use-master-data";
import { useItem } from "@/hooks/use-items";
import ItemForm from "./item-form";
import { PageError, PageLoading } from "@/components/admin/page-state";

export function ItemCreateLoader() {
  const effects = useItemEffects();
  if (effects.isPending) return <PageLoading label="Loading item form…"/>;
  if (effects.isError) return <PageError message="Unable to load item effects."/>;
  return <ItemForm effects={(effects.data?.data ?? []).filter((x) => x.is_active)}/>;
}

export default function ItemEditorLoader() {
  const id = String(useParams<{ id: string }>().id || ""); const item = useItem(id); const effects = useItemEffects();
  if (item.isPending || effects.isPending) return <PageLoading label="Loading item…"/>;
  if (item.isError || effects.isError || !item.data) return <PageError message="Unable to load item."/>;
  return <ItemForm mode="edit" itemId={id} initialValues={item.data} effects={(effects.data?.data ?? []).filter((x) => x.is_active)} />;
}
